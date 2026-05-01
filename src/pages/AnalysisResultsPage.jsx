import { useMemo, useState } from "react";
import {
  Row, Col, Typography, Card, Space, Tag, Spin, Empty,
  Button, Input, Select, Progress, Divider, Modal,
} from "antd";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  ArrowLeftOutlined, TrophyOutlined, SearchOutlined,
  FilePdfOutlined, CheckCircleOutlined,
  CloseCircleOutlined, BarChartOutlined, BulbOutlined,
  CaretDownOutlined, CaretUpOutlined, StarFilled,
  TeamOutlined, EyeOutlined, DownloadOutlined,
  FileExcelOutlined, SaveOutlined, EditOutlined,
  DeleteOutlined, PlusOutlined, SwapOutlined, CheckOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { useRunResults, useUpdateResultNote } from "../requests/AnalysisQueries";
import AnalysisManager from "../requests/AnalysisManager";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ── Sabitler ──────────────────────────────────────────────────────────────────

const SCORE_CATEGORIES = [
  { key: "hardSkillScore",    label: "Teknik Beceriler", max: 20, color: "#4F46E5" },
  { key: "softSkillScore",    label: "Soft Skills",      max: 15, color: "#0891B2" },
  { key: "experienceScore",   label: "Deneyim",          max: 20, color: "#059669" },
  { key: "educationScore",    label: "Eğitim",           max: 10, color: "#D97706" },
  { key: "projectCertScore",  label: "Proje / Sertifika",max: 10, color: "#7C3AED" },
  { key: "semanticScore",     label: "Anlamsal Uyum",    max: 25, color: "#DB2777" },
];

const RANK_STYLES = [
  { bg: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#fff", icon: <StarFilled /> },
  { bg: "linear-gradient(135deg,#9CA3AF,#6B7280)", color: "#fff", icon: <StarFilled /> },
  { bg: "linear-gradient(135deg,#CD7C2E,#B45309)", color: "#fff", icon: <StarFilled /> },
];

// ── Yardımcı ──────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 75) return "#10B981";
  if (score >= 55) return "#3B82F6";
  if (score >= 35) return "#F59E0B";
  return "#EF4444";
}

function scoreLabel(score) {
  if (score >= 75) return "Güçlü Uyum";
  if (score >= 55) return "İyi Uyum";
  if (score >= 35) return "Orta Uyum";
  return "Zayıf Uyum";
}

function splitList(str) {
  if (!str) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

// ── ScoreRing ─────────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const color = scoreColor(score);
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="7" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <Text strong style={{ fontSize: 15, color, lineHeight: 1 }}>{score}</Text>
        <Text style={{ fontSize: 9, color: "#9CA3AF", lineHeight: 1 }}>/ 100</Text>
      </div>
    </div>
  );
}

// ── CategoryBar ───────────────────────────────────────────────────────────────

function CategoryBar({ label, score, max, color }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <Text style={{ fontSize: 12, color: "#6B7280" }}>{label}</Text>
        <Text strong style={{ fontSize: 12, color }}>
          {score?.toFixed(1) ?? "0"} <Text style={{ fontSize: 10, color: "#9CA3AF" }}>/ {max}</Text>
        </Text>
      </div>
      <Progress
        percent={pct} showInfo={false}
        strokeColor={color} trailColor="#F1F5F9"
        strokeWidth={5}
        style={{ margin: 0 }}
      />
    </div>
  );
}

// ── CandidateCard ─────────────────────────────────────────────────────────────

