import {
  Row, Col, Typography, Card, Avatar, Button,
  Tag, notification, Form, Input,
} from "antd";
import {
  UserOutlined, LogoutOutlined,
  EditOutlined, SafetyOutlined, InfoCircleOutlined,
  CheckCircleOutlined, ArrowLeftOutlined, FileSearchOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { useUserAnalyses } from "../requests/AnalysisQueries";
import { useChangePassword } from "../requests/UserQueries";

const { Title, Text } = Typography;
const ACCENT = "#3940C1";

// ── Yardımcı bileşenler ───────────────────────────────────────────────────────

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <Card
      style={{ borderRadius: 20, border: "1px solid #E9EDF5", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
      styles={{ body: { padding: 28 } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: `${ACCENT}12`, color: ACCENT,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
        }}>
          {icon}
        </div>
        <div>
          <Text strong style={{ fontSize: 15, color: "#111827", display: "block" }}>{title}</Text>
          {subtitle && <Text style={{ fontSize: 12, color: "#9CA3AF" }}>{subtitle}</Text>}
        </div>
      </div>
      {children}
    </Card>
  );
}

function InfoRow({ label, value, tag, last }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0",
      borderBottom: last ? "none" : "1px solid #F1F5F9",
    }}>
      <Text style={{ fontSize: 13, color: "#6B7280" }}>{label}</Text>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Text strong style={{ fontSize: 13, color: "#111827" }}>{value}</Text>
        {tag && <Tag color="blue" style={{ borderRadius: 999, fontSize: 11 }}>{tag}</Tag>}
      </div>
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const navigate  = useNavigate();
  const [api, ctx] = notification.useNotification();
  const { mutateAsync: changePassword, isPending: isChanging } = useChangePassword();
  const [passwordForm] = Form.useForm();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { data: analysesData } = useUserAnalyses(user.id);
  const totalAnalyses = analysesData?.data?.length ?? 0;

  const initials = (user.fullName || "K")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FC" }}>
      {ctx}
      <LoginNavbar />

      <div style={{ paddingTop: 108, paddingBottom: 60 }}>
        <Row justify="center">
          <Col xs={22} md={20} lg={17} xl={15}>

            {/* Geri */}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/dashboard")}
              style={{ marginBottom: 24, borderRadius: 999, height: 40 }}
            >
              Anasayfaya Dön
            </Button>

            {/* Başlık */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 14,
                  background: `linear-gradient(135deg,${ACCENT},#6366F1)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 18,
                }}>
                  <EditOutlined />
                </div>
                <Title level={2} style={{ margin: 0, color: "#111827" }}>Ayarlar</Title>
              </div>
              <Text style={{ color: "#6B7280", fontSize: 14 }}>
                Profil bilgilerinizi ve güvenlik ayarlarınızı yönetin.
              </Text>
            </div>

            <Row gutter={[24, 24]}>

              {/* ── Sol kolon ─────────────────────────────────────────────── */}
              <Col xs={24} lg={8}>

                {/* Profil kartı */}
                <Card
                  style={{
                    borderRadius: 20, textAlign: "center",
                    border: "1px solid #E9EDF5",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                  }}
                  styles={{ body: { padding: 0 } }}
                >
                  <div style={{ height: 72, background: `linear-gradient(135deg,${ACCENT},#6366F1)` }} />

                  <div style={{ padding: "0 24px 28px", marginTop: -36 }}>
                    <Avatar
                      size={72}
                      style={{
                        background: "#FF6B6B", fontSize: 26, fontWeight: 700,
                        border: "3px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                      }}
                    >
                      {initials}
                    </Avatar>

                    <div style={{ marginTop: 14 }}>
                      <Text strong style={{ fontSize: 18, color: "#111827", display: "block" }}>
                        {user.fullName || "Kullanıcı"}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>
                        {user.email || "—"}
                      </Text>
                    </div>

                    <Tag style={{
                      marginTop: 12, borderRadius: 999, padding: "3px 14px",
                      background: `${ACCENT}12`, color: ACCENT,
                      border: `1px solid ${ACCENT}30`, fontWeight: 600, fontSize: 12,
                    }}>
                      <CheckCircleOutlined style={{ marginRight: 5 }} />
                      Aktif Hesap
                    </Tag>

                    {/* Analiz istatistiği */}
                    <div style={{
                      marginTop: 20, padding: "14px 0",
                      borderTop: "1px solid #F1F5F9",
                      display: "flex", justifyContent: "center", gap: 6, alignItems: "center",
                    }}>
                      <FileSearchOutlined style={{ color: ACCENT, fontSize: 16 }} />
                      <Text strong style={{ fontSize: 22, color: ACCENT }}>{totalAnalyses}</Text>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>toplam analiz</Text>
                    </div>
                  </div>
                </Card>

                {/* Çıkış kartı */}
                <Card
                  style={{ borderRadius: 20, border: "1px solid #FEE2E2", marginTop: 16, background: "#FFF8F8" }}
                  styles={{ body: { padding: "18px 24px" } }}
                >
                  <Text strong style={{ fontSize: 14, color: "#DC2626", display: "block", marginBottom: 6 }}>
                    Oturumu Kapat
                  </Text>
                  <Text style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginBottom: 14 }}>
                    Hesabınızdan çıkış yaparsınız.
                  </Text>
                  <Button
                    danger block icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{ borderRadius: 999, fontWeight: 600 }}
                  >
                    Çıkış Yap
                  </Button>
                </Card>

              </Col>

              {/* ── Sağ kolon ─────────────────────────────────────────────── */}
              <Col xs={24} lg={16}>
                <div style={{ display: "grid", gap: 20 }}>

                  {/* Hesap Bilgileri */}
                  <SectionCard
                    icon={<UserOutlined />}
                    title="Hesap Bilgileri"
                    subtitle="Kayıtlı kullanıcı bilgileriniz"
                  >
                    <InfoRow label="Ad Soyad"     value={user.fullName || "—"} />
                    <InfoRow label="E-posta"       value={user.email || "—"} tag="Doğrulandı" />
                    <InfoRow label="Toplam Analiz" value={totalAnalyses} last />
                    <div style={{ paddingTop: 12 }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 14px", borderRadius: 10,
                        background: "#F0F9FF", border: "1px solid #BAE6FD",
                      }}>
                        <InfoCircleOutlined style={{ color: "#0284C7", fontSize: 14 }} />
                        <Text style={{ fontSize: 12, color: "#0369A1" }}>
                          Profil bilgilerini güncellemek için destek ile iletişime geçin.
                        </Text>
                      </div>
                    </div>
                  </SectionCard>

                  {/* Şifre Değiştir */}
                  <SectionCard
                    icon={<LockOutlined />}
                    title="Şifre Değiştir"
                    subtitle="Mevcut şifrenizi girerek yeni şifre belirleyin"
                  >
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={async (values) => {
                        try {
                          await changePassword({
                            currentPassword: values.currentPassword,
                            newPassword: values.newPassword,
                          });
                          api.success({
                            message: "Şifre Güncellendi",
                            description: "Şifreniz başarıyla değiştirildi.",
                            placement: "topRight",
                          });
                          passwordForm.resetFields();
                        } catch (err) {
                          api.error({
                            message: "Hata",
                            description: err?.response?.data?.message || "Şifre güncellenemedi.",
                            placement: "topRight",
                          });
                        }
                      }}
                      style={{ gap: 0 }}
                    >
                      <Form.Item
                        label={<Text style={{ color: "#111827", fontWeight: 600, fontSize: 13 }}>Mevcut Şifre</Text>}
                        name="currentPassword"
                        rules={[{ required: true, message: "Mevcut şifre zorunlu" }]}
                        style={{ marginBottom: 14 }}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: "#9CA3AF" }} />}
                          placeholder="••••••••"
                          style={{ borderRadius: 10, height: 42 }}
                        />
                      </Form.Item>

                      <Form.Item
                        label={<Text style={{ color: "#111827", fontWeight: 600, fontSize: 13 }}>Yeni Şifre</Text>}
                        name="newPassword"
                        rules={[
                          { required: true, message: "Yeni şifre zorunlu" },
                          { min: 6, message: "En az 6 karakter olmalı" },
                        ]}
                        style={{ marginBottom: 14 }}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: "#3940c1" }} />}
                          placeholder="••••••••"
                          style={{ borderRadius: 10, height: 42 }}
                        />
                      </Form.Item>

                      <Form.Item
                        label={<Text style={{ color: "#111827", fontWeight: 600, fontSize: 13 }}>Yeni Şifre (Tekrar)</Text>}
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                          { required: true, message: "Şifre tekrarı zorunlu" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                              return Promise.reject(new Error("Şifreler eşleşmiyor."));
                            },
                          }),
                        ]}
                        style={{ marginBottom: 20 }}
                      >
                        <Input.Password
                          prefix={<LockOutlined style={{ color: "#3940c1" }} />}
                          placeholder="••••••••"
                          style={{ borderRadius: 10, height: 42 }}
                        />
                      </Form.Item>

                      <Button
                        type="primary" htmlType="submit" loading={isChanging} block
                        style={{
                          borderRadius: 999, height: 44, fontWeight: 600,
                          background: "#3940c1", border: "none",
                        }}
                      >
                        Şifremi Güncelle
                      </Button>
                    </Form>
                  </SectionCard>

                  {/* Analiz Özeti */}
                  <SectionCard
                    icon={<SafetyOutlined />}
                    title="Analiz Özeti"
                    subtitle="Hesabınızdaki analiz durumu"
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {[
                        { label: "Toplam Analiz",   value: totalAnalyses,                              color: ACCENT },
                        { label: "Tamamlanan",       value: analysesData?.data?.filter(a => a.status === "Tamamlandı" || a.status === "Tamamlandi").length ?? 0, color: "#10B981" },
                        { label: "Bekleyen",         value: analysesData?.data?.filter(a => a.status === "Bekliyor").length ?? 0,    color: "#F59E0B" },
                        { label: "Toplam CV",        value: analysesData?.data?.reduce((s, a) => s + (a.cvCount || 0), 0) ?? 0,     color: "#6366F1" },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{
                          padding: "16px 18px", borderRadius: 14,
                          background: `${color}08`, border: `1px solid ${color}20`,
                          textAlign: "center",
                        }}>
                          <Text strong style={{ fontSize: 26, color, display: "block", lineHeight: 1.1 }}>
                            {value}
                          </Text>
                          <Text style={{ fontSize: 12, color: "#6B7280" }}>{label}</Text>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <Button
                        block
                        onClick={() => navigate("/analizler")}
                        style={{ borderRadius: 999, height: 42, fontWeight: 600, color: ACCENT, borderColor: ACCENT }}
                      >
                        Analizlere Git
                      </Button>
                    </div>
                  </SectionCard>

                  {/* Uygulama Hakkında */}
                  <SectionCard
                    icon={<InfoCircleOutlined />}
                    title="Uygulama Hakkında"
                    subtitle="AtlasCV sistem bilgileri"
                  >
                    <div style={{ width: "100%" }}>
                      <InfoRow label="Uygulama"      value="AtlasCV" />
                      <InfoRow label="Versiyon"      value="2.0.0" />
                      <InfoRow label="Ortam"         value="Üretim" tag="Canlı" />
                      <InfoRow label="Analiz Motoru" value="GPT-4o-mini · FastAPI" />
                      <InfoRow label="Semantik Model" value="MiniLM-L12-v2" last />
                      <div style={{
                        paddingTop: 14,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                          © 2025 AtlasCV · Bitirme Projesi
                        </Text>
                        <Tag color="green" style={{ borderRadius: 999, fontSize: 11 }}>
                          Sistem Aktif
                        </Tag>
                      </div>
                    </div>
                  </SectionCard>

                </div>
              </Col>
            </Row>

          </Col>
        </Row>
      </div>
    </div>
  );
}
