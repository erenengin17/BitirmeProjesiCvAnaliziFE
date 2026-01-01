import React, { useMemo } from "react";
import { Row, Col, Card, Typography, Form, Input, Button, Divider, Space, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSignup } from "../requests/UserQueries";


const { Title, Text, Paragraph } = Typography;

const PRIMARY = "#3940c1";
const ACCENT = "#FF6B6B";

export default function Signup() {
  const navigate = useNavigate();
  const { mutateAsync: signupMutate, isPending } = useSignup();

  const cardStyle = useMemo(
    () => ({
      borderRadius: 20,
      border: "1px solid #e5e7eb",
      boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
      overflow: "hidden",
    }),
    []
  );

  const onFinish = async (values) => {
    try {
      // password2 backend’e gitmesin
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      };

      await signupMutate(payload);

      message.success("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsun.");
      navigate("/login");
    } catch (err) {
      const apiMsg = err?.response?.data?.error;
      message.error(apiMsg || "Kayıt sırasında hata oluştu.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <Navbar />

      <div style={{ paddingTop: 110, paddingBottom: 48 }}>
        <Row justify="center" style={{ padding: "0 16px" }}>
          <Col xs={24} sm={22} md={16} lg={12} xl={10}>
            <Card style={cardStyle} styles={{ body: { padding: 0 } }}>
              {/* ÜST BANNER */}
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
                    Kayıt Ol
                  </Title>
                  <Paragraph style={{ color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
                    1 dakikada hesabını oluştur, aday analize başla.
                  </Paragraph>
                </Space>
              </div>

              {/* FORM */}
              <div style={{ padding: 26 }}>
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
                          if (!value || getFieldValue("password") === value) return Promise.resolve();
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
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
