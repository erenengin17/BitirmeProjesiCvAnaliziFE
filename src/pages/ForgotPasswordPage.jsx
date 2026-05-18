import { useState } from "react";
import { Typography, Form, Input, Button, notification } from "antd";
import { MailOutlined, LockOutlined, SafetyOutlined, ArrowLeftOutlined, KeyOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useForgotPassword, useResetPassword } from "../requests/UserQueries";

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const [step, setStep]   = useState(1);
  const [email, setEmail] = useState("");

  const { mutateAsync: sendCode,  isPending: isSending }   = useForgotPassword();
  const { mutateAsync: resetPass, isPending: isResetting } = useResetPassword();

  const onSendCode = async (values) => {
    try {
      await sendCode({ email: values.email });
      setEmail(values.email);
      setStep(2);
      api.success({ message: "Kod Gönderildi", description: `${values.email} adresine sıfırlama kodu gönderildi.`, placement: "topRight" });
    } catch (err) {
      api.error({ message: "Hata", description: err?.response?.data?.message || "Kod gönderilemedi.", placement: "topRight" });
    }
  };

  const onResetPassword = async (values) => {
    try {
      await resetPass({ email, code: values.code, newPassword: values.newPassword });
      api.success({ message: "Şifre Güncellendi", description: "Yeni şifrenizle giriş yapabilirsiniz.", placement: "topRight" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      api.error({ message: "Hata", description: err?.response?.data?.message || "Şifre sıfırlanamadı.", placement: "topRight" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EEF0FF 0%,#F7F8FC 55%,#FFF3F3 100%)" }}>
      {contextHolder}
      <Navbar />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", right: "8%", width: 300, height: 300, background: "rgba(57,64,193,0.07)", filter: "blur(60px)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "5%", width: 250, height: 250, background: "rgba(255,107,107,0.07)", filter: "blur(50px)", borderRadius: "50%" }} />
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "calc(100vh - 96px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Marka satırı */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 18px", borderRadius: 999,
              background: "rgba(57,64,193,0.08)", border: "1px solid rgba(57,64,193,0.15)",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3940c1" }} />
              <Text style={{ color: "#3940c1", fontWeight: 600, fontSize: 13 }}>AtlasCV · CV Analiz Platformu</Text>
            </div>
          </div>

          {/* Adım göstergesi */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["Email Gir", "Yeni Şifre"].map((label, i) => (
              <div key={label} style={{ flex: 1 }}>
                <div style={{
                  height: 3, borderRadius: 999, marginBottom: 4,
                  background: step > i + 1 ? "#FF6B6B" : step === i + 1 ? "#3940c1" : "#E5E7EB",
                  transition: "background 0.3s",
                }} />
                <Text style={{ fontSize: 11, color: step === i + 1 ? "#374151" : "#9CA3AF", fontWeight: step === i + 1 ? 600 : 400 }}>
                  {label}
                </Text>
              </div>
            ))}
          </div>

          {/* Kart */}
          <div style={{
            background: "#fff", borderRadius: 24,
            boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 50px rgba(57,64,193,0.10)",
            border: "1px solid rgba(57,64,193,0.08)",
            overflow: "hidden",
          }}>
            <div style={{ height: 4, background: step === 1 ? "linear-gradient(90deg,#3940c1,#5761f5)" : "linear-gradient(90deg,#FF6B6B,#ff4949)" }} />

            <div style={{ padding: "24px 32px 30px" }}>
              {/* Başlık */}
              <div style={{ marginBottom: 22 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, marginBottom: 12,
                  background: step === 1
                    ? "linear-gradient(135deg,rgba(57,64,193,0.12),rgba(88,97,245,0.12))"
                    : "linear-gradient(135deg,rgba(255,107,107,0.12),rgba(255,73,73,0.12))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.3s",
                }}>
                  {step === 1
                    ? <MailOutlined style={{ fontSize: 20, color: "#3940c1" }} />
                    : <KeyOutlined style={{ fontSize: 20, color: "#FF6B6B" }} />
                  }
                </div>
                <Title level={3} style={{ margin: "0 0 4px", color: "#111827" }}>
                  {step === 1 ? "Şifremi Unuttum" : "Yeni Şifre Belirle"}
                </Title>
                <Text style={{ color: "#6B7280", fontSize: 14 }}>
                  {step === 1
                    ? "E-posta adresinize 6 haneli sıfırlama kodu göndereceğiz."
                    : <><Text style={{ color: "#3940c1", fontWeight: 600 }}>{email}</Text> adresine gönderilen kodu girin.</>
                  }
                </Text>
              </div>

              {step === 1 ? (
                <Form layout="vertical" onFinish={onSendCode} autoComplete="off">
                  <Form.Item
                    label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>E-posta</Text>}
                    name="email"
                    rules={[{ required: true, message: "E-posta zorunlu" }, { type: "email", message: "Geçerli bir e-posta" }]}
                    style={{ marginBottom: 22 }}
                  >
                    <Input size="large" prefix={<MailOutlined style={{ color: "#C4C9E8" }} />}
                      placeholder="ornek@firma.com"
                      style={{ borderRadius: 12, height: 46, borderColor: "#E5E7EB" }} />
                  </Form.Item>

                  <Button type="primary" htmlType="submit" size="large" loading={isSending} block
                    style={{ height: 48, borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none", background: "linear-gradient(135deg,#3940c1,#5761f5)", boxShadow: "0 8px 20px rgba(57,64,193,0.30)" }}>
                    Kod Gönder
                  </Button>

                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <Link to="/login">
                      <Button type="link" icon={<ArrowLeftOutlined />} style={{ color: "#9CA3AF", padding: 0, fontSize: 13 }}>
                        Giriş sayfasına dön
                      </Button>
                    </Link>
                  </div>
                </Form>
              ) : (
                <Form layout="vertical" onFinish={onResetPassword} autoComplete="off">
                  <Form.Item
                    label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>Doğrulama Kodu</Text>}
                    name="code" rules={[{ required: true, message: "Kodu girin" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input size="large" prefix={<SafetyOutlined style={{ color: "#C4C9E8" }} />}
                      placeholder="_ _ _ _ _ _" maxLength={6}
                      style={{ borderRadius: 12, height: 52, fontSize: 22, fontWeight: 700, letterSpacing: 8, textAlign: "center", borderColor: "#E5E7EB" }} />
                  </Form.Item>

                  <Form.Item
                    label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>Yeni Şifre</Text>}
                    name="newPassword"
                    rules={[{ required: true, message: "Yeni şifre zorunlu" }, { min: 6, message: "En az 6 karakter" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input.Password size="large" prefix={<LockOutlined style={{ color: "#C4C9E8" }} />}
                      placeholder="••••••••" style={{ borderRadius: 12, height: 46, borderColor: "#E5E7EB" }} />
                  </Form.Item>

                  <Form.Item
                    label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>Yeni Şifre (Tekrar)</Text>}
                    name="confirmPassword" dependencies={["newPassword"]}
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
                    <Input.Password size="large" prefix={<LockOutlined style={{ color: "#C4C9E8" }} />}
                      placeholder="••••••••" style={{ borderRadius: 12, height: 46, borderColor: "#E5E7EB" }} />
                  </Form.Item>

                  <Button type="primary" htmlType="submit" size="large" loading={isResetting} block
                    style={{ height: 48, borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none", background: "linear-gradient(135deg,#FF6B6B,#ff4949)", boxShadow: "0 8px 20px rgba(255,107,107,0.30)" }}>
                    Şifremi Güncelle
                  </Button>

                  <div style={{ textAlign: "center", marginTop: 14 }}>
                    <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => setStep(1)}
                      style={{ color: "#9CA3AF", padding: 0, fontSize: 13 }}>
                      Farklı email kullan
                    </Button>
                  </div>
                </Form>
              )}
            </div>
          </div>

          <Text style={{ display: "block", textAlign: "center", marginTop: 16, color: "#9CA3AF", fontSize: 12 }}>
            {step === 1 ? "Kod 15 dakika geçerlidir." : "Yeni kod istemek için önceki adıma dönün."}
          </Text>
        </div>
      </div>
    </div>
  );
}
