import { useMemo, useState } from "react";
import XLSXStyle from "xlsx-js-style";
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
  RobotOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { useRunResults, useUpdateResultNote, useExplainResult, useRunById } from "../requests/AnalysisQueries";
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

// Run'daki aktif kriterlere göre etkili max puanları hesaplar
function buildActiveCategories(run) {
  const softOn = splitList(run?.softSkills).length > 0;
  const eduOn  = splitList(run?.educationRequirements).length > 0;
  const projOn = run?.requireProjectOrCertificate === true;
  const semOn  = run?.useSemanticSimilarity !== false;
  const total  = 20 + (softOn?15:0) + (eduOn?10:0) + 20 + (projOn?10:0) + (semOn?25:0);
  const eff    = (raw) => Math.round((raw / total) * 100);
  return [
    { key: "hardSkillScore",   label: "Teknik Beceriler",  rawMax: 20, effMax: eff(20),              active: true,   color: "#4F46E5" },
    { key: "softSkillScore",   label: "Soft Skills",        rawMax: 15, effMax: softOn ? eff(15) : 0, active: softOn, color: "#0891B2" },
    { key: "experienceScore",  label: "Deneyim",            rawMax: 20, effMax: eff(20),              active: true,   color: "#059669" },
    { key: "educationScore",   label: "Eğitim",             rawMax: 10, effMax: eduOn  ? eff(10) : 0, active: eduOn,  color: "#D97706" },
    { key: "projectCertScore", label: "Proje / Sertifika",  rawMax: 10, effMax: projOn ? eff(10) : 0, active: projOn, color: "#7C3AED" },
    { key: "semanticScore",    label: "Anlamsal Uyum",      rawMax: 25, effMax: semOn  ? eff(25) : 0, active: semOn,  color: "#DB2777" },
  ];
}

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

