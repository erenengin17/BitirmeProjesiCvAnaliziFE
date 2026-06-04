import { Row, Col, Typography, Card, Spin, Tag } from "antd";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Legend,
} from "recharts";
import {
  BarChartOutlined, TeamOutlined, FunnelPlotOutlined,
  TrophyOutlined, ArrowLeftOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { useAnalytics } from "../requests/AnalysisQueries";

const { Title, Text } = Typography;
const PRIMARY = "#3940C1";

const STAGE_LABELS = {
  MULAKATA_CAGRILDI: "Mülakata Çağrıldı",
  TELEFON_GORUSMESI: "Telefon",
  TEKNIK_MULAKAT:    "Teknik",
  IK_MULAKATI:       "İK",
  TEKLIF_VERILDI:    "Teklif",
  ISE_ALINDI:        "İşe Alındı",
  REDDEDILDI:        "Reddedildi",
};

const STAGE_COLORS = {
  MULAKATA_CAGRILDI: PRIMARY,
  TELEFON_GORUSMESI: "#0EA5E9",
  TEKNIK_MULAKAT:    "#7C3AED",
  IK_MULAKATI:       "#EC4899",
  TEKLIF_VERILDI:    "#F59E0B",
  ISE_ALINDI:        "#10B981",
  REDDEDILDI:        "#EF4444",
};

const SCORE_COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#6366F1", "#10B981"];

function StatCard({ icon, label, value, color = PRIMARY, bg = "#EEF2FF" }) {
  return (
    <Card
      style={{ borderRadius: 20, border: "1px solid #E9EDF5", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
      styles={{ body: { padding: 24 } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          color, fontSize: 22,
        }}>
          {icon}
        </div>
        <div>
          <Text style={{ fontSize: 13, color: "#6B7280", display: "block" }}>{label}</Text>
          <Text strong style={{ fontSize: 26, color: "#111827" }}>{value}</Text>
        </div>
      </div>
    </Card>
  );
}

export default function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useAnalytics();
  const analytics = data?.data;

  const stagePieData = analytics
    ? Object.entries(analytics.stageDistribution)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: STAGE_LABELS[k] ?? k, value: v, fill: STAGE_COLORS[k] ?? "#9CA3AF" }))
    : [];

  const scoreBarData = analytics
    ? Object.entries(analytics.scoreDistribution).map(([range, count], i) => ({
        range, count, fill: SCORE_COLORS[i],
      }))
    : [];

  const topSkillsData = analytics?.topHardSkills?.slice(0, 8) ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "#eef0f7" }}>
      <LoginNavbar />

      <div style={{ paddingTop: 120, paddingBottom: 60 }}>
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
                Analitik Dashboard
              </Title>
              <Text style={{ color: "#6b7280", fontSize: 16 }}>
                Tüm analizlerinize ait özet istatistikler ve aday dağılımı.
              </Text>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <Spin size="large" />
              </div>
            ) : !analytics ? (
              <Card style={{ borderRadius: 20, textAlign: "center" }} styles={{ body: { padding: 60 } }}>
                <Text style={{ color: "#6B7280" }}>Veri yüklenemedi.</Text>
              </Card>
            ) : (
              <>
                {/* Özet kartlar */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} lg={6}>
                    <StatCard
                      icon={<BarChartOutlined />}
                      label="Toplam Analiz"
                      value={analytics.totalAnalyses}
                      color={PRIMARY}
                      bg="#EEF2FF"
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <StatCard
                      icon={<TeamOutlined />}
                      label="Toplam Aday"
                      value={analytics.totalCandidates}
                      color="#7C3AED"
                      bg="#F5F3FF"
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <StatCard
                      icon={<FunnelPlotOutlined />}
                      label="Mülakat Sürecindeki Aday"
                      value={analytics.pipelineActiveCandidates}
                      color="#10B981"
                      bg="#D1FAE5"
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <StatCard
                      icon={<TrophyOutlined />}
                      label="Ortalama Skor"
                      value={analytics.averageScore > 0 ? `${analytics.averageScore}/100` : "—"}
                      color="#F59E0B"
                      bg="#FFFBEB"
                    />
                  </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  {/* Pipeline Dağılımı — Pie */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={<Text strong>Pipeline Aşama Dağılımı</Text>}
                      style={{ borderRadius: 20, border: "1px solid #E9EDF5", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
                      styles={{ body: { padding: "12px 16px" } }}
                    >
                      {stagePieData.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                          <Text style={{ color: "#9CA3AF" }}>Henüz pipeline'da aday yok.</Text>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={stagePieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              stroke="none"
                            />
                            <Legend
                              formatter={(value) => <span style={{ fontSize: 12, color: "#374151" }}>{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </Card>
                  </Col>

                  {/* Skor Dağılımı — Bar */}
                  <Col xs={24} lg={12}>
                    <Card
                      title={<Text strong>Skor Dağılımı</Text>}
                      style={{ borderRadius: 20, border: "1px solid #E9EDF5", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
                      styles={{ body: { padding: "12px 16px" } }}
                    >
                      {scoreBarData.every((d) => d.count === 0) ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                          <Text style={{ color: "#9CA3AF" }}>Henüz analiz sonucu yok.</Text>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={scoreBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip
                              cursor={{ fill: "rgba(0,0,0,0.04)" }}
                              contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13 }}
                            />
                            <Bar dataKey="count" name="Aday Sayısı" radius={[6, 6, 0, 0]} activeBar={false} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </Card>
                  </Col>
                </Row>

                {/* En Çok Görülen Beceriler */}
                <Card
                  title={<Text strong>En Çok Görülen Teknik Beceriler (Top 8)</Text>}
                  style={{ borderRadius: 20, border: "1px solid #E9EDF5", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
                  styles={{ body: { padding: "12px 16px" } }}
                >
                  {topSkillsData.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <Text style={{ color: "#9CA3AF" }}>Henüz yeterli veri yok.</Text>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={topSkillsData.map((s) => ({ skill: s.skill, count: s.count }))}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                      >
                        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="skill" tick={{ fontSize: 12 }} width={110} />
                        <Tooltip
                          cursor={{ fill: "rgba(0,0,0,0.04)" }}
                          contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 13 }}
                        />
                        <Bar dataKey="count" name="Aday Sayısı" fill={PRIMARY} radius={[0, 6, 6, 0]} activeBar={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                    {topSkillsData.map((s, i) => (
                      <Tag
                        key={i}
                        style={{
                          borderRadius: 999, padding: "3px 12px", fontSize: 12,
                          background: "#EEF2FF", color: PRIMARY, border: `1px solid #C7D2FE`,
                          fontWeight: 600,
                        }}
                      >
                        {s.skill} · {s.count}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}
