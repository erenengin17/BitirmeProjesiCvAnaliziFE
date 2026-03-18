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
  Divider,
  Button,
  Input,
  InputNumber,
  notification,
} from "antd";
import {
  CalendarOutlined,
  FolderOpenOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import SelectableTagGroup from "../components/SelectableTagGroup";
import {
  useLastRun,
  useAnalysisById,
  useAnalysisFiles,
  useRunAnalysis,
} from "../requests/AnalysisQueries";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function AnalysisDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, refetch } = useAnalysisById(id);
  const { data: filesData, isLoading: isFilesLoading } = useAnalysisFiles(id);
  const { mutateAsync: runAnalysisMutate, isPending: isRunning } = useRunAnalysis();

  const {
    data: lastRun,
    isLoading: isLastRunLoading,
    refetch: refetchLastRun,
  } = useLastRun(id);

  const analysis = data?.data;
  const analysisFiles = filesData?.data || [];

  const [api, contextHolder] = notification.useNotification();
  const [latestRunId, setLatestRunId] = useState(null);

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedHardSkills, setSelectedHardSkills] = useState([]);
  const [selectedSoftSkills, setSelectedSoftSkills] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState([]);
  const [minExperienceYears, setMinExperienceYears] = useState(0);
  const [requireProjectOrCertificate, setRequireProjectOrCertificate] = useState(false);
  const [useSemanticSimilarity, setUseSemanticSimilarity] = useState(true);
  const [extraKeywords, setExtraKeywords] = useState("");
  const [runName, setRunName] = useState("");

  const profileTemplates = useMemo(
    () => [
      {
        key: "frontend",
        title: "Frontend Geliştirme",
        description: "Arayüz, kullanıcı deneyimi ve modern web teknolojileri odaklı adaylar.",
        hardSkills: ["Frontend Geliştirme", "Web Geliştirme"],
        softSkills: ["İletişim", "Takım Çalışması"],
        education: ["Bilgisayar Mühendisliği", "Yazılım Mühendisliği"],
      },
      {
        key: "backend",
        title: "Backend Geliştirme",
        description: "API, sunucu tarafı geliştirme, veritabanı ve sistem mantığı odaklı adaylar.",
        hardSkills: ["Backend Geliştirme", "Veritabanı", "Bulut ve DevOps"],
        softSkills: ["Problem Çözme", "Analitik Düşünme"],
        education: ["Bilgisayar Mühendisliği", "Yazılım Mühendisliği"],
      },
      {
        key: "ai",
        title: "Veri / Yapay Zeka",
        description: "Veri analizi, makine öğrenmesi ve yapay zeka tarafında güçlü adaylar.",
        hardSkills: ["Yapay Zeka", "Veri Analizi"],
        softSkills: ["Analitik Düşünme", "Problem Çözme"],
        education: ["Bilgisayar Bilimleri", "Bilgisayar Mühendisliği"],
      },
      {
        key: "security",
        title: "Siber Güvenlik",
        description: "Güvenlik odaklı düşünen, savunma ve risk tarafında güçlü adaylar.",
        hardSkills: ["Siber Güvenlik", "Bulut ve DevOps"],
        softSkills: ["Sorumluluk", "Analitik Düşünme"],
        education: ["Bilgisayar Mühendisliği", "Bilgisayar Bilimleri"],
      },
      {
        key: "embedded",
        title: "Gömülü Sistemler",
        description: "Elektronik, devre, donanım ve sistem entegrasyonu odaklı adaylar.",
        hardSkills: ["Gömülü Sistemler"],
        softSkills: ["Problem Çözme", "Sorumluluk"],
        education: ["Elektrik-Elektronik Mühendisliği", "Bilgisayar Mühendisliği"],
      },
      {
        key: "general",
        title: "Genel Teknik Profil",
        description: "Geniş teknik altyapıya sahip, çok yönlü adayları değerlendirmek için.",
        hardSkills: ["Web Geliştirme", "Backend Geliştirme", "Veritabanı"],
        softSkills: ["Takım Çalışması", "İletişim"],
        education: [
          "Bilgisayar Mühendisliği",
          "Yazılım Mühendisliği",
          "Yönetim Bilişim Sistemleri",
        ],
      },
    ],
    []
  );

  const hardSkillOptions = useMemo(
    () => [
      "Web Geliştirme",
      "Frontend Geliştirme",
      "Backend Geliştirme",
      "Veritabanı",
      "Yapay Zeka",
      "Veri Analizi",
      "Mobil Uygulama",
      "Gömülü Sistemler",
      "Siber Güvenlik",
      "Bulut ve DevOps",
    ],
    []
  );

  const softSkillOptions = useMemo(
    () => [
      "Takım Çalışması",
      "İletişim",
      "Liderlik",
      "Problem Çözme",
      "Analitik Düşünme",
      "Zaman Yönetimi",
      "Sorumluluk",
      "Uyum Sağlama",
    ],
    []
  );

  const educationOptions = useMemo(
    () => [
      "Bilgisayar Mühendisliği",
      "Yazılım Mühendisliği",
      "Yönetim Bilişim Sistemleri",
      "Bilgisayar Bilimleri",
      "Elektrik-Elektronik Mühendisliği",
      "Endüstri Mühendisliği",
    ],
    []
  );

  const getStatusColor = (status) => {
    if (status === "Tamamlandı" || status === "Tamamlandi") return "green";
    if (status === "Bekliyor") return "orange";
    return "blue";
  };

  const getStatusText = (status) => {
    if (status === "Tamamlandı" || status === "Tamamlandi") return "Tamamlandı";
    if (status === "Bekliyor") return "Onay Bekliyor";
    return status || "Bilinmiyor";
  };

  const isAnalysisCompleted =
    analysis?.status === "Tamamlandi" || analysis?.status === "Tamamlandı";

  const resolvedLastRunId =
    latestRunId || lastRun?.data?.id || lastRun?.id || null;

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile.key);
    setSelectedHardSkills(profile.hardSkills || []);
    setSelectedSoftSkills(profile.softSkills || []);
    setSelectedEducation(profile.education || []);
  };

  const handleRunAnalysis = async () => {
    try {
      const payload = {
        runName: runName?.trim() || "Yeni Analiz Çalıştırması",
        hardSkills: selectedHardSkills,
        softSkills: selectedSoftSkills,
        educationRequirements: selectedEducation,
        minExperienceYears: minExperienceYears || 0,
        requireProjectOrCertificate,
        useSemanticSimilarity,
        extraKeywords: extraKeywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const response = await runAnalysisMutate({
        analysisId: id,
        payload,
      });

      const runId = response?.data?.runId || response?.data?.id || null;
      setLatestRunId(runId);

      await Promise.all([refetch(), refetchLastRun()]);

      api.success({
        message: "Analiz Başlatıldı",
        description: "Analiz tamamlandı. Sonuçları görüntüleyebilirsin.",
        placement: "topRight",
      });
    } catch (error) {
      console.error(error);
      api.error({
        message: "Analiz Başlatılamadı",
        description:
          error?.response?.data?.message || "Analiz çalıştırılırken bir hata oluştu.",
        placement: "topRight",
      });
    }
  };

  const handleShowResults = async () => {
    try {
      let runId = resolvedLastRunId;

      if (!runId) {
        const refreshed = await refetchLastRun();
        runId = refreshed?.data?.data?.id || refreshed?.data?.id || null;
      }

      if (runId) {
        navigate(`/analysis-runs/${runId}/results`);
        return;
      }

      api.info({
        message: "Henüz analiz çalıştırılmamış",
      });
    } catch (error) {
      console.error(error);
      api.error({
        message: "Sonuçlar açılamadı",
        description: "Son çalıştırma bilgisi alınırken bir hata oluştu.",
        placement: "topRight",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      {contextHolder}
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
              <Row gutter={[24, 24]} align="top">
                <Col xs={24} lg={16}>
                  <div style={{ display: "grid", gap: 24 }}>
                    <Card
                      style={{
                        borderRadius: 28,
                        border: "1px solid #e9edf5",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
                      }}
                      styles={{ body: { padding: 28 } }}
                    >
                      <div style={{ display: "grid", gap: 18 }}>
                        <div>
                          <Text
                            style={{
                              color: "#3940c1",
                              fontWeight: 700,
                              fontSize: 13,
                              letterSpacing: 0.4,
                            }}
                          >
                            ANALİZ ÖZETİ
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
                                    {getStatusText(analysis.status)}
                                  </Tag>
                                </div>
                              </Space>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    </Card>

                    {!isAnalysisCompleted ? (
                      <Card
                        style={{
                          borderRadius: 28,
                          border: "1px solid #e9edf5",
                          boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
                        }}
                        styles={{ body: { padding: 28 } }}
                      >
                        <div style={{ display: "grid", gap: 28 }}>
                          <div>
                            <Text
                              style={{
                                color: "#3940c1",
                                fontWeight: 700,
                                fontSize: 13,
                                letterSpacing: 0.4,
                              }}
                            >
                              ADIM 1
                            </Text>
                            <Title level={3} style={{ margin: "8px 0 8px", color: "#111827" }}>
                              Hazır Profil Seç
                            </Title>
                            <Paragraph style={{ color: "#6b7280", marginBottom: 0 }}>
                              Hızlı başlamak için aşağıdan bir analiz profili seçebilir, ardından detayları istersen özelleştirebilirsin.
                            </Paragraph>
                          </div>
                              <div>
                                <Text strong style={{ display: "block", marginBottom: 8 }}>
                                  Çalıştırma Adı
                                </Text>
                                <Input
                                  value={runName}
                                  onChange={(e) => setRunName(e.target.value)}
                                  placeholder="Örn: Frontend Aday Analizi - Mart"
                                  style={{ borderRadius: 12, height: 44 }}
                                />
                              </div>
                          <Row gutter={[16, 16]}>
                            {profileTemplates.map((profile) => {
                              const active = selectedProfile === profile.key;
                              return (
                                <Col xs={24} md={12} xl={8} key={profile.key}>
                                  <Card
                                    onClick={() => handleSelectProfile(profile)}
                                    style={{
                                      borderRadius: 20,
                                      cursor: "pointer",
                                      border: active
                                        ? "1px solid #3940c1"
                                        : "1px solid #e7ebf3",
                                      background: active
                                        ? "rgba(57,64,193,0.05)"
                                        : "#fff",
                                      boxShadow: active
                                        ? "0 10px 28px rgba(57,64,193,0.12)"
                                        : "0 6px 14px rgba(0,0,0,0.03)",
                                      height: "100%",
                                    }}
                                    styles={{ body: { padding: 18 } }}
                                  >
                                    <div style={{ display: "grid", gap: 10 }}>
                                      <div
                                        style={{
                                          width: 42,
                                          height: 42,
                                          borderRadius: 14,
                                          background:
                                            "linear-gradient(135deg, rgba(57,64,193,0.12), rgba(255,107,107,0.12))",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          color: "#3940c1",
                                          fontSize: 18,
                                        }}
                                      >
                                        {active ? <CheckCircleOutlined /> : <AppstoreOutlined />}
                                      </div>

                                      <Text strong style={{ fontSize: 15, color: "#111827" }}>
                                        {profile.title}
                                      </Text>

                                      <Text style={{ color: "#6b7280", lineHeight: 1.7 }}>
                                        {profile.description}
                                      </Text>
                                    </div>
                                  </Card>
                                </Col>
                              );
                            })}
                          </Row>

                          <Divider style={{ margin: 0 }} />

                          <div>
                            <Text
                              style={{
                                color: "#3940c1",
                                fontWeight: 700,
                                fontSize: 13,
                                letterSpacing: 0.4,
                              }}
                            >
                              ADIM 2
                            </Text>
                            <Title level={3} style={{ margin: "8px 0 8px", color: "#111827" }}>
                              Detaylı Kriterleri Belirle
                            </Title>
                            <Paragraph style={{ color: "#6b7280", marginBottom: 0 }}>
                              Adaylarda özellikle görmek istediğin teknik alanları, kişisel yetkinlikleri ve eğitim beklentisini seç.
                            </Paragraph>
                          </div>

                          <SelectableTagGroup
                            title="Teknik Alan Öncelikleri"
                            options={hardSkillOptions}
                            selectedValues={selectedHardSkills}
                            onChange={setSelectedHardSkills}
                          />

                          <SelectableTagGroup
                            title="Kişisel Yetkinlik Öncelikleri"
                            options={softSkillOptions}
                            selectedValues={selectedSoftSkills}
                            onChange={setSelectedSoftSkills}
                          />

                          <SelectableTagGroup
                            title="Tercih Edilen Eğitim Alanları"
                            options={educationOptions}
                            selectedValues={selectedEducation}
                            onChange={setSelectedEducation}
                          />

                          <Divider style={{ margin: 0 }} />

                          <div>
                            <Text
                              style={{
                                color: "#3940c1",
                                fontWeight: 700,
                                fontSize: 13,
                                letterSpacing: 0.4,
                              }}
                            >
                              ADIM 3
                            </Text>
                            <Title level={3} style={{ margin: "8px 0 8px", color: "#111827" }}>
                              Ek Değerlendirme Tercihleri
                            </Title>
                            <Paragraph style={{ color: "#6b7280", marginBottom: 0 }}>
                              Deneyim, proje ve açıklama uyumu gibi ek kriterleri belirleyerek daha güçlü bir puanlama yapabilirsin.
                            </Paragraph>
                          </div>

                          <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                              Beklenen Minimum Deneyim
                            </Text>
                            <Text style={{ display: "block", marginBottom: 8, color: "#6b7280" }}>
                              Adayın en az kaç yıllık deneyime sahip olmasını istiyorsun?
                            </Text>
                            <InputNumber
                              min={0}
                              max={30}
                              value={minExperienceYears}
                              onChange={(value) => setMinExperienceYears(value || 0)}
                              style={{ width: 220 }}
                            />
                          </div>

                          <div style={{ display: "grid", gap: 12 }}>
                            <Card
                              onClick={() =>
                                setRequireProjectOrCertificate(!requireProjectOrCertificate)
                              }
                              style={{
                                borderRadius: 16,
                                cursor: "pointer",
                                border: requireProjectOrCertificate
                                  ? "1px solid #3940c1"
                                  : "1px solid #e5e7eb",
                                background: requireProjectOrCertificate
                                  ? "rgba(57,64,193,0.06)"
                                  : "#fff",
                                boxShadow: "none",
                              }}
                              styles={{ body: { padding: 16 } }}
                            >
                              <Space direction="vertical" size={4}>
                                <Text strong>
                                  Projeler ve sertifikalar değerlendirmede etkili olsun
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  Adayın yaptığı projeler veya aldığı sertifikalar puanlamaya dahil edilsin.
                                </Text>
                              </Space>
                            </Card>

                            <Card
                              onClick={() => setUseSemanticSimilarity(!useSemanticSimilarity)}
                              style={{
                                borderRadius: 16,
                                cursor: "pointer",
                                border: useSemanticSimilarity
                                  ? "1px solid #3940c1"
                                  : "1px solid #e5e7eb",
                                background: useSemanticSimilarity
                                  ? "rgba(57,64,193,0.06)"
                                  : "#fff",
                                boxShadow: "none",
                              }}
                              styles={{ body: { padding: 16 } }}
                            >
                              <Space direction="vertical" size={4}>
                                <Text strong>İlan açıklamasına genel uyum değerlendirilsin</Text>
                                <Text style={{ color: "#6b7280" }}>
                                  CV içeriği ile açıklama metni arasındaki genel yakınlık da puanlamaya dahil edilsin.
                                </Text>
                              </Space>
                            </Card>
                          </div>
                          <div>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>
                              Ek Öncelikli Kelimeler
                            </Text>
                            <Text style={{ display: "block", marginBottom: 8, color: "#6b7280" }}>
                              Özellikle aranmasını istediğin kelimeleri virgül ile ayırarak yazabilirsin.
                            </Text>
                            <TextArea
                              rows={3}
                              value={extraKeywords}
                              onChange={(e) => setExtraKeywords(e.target.value)}
                              placeholder="Örn: React, SQL, staj, takım çalışması"
                              style={{ borderRadius: 12 }}
                            />
                          </div>

                          <Button
                            type="primary"
                            loading={isRunning}
                            onClick={handleRunAnalysis}
                            icon={<RocketOutlined />}
                            style={{
                              borderRadius: 999,
                              height: 48,
                              padding: "0 24px",
                              background: "#FF6B6B",
                              border: "none",
                              fontWeight: 600,
                              boxShadow: "0 10px 24px rgba(255,107,107,0.25)",
                            }}
                          >
                            Analizi Başlat
                          </Button>
                        </div>
                      </Card>
                    ) : (
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
                            <Title level={3} style={{ margin: 0, color: "#111827" }}>
                              Analiz Tamamlandı
                            </Title>
                            <Paragraph style={{ color: "#6b7280", marginTop: 8, marginBottom: 0 }}>
                              Bu analiz için değerlendirme tamamlandı. Sonuç ekranından aday sıralamasını ve puanları inceleyebilirsin.
                            </Paragraph>
                          </div>

                          <Space wrap>
                            <Tag color="green">Analiz Bitti</Tag>
                            <Tag color="blue">{analysis?.cvCount || 0} CV</Tag>
                          </Space>

                          <Button
                            type="primary"
                            loading={isLastRunLoading}
                            onClick={handleShowResults}
                            style={{
                              borderRadius: 999,
                              height: 46,
                              padding: "0 24px",
                              background: "#3940c1",
                              border: "none",
                              fontWeight: 600,
                            }}
                          >
                            Sonuçları Göster
                          </Button>
                        </Space>
                      </Card>
                    )}
                  </div>
                </Col>

                <Col xs={24} lg={8}>
                  <div style={{ display: "grid", gap: 24, position: "sticky", top: 110 }}>
                    <Card
                      style={{
                        borderRadius: 24,
                        border: "1px solid #e9edf5",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
                      }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>
                        Yüklenen CV Dosyaları
                      </Title>

                      {isFilesLoading ? (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                          <Spin />
                        </div>
                      ) : analysisFiles.length === 0 ? (
                        <Empty description="Dosya bulunamadı" />
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gap: 12,
                            maxHeight: analysisFiles.length > 3 ? 260 : "unset",
                            overflowY: analysisFiles.length > 3 ? "auto" : "visible",
                            paddingRight: analysisFiles.length > 3 ? 6 : 0,
                          }}
                        >
                          {analysisFiles.map((file) => (
                            <div
                              key={file.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "12px 14px",
                                borderRadius: 16,
                                background: "#f8faff",
                                border: "1px solid #e8edff",
                              }}
                            >
                              <FilePdfOutlined style={{ color: "#3940c1", fontSize: 18 }} />
                              <div style={{ minWidth: 0 }}>
                                <Text
                                  strong
                                  style={{
                                    display: "block",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 220,
                                  }}
                                >
                                  {file.originalFileName}
                                </Text>
                                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                                  PDF dosyası
                                </Text>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>

                        {!isAnalysisCompleted && (
                          <Card
                            style={{
                              borderRadius: 24,
                              border: "1px solid #e9edf5",
                              boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
                            }}
                            styles={{ body: { padding: 24 } }}
                          >
                            <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>
                              Seçili Kriter Özeti
                            </Title>

                            <div style={{ display: "grid", gap: 12 }}>
                              <div>
                                <Text strong style={{ display: "block" }}>
                                  Hazır Profil
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  {profileTemplates.find((x) => x.key === selectedProfile)?.title || "Seçilmedi"}
                                </Text>
                              </div>

                              <div>
                                <Text strong style={{ display: "block" }}>
                                  Teknik Alanlar
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  {selectedHardSkills.length > 0
                                    ? selectedHardSkills.join(", ")
                                    : "Seçilmedi"}
                                </Text>
                              </div>

                              <div>
                                <Text strong style={{ display: "block" }}>
                                  Kişisel Yetkinlikler
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  {selectedSoftSkills.length > 0
                                    ? selectedSoftSkills.join(", ")
                                    : "Seçilmedi"}
                                </Text>
                              </div>

                              <div>
                                <Text strong style={{ display: "block" }}>
                                  Eğitim Alanları
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  {selectedEducation.length > 0
                                    ? selectedEducation.join(", ")
                                    : "Seçilmedi"}
                                </Text>
                              </div>

                              <div>
                                <Text strong style={{ display: "block" }}>
                                  Minimum Deneyim
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  {minExperienceYears} yıl
                                </Text>
                              </div>

                              <div>
                                <Text strong style={{ display: "block" }}>
                                  Ek Ölçütler
                                </Text>
                                <Text style={{ color: "#6b7280" }}>
                                  {[
                                    requireProjectOrCertificate ? "Proje/Sertifika dahil" : null,
                                    useSemanticSimilarity ? "Açıklama uyumu aktif" : null,
                                  ]
                                    .filter(Boolean)
                                    .join(" • ") || "Varsayılan"}
                                </Text>
                              </div>
                            </div>
                          </Card>
                        )}
                  </div>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}