function CategoryBar({ label, score, max, color, active = true }) {
  const pct = (active && max > 0) ? Math.round((score / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 8, opacity: active ? 1 : 0.45 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <Text style={{ fontSize: 12, color: active ? "#6B7280" : "#D1D5DB", textDecoration: active ? "none" : "line-through" }}>
          {label}
        </Text>
        {active ? (
          <Text strong style={{ fontSize: 12, color }}>
            {score?.toFixed(1) ?? "0"} <Text style={{ fontSize: 10, color: "#9CA3AF" }}>/ {max}</Text>
          </Text>
        ) : (
          <Text style={{ fontSize: 11, color: "#D1D5DB" }}>devre dışı</Text>
        )}
      </div>
      {active && (
        <Progress percent={pct} showInfo={false} strokeColor={color} trailColor="#F1F5F9" strokeWidth={5} style={{ margin: 0 }} />
      )}
    </div>
  );
}

// ── CandidateCard ─────────────────────────────────────────────────────────────

function CandidateCard({ item, rank, onPreview, isCompared, onToggleCompare, compareDisabled, onNoteSaved, categories, minExperienceYears }) {
  const [expanded,     setExpanded]     = useState(false);
  const [savedNote,    setSavedNote]    = useState(item.note || "");
  const [editMode,     setEditMode]     = useState(false);
  const [noteInput,    setNoteInput]    = useState("");
  const [explainOpen,  setExplainOpen]  = useState(false);
  const [explanation,  setExplanation]  = useState("");
  const isPdf = (item.fileName || "").toLowerCase().endsWith(".pdf");

  const { mutateAsync: saveNote,     isPending: isSaving    } = useUpdateResultNote();
  const { mutateAsync: explainResult, isPending: isExplaining } = useExplainResult();

  const handleExplain = async () => {
    setExplainOpen(true);
    if (explanation) return;
    try {
      const res = await explainResult(item.id);
      setExplanation(res?.data?.explanation || "Açıklama oluşturulamadı.");
    } catch {
      setExplanation("Puan gerekçesi şu an alınamıyor. Lütfen tekrar deneyin.");
    }
  };

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
                    {minExperienceYears > 0 && (
                      <span style={{ color: item.experienceYears >= minExperienceYears ? "#10B981" : "#EF4444" }}>
                        {" "}(min. {minExperienceYears} yıl)
                      </span>
                    )}
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

          {/* Detaylı Rapor butonu */}
          <Col flex="none">
            <Button
              size="small"
              onClick={handleExplain}
              icon={<RobotOutlined />}
              style={{
                borderRadius: 8, fontSize: 12, height: 28,
                background: "#EEF2FF", color: "#3940C1",
                borderColor: "#C7D2FE", fontWeight: 600,
              }}
            >
              Rapor
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

      {/* ── Detaylı Rapor modalı ── */}
      <Modal
        open={explainOpen}
        onCancel={() => setExplainOpen(false)}
        footer={null}
        width={620}
        destroyOnHidden
        title={
          <Space>
            <RobotOutlined style={{ color: "#3940C1" }} />
            <span style={{ fontWeight: 700 }}>Aday Değerlendirme Raporu</span>
            <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 13 }}>
              — {item.candidateName || "İsimsiz Aday"}
            </span>
          </Space>
        }
      >
        {isExplaining ? (
          <div style={{ textAlign: "center", padding: "52px 0" }}>
            <Spin size="large" />
            <Text style={{ display: "block", marginTop: 16, color: "#6B7280", fontSize: 13 }}>
              GPT-4o mini rapor hazırlıyor...
            </Text>
          </div>
        ) : (
          <ReportContent text={explanation} />
        )}
      </Modal>

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
                  {(categories ?? SCORE_CATEGORIES.map(c => ({ ...c, effMax: c.max, rawMax: c.max, active: true }))).map(({ key, label, effMax, rawMax, active, color: c }) => {
                    const raw = key.replace(/([A-Z])/g, "_$1").toLowerCase();
                    const rawVal = item[raw] ?? item[key] ?? 0;
                    const displayVal = (active && rawMax > 0) ? Math.round((rawVal / rawMax) * effMax * 10) / 10 : 0;
                    return (
                      <CategoryBar key={key} label={label} score={displayVal} max={effMax} color={c} active={active} />
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
                    <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5, display: "block", marginBottom: 4 }}>
                      DEĞERLENDİRME
                    </Text>
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

function CompareModal({ items, open, onClose, categories }) {
  if (!items.length) return null;

  const cats = categories ?? SCORE_CATEGORIES.map(c => ({ ...c, effMax: c.max, rawMax: c.max, active: true }));

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
                {cats.map(({ key, label, effMax, rawMax, active, color: c }) => {
                  const rawVal = getScore(item, key);
                  const isWinner = active && items.length > 1 && rawVal > 0 && rawVal === maxPer(key);
                  const displayVal = (active && rawMax > 0) ? Math.round((rawVal / rawMax) * effMax * 10) / 10 : 0;
                  return (
                    <div key={key} style={{
                      padding: "3px 6px", borderRadius: 8, marginBottom: 4,
                      background: isWinner ? "#F0FDF4" : "transparent",
                      border: isWinner ? "1px solid #BBF7D0" : "1px solid transparent",
                    }}>
                      <CategoryBar label={label} score={displayVal} max={effMax} color={isWinner ? "#10B981" : c} active={active} />
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

// ── Rapor görüntüleyici ───────────────────────────────────────────────────────

const SECTION_COLORS = {
  "GENEL DEĞERLENDİRME": { bg: "#EEF2FF", border: "#C7D2FE", icon: "📋" },
  "TEKNİK YETKİNLİK":    { bg: "#F0FDF4", border: "#BBF7D0", icon: "💻" },
  "DENEYİM VE EĞİTİM":   { bg: "#FFF7ED", border: "#FED7AA", icon: "🎓" },
  "GÜÇLÜ YÖNLER":         { bg: "#F0FDF4", border: "#86EFAC", icon: "✅" },
  "GELİŞİM ALANLARI":     { bg: "#FFF1F2", border: "#FECDD3", icon: "⚠️" },
  "İŞE ALIM TAVSİYESİ":  { bg: "#EFF6FF", border: "#BFDBFE", icon: "🎯" },
};

function ReportContent({ text }) {
  if (!text) return null;

  const sections = [];
  let currentTitle = null;
  let currentLines = [];

  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const isHeader = trimmed === trimmed.toUpperCase() && trimmed.length > 4 && /^[A-ZÇĞİÖŞÜ\s]+$/.test(trimmed);
    if (isHeader) {
      if (currentTitle) sections.push({ title: currentTitle, body: currentLines.join(" ").trim() });
      currentTitle = trimmed;
      currentLines = [];
    } else {
      currentLines.push(trimmed);
    }
  });
  if (currentTitle) sections.push({ title: currentTitle, body: currentLines.join(" ").trim() });

  if (sections.length === 0) {
    return (
      <div style={{ padding: "8px 4px" }}>
        <div style={{ padding: "16px 18px", borderRadius: 12, background: "#F8FAFF", border: "1px solid #E8EDFF" }}>
          <Text style={{ fontSize: 14, color: "#374151", lineHeight: 1.85, display: "block", whiteSpace: "pre-wrap" }}>
            {text}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10, padding: "4px 0 8px" }}>
      {sections.map(({ title, body }) => {
        const style = SECTION_COLORS[title] || { bg: "#F9FAFB", border: "#E5E7EB", icon: "•" };
        return (
          <div key={title} style={{
            padding: "12px 16px", borderRadius: 12,
            background: style.bg, border: `1px solid ${style.border}`,
          }}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: 0.6, display: "block", marginBottom: 5 }}>
              {style.icon} {title}
            </Text>
            <Text style={{ fontSize: 13, color: "#374151", lineHeight: 1.75, display: "block" }}>
              {body}
            </Text>
          </div>
        );
      })}
      <Text style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right" }}>
        GPT-4o mini tarafından üretilmiştir
      </Text>
    </div>
  );
}

// ── Kriter Özeti ─────────────────────────────────────────────────────────────

function CriteriaCard({ run }) {
  const [open, setOpen] = useState(false);
  if (!run) return null;

  const hardSkills = splitList(run.hardSkills);
  const softSkills = splitList(run.softSkills);
  const education  = splitList(run.educationRequirements);

  return (
    <Card
      style={{
        borderRadius: 16,
        border: "1.5px solid #C7D2FE",
        background: "#F5F6FF",
        marginBottom: 24,
      }}
      styles={{ body: { padding: "14px 18px" } }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <Space>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#3940C1", fontSize: 14,
          }}>
            <BulbOutlined />
          </div>
          <Text strong style={{ fontSize: 13, color: "#3940C1" }}>
            Analiz Kriterleri
          </Text>
          {run.runName && (
            <Text style={{ fontSize: 12, color: "#6B7280" }}>— {run.runName}</Text>
          )}
        </Space>
        <Button
          type="text"
          size="small"
          icon={open ? <CaretUpOutlined /> : <CaretDownOutlined />}
          style={{ color: "#6B7280" }}
        />
      </div>

      {open && (
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {hardSkills.length > 0 && (
            <div>
              <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
                TEKNİK BECERİLER
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {hardSkills.map((s) => (
                  <Tag key={s} color="blue" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 12 }}>{s}</Tag>
                ))}
              </div>
            </div>
          )}

          {softSkills.length > 0 && (
            <div>
              <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
                SOFT SKİLLS
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {softSkills.map((s) => (
                  <Tag key={s} color="cyan" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 12 }}>{s}</Tag>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <Text style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
                EĞİTİM GEREKSİNİMLERİ
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {education.map((s) => (
                  <Tag key={s} color="gold" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 12 }}>{s}</Tag>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {run.minExperienceYears > 0 && (
              <Tag style={{ borderRadius: 999, fontSize: 12, padding: "2px 12px", background: "#F0FDF4", color: "#059669", border: "1px solid #BBF7D0" }}>
                Min. {run.minExperienceYears} yıl deneyim
              </Tag>
            )}
            <Tag style={{
              borderRadius: 999, fontSize: 12, padding: "2px 12px",
              background: run.requireProjectOrCertificate ? "#EEF2FF" : "#F9FAFB",
              color: run.requireProjectOrCertificate ? "#3940C1" : "#9CA3AF",
              border: `1px solid ${run.requireProjectOrCertificate ? "#C7D2FE" : "#E5E7EB"}`,
            }}>
              {run.requireProjectOrCertificate ? "✓" : "✗"} Proje / Sertifika
            </Tag>
            <Tag style={{
              borderRadius: 999, fontSize: 12, padding: "2px 12px",
              background: run.useSemanticSimilarity ? "#EEF2FF" : "#F9FAFB",
              color: run.useSemanticSimilarity ? "#3940C1" : "#9CA3AF",
              border: `1px solid ${run.useSemanticSimilarity ? "#C7D2FE" : "#E5E7EB"}`,
            }}>
              {run.useSemanticSimilarity ? "✓" : "✗"} Anlamsal Benzerlik
            </Tag>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function AnalysisResultsPage() {
  const navigate = useNavigate();
  const { runId } = useParams();

  const { data, isLoading } = useRunResults(runId);
  const { data: runData }   = useRunById(runId);
  const run = runData?.data ?? null;
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
    const round1 = (v) => Math.round((v ?? 0) * 10) / 10;

    // ── Stil şablonları ───────────────────────────────────────────────────────
    const hdrStyle = (bgHex) => ({
      font:      { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      fill:      { fgColor: { rgb: bgHex } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top:    { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left:   { style: "thin", color: { rgb: "CCCCCC" } },
        right:  { style: "thin", color: { rgb: "CCCCCC" } },
      },
    });

    const cellStyle = (bgHex = "FFFFFF", bold = false, align = "center", wrap = false) => ({
      font:      { bold, sz: 10, color: { rgb: "1F2937" } },
      fill:      { fgColor: { rgb: bgHex } },
      alignment: { horizontal: align, vertical: "center", wrapText: wrap },
      border: {
        top:    { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left:   { style: "thin", color: { rgb: "E5E7EB" } },
        right:  { style: "thin", color: { rgb: "E5E7EB" } },
      },
    });

    const scoreStyle = (score) => {
      const bg = score >= 75 ? "D1FAE5" : score >= 55 ? "DBEAFE" : score >= 35 ? "FEF3C7" : "FEE2E2";
      const fg = score >= 75 ? "065F46" : score >= 55 ? "1E40AF" : score >= 35 ? "92400E" : "991B1B";
      return {
        font:      { bold: true, sz: 11, color: { rgb: fg } },
        fill:      { fgColor: { rgb: bg } },
        alignment: { horizontal: "center", vertical: "center" },
        border: cellStyle().border,
      };
    };

    const rankStyle = (rank) => {
      const cfg = rank === 0 ? { bg: "FEF3C7", fg: "92400E" }
                : rank === 1 ? { bg: "F3F4F6", fg: "374151" }
                : rank === 2 ? { bg: "FEF0E7", fg: "7C3AED" }
                : { bg: "F9FAFB", fg: "6B7280" };
      return {
        font:      { bold: rank < 3, sz: 11, color: { rgb: cfg.fg } },
        fill:      { fgColor: { rgb: cfg.bg } },
        alignment: { horizontal: "center", vertical: "center" },
        border:    cellStyle().border,
      };
    };

    // ── Başlık renkleri (sütun başına) ────────────────────────────────────────
    const HEADER_COLORS = [
      "374151","374151","374151",  // Sıra, Aday, Dosya
      "1E3A8A",                    // Toplam Puan
      "4F46E5","4F46E5","4F46E5", // Teknik
      "0E7490",                    // Soft
      "065F46","065F46",           // Deneyim
      "92400E",                    // Eğitim
      "6D28D9",                    // Proje/Sert
      "9D174D",                    // Anlamsal
      "374151","374151",           // Not, Özet
    ];

    const HEADERS = [
      "Sıra","Aday Adı","Dosya","Toplam Puan",
      "Teknik Beceri","Eşleşen Beceriler","Eksik Beceriler",
      "Soft Skill","Deneyim","Deneyim Yılı",
      "Eğitim","Proje / Sertifika","Anlamsal Uyum",
      "Not","Özet",
    ];

    // ── Veri satırları ────────────────────────────────────────────────────────
    const dataRows = sorted.map((r, i) => [
      i + 1,
      r.candidateName ?? "",
      r.fileName ?? "",
      round1(r.finalScore),
      round1(r.hardSkillScore),
      splitList(r.matchedHardSkills).join(", "),
      splitList(r.missingHardSkills).join(", "),
      round1(r.softSkillScore),
      round1(r.experienceScore),
      r.experienceYears ?? 0,
      round1(r.educationScore),
      round1(r.projectCertScore),
      round1(r.semanticScore),
      notesMap[r.id] ?? r.note ?? "",
      r.summary ?? "",
    ]);

    // ── Worksheet oluştur ─────────────────────────────────────────────────────
    const ws = {};
    const range = { s: { c: 0, r: 0 }, e: { c: HEADERS.length - 1, r: dataRows.length } };

    // Başlık satırı (satır 0)
    HEADERS.forEach((h, c) => {
      const ref = XLSXStyle.utils.encode_cell({ r: 0, c });
      ws[ref] = { v: h, t: "s", s: hdrStyle(HEADER_COLORS[c]) };
    });

    // Veri satırları (satır 1+)
    dataRows.forEach((row, ri) => {
      const isEven = ri % 2 === 0;
      const baseBg = isEven ? "F9FAFB" : "FFFFFF";

      row.forEach((val, c) => {
        const ref = XLSXStyle.utils.encode_cell({ r: ri + 1, c });
        const score = round1(sorted[ri]?.finalScore ?? 0);

        if (c === 0) {
          ws[ref] = { v: val, t: "n", s: rankStyle(ri) };
        } else if (c === 3) {
          ws[ref] = { v: val, t: "n", s: scoreStyle(score) };
        } else if ([4, 7, 8, 9, 10, 11, 12].includes(c)) {
          ws[ref] = { v: val, t: "n", s: cellStyle(baseBg, false, "center") };
        } else if (c === 1) {
          ws[ref] = { v: val, t: "s", s: cellStyle(baseBg, true, "left") };
        } else {
          ws[ref] = { v: val, t: "s", s: cellStyle(baseBg, false, "left") };
        }
      });
    });

    ws["!ref"] = XLSXStyle.utils.encode_range(range);

    // Özet sütunu için max karakter uzunluğunu hesapla
    const summaryMaxLen = Math.min(
      Math.max(...dataRows.map((r) => String(r[14] ?? "").length), 10),
      120
    );

    // Sütun genişlikleri
    ws["!cols"] = [
      { wch: 6 },             // Sıra
      { wch: 22 },            // Aday
      { wch: 22 },            // Dosya
      { wch: 12 },            // Toplam
      { wch: 12 },            // Teknik
      { wch: 30 },            // Eşleşen
      { wch: 25 },            // Eksik
      { wch: 10 },            // Soft
      { wch: 10 },            // Deneyim skor
      { wch: 10 },            // Deneyim yıl
      { wch: 10 },            // Eğitim
      { wch: 12 },            // Proje
      { wch: 12 },            // Anlamsal
      { wch: 45 },            // Not
      { wch: summaryMaxLen }, // Özet — içeriğe göre
    ];

    // Sabit satır yükseklikleri — bozulmayı önler
    ws["!rows"] = [{ hpt: 30 }, ...dataRows.map(() => ({ hpt: 18 }))];

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, "Analiz Sonuçları");
    XLSXStyle.writeFile(wb, `analiz-${runId}.xlsx`);
  };

  const activeCategories = useMemo(() => buildActiveCategories(run), [run]);

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

    const catBars = activeCategories
      .filter(({ active }) => active)
      .map(({ key, label, rawMax, color }) => ({
        label,
        pct: rawMax > 0 ? Math.round((avg(key) / rawMax) * 100) : 0,
        color,
      }));

    return { bins, catBars };
  }, [results, activeCategories]);

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

            {/* Kriter özeti */}
            <CriteriaCard run={run} />

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
                    Excel
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
                    categories={activeCategories}
                    minExperienceYears={run?.minExperienceYears ?? 0}
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
        categories={activeCategories}
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
