import { useState, useEffect } from "react";
import { Modal, Form, Rate, Input, Button, Typography, Divider, Spin } from "antd";
import { StarOutlined } from "@ant-design/icons";
import axiosInstance from "../requests/axiosInstance";

const { Text } = Typography;

const PRIMARY = "#3940C1";

const STAGE_CONFIG = {
  TELEFON_GORUSMESI: {
    label: "Telefon Görüşmesi",
    color: "#0EA5E9",
    criteria: [
      { key: "communicationScore", label: "İletişim Becerisi" },
      { key: "motivationScore",    label: "Motivasyon" },
      { key: "overallScore",       label: "Genel İzlenim" },
    ],
  },
  TEKNIK_MULAKAT: {
    label: "Teknik Mülakat",
    color: "#7C3AED",
    criteria: [
      { key: "technicalScore",      label: "Teknik Yetkinlik" },
      { key: "problemSolvingScore", label: "Problem Çözme" },
      { key: "codeQualityScore",    label: "Kod Kalitesi" },
      { key: "overallScore",        label: "Genel İzlenim" },
    ],
  },
  IK_MULAKATI: {
    label: "İK Mülakatı",
    color: "#EC4899",
    criteria: [
      { key: "culturalFitScore",  label: "Kültürel Uyum" },
      { key: "teamworkScore",     label: "Takım Çalışması" },
      { key: "careerGoalsScore",  label: "Kariyer Hedefleri" },
      { key: "overallScore",      label: "Genel İzlenim" },
    ],
  },
};

export default function EvaluationModal({ open, resultId, stage, candidateName, onClose, onSaved }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const cfg = STAGE_CONFIG[stage];

  useEffect(() => {
    if (!open || !resultId || !stage) return;
    form.resetFields();
    setLoading(true);
    axiosInstance
      .get(`/api/analyses/results/${resultId}/evaluations`)
      .then((res) => {
        const existing = (res.data || []).find((e) => e.stage === stage);
        if (existing) {
          const vals = {};
          cfg?.criteria.forEach(({ key }) => {
            vals[key] = existing[key] ?? 0;
          });
          vals.notes = existing.notes ?? "";
          form.setFieldsValue(vals);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, resultId, stage]);

  if (!cfg) return null;

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await axiosInstance.post(`/api/analyses/results/${resultId}/evaluation`, {
        stage,
        ...values,
      });
      onSaved?.();
      onClose();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      centered
      onCancel={onClose}
      destroyOnHidden
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: cfg.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 15,
          }}>
            <StarOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{cfg.label} Değerlendirmesi</div>
            {candidateName && (
              <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>{candidateName}</div>
            )}
          </div>
        </div>
      }
      footer={[
        <Button key="skip" onClick={onClose} style={{ borderRadius: 8 }}>
          Atla
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saving}
          onClick={handleSave}
          style={{ borderRadius: 8, background: cfg.color, borderColor: cfg.color, fontWeight: 600 }}
        >
          Kaydet
        </Button>,
      ]}
      styles={{ body: { paddingTop: 12 } }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          {cfg.criteria.map(({ key, label }) => (
            <Form.Item key={key} name={key} label={<Text style={{ fontWeight: 600 }}>{label}</Text>}>
              <Rate count={5} style={{ color: cfg.color }} />
            </Form.Item>
          ))}

          <Divider style={{ margin: "8px 0 12px" }} />

          <Form.Item name="notes" label={<Text style={{ fontWeight: 600 }}>Not (isteğe bağlı)</Text>}>
            <Input.TextArea
              rows={2}
              placeholder="Bu aşama için notunuzu girin..."
              style={{ borderRadius: 8, resize: "none" }}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
