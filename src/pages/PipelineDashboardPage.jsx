import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import {
  Row, Col, Typography, Card, Space, Tag, Spin, Button,
  Modal, Form, Input, Popconfirm, notification,
} from "antd";
import {
  FunnelPlotOutlined, TeamOutlined, RightOutlined,
  EditOutlined, DeleteOutlined, ArrowLeftOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import LoginNavbar from "../components/LoginNavbar";
import { usePipelineResults, useDeleteAnalysis, useUpdateAnalysis } from "../requests/AnalysisQueries";

dayjs.locale("tr");

const { Title, Text, Paragraph } = Typography;

const PRIMARY = "#3940C1";

const PIPELINE_STATUS_SET = new Set([
  "MULAKATA_CAGRILDI", "TELEFON_GORUSMESI", "TEKNIK_MULAKAT",
  "IK_MULAKATI", "TEKLIF_VERILDI", "ISE_ALINDI",
]);

const STAGE_META = [
  { key: "MULAKATA_CAGRILDI", short: "Çağrıldı", color: PRIMARY,   bg: "#EEF2FF", border: "#C7D2FE" },
  { key: "TELEFON_GORUSMESI", short: "Telefon",  color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD" },
  { key: "TEKNIK_MULAKAT",    short: "Teknik",   color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { key: "IK_MULAKATI",       short: "İK",       color: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8" },
  { key: "TEKLIF_VERILDI",    short: "Teklif",   color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  { key: "ISE_ALINDI",        short: "İşe",      color: "#10B981", bg: "#D1FAE5", border: "#A7F3D0" },
];

export default function PipelineDashboardPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = usePipelineResults();
  const allResults  = data?.data || [];

  const { mutateAsync: deleteAnalysis, isPending: isDeleting } = useDeleteAnalysis();
  const { mutateAsync: updateAnalysis, isPending: isUpdating } = useUpdateAnalysis();

  const [editModal, setEditModal] = useState({ open: false, item: null });
  const [form] = Form.useForm();

  const groups = useMemo(() => {
    const map = new Map();
    allResults
      .filter((r) => PIPELINE_STATUS_SET.has(r.status ?? "BEKLEMEDE"))
      .forEach((r) => {
        const key = String(r.analysisId);
        if (!map.has(key)) {
          map.set(key, {
            analysisId:        r.analysisId,
            analysisName:      r.analysisName,
            positionName:      r.positionName,
            runId:             r.runId,
            analysisCreatedAt: r.analysisCreatedAt,
            candidates:        [],
            stageCounts:       {},
          });
        }
        const entry = map.get(key);
        entry.candidates.push(r);
        const s = r.status ?? "MULAKATA_CAGRILDI";
        entry.stageCounts[s] = (entry.stageCounts[s] || 0) + 1;
      });
    return [...map.values()].sort(
      (a, b) => new Date(b.analysisCreatedAt) - new Date(a.analysisCreatedAt)
    );
  }, [allResults]);

  const openEdit = (g, e) => {
    e.stopPropagation();
    form.setFieldsValue({ analysisName: g.analysisName, positionName: g.positionName });
    setEditModal({ open: true, item: g });
  };

  const handleUpdate = async () => {
    const values = await form.validateFields();
    await updateAnalysis({ analysisId: editModal.item.analysisId, data: values });
    queryClient.invalidateQueries({ queryKey: ["pipelineResults"] });
    queryClient.invalidateQueries({ queryKey: ["userAnalyses"] });
    setEditModal({ open: false, item: null });
  };

  const handleDelete = async (analysisId) => {
    await deleteAnalysis(analysisId);
    queryClient.invalidateQueries({ queryKey: ["pipelineResults"] });
    queryClient.invalidateQueries({ queryKey: ["userAnalyses"] });
    notification.success({ message: "Analiz silindi", placement: "top" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef0f7" }}>
      <LoginNavbar />

      <div style={{ paddingTop: 120, paddingBottom: 50 }}>
        <Row justify="center">
          <Col xs={22} md={21} lg={19} xl={17}>

            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/dashboard")}
              style={{ marginBottom: 28, borderRadius: 999, height: 40 }}
            >
              Anasayfaya Dön
            </Button>

            <div style={{ marginBottom: 28 }}>
              <Title level={1} style={{ color: "#111827", marginBottom: 10 }}>
                Mülakat Takibi
              </Title>
              <Paragraph style={{ color: "#6b7280", fontSize: 16, marginBottom: 0, lineHeight: 1.7 }}>
                Mülakata çağrılan adayları analize göre takip edebilir, düzenleyebilir
                ve silebilirsin.
              </Paragraph>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
              </div>
            ) : groups.length === 0 ? (
              <Card style={{ borderRadius: 24, border: "1px solid #eef0f6", boxShadow: "0 10px 24px rgba(0,0,0,0.05)" }}>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <FunnelPlotOutlined style={{ fontSize: 48, color: "#D1D5DB", marginBottom: 16 }} />
                  <Text style={{ display: "block", fontSize: 15, color: "#6B7280", marginBottom: 8 }}>
                    Henüz mülakata çağrılan aday yok.
                  </Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                    Analiz sonuçlarında adayları "Mülakata Çağır" ile işaretleyin.
                  </Text>
                </div>
              </Card>
            ) : (
              <Row gutter={[24, 24]}>
                {groups.map((g) => (
                  <Col xs={24} md={12} xl={8} key={String(g.analysisId)}>
                    <Card
                      style={{
                        borderRadius: 24,
                        border: "1px solid #eef0f6",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                        height: "100%",
                        cursor: "pointer",
                        transition: "box-shadow 0.2s, transform 0.2s",
                      }}
                      styles={{ body: { padding: 24 } }}
                      onClick={() => navigate(`/pipeline/${g.analysisId}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 16px 40px rgba(57,64,193,0.13)";
                        e.currentTarget.style.transform = "translateY(-3px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.05)";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>

                        <div style={{
                          width: 56, height: 56, borderRadius: 18,
                          background: "linear-gradient(135deg, rgba(16,185,129,0.13), rgba(57,64,193,0.10))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#10B981", fontSize: 24,
                        }}>
                          <FunnelPlotOutlined />
                        </div>

                        <div>
                          <Title level={4} style={{ margin: 0, color: "#111827" }}>
                            {g.positionName}
                          </Title>
                          <Text style={{ color: "#6b7280" }}>{g.analysisName}</Text>
                        </div>

                        <div style={{ display: "grid", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <Tag
                              icon={<TeamOutlined />}
                              style={{
                                borderRadius: 999, padding: "2px 10px",
                                background: "#D1FAE5", color: "#059669",
                                border: "1px solid #A7F3D0", fontWeight: 700, fontSize: 12,
                              }}
                            >
                              {g.candidates.length} kişi süreçte
                            </Tag>
                            {g.analysisCreatedAt && (
                              <Space size={4}>
                                <CalendarOutlined style={{ color: "#9CA3AF", fontSize: 11 }} />
                                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                                  {dayjs(g.analysisCreatedAt).format("DD MMM YYYY")}
                                </Text>
                              </Space>
                            )}
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {STAGE_META.filter((s) => g.stageCounts[s.key]).map((s) => (
                              <Tag
                                key={s.key}
                                style={{
                                  borderRadius: 999, fontSize: 11, margin: 0,
                                  background: s.bg, color: s.color,
                                  border: `1px solid ${s.border}`, fontWeight: 600,
                                }}
                              >
                                {s.short} · {g.stageCounts[s.key]}
                              </Tag>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <Space size={4} onClick={(e) => e.stopPropagation()}>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={(e) => openEdit(g, e)}
                              style={{ color: "#6B7280", borderRadius: 8 }}
                              title="Düzenle"
                            />
                            <Popconfirm
                              title="Analizi sil"
                              description="Bu analiz ve tüm sonuçları kalıcı olarak silinecek. Emin misin?"
                              okText="Evet, sil"
                              cancelText="İptal"
                              okButtonProps={{ danger: true, loading: isDeleting }}
                              onConfirm={() => handleDelete(g.analysisId)}
                              onCancel={(e) => e?.stopPropagation?.()}
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                danger
                                onClick={(e) => e.stopPropagation()}
                                style={{ borderRadius: 8 }}
                                title="Sil"
                              />
                            </Popconfirm>
                          </Space>

                          <Button
                            type="link"
                            onClick={(e) => { e.stopPropagation(); navigate(`/pipeline/${g.analysisId}`); }}
                            style={{ padding: 0, color: PRIMARY, fontWeight: 600 }}
                          >
                            Listeyi Gör <RightOutlined />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

          </Col>
        </Row>
      </div>

      {/* Düzenleme Modalı */}
      <Modal
        title="Analizi Düzenle"
        open={editModal.open}
        onOk={handleUpdate}
        onCancel={() => setEditModal({ open: false, item: null })}
        okText="Kaydet"
        cancelText="İptal"
        confirmLoading={isUpdating}
        okButtonProps={{ style: { background: PRIMARY, borderColor: PRIMARY } }}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="analysisName"
            label="Analiz Adı"
            rules={[{ required: true, message: "Analiz adı zorunlu" }]}
          >
            <Input style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item
            name="positionName"
            label="Pozisyon"
            rules={[{ required: true, message: "Pozisyon adı zorunlu" }]}
          >
            <Input style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
