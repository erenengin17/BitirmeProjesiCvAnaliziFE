import { useState, useRef, useEffect } from "react";
import { Input, Button } from "antd";
import {
  RobotOutlined, SendOutlined, ClearOutlined,
  CloseOutlined, ThunderboltOutlined, CheckOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const GRAD = "linear-gradient(135deg, #3940C1 0%, #6366F1 60%, #818CF8 100%)";

const STATUS_COLORS = {
  MULAKATA_CAGRILDI: { bg: "#EEF2FF", color: "#3940C1", border: "#C7D2FE" },
  REDDEDILDI:        { bg: "#FFF1F2", color: "#EF4444", border: "#FECDD3" },
  BEKLEMEDE:         { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
};

const WELCOME = (context) =>
  `Merhaba! Ben Atlas AI Asistan.\n\n${context ? `"${context}"` : "Bu analiz"} adayları hakkında soru sorabilirsin.\n\nÖrneğin:\n• "Python bilen adayları göster"\n• "En yüksek deneyimli 3 kişi kim?"\n• "Hepsini mülakata çağır"\n• "80 puan üzeri kimler?"\n\nYalnızca analiz adaylarıyla ilgili konularda yardımcı olabilirim.`;

/* ── Yazıyor animasyonu ───────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#9CA3AF",
          animation: "chatDot 1.2s infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
          40%            { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Tek mesaj balonu ─────────────────────────────────────────────────── */
function Bubble({ msg, onConfirmAction }) {
  const isUser  = msg.role === "user";
  const actions = msg.executableActions ?? [];

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10,
      paddingRight: isUser ? 0 : 28,
      paddingLeft:  isUser ? 28 : 0,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 10, flexShrink: 0,
          background: GRAD, marginRight: 8, marginTop: 2,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13,
        }}>
          <RobotOutlined />
        </div>
      )}

      <div style={{
        maxWidth: "80%",
        background: isUser ? GRAD : "#fff",
        color:      isUser ? "#fff" : "#1F2937",
        borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
        padding: "10px 14px",
        fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap",
        boxShadow: isUser ? "0 2px 12px rgba(57,64,193,0.30)" : "0 1px 6px rgba(0,0,0,0.07)",
        border: isUser ? "none" : "1px solid #F1F5F9",
        wordBreak: "break-word",
      }}>
        {msg.text}

        {/* Vurgulanan adaylar */}
        {actions.length === 0 && (msg.filteredNames?.length ?? 0) > 0 && (
          <div style={{
            marginTop: 10, paddingTop: 10,
            borderTop: isUser ? "1px solid rgba(255,255,255,0.25)" : "1px solid #E9EDF5",
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 0.6, marginBottom: 6,
              color: isUser ? "rgba(255,255,255,0.70)" : "#6B7280",
            }}>
              {msg.filteredNames.length} ADAY VURGULANDI
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {msg.filteredNames.slice(0, 4).map((n) => (
                <span key={n} style={{
                  background:   isUser ? "rgba(255,255,255,0.18)" : "#EEF2FF",
                  color:        isUser ? "#fff" : "#3940C1",
                  border:       isUser ? "1px solid rgba(255,255,255,0.30)" : "1px solid #C7D2FE",
                  borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 600,
                }}>{n}</span>
              ))}
              {msg.filteredNames.length > 4 && (
                <span style={{
                  background:   isUser ? "rgba(255,255,255,0.12)" : "#F3F4F6",
                  color:        isUser ? "rgba(255,255,255,0.75)" : "#6B7280",
                  borderRadius: 999, padding: "2px 9px", fontSize: 11,
                }}>
                  +{msg.filteredNames.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Eylem onay kartları — her aksiyon için ayrı kart */}
        {actions.length > 0 && !msg.confirmed && actions.map((ea, idx) => {
          const cfg = STATUS_COLORS[ea.status] ?? STATUS_COLORS.MULAKATA_CAGRILDI;
          const sel = ea.selection ?? {};
          // Kural tabanlı açıklama
          const selDesc = sel.rule === "top_n"
            ? `İlk ${sel.n} aday (puan sıralamasına göre)`
            : sel.rule === "rest_after_n"
            ? `${sel.n}. sıra sonrası tüm adaylar`
            : sel.rule === "all"
            ? "Tüm adaylar"
            : null; // by_names → isimleri göster
          const byNames = sel.rule === "by_names" ? (sel.names ?? []) : (ea.candidate_names ?? []);

          return (
            <div key={idx} style={{
              marginTop: 10, padding: "10px 12px",
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, marginBottom: 6, letterSpacing: 0.4 }}>
                {actions.length > 1 ? `İŞLEM ${idx + 1} / ${actions.length}` : "İŞLEM ONAYI GEREKİYOR"}
              </div>
              {selDesc ? (
                <div style={{ fontSize: 12, color: "#374151", marginBottom: 10, fontWeight: 600 }}>
                  {selDesc}
                </div>
              ) : (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
                    <strong>{byNames.length}</strong> aday etkilenecek
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {byNames.slice(0, 4).map((n) => (
                      <span key={n} style={{
                        background: "#fff", color: cfg.color, border: `1px solid ${cfg.border}`,
                        borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 600,
                      }}>{n}</span>
                    ))}
                    {byNames.length > 4 && (
                      <span style={{ borderRadius: 999, padding: "2px 9px", fontSize: 11, color: "#6B7280", background: "#F3F4F6" }}>
                        +{byNames.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <button
                onClick={() => onConfirmAction(actions, idx)}
                style={{
                  width: "100%", padding: "8px 0",
                  background: cfg.color, color: "#fff",
                  border: "none", borderRadius: 10,
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                <CheckOutlined />
                {ea.confirm_label ?? "Onayla"}
              </button>
            </div>
          );
        })}

        {/* Tüm eylemler tamamlandı */}
        {actions.length > 0 && msg.confirmed && (
          <div style={{
            marginTop: 10, padding: "8px 12px",
            background: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: 10, display: "flex", alignItems: "center", gap: 6,
          }}>
            <CheckOutlined style={{ color: "#10B981", fontSize: 14 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#065F46" }}>
              {actions.length > 1 ? "Tüm işlemler uygulandı" : "İşlem uygulandı"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Ana bileşen ──────────────────────────────────────────────────────── */
export default function ChatDrawer({ onChat, onFilter, onClearFilter, onExecuteAction, isFiltered, context }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState(() => [{ role: "assistant", text: WELCOME(context) }]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res  = await onChat(q);
      const data = res?.data ?? res;
      setMessages((prev) => [...prev, {
        role:             "assistant",
        text:             data.answer,
        filteredNames:    data.filtered_names ?? [],
        executableActions: data.executable_actions ?? [],
        confirmed:        false,
      }]);
      if ((data.filtered_names?.length ?? 0) > 0) onFilter(new Set(data.filtered_names));
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Bir hata oluştu, lütfen tekrar deneyin." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (actions, clickedIdx) => {
    // Tıklanan aksiyondan itibaren aynı mesajdaki tüm aksiyonları sırayla uygula
    const pending = actions.slice(clickedIdx);
    try {
      for (const ea of pending) {
        await onExecuteAction(ea);
      }
      setMessages((prev) => prev.map((m) =>
        m.executableActions === actions ? { ...m, confirmed: true } : m
      ));
      const labels = pending.map((ea) => ea.confirm_label ?? "İşlem").join(" + ");
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: `✓ ${labels} başarıyla uygulandı.`,
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "İşlem uygulanırken bir hata oluştu." }]);
    }
  };

  const handleClear = () => {
    onClearFilter();
    setMessages((prev) => [...prev, { role: "assistant", text: "Filtre temizlendi. Yeni bir soru sorabilirsin." }]);
  };

  const TabButton = () => (
    <div
      onClick={() => setOpen(true)}
      style={{
        position: "fixed", right: 0, top: "50%", transform: "translateY(-50%)",
        zIndex: 1200, cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        background: GRAD, color: "#fff",
        padding: "18px 10px", borderRadius: "16px 0 0 16px",
        boxShadow: "-4px 0 20px rgba(57,64,193,0.25)",
        transition: "transform 0.2s, box-shadow 0.2s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-50%) translateX(-4px)";
        e.currentTarget.style.boxShadow = "-6px 0 28px rgba(57,64,193,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(-50%)";
        e.currentTarget.style.boxShadow = "-4px 0 20px rgba(57,64,193,0.25)";
      }}
    >
      <RobotOutlined style={{ fontSize: 20 }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, writingMode: "vertical-rl" }}>
        ATLAS AI
      </span>
      {isFiltered && (
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FCD34D", boxShadow: "0 0 6px rgba(252,211,77,0.8)" }} />
      )}
    </div>
  );

  return (
    <>
      {!open && <TabButton />}

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 380,
        zIndex: 1200, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        pointerEvents: open ? "all" : "none",
        borderRadius: "24px 0 0 24px", overflow: "hidden",
        boxShadow: "-8px 0 40px rgba(57,64,193,0.18), -2px 0 8px rgba(0,0,0,0.08)",
      }}>

        {/* Header */}
        <div style={{ background: GRAD, padding: "0 18px", height: 64, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 14, flexShrink: 0, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.30)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>
            <ThunderboltOutlined />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Atlas AI Asistan</div>
            <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {context ? `${context} · GPT-4o mini` : "GPT-4o mini"}
            </div>
          </div>
          {isFiltered && (
            <button onClick={handleClear} style={{ background: "rgba(252,211,77,0.20)", border: "1px solid rgba(252,211,77,0.50)", color: "#FCD34D", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <ClearOutlined style={{ fontSize: 10 }} />
              Filtreyi Temizle
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Mesajlar */}
        <div style={{ flex: 1, overflowY: "auto", background: "#F8FAFC", padding: "16px 12px 8px", scrollbarWidth: "thin", scrollbarColor: "#E2E8F0 transparent" }}>
          {messages.map((msg, i) => <Bubble key={i} msg={msg} onConfirmAction={handleConfirmAction} />)}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10, paddingRight: 28 }}>
              <div style={{ width: 28, height: 28, borderRadius: 10, flexShrink: 0, background: GRAD, marginRight: 8, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13 }}>
                <RobotOutlined />
              </div>
              <div style={{ background: "#fff", borderRadius: "4px 18px 18px 18px", padding: "10px 16px", border: "1px solid #F1F5F9", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ height: 1, background: "#E9EDF5", flexShrink: 0 }} />

        {/* Input */}
        <div style={{ background: "#fff", padding: "12px 14px 14px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 18, padding: "8px 8px 8px 14px" }}>
            <TextArea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Soru sor… (Enter ile gönder)"
              autoSize={{ minRows: 1, maxRows: 5 }}
              disabled={loading}
              style={{ background: "transparent", border: "none", boxShadow: "none", resize: "none", fontSize: 13, color: "#1F2937", padding: 0, flex: 1 }}
            />
            <Button
              type="primary" shape="circle" icon={<SendOutlined />}
              onClick={send} loading={loading} disabled={!input.trim()}
              style={{ width: 36, height: 36, background: input.trim() ? GRAD : "#E9EDF5", border: "none", boxShadow: input.trim() ? "0 2px 10px rgba(57,64,193,0.30)" : "none", flexShrink: 0, transition: "all 0.15s" }}
            />
          </div>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <span style={{ fontSize: 10, color: "#CBD5E1" }}>GPT-4o mini · Shift+Enter yeni satır</span>
          </div>
        </div>
      </div>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1199, background: "rgba(15, 23, 42, 0.25)", backdropFilter: "blur(2px)" }} />
      )}
    </>
  );
}
