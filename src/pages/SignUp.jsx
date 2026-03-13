import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Divider,
  Space,
  notification,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UserAddOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  useSignup,
  useVerifyEmail,
  useResendCode,
} from "../requests/UserQueries";

const { Title, Text, Paragraph } = Typography;

const PRIMARY = "#3940c1";
const ACCENT = "#FF6B6B";

export default function Signup() {
  const navigate = useNavigate();

  const { mutateAsync: signupMutate, isPending } = useSignup();
  const { mutateAsync: verifyEmailMutate, isPending: isVerifyPending } = useVerifyEmail();
  const { mutateAsync: resendCodeMutate, isPending: isResendPending } = useResendCode();

  const [step, setStep] = useState("signup");
  const [signupEmail, setSignupEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [api, contextHolder] = notification.useNotification();

  const showNotification = (type, message, description) => {
    api[type]({
      message,
      description,
      placement: "topRight",
      duration: 3,
    });
  };

  const cardStyle = useMemo(
    () => ({
      borderRadius: 20,
      border: "1px solid #e5e7eb",
      boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
      overflow: "hidden",
    }),
    []
  );

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const onFinish = async (values) => {
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      };

      await signupMutate(payload);

      setSignupEmail(values.email);
      setStep("verify");
      setResendCountdown(60);

      showNotification(
        "success",
        "Kayıt Başarılı",
        "Aktivasyon kodu e-posta adresine gönderildi."
      );
    } catch (err) {
      const apiMsg = err?.response?.data?.error || err?.response?.data?.message;

      showNotification(
        "error",
        "Kayıt Hatası",
        apiMsg || "Kayıt sırasında hata oluştu."
      );
    }
  };

  const handleVerifyCode = async () => {
    try {
      if (!verifyCode || verifyCode.length !== 6) {
        showNotification(
          "warning",
          "Eksik Bilgi",
          "Lütfen 6 haneli aktivasyon kodunu gir."
        );
        return;
      }

      await verifyEmailMutate({
        email: signupEmail,
        code: verifyCode,
      });

      showNotification(
        "success",
        "Doğrulama Başarılı",
        "Email başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsun."
      );

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      const apiMsg = err?.response?.data?.error || err?.response?.data?.message;

      showNotification(
        "error",
        "Doğrulama Hatası",
        apiMsg || "Kod doğrulanamadı."
      );
    }
  };

  const handleResendCode = async () => {
    try {
      await resendCodeMutate({
        email: signupEmail,
      });

      setResendCountdown(60);
      setVerifyCode("");

      showNotification(
        "success",
        "Yeni Kod Gönderildi",
        "Yeni aktivasyon kodu gönderildi. Eski kod artık geçersiz."
      );
    } catch (err) {
      const apiMsg = err?.response?.data?.error || err?.response?.data?.message;

      showNotification(
        "error",
        "Gönderim Hatası",
        apiMsg || "Kod tekrar gönderilemedi."
      );
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {contextHolder}
      <Navbar />

      <div style={{ paddingTop: 110, paddingBottom: 48 }}>
        <Row justify="center" style={{ padding: "0 16px" }}>
          <Col xs={24} sm={22} md={16} lg={12} xl={10}>
            <Card style={cardStyle} styles={{ body: { padding: 0 } }}>
              <div
                style={{
                  position: "relative",
                  padding: "28px 26px",
                  background: `linear-gradient(135deg, ${PRIMARY}, rgba(57,64,193,0.88))`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: -40,
                    top: -40,
                    width: 180,
                    height: 180,
                    background: "rgba(255,107,107,0.28)",
                    filter: "blur(18px)",
                    borderRadius: 999,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: -40,
                    bottom: -40,
                    width: 160,
                    height: 160,
                    background: "rgba(255,255,255,0.12)",
                    filter: "blur(18px)",
                    borderRadius: 999,
                  }}
                />

                <Space direction="vertical" size={6} style={{ position: "relative" }}>
                  <Title level={2} style={{ color: "white", margin: 0 }}>
                    {step === "signup" ? "Kayıt Ol" : "Email Doğrula"}
                  </Title>
                  <Paragraph style={{ color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
                    {step === "signup"
                      ? "1 dakikada hesabını oluştur, aday analize başla."
                      : "Mail adresine gönderilen 6 haneli aktivasyon kodunu gir."}
                  </Paragraph>
                </Space>
              </div>

              <div style={{ padding: 26 }}>
                {step === "signup" ? (
                  <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                    <Form.Item
                      label={<Text style={{ color: "#111827", fontWeight: 600 }}>Ad Soyad</Text>}
                      name="fullName"
                      rules={[{ required: true, message: "Ad Soyad zorunlu" }]}
                    >
                      <Input
                        size="large"
                        prefix={<UserOutlined style={{ color: PRIMARY }} />}
                        placeholder="Ad Soyad Gir"
                        style={{ borderRadius: 12 }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<Text style={{ color: "#111827", fontWeight: 600 }}>E-posta</Text>}
                      name="email"
                      rules={[
                        { required: true, message: "E-posta zorunlu" },
                        { type: "email", message: "Geçerli bir e-posta girin" },
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<MailOutlined style={{ color: PRIMARY }} />}
                        placeholder="ornek@firma.com"
                        style={{ borderRadius: 12 }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<Text style={{ color: "#111827", fontWeight: 600 }}>Şifre</Text>}
                      name="password"
                      rules={[
                        { required: true, message: "Şifre zorunlu" },
                        { min: 6, message: "Şifre en az 6 karakter olmalı" },
                      ]}
                    >
                      <Input.Password
                        size="large"
                        prefix={<LockOutlined style={{ color: PRIMARY }} />}
                        placeholder="••••••••"
                        style={{ borderRadius: 12 }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<Text style={{ color: "#111827", fontWeight: 600 }}>Şifre Tekrar</Text>}
                      name="password2"
                      dependencies={["password"]}
                      rules={[
                        { required: true, message: "Şifre tekrarı zorunlu" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error("Şifreler aynı değil"));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        size="large"
                        prefix={<LockOutlined style={{ color: PRIMARY }} />}
                        placeholder="••••••••"
                        style={{ borderRadius: 12 }}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<UserAddOutlined />}
                      loading={isPending}
                      disabled={isPending}
                      style={{
                        width: "100%",
                        borderRadius: 999,
                        height: 48,
                        background: ACCENT,
                        border: "none",
                        boxShadow: "0 12px 26px rgba(255,107,107,0.25)",
                        fontWeight: 600,
                      }}
                    >
                      Hesap Oluştur
                    </Button>

                    <Row justify="center" style={{ marginTop: 12 }}>
                      <Text style={{ color: "#6b7280" }}>
                        Zaten hesabın var mı?{" "}
                        <Link to="/login" style={{ color: PRIMARY, fontWeight: 700 }}>
                          Giriş Yap
                        </Link>
                      </Text>
                    </Row>

                    <Divider style={{ margin: "18px 0" }} />

                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                        Kayıt olarak Kullanım Koşulları’nı kabul etmiş olursunuz.
                      </Text>
                    </div>
                  </Form>
                ) : (
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <div
                      style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <Text style={{ color: "#6b7280" }}>Aktivasyon kodu gönderildi:</Text>
                      <br />
                      <Text strong style={{ color: PRIMARY }}>
                        {signupEmail}
                      </Text>
                    </div>

                    <div
                      style={{
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <Space>
                        <ClockCircleOutlined style={{ color: "#ea580c" }} />
                        <Text style={{ color: "#9a3412" }}>
                          {resendCountdown > 0
                            ? `Yeni kod istemek için ${resendCountdown} saniye bekleyin.`
                            : "Yeni aktivasyon kodu isteyebilirsiniz."}
                        </Text>
                      </Space>
                    </div>

                    <div>
                      <Text style={{ color: "#111827", fontWeight: 600, display: "block", marginBottom: 8 }}>
                        Aktivasyon Kodu
                      </Text>
                      <Input
                        size="large"
                        maxLength={6}
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                        prefix={<SafetyCertificateOutlined style={{ color: PRIMARY }} />}
                        placeholder="6 haneli kod"
                        style={{
                          borderRadius: 12,
                          textAlign: "center",
                          letterSpacing: 6,
                          fontSize: 18,
                        }}
                      />
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={isVerifyPending}
                      disabled={isVerifyPending}
                      onClick={handleVerifyCode}
                      style={{
                        borderRadius: 999,
                        height: 48,
                        background: ACCENT,
                        border: "none",
                        boxShadow: "0 12px 26px rgba(255,107,107,0.25)",
                        fontWeight: 600,
                      }}
                    >
                      Kodu Doğrula
                    </Button>

                    <Button
                      size="large"
                      block
                      icon={<ReloadOutlined />}
                      loading={isResendPending}
                      disabled={isResendPending || resendCountdown > 0}
                      onClick={handleResendCode}
                      style={{
                        borderRadius: 999,
                        height: 46,
                        fontWeight: 600,
                        opacity: resendCountdown > 0 ? 0.7 : 1,
                      }}
                    >
                      {resendCountdown > 0
                        ? `Tekrar Kod Gönder (${resendCountdown}s)`
                        : "Tekrar Kod Gönder"}
                    </Button>

                    <Text style={{ color: "#6b7280", textAlign: "center" }}>
                      Yeni kod gönderildiğinde önceki kod otomatik olarak geçersiz olur.
                    </Text>
                  </Space>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}