import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Space,
  Tag,
  Spin,
  Empty,
  Button,
  Input,
  Select,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  SearchOutlined,
  UserOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { useRunResults } from "../requests/AnalysisQueries";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function AnalysisResultsPage() {
  const navigate = useNavigate();
  const { runId } = useParams();

  const { data, isLoading } = useRunResults(runId);
  const results = data?.data || [];

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("finalScoreDesc");

  const getScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "blue";
    if (score >= 40) return "orange";
    return "red";
  };

  const sortedResults = useMemo(() => {
    let filtered = [...results];

    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.candidateName || "").toLowerCase().includes(lower) ||
          (item.fileName || "").toLowerCase().includes(lower)
      );
    }

    switch (sortBy) {
      case "finalScoreDesc":
        filtered.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
        break;
      case "finalScoreAsc":
        filtered.sort((a, b) => (a.finalScore || 0) - (b.finalScore || 0));
        break;
      case "educationDesc":
        filtered.sort((a, b) => (b.educationScore || 0) - (a.educationScore || 0));
        break;
      case "experienceDesc":
        filtered.sort((a, b) => (b.experienceScore || 0) - (a.experienceScore || 0));
        break;
      case "nameAsc":
        filtered.sort((a, b) =>
          (a.candidateName || "").localeCompare(b.candidateName || "", "tr")
        );
        break;
      default:
        break;
    }

    return filtered;
  }, [results, searchText, sortBy]);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <LoginNavbar />

      <div style={{ paddingTop: 120, paddingBottom: 50 }}>
        <Row justify="center">
          <Col xs={22} md={21} lg={18} xl={16}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/analizler")}
              style={{
                marginBottom: 18,
                borderRadius: 999,
                height: 40,
                padding: "0 18px",
              }}
            >
              Analizlere Dön
            </Button>

            <div style={{ marginBottom: 18 }}>
              <Title level={2} style={{ color: "#111827", marginBottom: 8 }}>
                Analiz Sonuçları
              </Title>
              <Paragraph
                style={{
                  color: "#6b7280",
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 0,
                }}
              >
                Adayları daha rahat incelemek için arama ve sıralama kullanabilirsin.
                Daha yüksek puan alan adaylar üstte gösterilir.
              </Paragraph>
            </div>

            <Card
              style={{
                borderRadius: 18,
                border: "1px solid #eef0f6",
                boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
                marginBottom: 18,
              }}
              styles={{ body: { padding: 16 } }}
            >
              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Aday adı veya dosya adına göre ara"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ borderRadius: 12, height: 40 }}
                  />
                </Col>

                <Col xs={24} md={12}>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: "100%" }}
                    size="large"
                  >
                    <Option value="finalScoreDesc">Toplam puan: yüksekten düşüğe</Option>
                    <Option value="finalScoreAsc">Toplam puan: düşükten yükseğe</Option>
                    <Option value="educationDesc">Eğitim puanına göre</Option>
                    <Option value="experienceDesc">Deneyim puanına göre</Option>
                    <Option value="nameAsc">İsme göre A-Z</Option>
                  </Select>
                </Col>
              </Row>
            </Card>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
              </div>
            ) : sortedResults.length === 0 ? (
              <Card
                style={{
                  borderRadius: 18,
                  border: "1px solid #eef0f6",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
                }}
              >
                <Empty description="Sonuç bulunamadı" />
              </Card>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {sortedResults.map((item, index) => (
                  <Card
                    key={item.id}
                    style={{
                      borderRadius: 16,
                      border: "1px solid #eef0f6",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.035)",
                    }}
                    styles={{ body: { padding: 16 } }}
                  >
                    <Row gutter={[14, 12]} align="top">
                      <Col xs={24} md={14}>
                        <Space size={12} align="start">
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 14,
                              background:
                                "linear-gradient(135deg, rgba(57,64,193,0.10), rgba(255,107,107,0.10))",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#3940c1",
                              fontSize: 18,
                              flexShrink: 0,
                            }}
                          >
                            {index === 0 ? <TrophyOutlined /> : <UserOutlined />}
                          </div>

                          <div style={{ minWidth: 0, width: "100%" }}>
                            <Text
                              strong
                              style={{
                                display: "block",
                                fontSize: 15,
                                color: "#111827",
                                marginBottom: 3,
                              }}
                            >
                              {item.candidateName || "İsimsiz Aday"}
                            </Text>

                            <Space size={6} style={{ marginBottom: 8 }}>
                              <FilePdfOutlined style={{ color: "#6b7280" }} />
                              <Text
                                style={{
                                  color: "#6b7280",
                                  fontSize: 13,
                                }}
                              >
                                {item.fileName}
                              </Text>
                            </Space>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {(item.matchedHardSkills || "")
                                .split(",")
                                .filter(Boolean)
                                .slice(0, 5)
                                .map((skill, idx) => (
                                  <Tag
                                    key={idx}
                                    color="blue"
                                    style={{ marginInlineEnd: 0 }}
                                  >
                                    {skill}
                                  </Tag>
                                ))}
                            </div>
                          </div>
                        </Space>
                      </Col>

                      <Col xs={24} md={10}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 8,
                          }}
                        >
                          <Tag
                            color={getScoreColor(item.finalScore)}
                            style={{
                              fontSize: 13,
                              borderRadius: 999,
                              padding: "4px 10px",
                              marginInlineEnd: 0,
                            }}
                          >
                            {item.finalScore} Puan
                          </Tag>

                          <div style={{ width: "100%" }}>
                            <Text
                              strong
                              style={{
                                display: "block",
                                marginBottom: 6,
                                fontSize: 13,
                              }}
                            >
                              Genel Uygunluk
                            </Text>
                            <Progress
                              percent={Math.round(item.finalScore || 0)}
                              size="small"
                              showInfo={false}
                              strokeColor="#3940c1"
                              trailColor="#edf1f7"
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>

                    <div style={{ marginTop: 12 }}>
                      <Text
                        style={{
                          color: "#4b5563",
                          lineHeight: 1.75,
                          fontSize: 13,
                          display: "block",
                        }}
                      >
                        {item.summary ||
                          "Bu aday için açıklama bulunmuyor. Analiz sonucu özet bilgisi burada gösterilecektir."}
                      </Text>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}