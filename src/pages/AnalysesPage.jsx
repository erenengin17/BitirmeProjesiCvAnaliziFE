import { useState } from "react";
import {
  Row, Col, Typography, Card, Space, Tag, Button,
  Spin, Empty, Modal, Form, Input, Popconfirm, message, notification,
} from "antd";
import {
  FileSearchOutlined, CalendarOutlined, FolderOpenOutlined,
  RightOutlined, DeleteOutlined, EditOutlined, CopyOutlined, ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import LoginNavbar from "../components/LoginNavbar";
import { useUserAnalyses, useDeleteAnalysis, useUpdateAnalysis, useCloneAnalysis } from "../requests/AnalysisQueries";

const { Title, Text, Paragraph } = Typography;

export default function AnalysesPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useUserAnalyses();
  const analyses = data?.data || [];

  const { mutateAsync: deleteAnalysis, isPending: isDeleting } = useDeleteAnalysis();
  const { mutateAsync: updateAnalysis, isPending: isUpdating } = useUpdateAnalysis();
  const { mutateAsync: cloneAnalysis, isPending: isCloning } = useCloneAnalysis();

  const [editModal, setEditModal] = useState({ open: false, item: null });
  const [cloneModal, setCloneModal] = useState({ open: false, item: null });
  const [form] = Form.useForm();
  const [cloneForm] = Form.useForm();

  const openEdit = (item, e) => {
    e.stopPropagation();
    form.setFieldsValue({
      analysisName: item.analysisName,
      positionName: item.positionName,
      description:  item.description || "",
    });
    setEditModal({ open: true, item });
  };

  const handleUpdate = async () => {
    const values = await form.validateFields();
    await updateAnalysis({ analysisId: editModal.item.id, data: values });
    queryClient.invalidateQueries({ queryKey: ["userAnalyses"] });
    queryClient.invalidateQueries({ queryKey: ["recentAnalyses"] });
    setEditModal({ open: false, item: null });
  };

  const handleClone = (item, e) => {
    e.stopPropagation();
    cloneForm.setFieldsValue({ newName: item.analysisName + " (Kopya)" });
    setCloneModal({ open: true, item });
  };

  const handleCloneConfirm = async () => {
    try {
      const values = await cloneForm.validateFields();
      const response = await cloneAnalysis({ analysisId: cloneModal.item.id, newName: values.newName });
      const newId = response?.data?.id;
      setCloneModal({ open: false, item: null });
      cloneForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["userAnalyses"] });
      queryClient.invalidateQueries({ queryKey: ["recentAnalyses"] });
      if (newId) navigate(`/analizler/${newId}`);
    } catch {
      message.error("Analiz kopyalanamadı.");
    }
  };

  const handleDelete = async (analysisId, e) => {
    e.stopPropagation();
    await deleteAnalysis(analysisId);
    queryClient.invalidateQueries({ queryKey: ["userAnalyses"] });
    queryClient.invalidateQueries({ queryKey: ["recentAnalyses"] });
    notification.success({ message: "Analiz silindi", placement: "top" });
  };

  const getStatusColor = (status) => {
    if (status === "Tamamlandı" || status === "Tamamlandi") return "green";
    if (status === "Bekliyor") return "orange";
    return "blue";
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
                Analizler
              </Title>
              <Paragraph style={{ color: "#6b7280", fontSize: 16, marginBottom: 0, lineHeight: 1.7 }}>
                Oluşturduğun tüm analizleri burada görebilir, istediğin analizin
                detay sayfasına geçerek form bilgilerini ve analiz sonuçlarını inceleyebilirsin.
              </Paragraph>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
              </div>
            ) : analyses.length === 0 ? (
              <Card style={{ borderRadius: 24, border: "1px solid #eef0f6", boxShadow: "0 10px 24px rgba(0,0,0,0.05)" }}>
                <Empty description="Henüz oluşturulmuş analiz bulunamadı" />
              </Card>
            ) : (
              <Row gutter={[24, 24]}>
                {analyses.map((item) => (
                  <Col xs={24} md={12} xl={8} key={item.id}>
                    <Card
                      style={{
                        borderRadius: 24, border: "1px solid #eef0f6",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.05)", height: "100%",
                        cursor: "pointer",
                        transition: "box-shadow 0.2s, transform 0.2s",
                      }}
                      styles={{ body: { padding: 24 } }}
                      onClick={() => navigate(`/analizler/${item.id}`)}
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
                          background: "linear-gradient(135deg, rgba(57,64,193,0.12), rgba(255,107,107,0.12))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#3940c1", fontSize: 24,
                        }}>
                          <FileSearchOutlined />
                        </div>

                        <div>
                          <Title level={4} style={{ margin: 0, color: "#111827" }}>
                            {item.analysisName}
                          </Title>
                          <Text style={{ color: "#6b7280" }}>{item.positionName}</Text>
                        </div>

                        <div style={{ display: "grid", gap: 10 }}>
                          <Space size={8}>
                            <CalendarOutlined style={{ color: "#3940c1" }} />
                            <Text style={{ color: "#6b7280" }}>
                              {new Date(item.createdAt).toLocaleString("tr-TR")}
                            </Text>
                          </Space>
                          <Space size={8}>
                            <FolderOpenOutlined style={{ color: "#3940c1" }} />
                            <Text style={{ color: "#6b7280" }}>{item.cvCount} CV yüklendi</Text>
                          </Space>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <Tag color={getStatusColor(item.status)}>{item.status}</Tag>

                          <Space size={4} onClick={(e) => e.stopPropagation()}>
                            <Button
                              type="text" size="small" icon={<CopyOutlined />}
                              loading={isCloning}
                              onClick={(e) => handleClone(item, e)}
                              style={{ color: "#3940c1", borderRadius: 8 }}
                              title="Klonla"
                            />
                            <Button
                              type="text" size="small" icon={<EditOutlined />}
                              onClick={(e) => openEdit(item, e)}
                              style={{ color: "#6B7280", borderRadius: 8 }}
                            />
                            <Popconfirm
                              title="Analizi sil"
                              description="Bu analiz ve tüm sonuçları kalıcı olarak silinecek. Emin misin?"
                              onConfirm={() => handleDelete(item.id, { stopPropagation: () => {} })}
                              onCancel={(e) => e?.stopPropagation?.()}
                              okText="Evet, sil"
                              cancelText="İptal"
                              okButtonProps={{ danger: true, loading: isDeleting }}
                            >
                              <Button
                                type="text" size="small" icon={<DeleteOutlined />}
                                danger onClick={(e) => e.stopPropagation()}
                                style={{ borderRadius: 8 }}
                              />
                            </Popconfirm>
                            <Button
                              type="link" onClick={(e) => { e.stopPropagation(); navigate(`/analizler/${item.id}`); }}
                              style={{ padding: 0, color: "#3940c1", fontWeight: 600 }}
                            >
                              Detayları Gör <RightOutlined />
                            </Button>
                          </Space>
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

      {/* Klon İsim Modalı */}
      <Modal
        title="Analizi Klonla"
        open={cloneModal.open}
        onOk={handleCloneConfirm}
        onCancel={() => { setCloneModal({ open: false, item: null }); cloneForm.resetFields(); }}
        okText="Klonla"
        cancelText="İptal"
        confirmLoading={isCloning}
        okButtonProps={{ style: { background: "#3940C1", borderColor: "#3940C1" } }}
      >
        <Form form={cloneForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="newName"
            label="Yeni Analiz Adı"
            rules={[{ required: true, message: "Analiz adı boş olamaz" }]}
          >
            <Input
              autoFocus
              onPressEnter={handleCloneConfirm}
              placeholder="Analiz adı"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Düzenleme Modalı */}
      <Modal
        title="Analizi Düzenle"
        open={editModal.open}
        onOk={handleUpdate}
        onCancel={() => setEditModal({ open: false, item: null })}
        okText="Kaydet"
        cancelText="İptal"
        confirmLoading={isUpdating}
        okButtonProps={{ style: { background: "#3940C1", borderColor: "#3940C1" } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="analysisName" label="Analiz Adı"
            rules={[{ required: true, message: "Analiz adı zorunlu" }]}
          >
            <Input style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item
            name="positionName" label="Pozisyon"
            rules={[{ required: true, message: "Pozisyon adı zorunlu" }]}
          >
            <Input style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} style={{ borderRadius: 10, resize: "none" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
