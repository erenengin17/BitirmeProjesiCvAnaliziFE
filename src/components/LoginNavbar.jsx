import React from "react";
import { Typography, Button, Space, Avatar, Dropdown } from "antd";
import {
  HomeOutlined,
  FileSearchOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AtlasCvLogo from "../assets/images/atlascv_logo_v2Navbar.png";

const { Text } = Typography;

const PRIMARY = "#3940c1";

const LoginNavbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const profileItems = [
    {
      key: "settings",
      label: "Ayarlar",
      icon: <SettingOutlined />,
      onClick: () => navigate("/ayarlar"),
    },
    {
      key: "logout",
      label: "Çıkış Yap",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

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
        <div
          onClick={() => navigate(token ? "/dashboard" : "/")}
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

        <Space size={24} align="center">
          <Button
            type="text"
            onClick={() => navigate("/dashboard")}
            icon={<HomeOutlined style={{ color: PRIMARY }} />}
            style={{
              color: "#111827",
              fontWeight: 500,
            }}
          >
            Anasayfa
          </Button>

          <Button
            type="text"
            onClick={() => navigate("/analizler")}
            icon={<FileSearchOutlined style={{ color: PRIMARY }} />}
            style={{
              color: "#111827",
              fontWeight: 500,
            }}
          >
            Analizler
          </Button>

          <Dropdown menu={{ items: profileItems }} trigger={["click"]}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ background: "#FF6B6B" }}
              />

              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <Text
                  style={{
                    margin: 0,
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {user?.fullName || "Kullanıcı"}
                </Text>
                <Text
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: 12,
                  }}
                >
                  Profil
                </Text>
              </div>

              <DownOutlined style={{ color: "#6b7280", fontSize: 12 }} />
            </div>
          </Dropdown>
        </Space>
      </div>
    </div>
  );
};

export default LoginNavbar;