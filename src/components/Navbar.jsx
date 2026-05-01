import React from "react";
import { Typography, Button, Space } from "antd";
import {
  HomeOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import AtlasCvLogo from "../assets/images/YeniLogoAtlasCV.png";


const { Text } = Typography;

const PRIMARY = "#3940c1";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "sticky",
        top: 16,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          height: 64,
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(14px)",
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
        }}
          >
              {/* LOGO */}
              <div
                  onClick={() => navigate("/")}
                  style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                  }}
              >
                  <img
                      src={AtlasCvLogo}
                      alt="AtlasCv Logo"
                      style={{
                          height: 120,
                          width: "auto",
                      }}
                  />
              </div>

        {/* MENU */}
        <Space size={28}>
          {/* Ana Sayfa */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#111827",
              fontSize: 15,
            }}
          >
            <HomeOutlined style={{ color: PRIMARY }} />
            <Text style={{ margin: 0, color: "#111827" }}>
              Ana Sayfa
            </Text>
          </Link>

          {/* Giriş */}
          <Button
            type="text"
            onClick={() => navigate("/Login")}
            icon={<LoginOutlined style={{ color: PRIMARY }} />}
            style={{
              color: "#111827",
              fontWeight: 500,
            }}
          >
            Giriş Yap
          </Button>

          {/* Kayıt */}
          <Button
            type="text"
            onClick={() => navigate("/SignUp")}
            icon={<UserAddOutlined  style={{ color: PRIMARY }}/>}
            style={{
              fontWeight: 500,
            }}
          >
            Kayıt Ol
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default Navbar;
