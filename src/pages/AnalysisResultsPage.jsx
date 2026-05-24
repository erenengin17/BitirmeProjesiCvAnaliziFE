import { useMemo, useState, useEffect } from "react";
import XLSXStyle from "xlsx-js-style";
import {
  Row, Col, Typography, Card, Space, Tag, Spin, Empty,
  Button, Input, Select, Progress, Divider, Modal,
  Badge, notification, Checkbox, Drawer, Slider,
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
  RobotOutlined, FilterOutlined, CopyOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { useRunResults, useUpdateResultNote, useExplainResult, useRunById, useUpdateResultStatus, useBulkUpdateStatus } from "../requests/AnalysisQueries";
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

const PIPELINE_STATUSES = new Set([
  "MULAKATA_CAGRILDI", "TELEFON_GORUSMESI", "TEKNIK_MULAKAT",
  "IK_MULAKATI", "TEKLIF_VERILDI", "ISE_ALINDI",
]);

function CandidateCard({ item, rank, onPreview, isCompared, onToggleCompare, compareDisabled, onNoteSaved, categories, minExperienceYears, isSelected, onToggleSelect, onStatusChange, statusOverride }) {
  const [expanded,       setExpanded]       = useState(false);
  const [savedNote,      setSavedNote]      = useState(item.note || "");
  const [editMode,       setEditMode]       = useState(false);
  const [noteInput,      setNoteInput]      = useState("");
  const [explainOpen,    setExplainOpen]    = useState(false);
  const [explanation,    setExplanation]    = useState("");
  const [pipelineStatus, setPipelineStatus] = useState(statusOverride || item.status || "BEKLEMEDE");

  useEffect(() => {
    if (statusOverride) setPipelineStatus(statusOverride);
  }, [statusOverride]);
  const isPdf = (item.fileName || "").toLowerCase().endsWith(".pdf");
  const inPipeline = PIPELINE_STATUSES.has(pipelineStatus);

  const { mutateAsync: saveNote,      isPending: isSaving       } = useUpdateResultNote();
  const { mutateAsync: explainResult, isPending: isExplaining   } = useExplainResult();
  const { mutateAsync: updateStatus,  isPending: isAddingToPool } = useUpdateResultStatus();

  const isRejected = pipelineStatus === "REDDEDILDI";

  const handleAddToPipeline = async () => {
    setPipelineStatus("MULAKATA_CAGRILDI");
    onStatusChange?.(item.id, "MULAKATA_CAGRILDI");
    try {
      await updateStatus({ resultId: item.id, status: "MULAKATA_CAGRILDI" });
    } catch {
      setPipelineStatus(item.status || "BEKLEMEDE");
      onStatusChange?.(item.id, item.status || "BEKLEMEDE");
    }
  };

  const handleReject = async () => {
    setPipelineStatus("REDDEDILDI");
    onStatusChange?.(item.id, "REDDEDILDI");
    try {
      await updateStatus({ resultId: item.id, status: "REDDEDILDI" });
    } catch {
      setPipelineStatus(item.status || "BEKLEMEDE");
      onStatusChange?.(item.id, item.status || "BEKLEMEDE");
    }
  };

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
        border: `1.5px solid ${isSelected ? "#3940C1" : rank < 3 ? color + "50" : "#E9EDF5"}`,
        boxShadow: isSelected
          ? "0 0 0 3px rgba(57,64,193,0.12)"
          : rank === 0
            ? "0 8px 32px rgba(245,158,11,0.15)"
            : "0 4px 16px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
      styles={{ body: { padding: 0 } }}
    >
      {/* ── Üst bant ── */}
      <div
        style={{ padding: "18px 20px", cursor: "pointer", userSelect: "none" }}
        onClick={() => onToggleSelect?.(item.id)}
      >
        <Row gutter={[16, 12]} align="middle" wrap={false}>

          {/* Sıralama rozeti / seçim göstergesi */}
          <Col flex="none">
            <div style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: isSelected ? "#3940C1" : rankStyle ? rankStyle.bg : "#F3F4F6",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: isSelected ? "#fff" : rankStyle ? rankStyle.color : "#9CA3AF",
              fontSize: rankStyle ? 14 : 13, fontWeight: 700,
              transition: "all 0.15s",
            }}>
              {isSelected ? <CheckOutlined style={{ fontSize: 14 }} /> : rankStyle ? rankStyle.icon : `#${rank + 1}`}
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
              <Tag
                style={{
                  borderRadius: 999, padding: "1px 10px",
                  background: isRejected ? "#FFF1F2" : inPipeline ? "#D1FAE5" : "#FEF3C7",
                  color: isRejected ? "#EF4444" : inPipeline ? "#059669" : "#D97706",
                  border: `1px solid ${isRejected ? "#FECDD3" : inPipeline ? "#A7F3D0" : "#FDE68A"}`,
                  fontWeight: 600, fontSize: 12,
                }}
              >
                {isRejected ? "Reddedildi" : inPipeline ? "Mülakata Çağrıldı" : "Beklemede"}
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

          {/* Aksiyonlar — kart seçimini tetiklememesi için propagation durdur */}
          <Col flex="none" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

              {/* Durum dropdown */}
              {isAddingToPool ? (
                <Tag style={{ borderRadius: 999, padding: "3px 12px", fontSize: 12, fontWeight: 600, background: "#F3F4F6", color: "#9CA3AF", border: "1px solid #E5E7EB" }}>
                  <Spin size="small" style={{ marginRight: 6 }} />
                  İşleniyor...
                </Tag>
              ) : !inPipeline && !isRejected ? (
                <>
                  <Button
                    size="small"
                    icon={<TeamOutlined />}
                    loading={isAddingToPool}
                    onClick={handleAddToPipeline}
                    style={{ borderRadius: 8, fontSize: 12, height: 28, background: "#3940C1", color: "#fff", border: "none", fontWeight: 600 }}
                  >
                    Mülakata Çağır
                  </Button>
                  <Button
                    size="small"
                    icon={<CloseCircleOutlined />}
                    loading={isAddingToPool}
                    danger
                    onClick={handleReject}
                    style={{ borderRadius: 8, fontSize: 12, height: 28, fontWeight: 600 }}
                  >
                    Reddet
                  </Button>
                </>
              ) : inPipeline ? (
                <Tag style={{ borderRadius: 999, padding: "3px 12px", background: "#D1FAE5", color: "#059669", border: "1px solid #A7F3D0", fontWeight: 600, fontSize: 12 }}>
                  <CheckCircleOutlined style={{ marginRight: 4 }} />Mülakata Çağrıldı
                </Tag>
              ) : (
                <Tag style={{ borderRadius: 999, padding: "3px 12px", background: "#FFF1F2", color: "#EF4444", border: "1px solid #FECDD3", fontWeight: 600, fontSize: 12 }}>
                  <CloseCircleOutlined style={{ marginRight: 4 }} />Reddedildi
                </Tag>
              )}

              {/* Karşılaştır */}
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

              {/* Rapor */}
              <Button
                size="small"
                onClick={handleExplain}
                icon={<RobotOutlined />}
                style={{ borderRadius: 8, fontSize: 12, height: 28, background: "#EEF2FF", color: "#3940C1", borderColor: "#C7D2FE", fontWeight: 600 }}
              >
                Rapor
              </Button>

              {/* Önizle / İndir */}
              {item.analysisFileId && (
                <Button
                  type="text"
                  onClick={() => onPreview(item.analysisFileId, item.fileName)}
                  style={{ color: "#3940c1", fontSize: 13, padding: "4px 10px" }}
                  icon={isPdf ? <EyeOutlined /> : <DownloadOutlined />}
                >
                  {isPdf ? "Önizle" : "İndir"}
                </Button>
              )}

              {/* Detay */}
              <Button
                type="text"
                onClick={() => setExpanded((v) => !v)}
                style={{ color: "#6B7280", fontSize: 13, padding: "4px 10px" }}
                icon={expanded ? <CaretUpOutlined /> : <CaretDownOutlined />}
              >
                {expanded ? "Kapat" : "Detay"}
              </Button>
            </div>
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
                  {matchedSkills.length > 0 && (
                    <div>
                      <Text style={{ fontSize: 12, color: "#4F46E5", fontWeight: 600 }}>
                        <CheckCircleOutlined /> Eşleşen Teknik Beceriler
                      </Text>
                      <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {matchedSkills.map((s) => (
                          <Tag key={s} color="blue" style={{ borderRadius: 999, marginInlineEnd: 0, fontSize: 11 }}>
                            ✓ {s}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}

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

  const [preview,      setPreview]     = useState({ url: null, fileName: null, loading: false });
  const [compareIds,   setCompareIds]  = useState(new Set());
  const [compareOpen,  setCompareOpen] = useState(false);
  const [notesMap,     setNotesMap]    = useState({});
  const [selectedIds,  setSelectedIds] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [statusMap,    setStatusMap]    = useState({});
  const [expMin,            setExpMin]            = useState("");
  const [expMax,            setExpMax]            = useState("");
  const [skillFilter,       setSkillFilter]       = useState([]);
  const [skillMode,         setSkillMode]         = useState("any");
  const [minScore,          setMinScore]          = useState(0);
  const [filterDrawerOpen,  setFilterDrawerOpen]  = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const { mutateAsync: bulkUpdateStatus, isPending: isBulkUpdating } = useBulkUpdateStatus();

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkUpdate = async (status, successMsg) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    try {
      await bulkUpdateStatus({ resultIds: ids, status });
      setStatusMap((prev) => {
        const next = { ...prev };
        ids.forEach((id) => { next[id] = status; });
        return next;
      });
      clearSelection();
      api.success({ message: successMsg, placement: "topRight" });
    } catch {
      api.error({ message: "Toplu işlem başarısız.", placement: "topRight" });
    }
  };

  const handleBulkAddToPipeline = () => bulkUpdate("MULAKATA_CAGRILDI", `${selectedIds.size} aday mülakata çağrıldı!`);
  const handleBulkReject       = () => bulkUpdate("REDDEDILDI",        `${selectedIds.size} aday reddedildi.`);
  const handleBulkSetPending   = () => bulkUpdate("BEKLEMEDE",         `${selectedIds.size} aday beklemede'ye alındı.`);

  const handleNoteSaved = (resultId, note) =>
    setNotesMap((prev) => ({ ...prev, [resultId]: note }));

  const handleStatusChange = (resultId, newStatus) =>
    setStatusMap((prev) => ({ ...prev, [resultId]: newStatus }));

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

    // ── Durum yardımcıları ────────────────────────────────────────────────────
    const getStatusLabel = (r) => {
      const s = statusMap[r.id] ?? r.status;
      if (!s || s === "BEKLEMEDE") return "Beklemede";
      if (PIPELINE_STATUSES.has(s) || s === "MULAKATA_CAGRILDI") return "Mülakata Çağrıldı";
      if (s === "REDDEDILDI") return "Reddedildi";
      return "Beklemede";
    };

    const statusStyle = (label) => {
      const map = {
        "Mülakata Çağrıldı": { bg: "D1FAE5", fg: "065F46" },
        "Reddedildi":        { bg: "FEE2E2", fg: "991B1B" },
        "Beklemede":         { bg: "FEF3C7", fg: "92400E" },
      };
      const { bg, fg } = map[label] || { bg: "F9FAFB", fg: "374151" };
      return {
        font:      { bold: true, sz: 10, color: { rgb: fg } },
        fill:      { fgColor: { rgb: bg } },
        alignment: { horizontal: "center", vertical: "center" },
        border:    cellStyle().border,
      };
    };

    // ── Başlık renkleri (sütun başına) ────────────────────────────────────────
    const HEADER_COLORS = [
      "374151","374151","374151",  // Sıra, Aday, Dosya
      "1E3A8A",                    // Toplam Puan
      "059669",                    // Mülakat Durumu
      "4F46E5","4F46E5","4F46E5", // Teknik
      "0E7490",                    // Soft
      "065F46","065F46",           // Deneyim
      "92400E",                    // Eğitim
      "6D28D9",                    // Proje/Sert
      "9D174D",                    // Anlamsal
      "374151","374151",           // Not, Özet
    ];

    const HEADERS = [
      "Sıra","Aday Adı","Dosya","Toplam Puan","Mülakat Durumu",
      "Teknik Beceri","Eşleşen Beceriler","Eksik Beceriler",
      "Soft Skill","Deneyim","Deneyim Yılı",
      "Eğitim","Proje / Sertifika","Anlamsal Uyum",
      "Not","Özet",
    ];

    // ── Veri satırları ────────────────────────────────────────────────────────
    // 0:Sıra 1:Aday 2:Dosya 3:Puan 4:Durum 5:Teknik 6:Eşleşen 7:Eksik
    // 8:Soft 9:Deneyim 10:DeneyimYıl 11:Eğitim 12:Proje 13:Anlamsal 14:Not 15:Özet
    const dataRows = sorted.map((r, i) => [
      i + 1,
      r.candidateName ?? "",
      r.fileName ?? "",
      round1(r.finalScore),
      getStatusLabel(r),
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
        } else if (c === 4) {
          ws[ref] = { v: val, t: "s", s: statusStyle(val) };
        } else if ([5, 8, 9, 10, 11, 12, 13].includes(c)) {
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
      Math.max(...dataRows.map((r) => String(r[15] ?? "").length), 10),
      120
    );

    // Sütun genişlikleri
    // 0:Sıra 1:Aday 2:Dosya 3:Puan 4:Durum 5:Teknik 6:Eşleşen 7:Eksik
    // 8:Soft 9:Den.skor 10:Den.yıl 11:Eğitim 12:Proje 13:Anlamsal 14:Not 15:Özet
    ws["!cols"] = [
      { wch: 6 },             // Sıra
      { wch: 22 },            // Aday
      { wch: 22 },            // Dosya
      { wch: 12 },            // Toplam Puan
      { wch: 20 },            // Mülakat Durumu
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

  const hardSkillOptions = useMemo(
    () => splitList(run?.hardSkills).map((s) => ({ label: s, value: s })),
    [run],
  );

  const activeFilterCount = [
    expMin !== "" ? 1 : 0,
    expMax !== "" ? 1 : 0,
    skillFilter.length > 0 ? 1 : 0,
    minScore > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const resetAdvancedFilters = () => {
    setExpMin("");
    setExpMax("");
    setSkillFilter([]);
    setSkillMode("any");
    setMinScore(0);
  };

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

    const minExp = expMin !== "" ? Number(expMin) : null;
    const maxExp = expMax !== "" ? Number(expMax) : null;
    if (minExp !== null && !isNaN(minExp))
      list = list.filter((r) => (r.experienceYears || 0) >= minExp);
    if (maxExp !== null && !isNaN(maxExp))
      list = list.filter((r) => (r.experienceYears || 0) <= maxExp);

    if (minScore > 0)
      list = list.filter((r) => (r.finalScore || 0) >= minScore);

    if (skillFilter.length > 0) {
      list = list.filter((r) => {
        const matched = splitList(r.matchedHardSkills).map((s) => s.toLowerCase());
        if (skillMode === "all")
          return skillFilter.every((sk) => matched.includes(sk.toLowerCase()));
        return skillFilter.some((sk) => matched.includes(sk.toLowerCase()));
      });
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
  }, [results, searchText, sortBy, expMin, expMax, skillFilter, skillMode, minScore]);

  const tabCounts = useMemo(() => {
    const c = { ALL: results.length, BEKLEMEDE: 0, MULAKATA_CAGRILDI: 0, REDDEDILDI: 0 };
    results.forEach((r) => {
      const s = statusMap[r.id] ?? r.status;
      if (!s || s === "BEKLEMEDE") c.BEKLEMEDE++;
      else if (PIPELINE_STATUSES.has(s) || s === "MULAKATA_CAGRILDI") c.MULAKATA_CAGRILDI++;
      else if (s === "REDDEDILDI") c.REDDEDILDI++;
      else c.BEKLEMEDE++;
    });
    return c;
  }, [results, statusMap]);

  const filteredSorted = useMemo(() => {
    if (statusFilter === "ALL") return sorted;
    return sorted.filter((item) => {
      const s = statusMap[item.id] ?? item.status;
      if (statusFilter === "BEKLEMEDE") return !s || s === "BEKLEMEDE";
      if (statusFilter === "MULAKATA_CAGRILDI") return PIPELINE_STATUSES.has(s) || s === "MULAKATA_CAGRILDI";
      if (statusFilter === "REDDEDILDI") return s === "REDDEDILDI";
      return true;
    });
  }, [sorted, statusFilter, statusMap]);

  const allFilteredSelected  = filteredSorted.length > 0 && filteredSorted.every((r) => selectedIds.has(r.id));
  const someFilteredSelected = filteredSorted.some((r) => selectedIds.has(r.id));

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredSorted.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredSorted.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef0f7" }}>
      {contextHolder}
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
              <Row gutter={[10, 10]} align="middle">
                <Col xs={24} md={11}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                    placeholder="Aday adı veya dosya adıyla ara..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ borderRadius: 12, height: 40 }}
                  />
                </Col>
                <Col xs={24} md={7}>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: "100%" }}
                    size="large"
                  >
                    <Option value="finalScoreDesc">Puan: yüksekten düşüğe</Option>
                    <Option value="finalScoreAsc">Puan: düşükten yükseğe</Option>
                    <Option value="experienceDesc">Deneyim: çoktan aza</Option>
                    <Option value="semanticDesc">Anlamsal uyuma göre</Option>
                    <Option value="nameAsc">İsme göre A–Z</Option>
                  </Select>
                </Col>
                <Col xs={12} md={3}>
                  <Badge count={activeFilterCount} color="#3940C1" offset={[-6, 4]}>
                    <Button
                      icon={<FilterOutlined />}
                      onClick={() => setFilterDrawerOpen(true)}
                      style={{
                        width: "100%", height: 40, borderRadius: 12, fontWeight: 600,
                        background: activeFilterCount > 0 ? "#EEF2FF" : "#fff",
                        borderColor: activeFilterCount > 0 ? "#C7D2FE" : "#d9d9d9",
                        color: activeFilterCount > 0 ? "#3940C1" : "#374151",
                      }}
                    >
                      Filtrele
                    </Button>
                  </Badge>
                </Col>
                <Col xs={12} md={3}>
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

              {/* Aktif filtre etiketleri */}
              {activeFilterCount > 0 && (
                <div style={{
                  marginTop: 10, paddingTop: 10,
                  borderTop: "1px solid #F1F5F9",
                  display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
                }}>
                  <Text style={{ fontSize: 11, color: "#9CA3AF" }}>Aktif filtreler:</Text>
                  {minScore > 0 && (
                    <Tag
                      closable onClose={() => setMinScore(0)}
                      style={{ borderRadius: 999, background: "#EEF2FF", color: "#3940C1", border: "1px solid #C7D2FE", fontSize: 11 }}
                    >
                      Min. skor ≥ {minScore}
                    </Tag>
                  )}
                  {(expMin !== "" || expMax !== "") && (
                    <Tag
                      closable onClose={() => { setExpMin(""); setExpMax(""); }}
                      style={{ borderRadius: 999, background: "#F0FDF4", color: "#059669", border: "1px solid #BBF7D0", fontSize: 11 }}
                    >
                      Deneyim: {expMin || "0"} – {expMax || "30+"} yıl
                    </Tag>
                  )}
                  {skillFilter.length > 0 && (
                    <Tag
                      closable onClose={() => setSkillFilter([])}
                      style={{ borderRadius: 999, background: "#F5F3FF", color: "#4F46E5", border: "1px solid #DDD6FE", fontSize: 11 }}
                    >
                      {skillFilter.length} beceri ({skillMode === "all" ? "tümü" : "en az biri"})
                    </Tag>
                  )}
                  <Button
                    type="link" size="small"
                    onClick={resetAdvancedFilters}
                    style={{ color: "#EF4444", fontSize: 11, padding: "0 4px", height: "auto" }}
                  >
                    Tümünü temizle
                  </Button>
                </div>
              )}
            </Card>

            {/* Status geçiş sekmeleri */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { key: "ALL",               label: "Tümü",               count: tabCounts.ALL },
                { key: "MULAKATA_CAGRILDI", label: "Mülakata Çağrıldı",  count: tabCounts.MULAKATA_CAGRILDI },
                { key: "BEKLEMEDE",         label: "Beklemede",           count: tabCounts.BEKLEMEDE },
                { key: "REDDEDILDI",        label: "Reddedildi",          count: tabCounts.REDDEDILDI },
              ].map(({ key, label, count }) => {
                const active = statusFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    style={{
                      padding: "7px 18px", borderRadius: 999, border: "none",
                      cursor: "pointer", fontWeight: 600, fontSize: 13,
                      background: active ? "#3940C1" : "#fff",
                      color: active ? "#fff" : "#374151",
                      boxShadow: active ? "0 2px 10px rgba(57,64,193,0.25)" : "0 1px 4px rgba(0,0,0,0.07)",
                      display: "inline-flex", alignItems: "center", gap: 7,
                    }}
                  >
                    {label}
                    <span style={{
                      background: active ? "rgba(255,255,255,0.22)" : "#F1F5F9",
                      color: active ? "#fff" : "#6B7280",
                      borderRadius: 999, padding: "1px 8px", fontSize: 11, fontWeight: 700,
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Toplu seçim çubuğu */}
            {selectedIds.size > 0 && (
              <Card
                style={{ borderRadius: 14, border: "1.5px solid #C7D2FE", background: "#EEF2FF", marginBottom: 14 }}
                styles={{ body: { padding: "10px 16px" } }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <Space>
                    <Badge count={selectedIds.size} color="#3940C1" />
                    <Text style={{ color: "#374151", fontWeight: 600 }}>aday seçildi</Text>
                    <Button size="small" onClick={clearSelection} style={{ color: "#9CA3AF", borderRadius: 8 }}>
                      Seçimi Temizle
                    </Button>
                  </Space>
                  <Space wrap>
                    <Button
                      type="primary"
                      icon={<TeamOutlined />}
                      loading={isBulkUpdating}
                      onClick={handleBulkAddToPipeline}
                      style={{ background: "#3940c1", border: "none", borderRadius: 10, fontWeight: 600 }}
                    >
                      Mülakata Çağır ({selectedIds.size})
                    </Button>
                    <Button
                      icon={<CloseCircleOutlined />}
                      danger
                      loading={isBulkUpdating}
                      onClick={handleBulkReject}
                      style={{ borderRadius: 10, fontWeight: 600 }}
                    >
                      Reddet ({selectedIds.size})
                    </Button>
                    <Button
                      icon={<CheckCircleOutlined />}
                      loading={isBulkUpdating}
                      onClick={handleBulkSetPending}
                      style={{ borderRadius: 10, fontWeight: 600, background: "#FEF3C7", color: "#D97706", border: "1px solid #FDE68A" }}
                    >
                      Beklemede'ye Al ({selectedIds.size})
                    </Button>
                  </Space>
                </div>
              </Card>
            )}

            {/* Hepsini seç satırı */}
            {!isLoading && filteredSorted.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "4px 2px" }}>
                <Checkbox
                  checked={allFilteredSelected}
                  indeterminate={someFilteredSelected && !allFilteredSelected}
                  onChange={handleSelectAll}
                >
                  <Text style={{ fontSize: 13, color: "#6B7280" }}>
                    {allFilteredSelected ? "Seçimi kaldır" : "Hepsini seç"} ({filteredSorted.length} aday)
                  </Text>
                </Checkbox>
              </div>
            )}

            {/* Sonuç listesi */}
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <Spin size="large" />
              </div>
            ) : filteredSorted.length === 0 ? (
              <Card style={{ borderRadius: 18, border: "1px solid #E9EDF5" }}>
                <Empty description="Sonuç bulunamadı" />
              </Card>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {filteredSorted.map((item, idx) => (
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
                    isSelected={selectedIds.has(item.id)}
                    onToggleSelect={toggleSelect}
                    onStatusChange={handleStatusChange}
                    statusOverride={statusMap[item.id]}
                  />
                ))}
              </div>
            )}

          </Col>
        </Row>
      </div>

      {/* ── Filtre Drawer ── */}
      <Drawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        placement="right"
        width={360}
        styles={{
          body:   { padding: 0, overflowY: "auto" },
          header: { padding: "18px 20px", borderBottom: "1px solid #F1F5F9" },
          footer: { padding: "14px 20px", borderTop: "1px solid #F1F5F9" },
        }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg,#3940C1,#6366F1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14,
            }}>
              <FilterOutlined />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Gelişmiş Filtreler</span>
            {activeFilterCount > 0 && (
              <span style={{
                background: "#3940C1", color: "#fff",
                borderRadius: 999, padding: "1px 9px", fontSize: 11, fontWeight: 700,
              }}>
                {activeFilterCount}
              </span>
            )}
          </div>
        }
        footer={
          <div style={{ display: "flex", gap: 10 }}>
            <Button
              block
              onClick={resetAdvancedFilters}
              disabled={activeFilterCount === 0}
              style={{ borderRadius: 10, height: 40, fontWeight: 600 }}
            >
              Temizle
            </Button>
            <Button
              block
              type="primary"
              onClick={() => setFilterDrawerOpen(false)}
              style={{ borderRadius: 10, height: 40, fontWeight: 600, background: "#3940C1", border: "none" }}
            >
              Uygula
            </Button>
          </div>
        }
      >
        <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* ── Bölüm: Minimum Skor ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: "#EEF2FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#3940C1", fontSize: 13,
              }}>
                <TrophyOutlined />
              </div>
              <Text strong style={{ fontSize: 13, color: "#374151", flex: 1 }}>Minimum Skor</Text>
              {minScore > 0 && (
                <span style={{
                  background: "#EEF2FF", color: "#3940C1",
                  border: "1px solid #C7D2FE",
                  borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700,
                }}>
                  ≥ {minScore}
                </span>
              )}
            </div>

            <div style={{ padding: "0 6px" }}>
              <Slider
                min={0} max={100} step={5}
                value={minScore}
                onChange={setMinScore}
                marks={{ 0: "0", 35: "35", 55: "55", 75: "75", 100: "100" }}
                tooltip={{ formatter: (v) => `${v} puan` }}
                styles={{
                  track: { background: "#3940C1" },
                  handle: { borderColor: "#3940C1" },
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <Text style={{ fontSize: 11, color: "#D1D5DB" }}>Tüm adaylar</Text>
              <Text style={{ fontSize: 11, color: "#D1D5DB" }}>Sadece en iyiler</Text>
            </div>

            {/* Skor renk rehberi */}
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              {[
                { label: "Zayıf",  range: "< 35",  bg: "#FEE2E2", color: "#991B1B" },
                { label: "Orta",   range: "35–54",  bg: "#FEF3C7", color: "#92400E" },
                { label: "İyi",    range: "55–74",  bg: "#DBEAFE", color: "#1E40AF" },
                { label: "Güçlü",  range: "≥ 75",   bg: "#D1FAE5", color: "#065F46" },
              ].map(({ label, range, bg, color }) => (
                <div key={label} style={{
                  padding: "3px 9px", borderRadius: 999,
                  background: bg, color, fontSize: 11, fontWeight: 600,
                }}>
                  {label} {range}
                </div>
              ))}
            </div>
          </div>

          <Divider style={{ margin: "0 0 28px", borderColor: "#F1F5F9" }} />

          {/* ── Bölüm: Deneyim Yılı ── */}
          <div style={{ marginBottom: hardSkillOptions.length > 0 ? 28 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: "#F0FDF4",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#059669", fontSize: 13,
              }}>
                <BarChartOutlined />
              </div>
              <Text strong style={{ fontSize: 13, color: "#374151", flex: 1 }}>Deneyim Yılı</Text>
              {(expMin !== "" || expMax !== "") && (
                <span style={{
                  background: "#F0FDF4", color: "#059669",
                  border: "1px solid #BBF7D0",
                  borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700,
                }}>
                  {expMin || "0"} – {expMax || "30+"} yıl
                </span>
              )}
            </div>

            <div style={{ padding: "0 6px" }}>
              <Slider
                range
                min={0} max={30}
                value={[
                  expMin === "" ? 0  : Number(expMin),
                  expMax === "" ? 30 : Number(expMax),
                ]}
                onChange={([mn, mx]) => {
                  setExpMin(mn > 0  ? String(mn) : "");
                  setExpMax(mx < 30 ? String(mx) : "");
                }}
                marks={{ 0: "0", 5: "5", 10: "10", 20: "20", 30: "30+" }}
                tooltip={{ formatter: (v) => v === 30 ? "30+ yıl" : `${v} yıl` }}
                styles={{
                  track: { background: "#059669" },
                  handle: { borderColor: "#059669" },
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <Text style={{ fontSize: 11, color: "#D1D5DB" }}>Az deneyim</Text>
              <Text style={{ fontSize: 11, color: "#D1D5DB" }}>Çok deneyim</Text>
            </div>

            {/* Hızlı seçim butonları */}
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              {[
                { label: "Junior (0–2 yıl)",    min: "",  max: "2" },
                { label: "Mid (3–5 yıl)",        min: "3", max: "5" },
                { label: "Senior (5+ yıl)",      min: "5", max: "" },
              ].map(({ label, min, max }) => {
                const active = expMin === min && expMax === max;
                return (
                  <button
                    key={label}
                    onClick={() => { setExpMin(min); setExpMax(max); }}
                    style={{
                      padding: "5px 12px", borderRadius: 999, border: "none",
                      cursor: "pointer", fontSize: 11, fontWeight: 600,
                      background: active ? "#059669" : "#F0FDF4",
                      color:      active ? "#fff"    : "#059669",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Bölüm: Teknik Beceriler ── */}
          {hardSkillOptions.length > 0 && (
            <>
              <Divider style={{ margin: "0 0 28px", borderColor: "#F1F5F9" }} />

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    background: "#F5F3FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#4F46E5", fontSize: 13,
                  }}>
                    <CheckCircleOutlined />
                  </div>
                  <Text strong style={{ fontSize: 13, color: "#374151", flex: 1 }}>Teknik Beceriler</Text>
                  {skillFilter.length > 0 && (
                    <span style={{
                      background: "#F5F3FF", color: "#4F46E5",
                      border: "1px solid #DDD6FE",
                      borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700,
                    }}>
                      {skillFilter.length} seçili
                    </span>
                  )}
                </div>

                {/* Mod toggle */}
                <div style={{
                  display: "flex", gap: 4, marginBottom: 14,
                  padding: 4, borderRadius: 10, background: "#F3F4F6",
                }}>
                  {[
                    { value: "any", label: "En az birine sahip" },
                    { value: "all", label: "Tümüne sahip" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setSkillMode(value)}
                      style={{
                        flex: 1, padding: "7px 0", borderRadius: 8, border: "none",
                        cursor: "pointer", fontSize: 12, fontWeight: 600,
                        background: skillMode === value ? "#fff" : "transparent",
                        color:      skillMode === value ? "#3940C1" : "#9CA3AF",
                        boxShadow:  skillMode === value ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Skill etiketleri */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {hardSkillOptions.map(({ value, label }) => {
                    const selected = skillFilter.includes(value);
                    return (
                      <button
                        key={value}
                        onClick={() =>
                          setSkillFilter((prev) =>
                            selected ? prev.filter((s) => s !== value) : [...prev, value]
                          )
                        }
                        style={{
                          padding: "6px 14px", borderRadius: 999, border: "none",
                          cursor: "pointer", fontSize: 12, fontWeight: 600,
                          background: selected ? "#4F46E5" : "#F3F4F6",
                          color:      selected ? "#fff"    : "#374151",
                          boxShadow:  selected ? "0 2px 8px rgba(79,70,229,0.25)" : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {selected ? "✓ " : ""}{label}
                      </button>
                    );
                  })}
                </div>

                {skillFilter.length > 0 && (
                  <button
                    onClick={() => setSkillFilter([])}
                    style={{
                      marginTop: 12, padding: "4px 12px", borderRadius: 999,
                      border: "1px dashed #D1D5DB", background: "transparent",
                      cursor: "pointer", fontSize: 11, color: "#9CA3AF", fontWeight: 600,
                    }}
                  >
                    Seçimi temizle
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </Drawer>

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
