import { Typography, Form, Input, Button, notification } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLogin } from "../requests/UserQueries";

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const { mutateAsync: loginMutate, isPending } = useLogin();
  const [api, contextHolder] = notification.useNotification();

  const onFinish = async (values) => {
    try {
      await loginMutate({ email: values.email, password: values.password });
      api.success({ message: "Giriş Başarılı", placement: "topRight" });
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message;
      if (msg?.toLowerCase().includes("doğrula")) {
        api.warning({ message: "Email Doğrulama Gerekli", description: msg, placement: "topRight" });
        setTimeout(() => navigate("/signup", { state: { email: values.email, step: "verify" } }), 700);
        return;
      }
      api.error({ message: "Giriş Hatası", description: msg || "Email veya şifre hatalı.", placement: "topRight" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EEF0FF 0%,#F7F8FC 55%,#FFF3F3 100%)" }}>
      {contextHolder}
      <Navbar />

      {/* Dekoratif arka plan blob'ları */}
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
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 18px", borderRadius: 999,
              background: "rgba(57,64,193,0.08)", border: "1px solid rgba(57,64,193,0.15)",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3940c1" }} />
              <Text style={{ color: "#3940c1", fontWeight: 600, fontSize: 13 }}>AtlasCV · CV Analiz Platformu</Text>
            </div>
          </div>

          {/* Kart */}
          <div style={{
            background: "#fff", borderRadius: 24,
            boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 20px 50px rgba(57,64,193,0.10)",
            border: "1px solid rgba(57,64,193,0.08)",
            overflow: "hidden",
          }}>
            {/* Üst aksanlı şerit */}
            <div style={{ height: 4, background: "linear-gradient(90deg,#3940c1,#FF6B6B)" }} />

            <div style={{ padding: "28px 32px 32px" }}>
              {/* Başlık */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, marginBottom: 14,
                  background: "linear-gradient(135deg,rgba(57,64,193,0.12),rgba(255,107,107,0.12))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <LoginOutlined style={{ fontSize: 20, color: "#3940c1" }} />
                </div>
                <Title level={3} style={{ margin: "0 0 4px", color: "#111827" }}>Giriş Yap</Title>
                <Text style={{ color: "#6B7280", fontSize: 14 }}>
                  Hesabın yok mu?{" "}
                  <Link to="/signup" style={{ color: "#3940c1", fontWeight: 600 }}>Kayıt Ol</Link>
                </Text>
              </div>

              {/* Form */}
              <Form layout="vertical" onFinish={onFinish} autoComplete="off">
                <Form.Item
                  label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>E-posta</Text>}
                  name="email"
                  rules={[{ required: true, message: "E-posta zorunlu" }, { type: "email", message: "Geçerli bir e-posta" }]}
                  style={{ marginBottom: 14 }}
                >
                  <Input size="large" prefix={<MailOutlined style={{ color: "#C4C9E8" }} />}
                    placeholder="ornek@firma.com"
                    style={{ borderRadius: 12, height: 46, borderColor: "#E5E7EB" }} />
                </Form.Item>

                <Form.Item
                  label={<Text style={{ color: "#374151", fontWeight: 600, fontSize: 13 }}>Şifre</Text>}
                  name="password"
                  rules={[{ required: true, message: "Şifre zorunlu" }]}
                  style={{ marginBottom: 10 }}
                >
                  <Input.Password size="large" prefix={<LockOutlined style={{ color: "#C4C9E8" }} />}
                    placeholder="••••••••"
                    style={{ borderRadius: 12, height: 46, borderColor: "#E5E7EB" }} />
                </Form.Item>

                <div style={{ textAlign: "right", marginBottom: 22 }}>
                  <Link to="/sifremi-unuttum" style={{ color: "#6B7280", fontSize: 13 }}>
                    Şifremi Unuttum?
                  </Link>
                </div>

                <Button type="primary" htmlType="submit" size="large" loading={isPending} block
                  style={{
                    height: 48, borderRadius: 12, fontWeight: 700, fontSize: 15, border: "none",
                    background: "linear-gradient(135deg,#3940c1,#5761f5)",
                    boxShadow: "0 8px 20px rgba(57,64,193,0.30)",
                  }}
                >
                  Giriş Yap
                </Button>
              </Form>
            </div>
          </div>

          <Text style={{ display: "block", textAlign: "center", marginTop: 16, color: "#9CA3AF", fontSize: 12 }}>
            Devam ederek Kullanım Koşulları'nı kabul etmiş olursunuz.
          </Text>
        </div>
      </div>
    </div>
  );
}
