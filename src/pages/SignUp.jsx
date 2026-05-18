import { useEffect, useState } from "react";
import { Typography, Form, Input, Button, notification } from "antd";
import {
  UserOutlined, MailOutlined, LockOutlined, UserAddOutlined,
  SafetyCertificateOutlined, ReloadOutlined, CheckCircleFilled,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSignup, useVerifyEmail, useResendCode } from "../requests/UserQueries";

const { Title, Text } = Typography;

export default function Signup() {
  const navigate = useNavigate();
  const { mutateAsync: signupMutate, isPending }                        = useSignup();
  const { mutateAsync: verifyEmailMutate, isPending: isVerifyPending }  = useVerifyEmail();
  const { mutateAsync: resendCodeMutate, isPending: isResendPending }   = useResendCode();

  const [step, setStep]                     = useState("signup");
  const [signupEmail, setSignupEmail]       = useState("");
  const [verifyCode, setVerifyCode]         = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [api, contextHolder]                = notification.useNotification();

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setInterval(() =>
      setResendCountdown((p) => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000
    );
    return () => clearInterval(t);
  }, [resendCountdown]);

  const onSignup = async (values) => {
    try {
      await signupMutate({ fullName: values.fullName, email: values.email, password: values.password });
      setSignupEmail(values.email);
      setStep("verify");
      setResendCountdown(60);
      api.success({ message: "Kayıt Başarılı", description: "Aktivasyon kodu e-postana gönderildi.", placement: "topRight" });
    } catch (err) {
      api.error({ message: "Kayıt Hatası", description: err?.response?.data?.message || "Hata oluştu.", placement: "topRight" });
    }
  };

  const onVerify = async () => {
    if (!verifyCode || verifyCode.length !== 6) { api.warning({ message: "6 haneli kodu girin.", placement: "topRight" }); return; }
    try {
      await verifyEmailMutate({ email: signupEmail, code: verifyCode });
      api.success({ message: "Email Doğrulandı!", placement: "topRight" });
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      api.error({ message: "Doğrulama Hatası", description: err?.response?.data?.message || "Kod hatalı.", placement: "topRight" });
    }
  };

  const onResend = async () => {
    try {
      await resendCodeMutate({ email: signupEmail });
      setResendCountdown(60);
      setVerifyCode("");
      api.success({ message: "Yeni kod gönderildi.", placement: "topRight" });
    } catch (err) {
      api.error({ message: "Hata", description: err?.response?.data?.message || "Tekrar gönderilemedi.", placement: "topRight" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EEF0FF 0%,#F7F8FC 55%,#FFF3F3 100%)" }}>
      {contextHolder}
      <Navbar />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%", right: "6%", width: 300, height: 300, background: "rgba(57,64,193,0.07)", filter: "blur(60px)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "4%", width: 250, height: 250, background: "rgba(255,107,107,0.07)", filter: "blur(50px)", borderRadius: "50%" }} />
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "calc(100vh - 96px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

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
            {["Hesap Bilgileri", "Email Doğrula"].map((label, i) => {
              const isActive = (step === "signup" && i === 0) || (step === "verify" && i === 1);
              const isDone   = step === "verify" && i === 0;
              return (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{
                    height: 3, borderRadius: 999, marginBottom: 4,
                    background: isDone ? "#FF6B6B" : isActive ? "#3940c1" : "#E5E7EB",
                    transition: "background 0.3s",
                  }} />
                  <Text style={{ fontSize: 11, color: isActive || isDone ? "#374151" : "#9CA3AF", fontWeight: isActive ? 600 : 400 }}>
                    {isDone && <CheckCircleFilled style={{ color: "#FF6B6B", marginRight: 4 }} />}{label}
                  </Text>
                </div>
              );
            })}
          </div>

          {/* Kart */}
          <div style={{
            background: "#fff", borderRadius: 24,
            boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 50px rgba(57,64,193,0.10)",
            border: "1px solid rgba(57,64,193,0.08)",
            overflow: "hidden",
          }}>
            <div style={{ height: 4, background: step === "signup" ? "linear-gradient(90deg,#3940c1,#FF6B6B)" : "linear-gradient(90deg,#10B981,#3940c1)" }} />

            <div style={{ padding: "24px 32px 30px" }}>
              {/* Başlık */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, marginBottom: 12,
                  background: step === "signup"
                    ? "linear-gradient(135deg,rgba(57,64,193,0.12),rgba(255,107,107,0.12))"
                    : "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(57,64,193,0.12))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {step === "signup"
                    ? <UserAddOutlined style={{ fontSize: 20, color: "#3940c1" }} />
                    : <SafetyCertificateOutlined style={{ fontSize: 20, color: "#10B981" }} />
                  }
                </div>
                <Title level={3} style={{ margin: "0 0 4px", color: "#111827" }}>
                  {step === "signup" ? "Hesap Oluştur" : "Email Doğrula"}
                </Title>
                <Text style={{ color: "#6B7280", fontSize: 14 }}>
                  {step === "signup"
                    ? <>Zaten hesabın var mı? <Link to="/login" style={{ color: "#3940c1", fontWeight: 600 }}>Giriş Yap</Link></>
                    : <><Text style={{ color: "#3940c1", fontWeight: 600 }}>{signupEmail}</Text> adresine kod gönderildi.</>
                  }
                </Text>
              </div>

              {step === "signup" ? (
                <Form layout="vertical" onFinish={onSignup} autoComplete="off">
                  <Form.Item label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>Ad Soyad</Text>}
                    name="fullName" rules={[{ required: true, message: "Ad Soyad zorunlu" }]} style={{ marginBottom: 12 }}>
                    <Input size="large" prefix={<UserOutlined style={{ color: "#C4C9E8" }} />}
                      placeholder="Adınız Soyadınız" style={{ borderRadius: 12, height: 46, borderColor: "#E5E7EB" }} />
                  </Form.Item>

                  <Form.Item label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>E-posta</Text>}
                    name="email" rules={[{ required: true, message: "E-posta zorunlu" }, { type: "email", message: "Geçerli bir e-posta" }]}
                    style={{ marginBottom: 12 }}>
                    <Input size="large" prefix={<MailOutlined style={{ color: "#C4C9E8" }} />}
                      placeholder="ornek@firma.com" style={{ borderRadius: 12, height: 46, borderColor: "#E5E7EB" }} />
                  </Form.Item>

                  <Form.Item label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>Şifre</Text>}
                    name="password" rules={[{ required: true, message: "Şifre zorunlu" }, { min: 6, message: "En az 6 karakter" }]}
                    style={{ marginBottom: 12 }}>
                    <Input.Password size="large" prefix={<LockOutlined style={{ color: "#C4C9E8" }} />}
                      placeholder="••••••••" style={{ borderRadius: 12, height: 46, borderColor: "#E5E7EB" }} />
                  </Form.Item>

                  <Form.Item label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>Şifre Tekrar</Text>}
                    name="password2" dependencies={["password"]}
                    rules={[
                      { required: true, message: "Şifre tekrarı zorunlu" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) return Promise.resolve();
                          return Promise.reject(new Error("Şifreler aynı değil"));
                        },
                      }),
                    ]}
                    style={{ marginBottom: 20 }}>
                    <Input.Password size="large" prefix={<LockOutlined style={{ color: "#C4C9E8" }} />}
                      placeholder="••••••••" style={{ borderRadius: 12, height: 46, borderColor: "#E5E7EB" }} />
                  </Form.Item>

                  <Button type="primary" htmlType="submit" size="large" icon={<UserAddOutlined />}
                    loading={isPending} block
                    style={{ height: 48, borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none", background: "linear-gradient(135deg,#3940c1,#5761f5)", boxShadow: "0 8px 20px rgba(57,64,193,0.30)" }}>
                    Hesap Oluştur
                  </Button>
                </Form>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ background: "#F8FAFF", border: "1px solid #E8EDFF", borderRadius: 12, padding: "12px 16px" }}>
                    <Text style={{ color: "#6B7280", fontSize: 12 }}>Aktivasyon kodu gönderildi:</Text>
                    <Text strong style={{ color: "#3940c1", display: "block", fontSize: 14 }}>{signupEmail}</Text>
                  </div>

                  {resendCountdown > 0 && (
                    <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "10px 14px" }}>
                      <Text style={{ color: "#9A3412", fontSize: 13 }}>
                        Yeni kod için <strong>{resendCountdown}s</strong> bekleyin.
                      </Text>
                    </div>
                  )}

                  <div>
                    <Text style={{ color: "#374151", fontWeight: 600, fontSize: 13, display: "block", marginBottom: 8 }}>
                      Aktivasyon Kodu
                    </Text>
                    <Input size="large" maxLength={6} value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                      prefix={<SafetyCertificateOutlined style={{ color: "#C4C9E8" }} />}
                      placeholder="6 haneli kod"
                      style={{ borderRadius: 12, textAlign: "center", letterSpacing: 8, fontSize: 20, height: 52, borderColor: "#E5E7EB" }} />
                  </div>

                  <Button type="primary" size="large" block loading={isVerifyPending} onClick={onVerify}
                    style={{ height: 48, borderRadius: 12, fontWeight: 700, border: "none", background: "linear-gradient(135deg,#10B981,#059669)", boxShadow: "0 8px 20px rgba(16,185,129,0.28)" }}>
                    Kodu Doğrula
                  </Button>

                  <Button size="large" block icon={<ReloadOutlined />} loading={isResendPending}
                    disabled={resendCountdown > 0} onClick={onResend}
                    style={{ height: 44, borderRadius: 12, fontWeight: 600, color: "#6B7280", borderColor: "#E5E7EB" }}>
                    {resendCountdown > 0 ? `Tekrar Gönder (${resendCountdown}s)` : "Tekrar Kod Gönder"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Text style={{ display: "block", textAlign: "center", marginTop: 16, color: "#9CA3AF", fontSize: 12 }}>
            {step === "signup" ? "Kayıt olarak Kullanım Koşulları'nı kabul etmiş olursunuz." : "Kod 5 dakika geçerlidir. Spam klasörünü kontrol edin."}
          </Text>
        </div>
      </div>
    </div>
  );
}
