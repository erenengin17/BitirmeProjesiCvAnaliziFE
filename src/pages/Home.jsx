import React from "react";
import { Col, Row, Typography, Button, Space, Card } from "antd";
import {
  FileSearchOutlined,
  TeamOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const { Text, Title, Paragraph } = Typography;

export default function Home() {
  const navigate = useNavigate();

  const handleSignUp = () => navigate("/signup");

  const features = [
    {
      icon: <FileSearchOutlined style={{ fontSize: 42 }} />,
      title: "CV Parse + Akıllı Özet",
      description:
        "PDF/DOCX CV’leri otomatik okuyup eğitim, deneyim, yetenek, sertifika ve anahtar kelimeleri çıkarır.",
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 42 }} />,
      title: "Skorlama & Karşılaştırma",
      description:
        "Pozisyona göre skor üretir; güçlü/zayıf yönleri grafikli olarak kıyaslar.",
    },
    {
      icon: <TeamOutlined style={{ fontSize: 42 }} />,
      title: "En Uygun Aday Önerisi",
      description:
        "İş ilanına göre en uygun adayları listeler; filtreleme ile hızlı shortlist oluşturur.",
    },
  ];

  const benefits = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: 34 }} />,
      title: "Hızlı Shortlist",
      description: "Manuel eleme yerine otomatik analizle zaman kazanın.",
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: 34 }} />,
      title: "Tutarlı Değerlendirme",
      description: "Aynı kriterlerle daha objektif puanlama.",
    },
    {
      icon: <ExperimentOutlined style={{ fontSize: 34 }} />,
      title: "Role Özel Kriterler",
      description: "Yetkinlik ağırlıklarını role göre ayarlayın.",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "CV’leri Yükle",
      description: "Toplu PDF/DOCX yükle veya örnek CV üret.",
      icon: <CloudUploadOutlined />,
    },
    {
      step: 2,
      title: "Kriterleri Gir",
      description: "İş tanımı, yetenekler, deneyim yılı ve ağırlıkları seç.",
      icon: <FileSearchOutlined />,
    },
    {
      step: 3,
      title: "Raporu Gör",
      description: "Skorlar, grafikler ve uygun aday listesi otomatik oluşur.",
      icon: <BarChartOutlined />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* NAVBAR */}
      <Navbar />

      <Row justify="center" className="w-full">
        {/* HERO */}
        <Col
          span={24}
          className="relative"
          style={{
            paddingTop: 120,   
            paddingBottom: 112, 
            marginBottom: 0,
            overflow: "hidden",
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3940c1] to-[#3940c1]/90" />
          <div className="absolute -right-20 top-16 w-72 h-72 bg-[#FF6B6B]/20 rounded-full blur-3xl" />
          <div className="absolute -left-20 bottom-16 w-56 h-56 bg-[#FF6B6B]/10 rounded-full blur-2xl" />
          <div className="absolute -right-10 bottom-0 w-52 h-52 bg-[#3940c1]/30 rounded-full blur-2xl" />

          <Row justify="center" align="middle" className="w-full z-10">
            <Col xs={22} md={18} lg={14} xl={12} style={{ margin: "0 auto" }}>
              <div
                style={{
                  textAlign: "center",
                  width: "100%",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <div className="inline-block mb-5 px-6 py-2 rounded-full bg-black/10 backdrop-blur-sm border border-black/20">
                  <Text style={{ color: "black" }}>
                    ⚡ İK ekipleri için hızlı aday eleme ve karşılaştırma
                  </Text>
                </div>

                <Title
                  level={1}
                  style={{ color: "black", marginBottom: 14, lineHeight: 1.15 }}
                >
                  CV’leri <span style={{ color: "#FF6B6B" }}>Akıllı</span> Analiz Et,
                  <br />
                  En Uygun Adayı{" "}
                  <span style={{ color: "#FF6B6B" }}>Hızla</span> Bul
                </Title>

                <Paragraph
                  style={{
                    color: "#111827", 
                    fontSize: 17,
                    marginBottom: 18,
                  }}
                >
                  Pozisyona göre otomatik skorlama, aday karşılaştırma grafikleri,
                  güçlü/zayıf yön analizi ve shortlist önerileri tek ekranda.
                </Paragraph>

                <Space
                  size={14}
                  className="flex flex-col sm:flex-row justify-center gap-3"
                >
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSignUp}
                    style={{
                      borderRadius: 999,
                      height: 50,
                      padding: "0 26px",
                      background: "#FF6B6B",
                      border: "none",
                      boxShadow: "0 10px 25px rgba(255,107,107,0.25)",
                    }}
                  >
                    Hemen Başlayın
                  </Button>
                </Space>

                <div style={{ marginTop: 8 }}>
                  <Text style={{ color: "#111827" }}>
                    • Toplu CV yükleme • Role göre ağırlıklandırma • Grafik karşılaştırma
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Col>

        {/* FEATURES */}
        <Col span={24} style={{ marginBottom: 28, paddingTop: 0 }}>        
          <Row
            justify="center"
            gutter={[24, 24]}
            style={{ width: "100%", padding: "0 32px" }}
          >
            <Col
              span={24}
              style={{
                textAlign: "center",
                marginBottom: 10,
                maxWidth: "none",
                marginLeft: 0,
                marginRight: 0,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  borderRadius: 999,
                  background: "rgba(57,64,193,0.10)",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#3940c1", fontWeight: 600 }}>
                  Yapay Zeka Destekli Özellikler
                </Text>
              </div>

              <Title level={2} style={{ color: "#3940c1", marginBottom: 8 }}>
                CV Analizinde Yeni Nesil Yaklaşım
              </Title>

              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 16,
                  lineHeight: 1.6,
                  display: "block",
                  maxWidth: 720,
                  margin: "0 auto",
                }}
              >
                Yapay zeka destekli CV analizi ile adayları yalnızca okumakla kalmayın;{" "}
                <strong>
                  yetkinliklerine göre puanlayın, karşılaştırın ve pozisyona en uygun
                  adayları saniyeler içinde belirleyin.
                </strong>
              </Text>
            </Col>

            {features.map((f, idx) => (
              <Col xs={22} sm={12} md={8} key={idx}>
                <Card
                  style={{
                    borderRadius: 24,
                    height: "100%",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <div style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 18,
                        background:
                          "linear-gradient(135deg, rgba(57,64,193,0.12), rgba(255,107,107,0.12))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3940c1",
                      }}
                    >
                      {f.icon}
                    </div>
                    <Title level={4} style={{ margin: 0 }}>
                      {f.title}
                    </Title>
                    <Text style={{ color: "#6b7280" }}>{f.description}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* BENEFITS  */}
        <Col
          span={24}
          style={{
            padding: "44px 0",
            marginBottom: 52,
            background: "#F3F4F6", 
            width: "100%",
          }}
        >
          <Row
            justify="center"
            gutter={[24, 24]}
            style={{ width: "100%", padding: "0 32px" }}
          >
            <Col
              span={24}
              style={{
                textAlign: "center",
                marginBottom: 14,
                maxWidth: "none",
                marginLeft: 0,
                marginRight: 0,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  borderRadius: 999,
                  background: "rgba(57,64,193,0.10)",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#3940c1", fontWeight: 600 }}>
                  İK Ekipleri İçin Avantajlar
                </Text>
              </div>

              <Title level={2} style={{ color: "#3940c1", marginBottom: 8 }}>
                Daha Hızlı, Daha Tutarlı, Daha Akıllı
              </Title>

              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 16,
                  lineHeight: 1.6,
                  display: "block",
                  maxWidth: 720,
                  margin: "0 auto",
                }}
              >
                Manuel CV eleme süreçlerini ortadan kaldırın. Aynı kriterlerle tüm
                adayları objektif biçimde değerlendirin ve işe alım sürecinde zaman kazanın.
              </Text>
            </Col>

            {benefits.map((b, idx) => (
              <Col xs={22} sm={12} md={8} key={idx}>
                <Card
                  style={{
                    borderRadius: 24,
                    height: "100%",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
                    background: "white",
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 18,
                        background:
                          "linear-gradient(135deg, rgba(57,64,193,0.12), rgba(255,107,107,0.12))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3940c1",
                      }}
                    >
                      {b.icon}
                    </div>
                    <Title level={4} style={{ margin: 0 }}>
                      {b.title}
                    </Title>
                    <Text style={{ color: "#6b7280" }}>{b.description}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* HOW IT WORKS */}
        <Col span={24} style={{ marginBottom: 52 }}>
          <Row
            justify="center"
            gutter={[24, 24]}
            style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}
          >
            <Col
              span={24}
              style={{
                textAlign: "center",
                marginBottom: 14,
                maxWidth: 900,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  borderRadius: 999,
                  background: "rgba(57,64,193,0.10)",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#3940c1", fontWeight: 600 }}>Süreç</Text>
              </div>

              <Title level={2} style={{ color: "#3940c1", marginBottom: 6 }}>
                3 Adımda Analiz
              </Title>

              <Text style={{ color: "#6b7280", fontSize: 16 }}>
                Kriter belirle → CV yükle → Raporu gör
              </Text>
            </Col>

            {howItWorks.map((s, idx) => (
              <Col xs={22} md={8} key={idx}>
                <Card
                  style={{
                    borderRadius: 24,
                    height: "100%",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        background: "linear-gradient(135deg, #3940c1, #FF6B6B)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 18,
                        fontWeight: 800,
                      }}
                    >
                      {s.step}
                    </div>
                    <Title level={4} style={{ margin: 0 }}>
                      {s.title}
                    </Title>
                    <Text style={{ color: "#6b7280" }}>{s.description}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
{/* CTA – FULL WIDTH */}
        <div
          style={{
            width: "100vw",
            marginLeft: "calc(-50vw + 50%)",
            background: "#3940c1",
            position: "relative",
            overflow: "hidden",
            padding: "64px 0",
          }}
        >
          {/* Decorative blob */}
          <div
            style={{
              position: "absolute",
              right: -80,
              top: -80,
              width: 260,
              height: 260,
              background: "rgba(255,107,107,0.25)",
              filter: "blur(30px)",
              borderRadius: 999,
            }}
          />

          {/* Centered content */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
            <div style={{ textAlign: "center", position: "relative" }}>
              <Title level={2} style={{ color: "white", marginBottom: 8 }}>
                İşe Alım Sürecinizi Hızlandıralım
              </Title>

              <Paragraph
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 16,
                  marginBottom: 18,
                }}
              >
                Ücretsiz deneme ile başlayın, ilk analiz raporunuzu dakikalar içinde alın.
              </Paragraph>

              <Space>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSignUp}
                  style={{
                    borderRadius: 999,
                    height: 50,
                    padding: "0 26px",
                    background: "white",
                    color: "#3940c1",
                    border: "none",
                    fontWeight: 600,
                  }}
                >
                  Hemen Başlayın
                </Button>
              </Space>

              <div style={{ marginTop: 14 }}>
                <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                  CV yükleme • Role göre skor • Grafik karşılaştırma • Shortlist
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <Col span={24} style={{ padding: "18px 0", textAlign: "center" }}>
          <Text style={{ color: "#6b7280" }}>İletişim: eren_engin03@hotmail.com</Text>
          <div>
            <Text style={{ color: "#9ca3af" }}>AtlasCv ©2025</Text>
          </div>
        </Col>
      </Row>
    </div>
  );
}
