import { useMemo, useState } from "react";
import {
  Row, Col, Typography, Card, Space, Tag, Spin, Empty,
  Divider, Button, Input, InputNumber, Switch, Badge,
  notification, Progress,
} from "antd";
import {
  CalendarOutlined, FolderOpenOutlined, UserOutlined,
  ArrowLeftOutlined, FilePdfOutlined,
  CheckCircleOutlined, RocketOutlined, PlusOutlined,
  SearchOutlined, CloseOutlined, AppstoreOutlined,
  CodeOutlined, DatabaseOutlined, MobileOutlined,
  ExperimentOutlined, DeploymentUnitOutlined, SafetyOutlined,
  TeamOutlined, BookOutlined, SettingOutlined,
  HistoryOutlined, BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import SelectableTagGroup from "../components/SelectableTagGroup";
import LoginNavbar from "../components/LoginNavbar";
import {
  useLastRun, useAnalysisById, useAnalysisFiles, useRunAnalysis, useAnalysisRuns,
} from "../requests/AnalysisQueries";

const { Title, Text, Paragraph } = Typography;

// ── Sabit veriler ─────────────────────────────────────────────────────────────

const CATEGORY_LIST = [
  { key: "frontend",  label: "Frontend",  color: "#4F46E5", icon: <CodeOutlined /> },
  { key: "backend",   label: "Backend",   color: "#0F766E", icon: <DatabaseOutlined /> },
  { key: "mobile",    label: "Mobile",    color: "#EA580C", icon: <MobileOutlined /> },
  { key: "data-ai",   label: "Data / AI", color: "#7C3AED", icon: <ExperimentOutlined /> },
  { key: "devops",    label: "DevOps",    color: "#2563EB", icon: <DeploymentUnitOutlined /> },
  { key: "security",  label: "Security",  color: "#DC2626", icon: <SafetyOutlined /> },
];
 
const TECHNOLOGY_MAP = {
  frontend: [
    "JavaScript","TypeScript","React","Next.js","Vue.js","Nuxt.js","Angular",
    "HTML","CSS","Sass","Tailwind CSS","Bootstrap","Ant Design","Material UI",
    "Redux","Zustand","React Query","Webpack","Vite","jQuery",
  ],
  backend: [
    "Java","Spring Boot","Kotlin","C#",".NET","ASP.NET Core",
    "Node.js","Express.js","NestJS","Python","Django","FastAPI",
    "PHP","Laravel","Go","Gin","Ruby","Ruby on Rails",
    "Rust","Scala","C","C++","Elixir","Haskell",
    "REST API","GraphQL","Microservices","gRPC","Socket.IO",
    "MySQL","PostgreSQL","MongoDB","Redis","SQLite","Cassandra","Elasticsearch",
    "Hibernate","SQLAlchemy","Prisma","JWT","OAuth",
  ],
  mobile: [
    "Java","Kotlin","Swift","Objective-C","Dart","Flutter","React Native",
    "Android","iOS","Firebase","Jetpack Compose","SwiftUI","UIKit",
    "MVVM","Room","Retrofit","Xamarin",
  ],
  "data-ai": [
    "Python","R","MATLAB","Julia","Scala",
    "Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch","Keras",
    "OpenCV","NLP","Machine Learning","Deep Learning","LLM","RAG","LangChain",
    "Matplotlib","Seaborn","Jupyter","Hugging Face","Spark","Hadoop",
    "Power BI","Tableau","SQL","dbt","Airflow","MLflow","ONNX",
  ],
  devops: [
    "Docker","Kubernetes","Linux","Bash","Shell","PowerShell",
    "AWS","Azure","GCP","Terraform","Ansible","Puppet","Chef",
    "Jenkins","GitHub Actions","GitLab CI","CircleCI","CI/CD",
    "Nginx","Apache","Helm","ArgoCD","Prometheus","Grafana","Vault","Pulumi",
  ],
  security: [
    "Python","Bash","C","C++",
    "Cyber Security","Network Security","OWASP","Penetration Testing",
    "Burp Suite","Wireshark","Kali Linux","Nmap","Metasploit",
    "SIEM","SOC","Splunk","Snort","Suricata",
    "CEH","OSCP","CompTIA Security+","CISSP","ISO 27001",
  ],
};

const SOFT_SKILL_OPTIONS = [
  "Takım Çalışması","İletişim","Liderlik","Problem Çözme","Analitik Düşünme",
  "Zaman Yönetimi","Sorumluluk","Uyum Sağlama","Proaktif","Agile / Scrum",
];

const EDUCATION_OPTIONS = ["Kontrol ve Otomasyon Mühendisliği", "Yapay Zeka ve Veri Mühendisliği", 
  "Siber Güvenlik Mühendisliği", "Ziraat Mühendisliği", "Bilgisayar Mühendisliği", "Yazılım Mühendisliği", 
  "Yönetim Bilişim Sistemleri", "Bilgisayar Bilimleri", "Elektrik-Elektronik Mühendisliği", 
  "Elektronik ve Haberleşme Mühendisliği", "Endüstri Mühendisliği", "Makine Mühendisliği", "İnşaat Mühendisliği", 
  "Mekatronik Mühendisliği"];

// ── Yardımcı bileşenler ───────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, count, points }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "rgba(57,64,193,0.10)", color: "#3940c1",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Text strong style={{ fontSize: 15, color: "#111827" }}>{title}</Text>
            {points !== undefined && (
              <Tag style={{
                borderRadius: 999, padding: "0 8px", fontSize: 11, fontWeight: 700,
                background: "rgba(57,64,193,0.08)", color: "#3940c1", border: "1px solid #C7D2FE",
              }}>
                maks {points} puan
              </Tag>
            )}
            {count > 0 && (
              <Tag color="blue" style={{ borderRadius: 999, padding: "0 8px", fontSize: 12 }}>
                {count} seçili
              </Tag>
            )}
          </div>
          {subtitle && <Text style={{ fontSize: 12, color: "#9CA3AF" }}>{subtitle}</Text>}
        </div>
      </div>
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function AnalysisDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, refetch } = useAnalysisById(id);
  const { data: filesData, isLoading: isFilesLoading } = useAnalysisFiles(id);
  const { mutateAsync: runAnalysisMutate, isPending: isRunning } = useRunAnalysis();
  const { data: lastRun, isLoading: isLastRunLoading, refetch: refetchLastRun } = useLastRun(id);
  const { data: runsData } = useAnalysisRuns(id);
  const analysisRuns = runsData?.data || [];

  const analysis = data?.data;
  const analysisFiles = filesData?.data || [];

  const [api, contextHolder] = notification.useNotification();
  const [latestRunId, setLatestRunId] = useState(null);

  // Form state
  const [runName, setRunName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSoftSkills, setSelectedSoftSkills] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState([]);
  const [minExperienceYears, setMinExperienceYears] = useState(0);
  const [requireProjectOrCertificate, setRequireProjectOrCertificate] = useState(false);
  const [useSemanticSimilarity, setUseSemanticSimilarity] = useState(true);

  const isAnalysisCompleted =
    analysis?.status === "Tamamlandi" || analysis?.status === "Tamamlandı";

  const resolvedLastRunId =
    latestRunId || lastRun?.data?.id || lastRun?.id || null;

  // Seçili kategorilerin union beceri listesi
  const filteredTechnologies = useMemo(() => {
    const all = selectedCategories.length > 0
      ? [...new Set(selectedCategories.flatMap((k) => TECHNOLOGY_MAP[k] || []))]
      : [...new Set(Object.values(TECHNOLOGY_MAP).flat())];
    if (!skillSearch.trim()) return all;
    return all.filter((t) => t.toLowerCase().includes(skillSearch.toLowerCase()));
  }, [selectedCategories, skillSearch]);

  // Kategori toggle (çoklu seçim — seçili becerileri korur)
  const toggleCategory = (key) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setSkillSearch("");
  };

  // Skill toggle
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Custom skill ekle
  const addCustomSkill = () => {
    const val = customSkillInput.trim();
    if (!val || selectedSkills.includes(val)) return;
    setSelectedSkills((prev) => [...prev, val]);
    setCustomSkillInput("");
  };

  // Puan dağılımı — aktif kriterlere göre etkin ağırlık (toplam 100)
  const scoringItems = useMemo(() => {
    const semOn  = useSemanticSimilarity;
    const projOn = requireProjectOrCertificate;
    const softOn = selectedSoftSkills.length > 0;
    const eduOn  = selectedEducation.length > 0;
    const maxAchievable = (
      20
      + (softOn ? 15 : 0)
      + (eduOn  ? 10 : 0)
      + 20
      + (semOn  ? 25 : 0)
      + (projOn ? 10 : 0)
    );
    const eff = (raw) => Math.round((raw / maxAchievable) * 100);
    return [
      { label: "Teknik Beceriler", raw: 20, active: true    },
      { label: "Soft Skills",      raw: 15, active: softOn  },
      { label: "Eğitim",           raw: 10, active: eduOn   },
      { label: "Deneyim",          raw: 20, active: true    },
      { label: "Proje/Sertifika",  raw: 10, active: projOn  },
      { label: "Anlamsal Uyum",    raw: 25, active: semOn   },
    ].map((item) => ({ ...item, pts: item.active ? eff(item.raw) : null }));
  }, [useSemanticSimilarity, requireProjectOrCertificate, selectedSoftSkills, selectedEducation]);

  // Tamamlanma yüzdesi
  const completionPercent = useMemo(() => {
    let score = 0;
    if (selectedSkills.length >= 3) score += 40;
    else if (selectedSkills.length > 0) score += 15;
    if (selectedSoftSkills.length > 0) score += 15;
    if (selectedEducation.length > 0) score += 15;
    if (minExperienceYears > 0) score += 15;
    if (requireProjectOrCertificate) score += 15;
    return Math.min(score, 100);
  }, [selectedSkills, selectedSoftSkills, selectedEducation, minExperienceYears, requireProjectOrCertificate]);

  const progressColor =
    completionPercent >= 70 ? "#10B981" : completionPercent >= 40 ? "#F59E0B" : "#3940c1";

  const handleRunAnalysis = async () => {
    if (selectedSkills.length === 0) {
      api.warning({ message: "En az bir teknik beceri seçmelisiniz.", placement: "topRight" });
      return;
    }
    try {
      const payload = {
        runName: runName?.trim() || "Yeni Analiz",
        hardSkills: selectedSkills,
        softSkills: selectedSoftSkills,
        educationRequirements: selectedEducation,
        minExperienceYears: Number(minExperienceYears) || 0,
        requireProjectOrCertificate,
        useSemanticSimilarity,
      };
      const response = await runAnalysisMutate({ analysisId: id, payload });
      const runId = response?.data?.runId || response?.data?.id || null;
      setLatestRunId(runId);
      await Promise.all([refetch(), refetchLastRun()]);
      api.success({ message: "Analiz tamamlandı!", description: "Sonuçları görüntüleyebilirsiniz.", placement: "topRight" });
    } catch (error) {
      api.error({
        message: "Analiz başlatılamadı",
        description: error?.response?.data?.message || "Bir hata oluştu.",
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
      if (runId) { navigate(`/analizler/${runId}/results`); return; }
      api.info({ message: "Henüz analiz çalıştırılmamış." });
    } catch {
      api.error({ message: "Sonuçlar açılamadı." });
    }
  };

  const getStatusColor = (s) => {
    if (s === "Tamamlandı" || s === "Tamamlandi") return "#10B981";
    if (s === "Bekliyor") return "#F59E0B";
    return "#3940c1";
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FC" }}>
      {contextHolder}
      <LoginNavbar />

      <div style={{ paddingTop: 100, paddingBottom: 60 }}>
        <Row justify="center">
          <Col xs={23} md={22} lg={21} xl={20}>

            {/* Geri butonu */}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/analizler")}
              style={{ marginBottom: 20, borderRadius: 999, height: 40 }}
            >
              Analizlere Dön
            </Button>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>
            ) : !analysis ? (
              <Card style={{ borderRadius: 24, textAlign: "center", padding: 40 }}>
                <Empty description="Analiz bulunamadı." />
              </Card>
            ) : (
              <>
                {/* ── Üst bilgi bandı ─────────────────────────────────── */}
                <Card
                  style={{ borderRadius: 20, marginBottom: 24, border: "1px solid #E9EDF5", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
                  styles={{ body: { padding: "16px 24px" } }}
                >
                  <Row align="middle" gutter={[16, 8]}>
                    <Col flex="auto">
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <Text strong style={{ fontSize: 18, color: "#111827" }}>{analysis.analysisName}</Text>
                        <Tag style={{ borderRadius: 999, padding: "2px 10px" }}>{analysis.positionName}</Tag>
                        <Tag
                          color={isAnalysisCompleted ? "success" : "warning"}
                          style={{ borderRadius: 999, padding: "2px 10px" }}
                        >
                          {isAnalysisCompleted ? "Tamamlandı" : "Bekliyor"}
                        </Tag>
                      </div>
                      {analysis.description && (
                        <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 4, display: "block" }}>
                          {analysis.description}
                        </Text>
                      )}
                    </Col>
                    <Col>
                      <Space split={<Divider type="vertical" />} style={{ color: "#9CA3AF", fontSize: 13 }}>
                        <Space size={4}><FolderOpenOutlined />{analysis.cvCount} CV</Space>
                        <Space size={4}><UserOutlined />{analysis.userFullName}</Space>
                        <Space size={4}><CalendarOutlined />{new Date(analysis.createdAt).toLocaleDateString("tr-TR")}</Space>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* ── Ana içerik ──────────────────────────────────────── */}
                <Row gutter={[24, 24]} align="top">

                  {/* ── Sol: Form ─────────────────────────────────────── */}
                  <Col xs={24} lg={16}>
                    {isAnalysisCompleted ? (
                      <Card style={{ borderRadius: 24, border: "1px solid #E9EDF5", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                        styles={{ body: { padding: 32 } }}>
                        <Space direction="vertical" size={16} style={{ width: "100%" }}>
                          <div style={{ textAlign: "center" }}>
                            <CheckCircleOutlined style={{ fontSize: 48, color: "#10B981", marginBottom: 12 }} />
                            <Title level={3} style={{ margin: 0 }}>Analiz Tamamlandı</Title>
                            <Paragraph style={{ color: "#6B7280", marginTop: 8 }}>
                              Aday sıralaması ve puanlar hazır. Sonuçları inceleyebilirsin.
                            </Paragraph>
                          </div>
                          <Button
                            type="primary" size="large" loading={isLastRunLoading}
                            onClick={handleShowResults}
                            style={{ borderRadius: 999, height: 50, width: "100%", background: "#3940c1", border: "none", fontWeight: 600 }}
                          >
                            Sonuçları Görüntüle
                          </Button>
                        </Space>
                      </Card>
                    ) : (
                      <Card
                        style={{ borderRadius: 24, border: "1px solid #E9EDF5", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                        styles={{ body: { padding: 32 } }}
                      >
                        {/* Tamamlanma çubuğu */}
                        <div style={{ marginBottom: 28 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <Text style={{ fontSize: 13, color: "#6B7280" }}>Kriter doluluğu</Text>
                            <Text strong style={{ fontSize: 13, color: progressColor }}>{completionPercent}%</Text>
                          </div>
                          <Progress percent={completionPercent} showInfo={false}
                            strokeColor={progressColor} trailColor="#EEF2FF" strokeWidth={6} />
                        </div>

                        {/* ── BÖLÜM 1: Analiz Adı ─────────────────────── */}
                        <SectionHeader
                          icon={<BookOutlined />}
                          title="Analiz Çalıştırma Adı"
                          subtitle="İsteğe bağlı — daha sonra tanımlamanızı kolaylaştırır"
                        />
                        <Input
                          value={runName}
                          onChange={(e) => setRunName(e.target.value)}
                          placeholder="Örn: Backend Java Senior — Mayıs 2025"
                          style={{ borderRadius: 12, height: 44, marginBottom: 28 }}
                        />

                        <Divider style={{ margin: "0 0 28px" }} />

                        {/* ── BÖLÜM 2: Kategori ─────────────────────────── */}
                        <SectionHeader
                          icon={<AppstoreOutlined />}
                          title="Teknoloji Filtresi"
                          subtitle="Birden fazla seçebilirsiniz — boş bırakırsanız tüm beceriler listelenir"
                          count={selectedCategories.length}
                        />
                        <Row gutter={[10, 10]} style={{ marginBottom: 28 }}>
                          {CATEGORY_LIST.map((cat) => {
                            const active = selectedCategories.includes(cat.key);
                            return (
                              <Col xs={12} sm={8} key={cat.key}>
                                <div
                                  onClick={() => toggleCategory(cat.key)}
                                  style={{
                                    border: active ? `2px solid ${cat.color}` : "1.5px solid #E5E7EB",
                                    borderRadius: 16,
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    background: active ? `${cat.color}12` : "#fff",
                                    display: "flex", alignItems: "center", gap: 10,
                                    transition: "all 0.18s",
                                  }}
                                >
                                  <div style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: active ? cat.color : "#F3F4F6",
                                    color: active ? "#fff" : "#6B7280",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 16, flexShrink: 0,
                                  }}>
                                    {active ? <CheckCircleOutlined /> : cat.icon}
                                  </div>
                                  <Text strong style={{ color: active ? cat.color : "#374151", fontSize: 14 }}>
                                    {cat.label}
                                  </Text>
                                </div>
                              </Col>
                            );
                          })}
                        </Row>

                        <Divider style={{ margin: "0 0 28px" }} />

                        {/* ── BÖLÜM 3: Teknik Beceriler ────────────────── */}
                        <SectionHeader
                          icon={<CodeOutlined />}
                          title="Teknik Beceriler"
                          subtitle="Pozisyon için gerekli dil ve teknolojileri seçin (çok seçimli)"
                          count={selectedSkills.length}
                          points={20}
                        />

                        {/* Seçili skill'ler */}
                        {selectedSkills.length > 0 && (
                          <div style={{ marginBottom: 12, padding: "12px 16px", borderRadius: 12, background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                            <Text style={{ fontSize: 12, color: "#6366F1", fontWeight: 600, display: "block", marginBottom: 8 }}>
                              SEÇİLİ BECERİLER
                            </Text>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {selectedSkills.map((s) => (
                                <Tag
                                  key={s}
                                  closable
                                  onClose={() => toggleSkill(s)}
                                  style={{
                                    borderRadius: 999, padding: "4px 10px",
                                    background: "#3940c1", color: "#fff",
                                    border: "none", fontSize: 13, fontWeight: 500,
                                  }}
                                  closeIcon={<CloseOutlined style={{ fontSize: 10, color: "#fff" }} />}
                                >
                                  {s}
                                </Tag>
                              ))}
                              <Tag
                                onClick={() => setSelectedSkills([])}
                                style={{ borderRadius: 999, cursor: "pointer", padding: "4px 10px", color: "#EF4444", borderColor: "#EF4444" }}
                              >
                                Tümünü Temizle
                              </Tag>
                            </div>
                          </div>
                        )}

                        {/* Arama */}
                        <Input
                          prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                          placeholder="Teknoloji ara..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          style={{ borderRadius: 12, height: 40, marginBottom: 10 }}
                          allowClear
                        />

                        {/* Teknoloji grid */}
                        <div style={{
                          display: "flex", flexWrap: "wrap", gap: 8,
                          maxHeight: 200, overflowY: "auto", paddingRight: 4, marginBottom: 12,
                        }}>
                          {filteredTechnologies.map((tech) => {
                            const sel = selectedSkills.includes(tech);
                            return (
                              <Tag
                                key={tech}
                                onClick={() => toggleSkill(tech)}
                                style={{
                                  cursor: "pointer", borderRadius: 999,
                                  padding: "6px 14px", fontSize: 13,
                                  border: sel ? "1.5px solid #3940c1" : "1.5px solid #E5E7EB",
                                  background: sel ? "rgba(57,64,193,0.10)" : "#FAFAFA",
                                  color: sel ? "#3940c1" : "#4B5563",
                                  fontWeight: sel ? 600 : 400,
                                  transition: "all 0.15s",
                                  userSelect: "none",
                                }}
                              >
                                {sel && "✓ "}{tech}
                              </Tag>
                            );
                          })}
                          {filteredTechnologies.length === 0 && (
                            <Text style={{ color: "#9CA3AF", fontSize: 13 }}>Sonuç bulunamadı</Text>
                          )}
                        </div>

                        {/* Custom skill ekle */}
                        <Space.Compact style={{ display: "flex" }}>
                          <Input
                            value={customSkillInput}
                            onChange={(e) => setCustomSkillInput(e.target.value)}
                            onPressEnter={addCustomSkill}
                            placeholder="Listede olmayan beceri ekle..."
                            style={{ flex: 1, height: 40 }}
                          />
                          <Button
                            icon={<PlusOutlined />}
                            onClick={addCustomSkill}
                            style={{ height: 40, background: "#3940c1", color: "#fff", border: "none" }}
                          >
                            Ekle
                          </Button>
                        </Space.Compact>

                        <Divider style={{ margin: "28px 0" }} />

                        {/* ── BÖLÜM 4: Soft Skills ───────────────────── */}
                        <SectionHeader
                          icon={<TeamOutlined />}
                          title="Kişisel Yetkinlikler"
                          subtitle="Adaylarda aranacak davranışsal özellikler (isteğe bağlı)"
                          count={selectedSoftSkills.length}
                          points={15}
                        />
                        <SelectableTagGroup
                          options={SOFT_SKILL_OPTIONS}
                          selectedValues={selectedSoftSkills}
                          onChange={setSelectedSoftSkills}
                        />

                        <Divider style={{ margin: "28px 0" }} />

                        {/* ── BÖLÜM 5: Eğitim ────────────────────────── */}
                        <SectionHeader
                          icon={<BookOutlined />}
                          title="Tercih Edilen Eğitim Alanları"
                          subtitle="Hangi bölümler öncelikli değerlendirilsin? (isteğe bağlı)"
                          count={selectedEducation.length}
                          points={10}
                        />
                        <SelectableTagGroup
                          options={EDUCATION_OPTIONS}
                          selectedValues={selectedEducation}
                          onChange={setSelectedEducation}
                        />

                        <Divider style={{ margin: "28px 0" }} />

                        {/* ── BÖLÜM 6: Değerlendirme Ayarları ─────────── */}
                        <SectionHeader
                          icon={<SettingOutlined />}
                          title="Değerlendirme Kriterleri"
                          subtitle="Puanlama yöntemini özelleştirin"
                        />

                        {/* Deneyim */}
                        <Card
                          style={{ borderRadius: 16, border: "1.5px solid #E5E7EB", marginBottom: 12 }}
                          styles={{ body: { padding: "14px 18px" } }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong>Minimum Deneyim (Yıl)</Text>
                              <br />
                              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                                Bu yıldan az deneyimi olan adaylar daha düşük puan alır
                              </Text>
                            </div>
                            <InputNumber
                              min={0} max={30} value={minExperienceYears}
                              onChange={(v) => setMinExperienceYears(v || 0)}
                              style={{ width: 90 }}
                              addonAfter="yıl"
                            />
                          </div>
                        </Card>

                        {/* Proje/Sertifika */}
                        <Card
                          style={{
                            borderRadius: 16, marginBottom: 12,
                            border: requireProjectOrCertificate ? "1.5px solid #3940c1" : "1.5px solid #E5E7EB",
                            background: requireProjectOrCertificate ? "rgba(57,64,193,0.04)" : "#fff",
                          }}
                          styles={{ body: { padding: "14px 18px" } }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong>Proje ve Sertifikalar Etkili Olsun</Text>
                              <br />
                              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                                CV'de proje/sertifika bulunması ek puan kazandırır  
                              </Text>
                            </div>
                            <Switch
                              checked={requireProjectOrCertificate}
                              onChange={setRequireProjectOrCertificate}
                              style={requireProjectOrCertificate ? { background: "#3940c1" } : {}}
                            />
                          </div>
                        </Card>

                        {/* Semantik */}
                        <Card
                          style={{
                            borderRadius: 16, marginBottom: 12,
                            border: useSemanticSimilarity ? "1.5px solid #3940c1" : "1.5px solid #E5E7EB",
                            background: useSemanticSimilarity ? "rgba(57,64,193,0.04)" : "#fff",
                          }}
                          styles={{ body: { padding: "14px 18px" } }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong>Anlamsal Uyum Skoru</Text>
                              <br />
                              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                                CV metninin seçilen beceriler ve iş tanımıyla anlamsal yakınlığı 
                              </Text>
                            </div>
                            <Switch
                              checked={useSemanticSimilarity}
                              onChange={setUseSemanticSimilarity}
                              style={useSemanticSimilarity ? { background: "#3940c1" } : {}}
                            />
                          </div>
                        </Card>


                        <Divider style={{ margin: "28px 0" }} />

                        {/* ── Analiz başlat butonu ─────────────────────── */}
                        <Button
                          type="primary"
                          size="large"
                          loading={isRunning}
                          onClick={handleRunAnalysis}
                          icon={<RocketOutlined />}
                          block
                          disabled={selectedSkills.length === 0}
                          style={{
                            height: 54, borderRadius: 999, fontSize: 16, fontWeight: 700,
                            background: selectedSkills.length > 0 ? "#FF6B6B" : undefined,
                            border: "none",
                            boxShadow: selectedSkills.length > 0 ? "0 10px 24px rgba(255,107,107,0.28)" : "none",
                          }}
                        >
                          {isRunning ? "Analiz Çalışıyor..." : "Analizi Başlat"}
                        </Button>
                        {selectedSkills.length === 0 && (
                          <Text style={{ display: "block", textAlign: "center", marginTop: 8, color: "#F59E0B", fontSize: 13 }}>
                            ⚠ Analiz başlatmak için en az 1 teknik beceri seçin
                          </Text>
                        )}
                      </Card>
                    )}
                  </Col>

                  {/* ── Sağ: Sidebar ──────────────────────────────────── */}
                  <Col xs={24} lg={8}>
                    <div style={{ position: "sticky", top: 100, display: "grid", gap: 20 }}>

                      {/* CV dosyaları */}
                      <Card
                        style={{ borderRadius: 20, border: "1px solid #E9EDF5", boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <Text strong style={{ fontSize: 15 }}>Yüklenen CV'ler</Text>
                          <Badge count={analysisFiles.length} color="#3940c1" />
                        </div>
                        {isFilesLoading ? (
                          <div style={{ textAlign: "center", padding: 20 }}><Spin /></div>
                        ) : analysisFiles.length === 0 ? (
                          <Empty description="Dosya yok" imageStyle={{ height: 40 }} />
                        ) : (
                          <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                            {analysisFiles.map((f) => (
                              <div key={f.id} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 12px", borderRadius: 12,
                                background: "#F8FAFF", border: "1px solid #E8EDFF",
                              }}>
                                <FilePdfOutlined style={{ color: "#3940c1", fontSize: 16, flexShrink: 0 }} />
                                <Text style={{ fontSize: 12, color: "#374151" }}
                                  ellipsis={{ tooltip: f.originalFileName }}>
                                  {f.originalFileName}
                                </Text>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>

                      {/* Anlık Kriter Özeti */}
                      {!isAnalysisCompleted && (
                        <Card
                          style={{ borderRadius: 20, border: "1px solid #E9EDF5", boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}
                          styles={{ body: { padding: 20 } }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <Text strong style={{ fontSize: 15 }}>Kriter Özeti</Text>
                            <div style={{
                              fontSize: 12, fontWeight: 700, color: progressColor,
                              background: `${progressColor}18`, borderRadius: 999, padding: "2px 10px",
                            }}>
                              {completionPercent}% dolu
                            </div>
                          </div>

                          <div style={{ display: "grid", gap: 10 }}>
                            <SummaryRow label="Kategori"
                              value={selectedCategories.length > 0
                                ? CATEGORY_LIST.filter((c) => selectedCategories.includes(c.key)).map((c) => c.label).join(", ")
                                : "Tümü"}
                              filled />
                            <SummaryRow
                              label="Teknik Beceriler"
                              value={selectedSkills.length > 0 ? `${selectedSkills.length} beceri seçili` : null}
                              detail={selectedSkills.slice(0, 3).join(", ") + (selectedSkills.length > 3 ? "..." : "")}
                              required
                            />
                            <SummaryRow
                              label="Soft Skills"
                              value={selectedSoftSkills.length > 0 ? `${selectedSoftSkills.length} seçili` : null}
                            />
                            <SummaryRow
                              label="Eğitim"
                              value={selectedEducation.length > 0 ? selectedEducation[0] : null}
                            />
                            <SummaryRow
                              label="Min. Deneyim"
                              value={minExperienceYears > 0 ? `${minExperienceYears} yıl` : null}
                            />
                            <SummaryRow
                              label="Proje/Sertifika"
                              value={requireProjectOrCertificate ? "Aktif (+10 puan)" : null}
                            />
                            <SummaryRow
                              label="Anlamsal Uyum"
                              value={useSemanticSimilarity ? "Aktif (+25 puan)" : "Devre dışı"}
                              filled={useSemanticSimilarity}
                            />
                          </div>

                          {/* Puan dağılımı */}
                          <Divider style={{ margin: "14px 0 10px" }} />
                          <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, letterSpacing: 0.5 }}>
                            PUAN DAĞILIMI (TOPLAM 100)
                          </Text>
                          <div style={{ marginTop: 8, display: "grid", gap: 5 }}>
                            {scoringItems.map(({ label, pts, active }) => (
                              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ fontSize: 12, color: active ? "#6B7280" : "#D1D5DB", textDecoration: active ? "none" : "line-through" }}>
                                  {label}
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: 600, color: active ? "#374151" : "#D1D5DB" }}>
                                  {active ? `${pts} puan` : "devre dışı"}
                                </Text>
                              </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: 5, marginTop: 2 }}>
                              <Text style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Toplam</Text>
                              <Text style={{ fontSize: 12, fontWeight: 700, color: "#3940c1" }}>100 puan</Text>
                            </div>
                          </div>
                        </Card>
                      )}

                    </div>
                  </Col>
                </Row>

                {/* ── Çalıştırma Geçmişi ──────────────────────────────── */}
                {analysisRuns.length > 0 && (
                  <Card
                    style={{ borderRadius: 20, marginTop: 24, border: "1px solid #E9EDF5", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
                    styles={{ body: { padding: "20px 24px" } }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: "rgba(57,64,193,0.10)", color: "#3940c1",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                      }}>
                        <HistoryOutlined />
                      </div>
                      <Text strong style={{ fontSize: 15, color: "#111827" }}>Çalıştırma Geçmişi</Text>
                      <Tag style={{ borderRadius: 999, background: "#EEF2FF", color: "#3940c1", border: "none", fontSize: 12 }}>
                        {analysisRuns.length} çalıştırma
                      </Tag>
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      {analysisRuns.map((run, idx) => (
                        <div key={run.id} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 16px", borderRadius: 14,
                          background: idx === 0 ? "#F5F7FF" : "#FAFBFF",
                          border: `1px solid ${idx === 0 ? "#C7D2FE" : "#E9EDF5"}`,
                          flexWrap: "wrap", gap: 10,
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <Text strong style={{ fontSize: 13, color: "#111827" }}>
                                {run.runName || "İsimsiz Çalıştırma"}
                              </Text>
                              {idx === 0 && (
                                <Tag style={{ borderRadius: 999, background: "#3940c1", color: "#fff", border: "none", fontSize: 11 }}>
                                  Son
                                </Tag>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                              <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {new Date(run.createdAt).toLocaleString("tr-TR")}
                              </Text>
                              {run.hardSkills && (
                                <Text style={{ fontSize: 11, color: "#6B7280" }} ellipsis>
                                  {run.hardSkills.split(",").slice(0, 3).join(", ")}
                                  {run.hardSkills.split(",").length > 3 ? ` +${run.hardSkills.split(",").length - 3}` : ""}
                                </Text>
                              )}
                            </div>
                          </div>
                          <Button
                            size="small"
                            icon={<BarChartOutlined />}
                            onClick={() => navigate(`/analizler/${run.id}/results`)}
                            style={{
                              borderRadius: 10, height: 32, fontSize: 12,
                              background: idx === 0 ? "#3940c1" : undefined,
                              color: idx === 0 ? "#fff" : undefined,
                              borderColor: idx === 0 ? "#3940c1" : undefined,
                            }}
                          >
                            Sonuçları Gör
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}

// Özet satırı yardımcı bileşeni
function SummaryRow({ label, value, detail, required, filled }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <Text style={{ fontSize: 12, color: "#6B7280", flexShrink: 0 }}>
        {required && !value && <span style={{ color: "#EF4444" }}>* </span>}
        {label}
      </Text>
      <div style={{ textAlign: "right" }}>
        {value ? (
          <Text style={{ fontSize: 12, fontWeight: 600, color: filled ? "#3940c1" : "#111827" }}>
            {value}
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: "#D1D5DB" }}>—</Text>
        )}
        {detail && value && (
          <Text style={{ fontSize: 11, color: "#9CA3AF", display: "block" }}>{detail}</Text>
        )}
      </div>
    </div>
  );
}