function CandidateCard({ item, rank, onPreview, isCompared, onToggleCompare, compareDisabled, onNoteSaved }) {
  const [expanded,   setExpanded]   = useState(false);
  const [savedNote,  setSavedNote]  = useState(item.note || "");
  const [editMode,   setEditMode]   = useState(false);
  const [noteInput,  setNoteInput]  = useState("");
  const isPdf = (item.fileName || "").toLowerCase().endsWith(".pdf");

  const { mutateAsync: saveNote, isPending: isSaving } = useUpdateResultNote();

  const handleSaveNote = async () => {
    try {
      await saveNote({ resultId: item.id, note: noteInput });
      setSavedNote(noteInput);
      onNoteSaved?.(item.id, noteInput);
      setEditMode(false);
    } catch (err) {
      console.error("Not kaydetme hatası:", err?.response?.data || err.message);
    }
  };

  const handleDeleteNote = async () => {
    try {
      await saveNote({ resultId: item.id, note: "" });
      setSavedNote("");
      onNoteSaved?.(item.id, "");
      setEditMode(false);
    } catch (err) {
      console.error("Not silme hatası:", err?.response?.data || err.message);
    }
  };

  const handleStartEdit = () => {
    setNoteInput(savedNote);
    setEditMode(true);
  };

  const matchedSkills  = splitList(item.matchedHardSkills);
  const missingSkills  = splitList(item.missingHardSkills);
  const matchedSoft    = splitList(item.matchedSoftSkills);
  const certList       = splitList(item.candidateCertificates);
  const projectList    = splitList(item.candidateProjects);

  const rankStyle = RANK_STYLES[rank] || null;
  const color     = scoreColor(item.finalScore);

  return (
    <Card
      style={{
        borderRadius: 20,
        border: `1.5px solid ${rank < 3 ? color + "50" : "#E9EDF5"}`,
        boxShadow: rank === 0
          ? "0 8px 32px rgba(245,158,11,0.15)"
          : "0 4px 16px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
      styles={{ body: { padding: 0 } }}
    >
      {/* ── Üst bant ── */}
      <div style={{ padding: "18px 20px" }}>
        <Row gutter={[16, 12]} align="middle" wrap={false}>

          {/* Sıralama rozeti */}
          <Col flex="none">
            <div style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: rankStyle ? rankStyle.bg : "#F3F4F6",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: rankStyle ? rankStyle.color : "#9CA3AF",
              fontSize: rankStyle ? 14 : 13, fontWeight: 700,
            }}>
              {rankStyle ? rankStyle.icon : `#${rank + 1}`}
            </div>
          </Col>

          {/* Puan halkası */}
          <Col flex="none">
            <ScoreRing score={Math.round(item.finalScore || 0)} />
          </Col>

          {/* İsim + Dosya + Etiket */}
          <Col flex="auto" style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <Text strong style={{ fontSize: 15, color: "#111827" }}>
                {item.candidateName || "İsimsiz Aday"}
              </Text>
              <Tag
                style={{
                  borderRadius: 999, padding: "1px 10px",
                  background: color + "18", color, border: `1px solid ${color}40`,
                  fontWeight: 600, fontSize: 12,
                }}
              >
                {scoreLabel(item.finalScore)}
              </Tag>
            </div>
            <Space size={6} style={{ color: "#9CA3AF", fontSize: 12 }}>
              <FilePdfOutlined />
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{item.fileName}</Text>
              {item.experienceYears > 0 && (
                <>
                  <span>·</span>
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                    {item.experienceYears} yıl deneyim
                  </Text>
                </>
              )}
            </Space>

            {/* Eşleşen skill tag'leri */}
            {matchedSkills.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
                {matchedSkills.slice(0, 5).map((s) => (
                  <Tag key={s} color="blue" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 11 }}>
                    ✓ {s}
                  </Tag>
                ))}
                {matchedSkills.length > 5 && (
                  <Tag style={{ borderRadius: 999, fontSize: 11, color: "#6B7280" }}>
                    +{matchedSkills.length - 5} daha
                  </Tag>
                )}
              </div>
            )}
          </Col>

          {/* Karşılaştır butonu */}
          <Col flex="none">
            <Button
              size="small"
              onClick={() => onToggleCompare(item.id)}
              disabled={!isCompared && compareDisabled}
              icon={isCompared ? <CheckOutlined /> : <SwapOutlined />}
              style={{
                borderRadius: 8, fontSize: 12, height: 28,
                background: isCompared ? "#3940C1" : undefined,
                borderColor: isCompared ? "#3940C1" : undefined,
                color: isCompared ? "#fff" : undefined,
              }}
            >
              {isCompared ? "Seçildi" : "Karşılaştır"}
            </Button>
          </Col>

          {/* Önizle / İndir butonu */}
          {item.analysisFileId && (
            <Col flex="none">
              <Button
                type="text"
                onClick={() => onPreview(item.analysisFileId, item.fileName)}
                style={{ color: "#3940c1", fontSize: 13, padding: "4px 10px" }}
                icon={isPdf ? <EyeOutlined /> : <DownloadOutlined />}
              >
                {isPdf ? "Önizle" : "İndir"}
              </Button>
            </Col>
          )}

          {/* Detay butonu */}
          <Col flex="none">
            <Button
              type="text"
              onClick={() => setExpanded((v) => !v)}
              style={{ color: "#6B7280", fontSize: 13, padding: "4px 10px" }}
              icon={expanded ? <CaretUpOutlined /> : <CaretDownOutlined />}
            >
              {expanded ? "Kapat" : "Detay"}
            </Button>
          </Col>
        </Row>
      </div>

      {/* ── Genişletilmiş bölüm ── */}
      {expanded && (
        <>
          <Divider style={{ margin: 0, borderColor: "#F1F5F9" }} />
          <div style={{ padding: "20px 20px 16px", background: "#FAFBFF" }}>
            <Row gutter={[24, 20]}>

              {/* Sol: Skor çubukları */}
              <Col xs={24} md={10}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5 }}>
                  PUAN DAĞILIMI
                </Text>
                <div style={{ marginTop: 12 }}>
                  {SCORE_CATEGORIES.map(({ key, label, max, color: c }) => {
                    const raw = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                    const val = item[raw] ?? item[key] ?? 0;
                    return (
                      <CategoryBar key={key} label={label} score={val} max={max} color={c} />
                    );
                  })}
                </div>
              </Col>

              {/* Sağ: Beceriler + Özet */}
              <Col xs={24} md={14}>
                <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5 }}>
                  BECERİ DURUMU
                </Text>

                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {missingSkills.length > 0 && (
                    <div>
                      <Text style={{ fontSize: 12, color: "#EF4444", fontWeight: 600 }}>
                        <CloseCircleOutlined /> Eksik Beceriler
                      </Text>
                      <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {missingSkills.map((s) => (
                          <Tag key={s} color="red" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 11 }}>
                            {s}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedSoft.length > 0 && (
                    <div>
                      <Text style={{ fontSize: 12, color: "#0891B2", fontWeight: 600 }}>
                        <CheckCircleOutlined /> Eşleşen Soft Skills
                      </Text>
                      <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {matchedSoft.map((s) => (
                          <Tag key={s} color="cyan" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 11 }}>
                            {s}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {(certList.length > 0 || projectList.length > 0) && (
                    <div>
                      <Text style={{ fontSize: 12, color: "#7C3AED", fontWeight: 600 }}>
                        <BulbOutlined /> Projeler / Sertifikalar
                      </Text>
                      <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {[...certList, ...projectList].slice(0, 4).map((s, i) => (
                          <Tag key={i} color="purple" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 11 }}>
                            {s}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {item.summary && (
                  <div style={{
                    marginTop: 14, padding: "10px 14px",
                    background: "#fff", borderRadius: 12,
                    border: "1px solid #E9EDF5",
                  }}>
                    <Text style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.7 }}>
                      {item.summary}
                    </Text>
                  </div>
                )}

                {/* ── Not alanı ── */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5 }}>
                      <EditOutlined style={{ marginRight: 4 }} />NOT
                    </Text>
                    {!editMode && !savedNote && (
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => { setNoteInput(""); setEditMode(true); }}
                        style={{ borderRadius: 8, fontSize: 12, height: 26 }}
                      >
                        Not Ekle
                      </Button>
                    )}
                  </div>

                  {/* Kaydedilmiş not */}
                  {!editMode && savedNote && (
                    <div style={{
                      padding: "10px 14px", background: "#FFFBEB",
                      borderRadius: 10, border: "1px solid #FDE68A",
                    }}>
                      <Text style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, display: "block" }}>
                        {savedNote}
                      </Text>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={handleStartEdit}
                          style={{ borderRadius: 8, fontSize: 11, height: 26 }}
                        >
                          Düzenle
                        </Button>
                        <Button
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                          loading={isSaving}
                          onClick={handleDeleteNote}
                          style={{ borderRadius: 8, fontSize: 11, height: 26 }}
                        >
                          Sil
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Düzenleme modu */}
                  {editMode && (
                    <>
                      <TextArea
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Bu aday hakkında notunuzu buraya yazın..."
                        rows={3}
                        style={{ borderRadius: 10, fontSize: 13, resize: "none" }}
                        autoFocus
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <Button
                          size="small"
                          icon={<SaveOutlined />}
                          loading={isSaving}
                          onClick={handleSaveNote}
                          style={{
                            borderRadius: 8, height: 28,
                            background: "#3940c1", color: "#fff", border: "none",
                          }}
                        >
                          Kaydet
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setEditMode(false)}
                          style={{ borderRadius: 8, height: 28 }}
                        >
                          İptal
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </>
      )}
    </Card>
  );
}

