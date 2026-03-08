import React from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Space,
  Tag,
  Spin,
  Empty,
  Divider,
  Button,
} from "antd";
import {
  FileSearchOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { useAnalysisById } from "../requests/AnalysisQueries";

const { Title, Text, Paragraph } = Typography;

export default function AnalysisDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading } = useAnalysisById(id);
  const analysis = data?.data;

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
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/analizler")}
              style={{
                marginBottom: 20,
                borderRadius: 999,
                height: 42,
                padding: "0 18px",
              }}
            >
              Analizlere Dön
            </Button>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
              </div>
            ) : !analysis ? (
              <Card
                style={{
                  borderRadius: 24,
                  border: "1px solid #eef0f6",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                }}
              >
                <Empty description="Analiz bulunamadı" />
              </Card>
            ) : (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card
                    style={{
                      borderRadius: 28,
                      border: "1px solid #e9edf5",
                      boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
                    }}
                    styles={{ body: { padding: 28 } }}
                  >
                    <Space direction="vertical" size={18} style={{ width: "100%" }}>
                      <div>
                        <Text
                          style={{
                            color: "#3940c1",
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: 0.4,
                          }}
                        >
                          ANALİZ DETAYI
                        </Text>
                        <Title level={2} style={{ margin: "8px 0 6px", color: "#111827" }}>
                          {analysis.analysisName}
                        </Title>
                        <Text style={{ color: "#6b7280", fontSize: 16 }}>
                          {analysis.positionName}
                        </Text>
                      </div>

                      <Paragraph
                        style={{
                          color: "#4b5563",
                          lineHeight: 1.8,
                          marginBottom: 0,
                        }}
                      >
                        {analysis.description || "Bu analiz için açıklama eklenmemiş."}
                      </Paragraph>

                      <Divider style={{ margin: "4px 0" }} />

                      <Row gutter={[18, 18]}>
                        <Col xs={24} md={12}>
                          <Card
                            style={{
                              borderRadius: 18,
                              background: "#f8faff",
                              border: "1px solid #e8edff",
                              boxShadow: "none",
                            }}
                          >
                            <Space align="center">
                              <CalendarOutlined style={{ color: "#3940c1", fontSize: 18 }} />
                              <div>
                                <Text strong style={{ display: "block" }}>
                                  Oluşturulma Tarihi
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  {new Date(analysis.createdAt).toLocaleString("tr-TR")}
                                </Text>
                              </div>
                            </Space>
                          </Card>
                        </Col>

                        <Col xs={24} md={12}>
                          <Card
                            style={{
                              borderRadius: 18,
                              background: "#f8faff",
                              border: "1px solid #e8edff",
                              boxShadow: "none",
                            }}
                          >
                            <Space align="center">
                              <FolderOpenOutlined style={{ color: "#3940c1", fontSize: 18 }} />
                              <div>
                                <Text strong style={{ display: "block" }}>
                                  CV Sayısı
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  {analysis.cvCount} CV
                                </Text>
                              </div>
                            </Space>
                          </Card>
                        </Col>

                        <Col xs={24} md={12}>
                          <Card
                            style={{
                              borderRadius: 18,
                              background: "#f8faff",
                              border: "1px solid #e8edff",
                              boxShadow: "none",
                            }}
                          >
                            <Space align="center">
                              <UserOutlined style={{ color: "#3940c1", fontSize: 18 }} />
                              <div>
                                <Text strong style={{ display: "block" }}>
                                  Oluşturan Kullanıcı
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  {analysis.userFullName}
                                </Text>
                              </div>
                            </Space>
                          </Card>
                        </Col>

                        <Col xs={24} md={12}>
                          <Card
                            style={{
                              borderRadius: 18,
                              background: "#f8faff",
                              border: "1px solid #e8edff",
                              boxShadow: "none",
                            }}
                          >
                            <Space align="center">
                              <BarChartOutlined style={{ color: "#3940c1", fontSize: 18 }} />
                              <div>
                                <Text strong style={{ display: "block" }}>
                                  Durum
                                </Text>
                                <Tag color={getStatusColor(analysis.status)} style={{ marginTop: 4 }}>
                                  {analysis.status}
                                </Tag>
                              </div>
                            </Space>
                          </Card>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <Space direction="vertical" size={24} style={{ width: "100%" }}>
                    <Card
                      style={{
                        borderRadius: 24,
                        border: "1px solid #e9edf5",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
                      }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <Title level={4} style={{ marginTop: 0, marginBottom: 10 }}>
                        Bu Sayfa Ne İçin?
                      </Title>
                      <Paragraph
                        style={{
                          color: "#6b7280",
                          marginBottom: 0,
                          lineHeight: 1.7,
                        }}
                      >
                        Bu ekranda analiz form bilgilerini inceleyebilir, ileride Python
                        analizi tamamlandığında aday sonuçlarını, skorları ve sıralamaları
                        aynı sayfada görüntüleyebilirsin.
                      </Paragraph>
                    </Card>

                    <Card
                      style={{
                        borderRadius: 24,
                        border: "1px solid #e9edf5",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
                      }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <Title level={4} style={{ marginTop: 0, marginBottom: 10 }}>
                        Sonraki Aşama
                      </Title>
                      <div style={{ display: "grid", gap: 10 }}>
                        <Text style={{ color: "#6b7280" }}>
                          • Python analiz sonucu burada gösterilecek
                        </Text>
                        <Text style={{ color: "#6b7280" }}>
                          • Aday skorları eklenecek
                        </Text>
                        <Text style={{ color: "#6b7280" }}>
                          • Uygunluk sıralaması listelenecek
                        </Text>
                        <Text style={{ color: "#6b7280" }}>
                          • Detaylı değerlendirme kartları burada yer alacak
                        </Text>
                      </div>
                    </Card>
                  </Space>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}