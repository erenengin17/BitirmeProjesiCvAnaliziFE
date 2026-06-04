import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import XLSXStyle from "xlsx-js-style";
import {
  Row, Col, Typography, Card, Tag, Spin, Button, Input,
  Divider, Tooltip, Space, notification, Steps, DatePicker, Modal,
} from "antd";
import {
  ArrowLeftOutlined, CheckCircleOutlined, MailOutlined,
  CopyOutlined, FilePdfOutlined, TrophyOutlined,
  SearchOutlined, ArrowRightOutlined, UserOutlined,
  FileExcelOutlined, CloseCircleOutlined,
  EditOutlined, CalendarOutlined, SaveOutlined,
  HistoryOutlined, FormOutlined, StarFilled,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import LoginNavbar from "../components/LoginNavbar";
import {
  usePipelineResults,
  useUpdateResultStatus,
  useUpdateInterviewDate,
  useUpdateResultNote,
  useStageLog,
  useChatPipelineResults,
} from "../requests/AnalysisQueries";
import ChatDrawer from "../components/ChatDrawer";
import EvaluationModal from "../components/EvaluationModal";
import axiosInstance from "../requests/axiosInstance";

dayjs.locale("tr");

const { Title, Text } = Typography;
const PRIMARY = "#3940C1";

const PIPELINE_STAGES = [
  { key: "MULAKATA_CAGRILDI", label: "Mülakata Çağrıldı", stepLabel: "Mülakata Çağrıldı " },
  { key: "TELEFON_GORUSMESI", label: "Telefon Görüşmesi", stepLabel: "Telefon Görüşmesi " },
  { key: "TEKNIK_MULAKAT",    label: "Teknik Mülakat",    stepLabel: "Teknik Mülakat " },
  { key: "IK_MULAKATI",       label: "İK Mülakatı",       stepLabel: "İK Mülakatı " },
  { key: "TEKLIF_VERILDI",    label: "Teklif Verildi",    stepLabel: "Teklif Verildi " },
  { key: "ISE_ALINDI",        label: "İşe Alındı",        stepLabel: "İşe Alındı " },
];

const PIPELINE_STATUS_SET = new Set(PIPELINE_STAGES.map((s) => s.key));

const stageIdx = (s) => PIPELINE_STAGES.findIndex((st) => st.key === s);

const STAGE_DATE_LABEL = {
  MULAKATA_CAGRILDI: "Mülakat Tarihi",
  TELEFON_GORUSMESI: "Telefon Görüşmesi Tarihi",
  TEKNIK_MULAKAT:    "Teknik Mülakat Tarihi",
  IK_MULAKATI:       "İK Mülakatı Tarihi",
  TEKLIF_VERILDI:    "Teklif Tarihi",
  ISE_ALINDI:        "İşe Alınma Tarihi",
};

const STATUS_CFG = {
  BEKLEMEDE:          { label: "Beklemede",          color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  MULAKATA_CAGRILDI:  { label: "Mülakata Çağrıldı",  color: PRIMARY,   bg: "#EEF2FF", border: "#C7D2FE" },
  TELEFON_GORUSMESI:  { label: "Telefon Görüşmesi",  color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD" },
  TEKNIK_MULAKAT:     { label: "Teknik Mülakat",     color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  IK_MULAKATI:        { label: "İK Mülakatı",        color: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8" },
  TEKLIF_VERILDI:     { label: "Teklif Verildi",     color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  ISE_ALINDI:         { label: "İşe Alındı",         color: "#10B981", bg: "#D1FAE5", border: "#A7F3D0" },
  REDDEDILDI:         { label: "Reddedildi",          color: "#EF4444", bg: "#FFF1F2", border: "#FECDD3" },
};

function scoreColor(s) {
  if (s >= 75) return "#10B981";
  if (s >= 55) return "#3B82F6";
  if (s >= 35) return "#F59E0B";
  return "#EF4444";
}

function splitList(str) {
  if (!str) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

const EVAL_STAGES = new Set(["TELEFON_GORUSMESI", "TEKNIK_MULAKAT", "IK_MULAKATI"]);

function CandidateCard({
  item, rank, status, interviewDate,
  onStageAdvance, onReject, onInterviewDateChange, onNoteSave, onOpenEval, evalRefreshKey, isSaving,
}) {
  const score   = Math.round(item.finalScore || 0);
  const color   = scoreColor(score);
  const matched = splitList(item.matchedHardSkills);
  const soft    = splitList(item.matchedSoftSkills);
  const cfg     = STATUS_CFG[status] ?? STATUS_CFG.MULAKATA_CAGRILDI;
  const sIdx    = stageIdx(status);
  const isCompleted = status === "ISE_ALINDI";
  const nextStage   = !isCompleted && sIdx >= 0 && sIdx < PIPELINE_STAGES.length - 1
    ? PIPELINE_STAGES[sIdx + 1]
    : null;

  const [editingNote, setEditingNote]     = useState(false);
  const [noteValue, setNoteValue]         = useState(item.note || "");
  const [dateOpen, setDateOpen]           = useState(false);
  const [rejectModal, setRejectModal]     = useState(false);
  const [stageModal, setStageModal]       = useState(false);
  const [stageDateVal, setStageDateVal]   = useState(null);
  const [showLog, setShowLog]             = useState(false);
  const [showEvals, setShowEvals]         = useState(false);
  const [evalData, setEvalData]           = useState(null);
  const [evalLoading, setEvalLoading]     = useState(false);

  const { data: logData, isFetching: isLogLoading } = useStageLog(item.id, showLog);

  const EVAL_STAGE_LABELS = {
    TELEFON_GORUSMESI: "Telefon Görüşmesi",
    TEKNIK_MULAKAT:    "Teknik Mülakat",
    IK_MULAKATI:       "İK Mülakatı",
  };
  const EVAL_STAGE_COLORS = {
    TELEFON_GORUSMESI: "#0EA5E9",
    TEKNIK_MULAKAT:    "#7C3AED",
    IK_MULAKATI:       "#EC4899",
  };

  const loadEvals = async () => {
    if (evalData !== null) return;
    setEvalLoading(true);
    try {
      const res = await axiosInstance.get(`/api/analyses/results/${item.id}/evaluations`);
      setEvalData(res.data || []);
    } catch {
      setEvalData([]);
    } finally {
      setEvalLoading(false);
    }
  };

  const toggleEvals = () => {
    if (!showEvals) loadEvals();
    setShowEvals((v) => !v);
  };

  useEffect(() => {
    if (evalRefreshKey === 0) return;
    setEvalData(null);
    if (showEvals) loadEvals();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evalRefreshKey]);
  const stageLog = logData?.data || [];

  const copyEmail = (e) => {
    e.stopPropagation();
    if (!item.candidateEmail) return;
    navigator.clipboard.writeText(item.candidateEmail).then(() => {
      notification.success({
        message: "E-posta Kopyalandı",
        description: item.candidateEmail,
        placement: "topRight",
        duration: 2.5,
        icon: <MailOutlined style={{ color: "#059669" }} />,
        style: { borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
      });
    });
  };

  return (
    <Card
      style={{
        borderRadius: 20,
        border: isCompleted
          ? "1.5px solid #A7F3D0"
          : rank < 3
          ? `1.5px solid ${color}40`
          : "1px solid #E9EDF5",
        boxShadow: rank === 0
          ? "0 8px 32px rgba(16,185,129,0.10)"
          : "0 2px 12px rgba(0,0,0,0.04)",
      }}
      styles={{ body: { padding: "20px 22px" } }}
    >
      {/* Ana bilgi satırı */}
      <Row gutter={[16, 12]} align="middle" wrap={false}>

        <Col flex="none">
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: rank < 3
              ? ["linear-gradient(135deg,#F59E0B,#D97706)", "linear-gradient(135deg,#9CA3AF,#6B7280)", "linear-gradient(135deg,#CD7C2E,#B45309)"][rank]
              : "#F3F4F6",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: rank < 3 ? "#fff" : "#9CA3AF",
            fontWeight: 700, fontSize: 13,
          }}>
            #{rank + 1}
          </div>
        </Col>

        <Col flex="none">
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: color + "18", border: `2px solid ${color}40`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <Text strong style={{ fontSize: 16, color, lineHeight: 1 }}>{score}</Text>
            <Text style={{ fontSize: 9, color: "#9CA3AF", lineHeight: 1.3 }}>/100</Text>
          </div>
        </Col>

        <Col flex="auto" style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
            <UserOutlined style={{ color: "#9CA3AF" }} />
            <Text strong style={{ fontSize: 15, color: "#111827" }}>
              {item.candidateName || "İsimsiz Aday"}
            </Text>
            <Tag style={{
              borderRadius: 999, padding: "1px 10px",
              background: color + "18", color, border: `1px solid ${color}40`,
              fontWeight: 600, fontSize: 11,
            }}>
              {score >= 75 ? "Güçlü Uyum" : score >= 55 ? "İyi Uyum" : score >= 35 ? "Orta Uyum" : "Zayıf Uyum"}
            </Tag>
            <Tag style={{
              borderRadius: 999, padding: "1px 10px",
              background: cfg.bg, color: cfg.color,
              border: `1px solid ${cfg.border}`,
              fontWeight: 600, fontSize: 11,
            }}>
              {cfg.label}
            </Tag>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <FilePdfOutlined style={{ color: "#9CA3AF", fontSize: 11 }} />
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{item.fileName}</Text>
            {item.experienceYears > 0 && (
              <>
                <Text style={{ color: "#D1D5DB" }}>·</Text>
                <TrophyOutlined style={{ color: "#D97706", fontSize: 11 }} />
                <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{item.experienceYears} yıl deneyim</Text>
              </>
            )}
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 4,
            padding: "5px 12px", borderRadius: 10,
            background: item.candidateEmail ? "#F0FDF4" : "#F9FAFB",
            border: `1px solid ${item.candidateEmail ? "#BBF7D0" : "#E5E7EB"}`,
          }}>
            <MailOutlined style={{ color: item.candidateEmail ? "#059669" : "#D1D5DB", fontSize: 13 }} />
            {item.candidateEmail ? (
              <>
                <Text style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>{item.candidateEmail}</Text>
                <Tooltip title="Kopyala">
                  <Button
                    type="text" size="small" icon={<CopyOutlined />}
                    onClick={copyEmail}
                    style={{ color: "#059669", padding: "0 4px", height: 20 }}
                  />
                </Tooltip>
              </>
            ) : (
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>E-posta bulunamadı</Text>
            )}
          </div>
        </Col>

        <Col flex="none" style={{ maxWidth: 200 }}>
          {matched.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: 4 }}>
                TEKNİK BECERİLER
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {matched.slice(0, 5).map((s) => (
                  <Tag key={s} color="blue" style={{ borderRadius: 999, fontSize: 10, marginInlineEnd: 0 }}>{s}</Tag>
                ))}
                {matched.length > 5 && (
                  <Tag style={{ borderRadius: 999, fontSize: 10, color: "#6B7280" }}>+{matched.length - 5}</Tag>
                )}
              </div>
            </div>
          )}
          {soft.length > 0 && (
            <div>
              <Text style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", display: "block", marginBottom: 4 }}>
                SOFT SKILLS
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {soft.slice(0, 3).map((s) => (
                  <Tag key={s} color="cyan" style={{ borderRadius: 999, fontSize: 10, marginInlineEnd: 0 }}>{s}</Tag>
                ))}
              </div>
            </div>
          )}
        </Col>
      </Row>

      {/* Aşama + tarih + aksiyonlar */}
      <div style={{ marginTop: 16, borderTop: "1px solid #F3F4F6", paddingTop: 16 }}>

        {/* Aşama göstergesi — herhangi bir aşamaya tıklayarak geçiş yapılabilir */}
        <div style={{ overflowX: "auto", marginBottom: 14 }}>
          <Steps
            size="small"
            current={sIdx >= 0 ? sIdx : 0}
            status={isCompleted ? "finish" : "process"}
            onChange={(idx) => onStageAdvance(PIPELINE_STAGES[idx].key)}
            items={PIPELINE_STAGES.map((s) => ({ title: s.stepLabel }))}
          />
        </div>

        {/* Tarih + butonlar — yan yana */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

          {/* Mülakat tarihi — tıklanabilir kart */}
          <div
            onClick={() => setDateOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 14px", borderRadius: 12, cursor: "pointer",
              background: interviewDate ? "#F0F9FF" : "#F9FAFB",
              border: `1.5px solid ${interviewDate ? "#BAE6FD" : "#E5E7EB"}`,
              transition: "border-color 0.15s",
              minWidth: 200,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = interviewDate ? "#0EA5E9" : "#C7D2FE";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = interviewDate ? "#BAE6FD" : "#E5E7EB";
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: interviewDate
                ? "linear-gradient(135deg,#0EA5E9,#0284C7)"
                : "linear-gradient(135deg,#E5E7EB,#D1D5DB)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 14,
            }}>
              <CalendarOutlined />
            </div>
            <div style={{ lineHeight: 1.35, flex: 1 }}>
              <Text style={{ fontSize: 10, color: "#6B7280", display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {STAGE_DATE_LABEL[status] ?? "Tarih"}
              </Text>
              <Text style={{
                fontSize: 13, fontWeight: 600,
                color: interviewDate ? "#0369A1" : "#9CA3AF",
              }}>
                {interviewDate
                  ? dayjs(interviewDate).format("DD MMMM YYYY, HH:mm")
                  : "Tarih seçmek için tıklayın"}
              </Text>
            </div>
            {interviewDate && (
              <EditOutlined style={{ color: "#9CA3AF", fontSize: 12, flexShrink: 0 }} />
            )}
          </div>

          {/* Gizli DatePicker — yukarıdaki div tarafından tetiklenir */}
          <DatePicker
            open={dateOpen}
            onOpenChange={setDateOpen}
            showTime={{ format: "HH:mm" }}
            value={interviewDate ? dayjs(interviewDate) : null}
            onChange={(date) => {
              onInterviewDateChange(date ? date.toISOString() : null);
              setDateOpen(false);
            }}
            style={{
              position: "absolute",
              width: 0, height: 0,
              opacity: 0, overflow: "hidden",
              border: "none", padding: 0,
              pointerEvents: "none",
            }}
          />

          {/* Sonraki aşama */}
          {nextStage && (
            <>
              <Button
                type="primary"
                size="middle"
                icon={<ArrowRightOutlined />}
                loading={isSaving}
                onClick={() => {
                  if (interviewDate) {
                    onStageAdvance(nextStage.key);
                  } else {
                    setStageDateVal(dayjs());
                    setStageModal(true);
                  }
                }}
                style={{
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${PRIMARY}, #6366F1)`,
                  border: "none",
                  fontWeight: 600,
                  height: 38,
                }}
              >
                {nextStage.label}
              </Button>

              <Modal
                open={stageModal}
                centered
                onCancel={() => setStageModal(false)}
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: `linear-gradient(135deg, ${PRIMARY}, #6366F1)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 15,
                    }}>
                      <ArrowRightOutlined />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{nextStage.label}'a Geç</span>
                  </div>
                }
                footer={[
                  <Button key="skip" onClick={() => { onStageAdvance(nextStage.key); setStageModal(false); }}
                    style={{ borderRadius: 8 }}>
                    Tarihi Atla
                  </Button>,
                  <Button key="ok" type="primary" loading={isSaving}
                    onClick={() => {
                      onStageAdvance(nextStage.key);
                      if (stageDateVal) onInterviewDateChange(stageDateVal.toISOString());
                      setStageModal(false);
                    }}
                    style={{ borderRadius: 8, background: PRIMARY, border: "none", fontWeight: 600 }}>
                    İleri Al
                  </Button>,
                ]}
                styles={{ body: { paddingTop: 12 } }}
              >
                <p style={{ color: "#6B7280", margin: "0 0 12px", fontSize: 14 }}>
                  Bu aşama için tarih girmek ister misin? (isteğe bağlı)
                </p>
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  value={stageDateVal}
                  onChange={setStageDateVal}
                  format="DD MMMM YYYY, HH:mm"
                  style={{ borderRadius: 10, height: 40, width: "100%" }}
                  placeholder="Tarih seç..."
                />
              </Modal>
            </>
          )}

          {/* Reddet */}
          {!isCompleted && (
            <>
              <Button
                size="middle"
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModal(true)}
                style={{
                  borderRadius: 10, height: 38, fontWeight: 600,
                  background: "#FFF1F2", border: "1px solid #FECDD3",
                  color: "#EF4444",
                }}
              >
                Reddet
              </Button>

              <Modal
                open={rejectModal}
                centered
                onCancel={() => setRejectModal(false)}
                onOk={() => { onReject(); setRejectModal(false); }}
                okText="Evet, reddet"
                cancelText="İptal"
                okButtonProps={{ danger: true, style: { borderRadius: 8, fontWeight: 600 } }}
                cancelButtonProps={{ style: { borderRadius: 8 } }}
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: "#FFF1F2", border: "1px solid #FECDD3",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#EF4444", fontSize: 17,
                    }}>
                      <CloseCircleOutlined />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Adayı Reddet</span>
                  </div>
                }
                styles={{ body: { paddingTop: 8 } }}
              >
                <p style={{ color: "#6B7280", margin: 0, fontSize: 14 }}>
                  <strong style={{ color: "#111827" }}>{item.candidateName || "Bu aday"}</strong>{" "}
                  mülakat sürecinden çıkarılacak. Bu işlem geri alınamaz.
                </p>
              </Modal>
            </>
          )}

        </div>
      </div>

      {/* Aşama geçmişi + Değerlendirmeler */}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <Button
            type="text" size="small"
            icon={<HistoryOutlined />}
            onClick={() => setShowLog((v) => !v)}
            style={{ color: "#6B7280", padding: "0 6px", fontSize: 12 }}
          >
            {showLog ? "Geçmişi Gizle" : "Aşama Geçmişi"}
          </Button>
          <Button
            type="text" size="small"
            icon={<FormOutlined />}
            onClick={toggleEvals}
            style={{ color: "#6B7280", padding: "0 6px", fontSize: 12 }}
          >
            {showEvals ? "Değerlendirmeleri Gizle" : "Değerlendirmeler"}
          </Button>
          {onOpenEval && Object.keys(EVAL_STAGE_LABELS).includes(status) && (
            <Button
              type="text" size="small"
              icon={<StarFilled style={{ color: EVAL_STAGE_COLORS[status] }} />}
              onClick={() => onOpenEval(item.id, status, item.candidateName)}
              style={{ color: EVAL_STAGE_COLORS[status], padding: "0 6px", fontSize: 12 }}
            >
              Değerlendirme Ekle
            </Button>
          )}
        </div>

        {showLog && (
          <div style={{
            padding: "12px 14px", borderRadius: 10,
            background: "#F9FAFB", border: "1px solid #E5E7EB",
          }}>
            {isLogLoading ? (
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>Yükleniyor...</Text>
            ) : stageLog.length === 0 ? (
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>Henüz aşama geçişi yok.</Text>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {stageLog.map((entry) => {
                  const from = STATUS_CFG[entry.fromStatus];
                  const to   = STATUS_CFG[entry.toStatus];
                  return (
                    <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <Text style={{ fontSize: 11, color: "#9CA3AF", minWidth: 120 }}>
                        {dayjs(entry.changedAt).format("DD MMM YYYY, HH:mm")}
                      </Text>
                      <span style={{
                        background: from?.bg, color: from?.color,
                        border: `1px solid ${from?.border}`,
                        borderRadius: 999, padding: "1px 8px", fontWeight: 600, fontSize: 11,
                      }}>
                        {from?.label ?? entry.fromStatus}
                      </span>
                      <ArrowRightOutlined style={{ color: "#D1D5DB", fontSize: 10 }} />
                      <span style={{
                        background: to?.bg, color: to?.color,
                        border: `1px solid ${to?.border}`,
                        borderRadius: 999, padding: "1px 8px", fontWeight: 600, fontSize: 11,
                      }}>
                        {to?.label ?? entry.toStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {showEvals && (
          <div style={{
            padding: "12px 14px", borderRadius: 10,
            background: "#F9FAFB", border: "1px solid #E5E7EB",
          }}>
            {evalLoading ? (
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>Yükleniyor...</Text>
            ) : !evalData || evalData.length === 0 ? (
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>Henüz değerlendirme eklenmemiş.</Text>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {evalData.map((ev) => {
                  const stageColor = EVAL_STAGE_COLORS[ev.stage] ?? "#6B7280";
                  const stageLabel = EVAL_STAGE_LABELS[ev.stage] ?? ev.stage;
                  const scores = [
                    ev.communicationScore, ev.motivationScore,
                    ev.technicalScore, ev.problemSolvingScore, ev.codeQualityScore,
                    ev.culturalFitScore, ev.teamworkScore, ev.careerGoalsScore,
                  ].filter(Boolean);
                  const avgScore = scores.length
                    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                    : null;
                  return (
                    <div key={ev.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{
                        background: stageColor + "18", color: stageColor,
                        border: `1px solid ${stageColor}40`,
                        borderRadius: 999, padding: "1px 8px", fontWeight: 600, fontSize: 11,
                        whiteSpace: "nowrap",
                      }}>
                        {stageLabel}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {ev.overallScore && (
                            <span style={{ fontSize: 12, fontWeight: 700, color: stageColor }}>
                              Genel: {ev.overallScore}/5
                            </span>
                          )}
                          {avgScore && (
                            <span style={{ fontSize: 11, color: "#6B7280" }}>· Ort: {avgScore}/5</span>
                          )}
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                            · {dayjs(ev.evaluatedAt).format("DD MMM YYYY")}
                          </span>
                        </div>
                        {ev.notes && (
                          <Text style={{ fontSize: 11, color: "#92400E", display: "block", marginTop: 2 }}>
                            {ev.notes}
                          </Text>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Not bölümü */}
      <div style={{ marginTop: 10 }}>
        {editingNote ? (
          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <Input.TextArea
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              rows={2}
              autoFocus
              style={{ borderRadius: 8, fontSize: 12, resize: "none", flex: 1 }}
              placeholder="Not ekle..."
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Button
                size="small" type="primary"
                icon={<SaveOutlined />}
                onClick={() => { onNoteSave(noteValue); setEditingNote(false); }}
                style={{ borderRadius: 6, background: PRIMARY, border: "none" }}
              >
                Kaydet
              </Button>
              <Button
                size="small"
                onClick={() => { setEditingNote(false); setNoteValue(item.note || ""); }}
                style={{ borderRadius: 6 }}
              >
                İptal
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setEditingNote(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              cursor: "pointer", padding: "7px 12px", borderRadius: 8,
              background: noteValue ? "#FFFBEB" : "#F9FAFB",
              border: `1px solid ${noteValue ? "#FDE68A" : "#E5E7EB"}`,
              transition: "border-color 0.15s",
            }}
          >
            {noteValue ? (
              <Text style={{ fontSize: 12, color: "#92400E", flex: 1 }}>{noteValue}</Text>
            ) : (
              <Text style={{ fontSize: 12, color: "#9CA3AF", flex: 1 }}>+ Not ekle...</Text>
            )}
            <EditOutlined style={{ color: "#9CA3AF", fontSize: 12, flexShrink: 0 }} />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function PipelineDetailPage() {
  const navigate             = useNavigate();
  const { analysisId }       = useParams();
  const queryClient          = useQueryClient();
  const { data, isLoading }  = usePipelineResults();
  const [search, setSearch]  = useState("");
  const [stageFilter, setStageFilter]               = useState(null);
  const [localStatus, setLocalStatus]               = useState({});
  const [localInterviewDate, setLocalInterviewDate] = useState({});
  const [savingId, setSavingId]                     = useState(null);

  const [chatHighlight, setChatHighlight]    = useState(null);
  const [evalModal, setEvalModal]            = useState({ open: false, resultId: null, stage: null, candidateName: null });
  const [evalRefreshKeys, setEvalRefreshKeys] = useState({});

  const { mutateAsync: updateStatus }        = useUpdateResultStatus();
  const { mutateAsync: updateInterviewDate } = useUpdateInterviewDate();
  const { mutateAsync: updateNote }          = useUpdateResultNote();
  const { mutateAsync: chatPipeline }        = useChatPipelineResults();

  const allResults = data?.data || [];

  const getStatus = (item) =>
    localStatus[String(item.id)] ?? item.status ?? "MULAKATA_CAGRILDI";

  const group = useMemo(() => {
    const candidates = allResults.filter(
      (r) =>
        String(r.analysisId) === analysisId &&
        PIPELINE_STATUS_SET.has(localStatus[String(r.id)] ?? r.status ?? "BEKLEMEDE"),
    );
    if (!candidates.length) {
      const any = allResults.find((r) => String(r.analysisId) === analysisId);
      return any
        ? { analysisName: any.analysisName, positionName: any.positionName, runId: any.runId, candidates: [] }
        : null;
    }
    return {
      analysisName: candidates[0].analysisName,
      positionName: candidates[0].positionName,
      runId:        candidates[0].runId,
      candidates,
    };
  }, [allResults, analysisId, localStatus]);

  const filtered = useMemo(() => {
    if (!group) return [];
    let list = group.candidates;
    if (stageFilter) list = list.filter((c) => getStatus(c) === stageFilter);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        (c.candidateName  || "").toLowerCase().includes(q) ||
        (c.candidateEmail || "").toLowerCase().includes(q),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, search, stageFilter, localStatus]);

  const handleStageAdvance = async (resultId, nextStatus) => {
    const currentItem = allResults.find((r) => r.id === resultId);
    const fromStatus = localStatus[String(resultId)] ?? currentItem?.status ?? "MULAKATA_CAGRILDI";

    setSavingId(resultId);
    setLocalStatus((prev) => ({ ...prev, [String(resultId)]: nextStatus }));
    try {
      await updateStatus({ resultId, status: nextStatus });
      queryClient.invalidateQueries({ queryKey: ["pipelineResults"] });

      if (EVAL_STAGES.has(fromStatus)) {
        setEvalModal({ open: true, resultId, stage: fromStatus, candidateName: currentItem?.candidateName ?? "" });
      }
    } catch {
      // Optimistic update stays — server state will sync on next refetch
    } finally {
      setSavingId(null);
    }
  };

  const handleReject = async (resultId) => {
    setLocalStatus((prev) => ({ ...prev, [String(resultId)]: "REDDEDILDI" }));
    try {
      await updateStatus({ resultId, status: "REDDEDILDI" });
      queryClient.invalidateQueries({ queryKey: ["pipelineResults"] });
    } catch {
      // Optimistic update stays
    }
  };

  const handleInterviewDate = async (resultId, isoString) => {
    setLocalInterviewDate((prev) => ({ ...prev, [String(resultId)]: isoString }));
    try {
      await updateInterviewDate({ resultId, interviewDate: isoString });
    } catch {
      // Keep optimistic date
    }
  };

  const handleNoteSave = async (resultId, note) => {
    try {
      await updateNote({ resultId, note });
      queryClient.invalidateQueries({ queryKey: ["pipelineResults"] });
    } catch { }
  };

  const exportExcel = () => {
    const hStyle = (bg) => ({
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      fill: { fgColor: { rgb: bg } },
      alignment: { horizontal: "center", vertical: "center" },
      border: { top: { style: "thin", color: { rgb: "CCCCCC" } }, bottom: { style: "thin", color: { rgb: "CCCCCC" } }, left: { style: "thin", color: { rgb: "CCCCCC" } }, right: { style: "thin", color: { rgb: "CCCCCC" } } },
    });
    const cStyle = (bg = "FFFFFF", bold = false, align = "left") => ({
      font: { bold, sz: 10, color: { rgb: "1F2937" } },
      fill: { fgColor: { rgb: bg } },
      alignment: { horizontal: align, vertical: "center", wrapText: true },
      border: { top: { style: "thin", color: { rgb: "E5E7EB" } }, bottom: { style: "thin", color: { rgb: "E5E7EB" } }, left: { style: "thin", color: { rgb: "E5E7EB" } }, right: { style: "thin", color: { rgb: "E5E7EB" } } },
    });
    const scoreStyle = (s) => {
      const bg = s >= 75 ? "D1FAE5" : s >= 55 ? "DBEAFE" : s >= 35 ? "FEF3C7" : "FEE2E2";
      const fg = s >= 75 ? "065F46" : s >= 55 ? "1E40AF" : s >= 35 ? "92400E" : "991B1B";
      return { font: { bold: true, sz: 11, color: { rgb: fg } }, fill: { fgColor: { rgb: bg } }, alignment: { horizontal: "center", vertical: "center" }, border: cStyle().border };
    };

    const HEADERS = ["Sıra", "Aday Adı", "E-posta", "Toplam Puan", "Aşama", "Mülakat Tarihi", "Deneyim (Yıl)", "Teknik Beceriler", "Not"];
    const HEADER_COLORS = ["374151", "374151", "059669", "1E3A8A", "374151", "374151", "374151", "4F46E5", "374151"];

    const rows = filtered.map((r, i) => {
      const st      = getStatus(r);
      const dateVal = localInterviewDate[r.id] ?? r.interviewDate;
      return [
        i + 1,
        r.candidateName || "",
        r.candidateEmail || "",
        Math.round(r.finalScore || 0),
        STATUS_CFG[st]?.label || st,
        dateVal ? dayjs(dateVal).format("DD MMM YYYY HH:mm") : "",
        r.experienceYears || 0,
        splitList(r.matchedHardSkills).join(", "),
        r.note || "",
      ];
    });

    const ws = {};
    const range = { s: { c: 0, r: 0 }, e: { c: HEADERS.length - 1, r: rows.length } };
    HEADERS.forEach((h, c) => {
      ws[XLSXStyle.utils.encode_cell({ r: 0, c })] = { v: h, t: "s", s: hStyle(HEADER_COLORS[c]) };
    });
    rows.forEach((row, ri) => {
      const bg = ri % 2 === 0 ? "F9FAFB" : "FFFFFF";
      row.forEach((val, c) => {
        const ref   = XLSXStyle.utils.encode_cell({ r: ri + 1, c });
        const score = rows[ri][3];
        if (c === 0) ws[ref] = { v: val, t: "n", s: cStyle(bg, true, "center") };
        else if (c === 3) ws[ref] = { v: val, t: "n", s: scoreStyle(score) };
        else if (c === 6) ws[ref] = { v: val, t: "n", s: cStyle(bg, false, "center") };
        else ws[ref] = { v: val, t: "s", s: cStyle(bg) };
      });
    });
    ws["!ref"]  = XLSXStyle.utils.encode_range(range);
    ws["!cols"] = [{ wch: 5 }, { wch: 24 }, { wch: 28 }, { wch: 12 }, { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 40 }, { wch: 40 }];
    ws["!rows"] = [{ hpt: 30 }, ...rows.map(() => ({ hpt: 18 }))];
    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, "Mülakat Listesi");
    XLSXStyle.writeFile(wb, `mulakat-listesi-${analysisId}.xlsx`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef0f7" }}>
      <LoginNavbar />
      <div style={{ paddingTop: 108, paddingBottom: 60 }}>
        <Row justify="center">
          <Col xs={22} md={21} lg={19} xl={17}>

            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/pipeline")}
              style={{ marginBottom: 20, borderRadius: 999, height: 40 }}
            >
              Mülakat Listesine Dön
            </Button>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}><Spin size="large" /></div>
            ) : !group ? (
              <Card style={{ borderRadius: 18, border: "1px solid #E9EDF5", textAlign: "center" }} styles={{ body: { padding: 60 } }}>
                <Text style={{ color: "#6B7280", fontSize: 15 }}>Bu analiz bulunamadı.</Text>
              </Card>
            ) : (
              <>
                {/* Başlık kartı */}
                <Card
                  style={{
                    borderRadius: 20, marginBottom: 20,
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    boxShadow: "0 4px 24px rgba(57,64,193,0.07)",
                    overflow: "hidden",
                  }}
                  styles={{ body: { padding: 0 } }}
                >
                  {/* Renk şeridi */}
                  <div style={{
                    background: `linear-gradient(90deg, ${PRIMARY} 0%, #6366F1 55%, #8B5CF6 100%)`,
                    height: 4,
                  }} />

                  <div style={{ padding: "22px 26px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 16,
                        background: `linear-gradient(135deg, ${PRIMARY}, #6366F1)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 22,
                      }}>
                        <CheckCircleOutlined />
                      </div>
                      <div>
                        <Title level={3} style={{ margin: 0, color: "#111827" }}>{group.positionName}</Title>
                        <Text style={{ color: "#6B7280", fontSize: 13 }}>{group.analysisName}</Text>
                      </div>
                    </div>
                    <div style={{ textAlign: "center", padding: "8px 20px", borderRadius: 12, background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                      <Text strong style={{ fontSize: 22, color: PRIMARY, display: "block" }}>{group.candidates.length}</Text>
                      <Text style={{ fontSize: 11, color: "#6366F1" }}>Aktif Süreçte</Text>
                    </div>
                  </div>

                  <Divider style={{ margin: "0 0 14px", borderColor: "#F3F4F6" }} />

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <Input
                      allowClear
                      prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                      placeholder="İsim veya e-posta ara..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ borderRadius: 12, height: 40, maxWidth: 320 }}
                    />
                    <Space size={8}>
                      <Button
                        icon={<FileExcelOutlined />}
                        onClick={exportExcel}
                        disabled={filtered.length === 0}
                        style={{
                          height: 40, borderRadius: 12, fontWeight: 600,
                          background: "#10B981", color: "#fff", border: "none",
                        }}
                      >
                        Excel
                      </Button>
                      <Button
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate(`/analizler/${group.runId}/results`)}
                        style={{
                          borderRadius: 12, height: 40, fontWeight: 600,
                          background: "#EEF2FF", color: PRIMARY, border: "1px solid #C7D2FE",
                        }}
                      >
                        Tüm Analiz Sonuçları
                      </Button>
                    </Space>
                  </div>

                  {/* Aşama filtresi */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    <Tag
                      style={{
                        borderRadius: 999, cursor: "pointer", fontSize: 12,
                        padding: "3px 12px", fontWeight: 600,
                        background: stageFilter === null ? PRIMARY : "#F3F4F6",
                        color: stageFilter === null ? "#fff" : "#374151",
                        border: `1px solid ${stageFilter === null ? PRIMARY : "#E5E7EB"}`,
                        transition: "all 0.15s",
                      }}
                      onClick={() => setStageFilter(null)}
                    >
                      Tümü · {group.candidates.length}
                    </Tag>
                    {PIPELINE_STAGES.map((s) => {
                      const count = group.candidates.filter((c) => getStatus(c) === s.key).length;
                      if (!count) return null;
                      const cfg = STATUS_CFG[s.key];
                      const active = stageFilter === s.key;
                      return (
                        <Tag
                          key={s.key}
                          style={{
                            borderRadius: 999, cursor: "pointer", fontSize: 12,
                            padding: "3px 12px", fontWeight: 600,
                            background: active ? cfg.color : cfg.bg,
                            color: active ? "#fff" : cfg.color,
                            border: `1px solid ${active ? cfg.color : cfg.border}`,
                            transition: "all 0.15s",
                          }}
                          onClick={() => setStageFilter((prev) => prev === s.key ? null : s.key)}
                        >
                          {s.stepLabel} · {count}
                        </Tag>
                      );
                    })}
                  </div>
                  </div>
                </Card>

                {/* Aday listesi */}
                {group.candidates.length === 0 ? (
                  <Card style={{ borderRadius: 18, border: "1px solid #E9EDF5", textAlign: "center" }} styles={{ body: { padding: 48 } }}>
                    <Text style={{ color: "#6B7280" }}>Bu analiz için mülakata çağrılan aday yok.</Text>
                  </Card>
                ) : (
                  <div style={{ display: "grid", gap: 14 }}>
                    {filtered.map((item, i) => (
                      <div
                        key={item.id}
                        style={{
                          opacity: chatHighlight !== null && chatHighlight.size > 0 && ![...chatHighlight].some((n) => n.trim().toLowerCase() === (item.candidateName ?? "").trim().toLowerCase()) ? 0.35 : 1,
                          transition: "opacity 0.25s ease",
                        }}
                      >
                        <CandidateCard
                          item={item}
                          rank={i}
                          status={getStatus(item)}
                          interviewDate={localInterviewDate[String(item.id)] ?? item.interviewDate}
                          onStageAdvance={(nextKey) => handleStageAdvance(item.id, nextKey)}
                          onReject={() => handleReject(item.id)}
                          onInterviewDateChange={(iso) => handleInterviewDate(item.id, iso)}
                          onNoteSave={(note) => handleNoteSave(item.id, note)}
                          onOpenEval={(rid, stage, name) => setEvalModal({ open: true, resultId: rid, stage, candidateName: name })}
                          evalRefreshKey={evalRefreshKeys[String(item.id)] ?? 0}
                          isSaving={savingId === item.id}
                        />
                      </div>
                    ))}
                    {filtered.length === 0 && search && (
                      <Card style={{ borderRadius: 18, border: "1px solid #E9EDF5", textAlign: "center" }} styles={{ body: { padding: 40 } }}>
                        <Text style={{ color: "#9CA3AF" }}>Arama sonucu bulunamadı.</Text>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>

      <EvaluationModal
        open={evalModal.open}
        resultId={evalModal.resultId}
        stage={evalModal.stage}
        candidateName={evalModal.candidateName}
        onClose={() => setEvalModal({ open: false, resultId: null, stage: null, candidateName: null })}
        onSaved={() => {
          const rid = String(evalModal.resultId);
          setEvalRefreshKeys((prev) => ({ ...prev, [rid]: (prev[rid] ?? 0) + 1 }));
          setEvalModal({ open: false, resultId: null, stage: null, candidateName: null });
        }}
      />

      <ChatDrawer
        context={group?.positionName}
        isFiltered={chatHighlight !== null}
        onChat={(q) => chatPipeline({ analysisId, query: q })}
        onFilter={(names) => setChatHighlight(names)}
        onClearFilter={() => setChatHighlight(null)}
        onExecuteAction={async (ea) => {
          if (ea.type !== "bulk_status") return;
          const sel = ea.selection ?? {};
          const all = group?.candidates ?? [];
          let targets = [];
          if (sel.rule === "top_n") {
            targets = all.slice(0, sel.n ?? 0);
          } else if (sel.rule === "rest_after_n") {
            targets = all.slice(sel.n ?? 0);
          } else if (sel.rule === "all") {
            targets = all;
          } else {
            const names = sel.names ?? ea.candidate_names ?? [];
            const nameSet = new Set(names.map((n) => n.toLowerCase().trim()));
            targets = all.filter((c) => nameSet.has((c.candidateName ?? "").toLowerCase().trim()));
          }
          for (const c of targets) {
            setLocalStatus((prev) => ({ ...prev, [String(c.id)]: ea.status }));
            await updateStatus({ resultId: c.id, status: ea.status });
          }
        }}
      />
    </div>
  );
}