// ── CompareModal ──────────────────────────────────────────────────────────────

function CompareModal({ items, open, onClose }) {
  if (!items.length) return null;

  const getScore = (item, key) => {
    const snake = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    return item[snake] ?? item[key] ?? 0;
  };

  const maxPer = (key) => Math.max(...items.map((it) => getScore(it, key)));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="92%"
      style={{ top: 16 }}
      destroyOnHidden
      title={
        <Space>
          <SwapOutlined style={{ color: "#3940C1" }} />
          <span>Aday Karşılaştırma</span>
          <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 13 }}>
            ({items.length} aday)
          </span>
        </Space>
      }
    >
      <Row gutter={[14, 0]} style={{ overflowX: "auto" }} wrap={false}>
        {items.map((item) => {
          const color = scoreColor(item.finalScore);
          const matched = splitList(item.matchedHardSkills);
          const missing = splitList(item.missingHardSkills);

          return (
            <Col key={item.id} flex={`${Math.floor(100 / items.length)}%`} style={{ minWidth: 220 }}>
              {/* Kart başlığı */}
              <div style={{
                textAlign: "center", padding: "16px 12px",
                background: color + "12", borderRadius: 14, marginBottom: 14,
                border: `1.5px solid ${color}30`,
              }}>
                <ScoreRing score={Math.round(item.finalScore || 0)} />
                <Text strong style={{ display: "block", fontSize: 14, marginTop: 8 }}>
                  {item.candidateName || "İsimsiz Aday"}
                </Text>
                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>{item.fileName}</Text>
                {item.experienceYears > 0 && (
                  <Tag style={{ borderRadius: 999, fontSize: 11, marginTop: 6 }}>
                    {item.experienceYears} yıl deneyim
                  </Tag>
                )}
              </div>

              {/* Puan dağılımı */}
              <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5 }}>
                PUAN DAĞILIMI
              </Text>
              <div style={{ marginTop: 8, marginBottom: 14 }}>
                {SCORE_CATEGORIES.map(({ key, label, max, color: c }) => {
                  const val = getScore(item, key);
                  const isWinner = items.length > 1 && val > 0 && val === maxPer(key);
                  return (
                    <div key={key} style={{
                      padding: "3px 6px", borderRadius: 8, marginBottom: 4,
                      background: isWinner ? "#F0FDF4" : "transparent",
                      border: isWinner ? "1px solid #BBF7D0" : "1px solid transparent",
                    }}>
                      <CategoryBar label={label} score={val} max={max} color={isWinner ? "#10B981" : c} />
                    </div>
                  );
                })}
              </div>

              {/* Eşleşen beceriler */}
              {matched.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5 }}>
                    EŞLEŞİEN BECERİLER
                  </Text>
                  <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {matched.slice(0, 6).map((s) => (
                      <Tag key={s} color="blue" style={{ borderRadius: 999, fontSize: 10, marginInlineEnd: 0 }}>{s}</Tag>
                    ))}
                    {matched.length > 6 && (
                      <Tag style={{ borderRadius: 999, fontSize: 10 }}>+{matched.length - 6}</Tag>
                    )}
                  </div>
                </div>
              )}

              {/* Eksik beceriler */}
              {missing.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5 }}>
                    EKSİK BECERİLER
                  </Text>
                  <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {missing.slice(0, 5).map((s) => (
                      <Tag key={s} color="red" style={{ borderRadius: 999, fontSize: 10, marginInlineEnd: 0 }}>{s}</Tag>
                    ))}
                    {missing.length > 5 && (
                      <Tag style={{ borderRadius: 999, fontSize: 10 }}>+{missing.length - 5}</Tag>
                    )}
                  </div>
                </div>
              )}

              {/* Özet */}
              {item.summary && (
                <div style={{
                  padding: "8px 10px", background: "#F8FAFC",
                  borderRadius: 10, border: "1px solid #E9EDF5",
                }}>
                  <Text style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.6 }}>{item.summary}</Text>
                </div>
              )}
            </Col>
          );
        })}
      </Row>
    </Modal>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function AnalysisResultsPage() {
  const navigate = useNavigate();
  const { runId } = useParams();

  const { data, isLoading } = useRunResults(runId);
  const results = data?.data || [];

  const [searchText, setSearchText] = useState("");
  const [sortBy,     setSortBy]     = useState("finalScoreDesc");

  const [preview,     setPreview]     = useState({ url: null, fileName: null, loading: false });
  const [compareIds,  setCompareIds]  = useState(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [notesMap,    setNotesMap]    = useState({});

  const handleNoteSaved = (resultId, note) =>
    setNotesMap((prev) => ({ ...prev, [resultId]: note }));

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const compareItems = results.filter((r) => compareIds.has(r.id));

  const handlePreview = async (fileId, fileName) => {
    setPreview({ url: null, fileName, loading: true });
    try {
      const resp = await AnalysisManager.getFileContent(fileId);
      const url = URL.createObjectURL(resp.data);
      setPreview({ url, fileName, loading: false });
    } catch {
      setPreview({ url: null, fileName: null, loading: false });
    }
  };

  const handleClosePreview = () => {
    if (preview.url) URL.revokeObjectURL(preview.url);
    setPreview({ url: null, fileName: null, loading: false });
  };

  const exportCSV = () => {
    // Türkçe Excel lokasyonu ondalık ayraç olarak virgül bekler;
    // noktalı sayılar (16.6) tarih olarak okunur (16 Haziran).
    const fmtNum = (v) => String(v != null ? Math.round(v * 10) / 10 : 0).replace(".", ",");
    const fmt = (v) => {
      if (typeof v === "number") return `"${fmtNum(v)}"`;
      return `"${String(v ?? "").replace(/"/g, '""')}"`;
    };

    const headers = [
      "Sıra", "Aday Adı", "Dosya", "Toplam Puan",
      "Teknik Beceri", "Eşleşen Beceriler", "Eksik Beceriler",
      "Soft Skill",
      "Deneyim", "Deneyim Yılı",
      "Eğitim", "Proje/Sertifika", "Anlamsal Uyum",
      "Not", "Özet",
    ];
    const rows = sorted.map((r, i) => [
      i + 1,
      r.candidateName ?? "",
      r.fileName ?? "",
      r.finalScore ?? 0,
      r.hardSkillScore ?? 0,
      splitList(r.matchedHardSkills).join("; "),
      splitList(r.missingHardSkills).join("; "),
      r.softSkillScore ?? 0,
      r.experienceScore ?? 0,
      r.experienceYears ?? 0,
      r.educationScore ?? 0,
      r.projectCertScore ?? 0,
      r.semanticScore ?? 0,
      notesMap[r.id] ?? r.note ?? "",
      r.summary ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(fmt).join(";"))
      .join("\r\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analiz-${runId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => {
    if (!results.length) return null;

    const bins = [
      { range: "0–25",  count: 0, fill: "#EF4444" },
      { range: "25–50", count: 0, fill: "#F59E0B" },
      { range: "50–75", count: 0, fill: "#3B82F6" },
      { range: "75–100",count: 0, fill: "#10B981" },
    ];
    results.forEach((r) => {
      const s = r.finalScore || 0;
      if      (s < 25)  bins[0].count++;
      else if (s < 50)  bins[1].count++;
      else if (s < 75)  bins[2].count++;
      else              bins[3].count++;
    });

    const avg = (key) =>
      Math.round(results.reduce((s, r) => s + (r[key] || 0), 0) / results.length * 10) / 10;

    const catBars = SCORE_CATEGORIES.map(({ key, label, max, color }) => ({
      label,
      pct: Math.round((avg(key) / max) * 100),
      color,
    }));

    return { bins, catBars };
  }, [results]);

  // Özet istatistikler
  const stats = useMemo(() => {
    if (!results.length) return null;
    const scores = results.map((r) => r.finalScore || 0);
    return {
      total:   results.length,
      avg:     Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      top:     Math.round(Math.max(...scores)),
      strong:  scores.filter((s) => s >= 75).length,
    };
  }, [results]);

  const sorted = useMemo(() => {
    let list = [...results];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (r) =>
          (r.candidateName || "").toLowerCase().includes(q) ||
          (r.fileName || "").toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "finalScoreDesc":  list.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));    break;
      case "finalScoreAsc":   list.sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0));    break;
      case "experienceDesc":  list.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0)); break;
      case "semanticDesc":    list.sort((a, b) => (b.semanticScore || 0) - (a.semanticScore || 0));     break;
      case "nameAsc":         list.sort((a, b) => (a.candidateName || "").localeCompare(b.candidateName || "", "tr")); break;
      default: break;
    }
    return list;
  }, [results, searchText, sortBy]);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FC" }}>
      <LoginNavbar />

      <div style={{ paddingTop: 108, paddingBottom: compareIds.size > 0 ? 120 : 60 }}>
        <Row justify="center">
          <Col xs={22} md={21} lg={19} xl={17}>

            {/* Geri */}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/analizler")}
              style={{ marginBottom: 20, borderRadius: 999, height: 40 }}
            >
              Analizlere Dön
            </Button>

            {/* Başlık */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 14,
                  background: "linear-gradient(135deg,#3940C1,#6366F1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 18,
                }}>
                  <BarChartOutlined />
                </div>
                <Title level={2} style={{ margin: 0, color: "#111827" }}>
                  Analiz Sonuçları
                </Title>
              </div>
              <Text style={{ color: "#6B7280", fontSize: 14 }}>
                Adaylar 100 puan üzerinden değerlendirildi. Detay için karta tıklayın.
              </Text>
            </div>

            {/* İstatistik kartları */}
            {stats && (
              <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
                {[
                  { title: "Toplam Aday",     value: stats.total,  icon: <TeamOutlined />,        color: "#3940C1" },
                  { title: "Ortalama Puan",   value: stats.avg,    icon: <BarChartOutlined />,    color: "#0891B2" },
                  { title: "En Yüksek Puan",  value: stats.top,    icon: <TrophyOutlined />,      color: "#D97706" },
                  { title: "Güçlü Uyum (75+)",value: stats.strong, icon: <CheckCircleOutlined />, color: "#10B981" },
                ].map(({ title, value, icon, color }) => (
                  <Col xs={12} md={6} key={title}>
                    <Card
                      style={{ borderRadius: 16, border: "1px solid #E9EDF5", textAlign: "center" }}
                      styles={{ body: { padding: "14px 10px" } }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 12, margin: "0 auto 8px",
                        background: color + "18",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color, fontSize: 16,
                      }}>
                        {icon}
                      </div>
                      <Text strong style={{ fontSize: 22, color, display: "block", lineHeight: 1.1 }}>
                        {value}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#9CA3AF" }}>{title}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* Grafikler */}
            {chartData && (
              <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
                {/* Puan Dağılımı */}
                <Col xs={24} md={12}>
                  <Card
                    style={{ borderRadius: 16, border: "1px solid #E9EDF5" }}
                    styles={{ body: { padding: "18px 16px" } }}
                  >
                    <Text strong style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 14 }}>
                      Puan Dağılımı
                    </Text>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData.bins} barCategoryGap="25%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#6B7280" }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                        <RechartTooltip
                          formatter={(v) => [v + " aday", "Aday"]}
                          contentStyle={{ borderRadius: 10, fontSize: 12 }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {chartData.bins.map((entry) => (
                            <Cell key={entry.range} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

                {/* Kategori Ortalamaları */}
                <Col xs={24} md={12}>
                  <Card
                    style={{ borderRadius: 16, border: "1px solid #E9EDF5" }}
                    styles={{ body: { padding: "18px 16px" } }}
                  >
                    <Text strong style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 14 }}>
                      Kategori Ortalamaları (%)
                    </Text>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData.catBars} layout="vertical" barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#6B7280" }} unit="%" />
                        <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 10, fill: "#6B7280" }} />
                        <RechartTooltip
                          formatter={(v) => [v + "%", "Ort. Uyum"]}
                          contentStyle={{ borderRadius: 10, fontSize: 12 }}
                        />
                        <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                          {chartData.catBars.map((entry) => (
                            <Cell key={entry.label} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Arama + Sıralama */}
            <Card
              style={{ borderRadius: 16, border: "1px solid #E9EDF5", marginBottom: 20 }}
              styles={{ body: { padding: "14px 16px" } }}
            >
              <Row gutter={[12, 10]} align="middle">
                <Col xs={24} md={13}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                    placeholder="Aday adı veya dosya adıyla ara..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ borderRadius: 12, height: 40 }}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: "100%" }}
                    size="large"
                  >
                    <Option value="finalScoreDesc">Toplam puan: yüksekten düşüğe</Option>
                    <Option value="finalScoreAsc">Toplam puan: düşükten yükseğe</Option>
                    <Option value="experienceDesc">Deneyim yılına göre (çoktan aza)</Option>
                    <Option value="semanticDesc">Anlamsal uyuma göre</Option>
                    <Option value="nameAsc">İsme göre A–Z</Option>
                  </Select>
                </Col>
                <Col xs={24} md={3}>
                  <Button
                    icon={<FileExcelOutlined />}
                    onClick={exportCSV}
                    disabled={sorted.length === 0}
                    style={{
                      width: "100%", height: 40, borderRadius: 12,
                      background: "#10B981", color: "#fff", border: "none",
                      fontWeight: 600,
                    }}
                  >
                    CSV
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Sonuç listesi */}
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <Spin size="large" />
              </div>
            ) : sorted.length === 0 ? (
              <Card style={{ borderRadius: 18, border: "1px solid #E9EDF5" }}>
                <Empty description="Sonuç bulunamadı" />
              </Card>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {sorted.map((item, idx) => (
                  <CandidateCard
                    key={item.id ?? idx}
                    item={item}
                    rank={idx}
                    onPreview={handlePreview}
                    isCompared={compareIds.has(item.id)}
                    onToggleCompare={toggleCompare}
                    compareDisabled={compareIds.size >= 3}
                    onNoteSaved={handleNoteSaved}
                  />
                ))}
              </div>
            )}

          </Col>
        </Row>
      </div>

      {/* ── Karşılaştırma alt barı ── */}
      {compareIds.size > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: "#fff", borderTop: "2px solid #E9EDF5",
          padding: "12px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.10)",
          flexWrap: "wrap", gap: 10,
        }}>
          <Space wrap>
            <Text style={{ color: "#6B7280", fontSize: 13 }}>Seçilen adaylar:</Text>
            {compareItems.map((item) => (
              <Tag
                key={item.id}
                closable
                onClose={() => toggleCompare(item.id)}
                style={{
                  borderRadius: 999, fontSize: 12, padding: "3px 10px",
                  background: scoreColor(item.finalScore) + "18",
                  color: scoreColor(item.finalScore),
                  border: `1px solid ${scoreColor(item.finalScore)}40`,
                }}
              >
                {item.candidateName || "İsimsiz"} · {Math.round(item.finalScore || 0)}
              </Tag>
            ))}
            {compareIds.size < 3 && (
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                ({3 - compareIds.size} daha ekleyebilirsiniz)
              </Text>
            )}
          </Space>
          <Space>
            <Button onClick={() => setCompareIds(new Set())} style={{ borderRadius: 10, height: 36 }}>
              Temizle
            </Button>
            <Button
              type="primary"
              disabled={compareIds.size < 2}
              icon={<SwapOutlined />}
              onClick={() => setCompareOpen(true)}
              style={{ borderRadius: 10, height: 36, background: "#3940C1", borderColor: "#3940C1" }}
            >
              Karşılaştır ({compareIds.size}/3)
            </Button>
          </Space>
        </div>
      )}

      {/* ── Karşılaştırma Modalı ── */}
      <CompareModal
        items={compareItems}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
      />

      {/* ── PDF / DOCX Önizleme Modalı ── */}
      <Modal
        open={!!preview.url || preview.loading}
        onCancel={handleClosePreview}
        footer={null}
        width="82%"
        title={preview.fileName}
        style={{ top: 20 }}
        destroyOnHidden
      >
        {preview.loading && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        )}
        {preview.url && (preview.fileName?.toLowerCase().endsWith(".pdf") ? (
          <iframe
            src={preview.url}
            style={{ width: "100%", height: "78vh", border: "none", borderRadius: 8 }}
            title="CV Önizleme"
          />
        ) : (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Text style={{ color: "#6B7280", display: "block", marginBottom: 20 }}>
              DOCX dosyaları tarayıcıda önizlenemez.
            </Text>
            <a href={preview.url} download={preview.fileName}>
              <Button type="primary" icon={<DownloadOutlined />} size="large">
                Dosyayı İndir
              </Button>
            </a>
          </div>
        ))}
      </Modal>
    </div>
  );
}
