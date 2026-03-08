import React from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Space,
  Tag,
  Button,
  Spin,
  Empty,
} from "antd";
import {
  FileSearchOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { useUserAnalyses } from "../requests/AnalysisQueries";

const { Title, Text, Paragraph } = Typography;

export default function AnalysesPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const { data, isLoading } = useUserAnalyses(user?.id);
  const analyses = data?.data || [];

  const getStatusColor = (status) => {
    if (status === "Tamamlandı") return "green";
    if (status === "Bekliyor") return "orange";
    return "blue";
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <LoginNavbar />

      <div style={{ paddingTop: 120, paddingBottom: 50 }}>
        <Row justify="center">
          <Col xs={22} md={21} lg={19} xl={17}>
            <div style={{ marginBottom: 28 }}>
              <Title level={1} style={{ color: "#111827", marginBottom: 10 }}>
                Analizler
              </Title>
              <Paragraph
                style={{
                  color: "#6b7280",
                  fontSize: 16,
                  marginBottom: 0,
                  lineHeight: 1.7,
                }}
              >
                Oluşturduğun tüm analizleri burada görebilir, istediğin analizin
                detay sayfasına geçerek form bilgilerini ve ileride analiz sonuçlarını inceleyebilirsin.
              </Paragraph>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
              </div>
            ) : analyses.length === 0 ? (
              <Card
                style={{
                  borderRadius: 24,
                  border: "1px solid #eef0f6",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                }}
              >
                <Empty description="Henüz oluşturulmuş analiz bulunamadı" />
              </Card>
            ) : (
              <Row gutter={[24, 24]}>
                {analyses.map((item) => (
                  <Col xs={24} md={12} xl={8} key={item.id}>
                    <Card
                      style={{
                        borderRadius: 24,
                        border: "1px solid #eef0f6",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                        height: "100%",
                      }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <Space direction="vertical" size={16} style={{ width: "100%" }}>
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 18,
                            background:
                              "linear-gradient(135deg, rgba(57,64,193,0.12), rgba(255,107,107,0.12))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#3940c1",
                            fontSize: 24,
                          }}
                        >
                          <FileSearchOutlined />
                        </div>

                        <div>
                          <Title level={4} style={{ margin: 0, color: "#111827" }}>
                            {item.analysisName}
                          </Title>
                          <Text style={{ color: "#6b7280" }}>
                            {item.positionName}
                          </Text>
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
                            <Text style={{ color: "#6b7280" }}>
                              {item.cvCount} CV yüklendi
                            </Text>
                          </Space>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                          }}
                        >
                          <Tag color={getStatusColor(item.status)}>{item.status}</Tag>

                          <Button
                            type="link"
                            onClick={() => navigate(`/analizler/${item.id}`)}
                            style={{
                              padding: 0,
                              color: "#3940c1",
                              fontWeight: 600,
                            }}
                          >
                            Detayları Gör <RightOutlined />
                          </Button>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}