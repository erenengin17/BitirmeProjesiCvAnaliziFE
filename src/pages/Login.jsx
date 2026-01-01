import React, { useMemo } from "react";
import { Row, Col, Card, Typography, Form, Input, Button, Divider, Space, message } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import { useLogin } from "../requests/UserQueries";

const { Title, Text, Paragraph } = Typography;

const PRIMARY = "#3940c1";
const ACCENT = "#FF6B6B";

export default function Login() {
  const navigate = useNavigate();
  const { mutateAsync: loginMutate, isPending } = useLogin();

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
      await loginMutate({
        email: values.email,
        password: values.password,
      });

      message.success("Giriş başarılı ✅");
      navigate("/"); // istersen /dashboard yap
    } catch (err) {
      const apiMsg = err?.response?.data?.error;
      message.error(apiMsg || "Giriş sırasında hata oluştu.");
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
                    Giriş Yap
                  </Title>
                  <Paragraph style={{ color: "rgba(255,255,255,0.9)", marginBottom: 0 }}>
                    Aday analiz paneline erişmek için giriş yapın.
                  </Paragraph>
                </Space>
              </div>

              {/* FORM */}
              <div style={{ padding: 26 }}>
                <Form layout="vertical" onFinish={onFinish} autoComplete="off">
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
                    rules={[{ required: true, message: "Şifre zorunlu" }]}
                  >
                    <Input.Password
                      size="large"
                      prefix={<LockOutlined style={{ color: PRIMARY }} />}
                      placeholder="••••••••"
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>

                  <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
                    <Text style={{ color: "#6b7280" }}>
                      Hesabın yok mu?{" "}
                      <Link to="/signup" style={{ color: PRIMARY, fontWeight: 600 }}>
                        Kayıt Ol
                      </Link>
                    </Text>
                  </Row>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<LoginOutlined />}
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
                    Giriş Yap
                  </Button>

                  <Divider style={{ margin: "18px 0" }} />

                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                      Devam ederek Kullanım Koşulları’nı kabul etmiş olursunuz.
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
