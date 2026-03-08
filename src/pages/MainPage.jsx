import React, { useState } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Card,
  Upload,
  Input,
  Space,
  Tag,
  Divider,
  Spin,
  Empty,
  message,
} from "antd";
import {
  InboxOutlined,
  CloudUploadOutlined,
  FilePdfOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  UsergroupAddOutlined,
  FileSearchOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import LoginNavbar from "../components/LoginNavbar";
import {
  useCreateAnalysis,
  useRecentAnalyses,
} from "../requests/AnalysisQueries";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

export default function MainPage() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [analysisName, setAnalysisName] = useState("");
  const [positionName, setPositionName] = useState("");
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);

  const {
    mutateAsync: createAnalysisMutate,
    isPending: isCreatingAnalysis,
  } = useCreateAnalysis();

  const {
    data,
    isLoading,
    refetch,
  } = useRecentAnalyses(user?.id);

  const recentAnalyses = (data?.data || []).slice(0, 3);

  const formatFileSize = (size) => {
    if (!size) return "Boyut bilinmiyor";
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const handleRemoveFile = (targetFile) => {
    setFileList((prev) => prev.filter((file) => file.uid !== targetFile.uid));
  };

  const uploadProps = {
    name: "file",
    multiple: true,
    accept: ".pdf",
    showUploadList: false,
    beforeUpload: (file) => {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        message.error(`${file.name} PDF değil.`);
        return Upload.LIST_IGNORE;
      }

      const alreadyExists = fileList.some(
        (existingFile) =>
          existingFile.name === file.name && existingFile.size === file.size
      );

      if (alreadyExists) {
        message.warning(`${file.name} zaten eklendi.`);
        return Upload.LIST_IGNORE;
      }

      setFileList((prev) => [...prev, file]);
      return false;
    },
  };

  const handleCreateAnalysis = async () => {
    try {
      if (!analysisName.trim()) {
        message.error("Analiz adı zorunlu.");
        return;
      }

      if (!positionName.trim()) {
        message.error("Pozisyon adı zorunlu.");
        return;
      }

      if (fileList.length === 0) {
        message.error("En az bir PDF CV yüklemelisin.");
        return;
      }

      if (!user?.id) {
        message.error("Kullanıcı bilgisi bulunamadı.");
        return;
      }

      const payload = {
        analysisName,
        positionName,
        description,
        cvCount: fileList.length,
        userId: user.id,
      };

      await createAnalysisMutate(payload);

      message.success("Analiz başarıyla oluşturuldu ✅");

      setAnalysisName("");
      setPositionName("");
      setDescription("");
      setFileList([]);

      refetch();
    } catch (error) {
      console.error(error);
      message.error("Analiz oluşturulurken hata oluştu.");
    }
  };

  const infoCards = [
    {
      icon: <FilePdfOutlined style={{ fontSize: 28 }} />,
      title: "Toplu PDF Yükleme",
      description: "Bir analiz içinde birden fazla aday CV’sini aynı anda ekleyin.",
    },
    {
      icon: <FileSearchOutlined style={{ fontSize: 28 }} />,
      title: "İsimlendirilmiş Analizler",
      description: "Her yüklemeyi analiz adıyla kaydedip daha sonra tekrar inceleyin.",
    },
    {
      icon: <UsergroupAddOutlined style={{ fontSize: 28 }} />,
      title: "Aday Karşılaştırma",
      description: "Analiz tamamlandığında adayları detaylı şekilde inceleyebilirsiniz.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <LoginNavbar />

      <Row justify="center" className="w-full">
        <Col
          span={24}
          style={{
            paddingTop: 120,
            paddingBottom: 50,
            position: "relative",
            overflow: "hidden",
            background: "#f7f8fc",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -100,
              top: 20,
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "rgba(57,64,193,0.08)",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -80,
              bottom: -30,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "rgba(255,107,107,0.08)",
              filter: "blur(40px)",
            }}
          />

          <Row justify="center" style={{ position: "relative", zIndex: 2 }}>
            <Col xs={22} md={21} lg={19} xl={17}>
              <Row gutter={[24, 24]} align="top">
                <Col xs={24} lg={15}>
                  <div style={{ marginBottom: 22 }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "8px 16px",
                        borderRadius: 999,
                        background: "rgba(57,64,193,0.08)",
                        border: "1px solid rgba(57,64,193,0.12)",
                        marginBottom: 18,
                      }}
                    >
                      <Text style={{ color: "#3940c1", fontWeight: 500 }}>
                        Hoş geldin, {user?.fullName || "Kullanıcı"}
                      </Text>
                    </div>

                    <Title
                      level={1}
                      style={{
                        color: "#111827",
                        marginBottom: 12,
                        lineHeight: 1.1,
                        maxWidth: 700,
                      }}
                    >
                      Yeni Analiz Oluştur
                    </Title>

                    <Paragraph
                      style={{
                        color: "#4b5563",
                        fontSize: 16,
                        lineHeight: 1.8,
                        maxWidth: 760,
                        marginBottom: 0,
                      }}
                    >
                      Analiz adı belirleyin, aday CV’lerini PDF formatında yükleyin
                      ve işe alım değerlendirme sürecinizi isimlendirilmiş analizler
                      halinde yönetin.
                    </Paragraph>
                  </div>

                  <Card
                    style={{
                      borderRadius: 28,
                      border: "1px solid #e9edf5",
                      background: "rgba(255,255,255,0.98)",
                      boxShadow: "0 22px 50px rgba(0,0,0,0.08)",
                    }}
                    styles={{ body: { padding: 30 } }}
                  >
                    <div style={{ marginBottom: 22 }}>
                      <Text
                        style={{
                          color: "#3940c1",
                          fontWeight: 700,
                          fontSize: 13,
                          letterSpacing: 0.4,
                        }}
                      >
                        ANALİZ OLUŞTUR
                      </Text>
                      <Title
                        level={3}
                        style={{ margin: "8px 0 8px", color: "#111827" }}
                      >
                        CV Analiz Bilgileri
                      </Title>
                      <Paragraph
                        style={{
                          color: "#6b7280",
                          marginBottom: 0,
                          fontSize: 15,
                          lineHeight: 1.7,
                        }}
                      >
                        Analiz adı ve açıklama ekleyin, ardından CV dosyalarını yükleyin.
                        Bu analiz daha sonra kayıtlı analizler arasından açılıp incelenebilir.
                      </Paragraph>
                    </div>

                    <Row gutter={[18, 24]}>
                      <Col xs={24} md={12}>
                        <Text
                          style={{
                            display: "block",
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          Analiz Adı
                        </Text>
                        <Input
                          size="large"
                          placeholder="Örn: Frontend Developer Mart 2026"
                          style={{ borderRadius: 14, height: 48 }}
                          value={analysisName}
                          onChange={(e) => setAnalysisName(e.target.value)}
                        />
                      </Col>

                      <Col xs={24} md={12}>
                        <Text
                          style={{
                            display: "block",
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          Pozisyon Adı
                        </Text>
                        <Input
                          size="large"
                          placeholder="Örn: Frontend Developer"
                          style={{ borderRadius: 14, height: 48 }}
                          value={positionName}
                          onChange={(e) => setPositionName(e.target.value)}
                        />
                      </Col>

                      <Col span={24}>
                        <Text
                          style={{
                            display: "block",
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          Açıklama
                        </Text>
                        <TextArea
                          rows={4}
                          placeholder="Örn: React ve TypeScript ağırlıklı aday değerlendirmesi"
                          style={{ borderRadius: 14, resize: "none" }}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </Col>

                      <Col span={24}>
                        <Text
                          style={{
                            display: "block",
                            fontWeight: 600,
                            marginBottom: 10,
                          }}
                        >
                          CV Yükleme Alanı
                        </Text>

                        <Dragger
                          {...uploadProps}
                          style={{
                            borderRadius: 24,
                            padding: "34px 16px",
                            border: "2px dashed #c7d2fe",
                            background: "#f8faff",
                          }}
                        >
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: "#3940c1", fontSize: 52 }} />
                          </p>

                          <p
                            className="ant-upload-text"
                            style={{
                              fontSize: 20,
                              fontWeight: 600,
                              color: "#3940c1",
                              marginBottom: 8,
                            }}
                          >
                            PDF CV dosyalarını buraya bırakın
                          </p>

                          <p
                            className="ant-upload-hint"
                            style={{
                              color: "#6b7280",
                              fontSize: 14,
                              marginBottom: 20,
                            }}
                          >
                            veya cihazınızdan seçerek yükleyin • En fazla 100 PDF
                          </p>

                          <Button
                            type="primary"
                            size="large"
                            icon={<CloudUploadOutlined />}
                            style={{
                              borderRadius: 999,
                              height: 48,
                              padding: "0 24px",
                              background: "#3940c1",
                              border: "none",
                              fontWeight: 600,
                            }}
                          >
                            PDF Seç
                          </Button>
                        </Dragger>
                      </Col>

                      <Col span={24} style={{ marginTop: 12 }} >
                        <Card
                          style={{
                            borderRadius: 20,
                            border: "1px solid #eef0f6",
                            background: "#fcfdff",
                            boxShadow: "none",
                            marginTop: 4,
                          }}
                          styles={{ body: { padding: 20 } }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 14,
                              gap: 12,
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <Title level={5} style={{ margin: 0, color: "#111827" }}>
                                Seçilen PDF Dosyaları
                              </Title>
                              <Text style={{ color: "#6b7280" }}>
                                {fileList.length > 0
                                  ? `${fileList.length} dosya seçildi`
                                  : "Henüz dosya seçilmedi"}
                              </Text>
                            </div>

                            {fileList.length > 0 && (
                              <Tag color="blue">{fileList.length} PDF</Tag>
                            )}
                          </div>

                          {fileList.length === 0 ? (
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description="Yüklediğin PDF dosyaları burada listelenecek"
                            />
                          ) : (
                            <div
                              style={{
                                display: "grid",
                                gap: 12,
                                maxHeight: 260,
                                overflowY: "auto",
                                paddingRight: 4,
                              }}
                            >
                              {fileList.map((file) => (
                                <div
                                  key={file.uid}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    padding: "14px 16px",
                                    borderRadius: 16,
                                    background: "#ffffff",
                                    border: "1px solid #edf1f7",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                      minWidth: 0,
                                      flex: 1,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 14,
                                        background:
                                          "linear-gradient(135deg, rgba(57,64,193,0.12), rgba(255,107,107,0.12))",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#3940c1",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <FilePdfOutlined style={{ fontSize: 20 }} />
                                    </div>

                                    <div style={{ minWidth: 0 }}>
                                      <Text
                                        strong
                                        style={{
                                          display: "block",
                                          color: "#111827",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          maxWidth: "100%",
                                        }}
                                      >
                                        {file.name}
                                      </Text>
                                      <Text style={{ color: "#6b7280", fontSize: 13 }}>
                                        {formatFileSize(file.size)}
                                      </Text>
                                    </div>
                                  </div>

                                  <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveFile(file)}
                                  >
                                    Sil
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      </Col>
                    </Row>

                    <Divider style={{ margin: "26px 0 20px" }} />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <Space wrap size={[8, 8]}>
                        <Tag color="blue">PDF</Tag>
                        <Tag color="purple">İsimlendirilmiş Analiz</Tag>
                        <Tag color="cyan">Toplu Yükleme</Tag>
                      </Space>

                      <Button
                        type="primary"
                        size="large"
                        loading={isCreatingAnalysis}
                        onClick={handleCreateAnalysis}
                        style={{
                          borderRadius: 999,
                          height: 46,
                          padding: "0 22px",
                          background: "#FF6B6B",
                          border: "none",
                          fontWeight: 600,
                          boxShadow: "0 10px 24px rgba(255,107,107,0.25)",
                        }}
                      >
                        Analizi Başlat
                      </Button>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={9}>
                  <Space direction="vertical" size={24} style={{ width: "100%" }}>
                    <Card
                      style={{
                        borderRadius: 24,
                        border: "1px solid #e9edf5",
                        background: "rgba(255,255,255,0.98)",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
                      }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <Space align="start" size={14}>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 16,
                            background:
                              "linear-gradient(135deg, rgba(57,64,193,0.12), rgba(255,107,107,0.12))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#3940c1",
                            fontSize: 22,
                            flexShrink: 0,
                          }}
                        >
                          <FolderOpenOutlined />
                        </div>

                        <div>
                          <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
                            Nasıl Çalışır?
                          </Title>
                          <div style={{ display: "grid", gap: 10 }}>
                            <Text style={{ color: "#6b7280" }}>1. Analiz adı belirle</Text>
                            <Text style={{ color: "#6b7280" }}>2. Pozisyon ve açıklama ekle</Text>
                            <Text style={{ color: "#6b7280" }}>3. PDF CV’leri yükle</Text>
                            <Text style={{ color: "#6b7280" }}>4. Analizi kaydet ve detaydan incele</Text>
                          </div>
                        </div>
                      </Space>
                    </Card>

                    <Card
                      style={{
                        borderRadius: 24,
                        border: "1px solid #e9edf5",
                        background: "rgba(255,255,255,0.98)",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
                      }}
                      styles={{ body: { padding: 24 } }}
                    >
                      <Space align="start" size={14}>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 16,
                            background: "rgba(57,64,193,0.10)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#3940c1",
                            fontSize: 22,
                            flexShrink: 0,
                          }}
                        >
                          <HistoryOutlined />
                        </div>

                        <div>
                          <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
                            Son Analizler
                          </Title>
                          <Paragraph
                            style={{ color: "#6b7280", marginBottom: 0, lineHeight: 1.7 }}
                          >
                            Oluşturduğun analizler burada listelenir. Dilediğin analizi seçerek detaylarına tekrar ulaşabilirsin.
                          </Paragraph>
                        </div>
                      </Space>

                      <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
                        {isLoading ? (
                          <div style={{ textAlign: "center", padding: "24px 0" }}>
                            <Spin />
                          </div>
                        ) : recentAnalyses.length === 0 ? (
                          <Empty description="Henüz analiz bulunamadı" />
                        ) : (
                          recentAnalyses.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                padding: "14px 14px",
                                borderRadius: 16,
                                background: "#f8faff",
                                border: "1px solid #e8edff",
                              }}
                            >
                              <Text
                                style={{
                                  display: "block",
                                  fontWeight: 600,
                                  color: "#111827",
                                  marginBottom: 4,
                                }}
                              >
                                {item.analysisName}
                              </Text>
                              <Text
                                style={{
                                  display: "block",
                                  color: "#6b7280",
                                  fontSize: 13,
                                  marginBottom: 6,
                                }}
                              >
                                {item.positionName} • {item.cvCount} CV
                              </Text>
                              <Tag color="blue">{item.status}</Tag>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </Space>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>

        <Col span={24} style={{ marginBottom: 48 }}>
          <Row
            justify="center"
            gutter={[24, 24]}
            style={{ width: "100%", padding: "0 24px" }}
          >
            {infoCards.map((item, idx) => (
              <Col xs={22} md={7} key={idx}>
                <Card
                  style={{
                    borderRadius: 24,
                    height: "100%",
                    border: "1px solid #eef0f6",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
                  }}
                  styles={{ body: { padding: 24 } }}
                >
                  <div style={{ display: "grid", gap: 14 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        background:
                          "linear-gradient(135deg, rgba(57,64,193,0.12), rgba(255,107,107,0.12))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3940c1",
                      }}
                    >
                      {item.icon}
                    </div>

                    <Title level={4} style={{ margin: 0 }}>
                      {item.title}
                    </Title>

                    <Text style={{ color: "#6b7280", lineHeight: 1.7 }}>
                      {item.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
}