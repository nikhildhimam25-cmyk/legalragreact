import { useState, useRef, useEffect } from "react";

const API_BASE = "https://nikhu28-legalrag.hf.space";
const WELCOME = "Hello! How can I help you today? Ask me anything or upload a PDF / Image for analysis.";
let sessionCounter = 0;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #f5f4f0;
  --sidebar-bg: #efefeb;
  --sidebar-border: #e0dfd8;
  --text: #1a1915;
  --text-muted: #6b6a63;
  --text-light: #9e9d96;
  --accent: #c96b3a;
  --accent-light: #f0e8e0;
  --bubble-user: #1a1915;
  --bubble-ai: #ffffff;
  --bubble-user-text: #f5f4f0;
  --bubble-ai-text: #1a1915;
  --border: #e0dfd8;
  --input-bg: #ffffff;
  --shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06);
  --shadow-lg: 0 8px 32px rgba(0,0,0,.12);
  --sidebar-w: 268px;
}

html, body, #root {
  height: 100%;
  /* Use dvh when available, fallback to svh, then vh */
  height: 100dvh;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
}

/* ── APP SHELL ── */
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  height: 100dvh;
  overflow: hidden;
}

/* ── TOPBAR (mobile) ── */
.topbar {
  display: none;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  flex-shrink: 0;
  height: 52px;
  min-height: 52px;
  z-index: 10;
}
.topbar-brand {
  font-family: 'Lora', serif;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 9px;
  cursor: pointer;
  color: var(--text);
  flex-shrink: 0;
}

/* ── SHELL (sidebar + main) ── */
.shell {
  display: flex;
  flex: 1;
  min-height: 0; /* CRITICAL: allows flex children to shrink below content size */
  overflow: hidden;
  position: relative;
}

/* ── SIDEBAR ── */
.sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  z-index: 200;
  transition: transform .25s ease;
}
.sidebar-top {
  padding: 20px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 2px;
}
.brand-icon { font-size: 22px; color: var(--accent); }
.brand-name {
  font-family: 'Lora', serif;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -.3px;
  color: var(--text);
}
.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s;
}
.new-chat-btn:hover { background: var(--accent-light); border-color: var(--accent); color: var(--accent); }
.recents-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--text-light);
  padding: 4px 18px 6px;
  flex-shrink: 0;
}
.sessions-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 0;
}
.sessions-list::-webkit-scrollbar { width: 4px; }
.sessions-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .13s;
  flex-shrink: 0;
}
.session-item:hover { background: rgba(0,0,0,.05); }
.session-item.active { background: var(--accent-light); }
.session-name {
  flex: 1;
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.session-item.active .session-name { color: var(--accent); font-weight: 500; }
.delete-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  flex-shrink: 0;
}
.session-item:hover .delete-btn { display: flex; }
.delete-btn:hover { background: #ffe4e4; color: #c0392b; }
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 150;
}

/* ── MAIN ── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* CRITICAL */
  min-width: 0;
  overflow: hidden;
  background: var(--bg);
}

/* ── WELCOME SCREEN ── */
.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}
.welcome-hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.hero-icon { font-size: 44px; color: var(--accent); margin-bottom: 4px; }
.welcome-title { font-family: 'Lora', serif; font-size: 36px; font-weight: 600; letter-spacing: -.5px; color: var(--text); }
.welcome-sub { font-size: 15px; color: var(--text-muted); max-width: 380px; line-height: 1.6; }

/* ── CHAT AREA ── */
.chat-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* smooth iOS momentum scroll */
  overscroll-behavior: contain;
  padding: 24px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0; /* CRITICAL: without this, flex child won't scroll */
}
.chat-area::-webkit-scrollbar { width: 5px; }
.chat-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.msg-wrap {
  display: flex;
  gap: 12px;
  padding: 0 20px;
  max-width: 820px;
  width: 100%;
  margin: 0 auto;
}
.msg-wrap.user { flex-direction: row-reverse; }
.ai-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.bubble-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 75%;
  min-width: 0;
}
.msg-wrap.user .bubble-col { align-items: flex-end; }
.bubble {
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14.5px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.msg-wrap.ai .bubble {
  background: var(--bubble-ai);
  color: var(--bubble-ai-text);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
  box-shadow: var(--shadow);
}
.msg-wrap.user .bubble {
  background: var(--bubble-user);
  color: var(--bubble-user-text);
  border-bottom-right-radius: 4px;
}
.source-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pill {
  padding: 3px 10px;
  background: var(--accent-light);
  color: var(--accent);
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
  border: 1px solid rgba(201,107,58,.2);
}
.typing-dots {
  display: flex;
  gap: 5px;
  padding: 14px 16px;
  background: var(--bubble-ai);
  border: 1px solid var(--border);
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  align-items: center;
  width: fit-content;
  box-shadow: var(--shadow);
}
.typing-dots span {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: bounce 1.1s infinite;
}
.typing-dots span:nth-child(2) { animation-delay: .18s; }
.typing-dots span:nth-child(3) { animation-delay: .36s; }
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: .5; }
  40% { transform: translateY(-6px); opacity: 1; }
}

/* ── INPUT ZONE ── */
.input-zone {
  padding: 10px 16px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0; /* NEVER let input zone shrink or get pushed off screen */
  background: var(--bg);
}
.input-card {
  width: 100%;
  max-width: 760px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}
.chat-textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: var(--text);
  resize: none;
  padding: 14px 16px 6px;
  min-height: 52px;
  max-height: 140px;
  overflow-y: auto;
  line-height: 1.55;
  -webkit-overflow-scrolling: touch;
}
.chat-textarea::placeholder { color: var(--text-light); }
.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px 10px;
  gap: 8px;
}
.action-btn {
  width: 34px; height: 34px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .13s;
}
.action-btn:hover { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
.upload-wrapper { position: relative; }
.upload-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  min-width: 170px;
  z-index: 100;
}
.upload-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  cursor: pointer;
  font-size: 13.5px;
  color: var(--text);
  transition: background .12s;
  font-family: 'DM Sans', sans-serif;
}
.upload-option:hover { background: var(--accent-light); color: var(--accent); }
.send-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: var(--accent);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .13s;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) { background: #b55a2c; }
.send-btn:disabled { background: var(--border); cursor: not-allowed; color: var(--text-light); }
.spin { animation: spin .9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.disclaimer { font-size: 11.5px; color: var(--text-light); text-align: center; }

/* ── MOBILE ── */
@media (max-width: 680px) {
  .topbar { display: flex; }
  .sidebar {
    position: fixed;
    left: 0; top: 0;
    height: 100%;
    height: 100dvh;
    transform: translateX(-100%);
  }
  .sidebar.open { transform: translateX(0); box-shadow: var(--shadow-lg); }
  .sidebar-overlay.show { display: block; }
  .welcome-title { font-size: 26px; }
  .hero-icon { font-size: 36px; }
  .bubble { font-size: 14px; }
  .bubble-col { max-width: 82%; }
  .msg-wrap { padding: 0 12px; }
  .input-zone { padding: 8px 10px 12px; }
  .chat-area { padding: 12px 0 4px; gap: 16px; }
  .disclaimer { font-size: 11px; }
  .chat-textarea { font-size: 16px; /* prevent iOS zoom on focus */ }
}
`;

export default function App() {
  const [sessions, setSessions] = useState([
    { id: ++sessionCounter, name: "New Chat", messages: [{ role: "ai", text: WELCOME }] },
  ]);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const uploadMenuRef = useRef(null);
  const bottomRef = useRef(null);

  const activeSession = sessions.find((s) => s.id === activeId);
  const messages = activeSession?.messages || [];

  // Scroll to bottom whenever messages change or loading changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    const handler = (e) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target))
        setShowUploadMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const updateMessages = (id, updater) =>
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, messages: updater(s.messages) } : s))
    );

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    const sid = activeId;
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    updateMessages(sid, (msgs) => [...msgs, { role: "user", text: question }]);
    const session = sessions.find((s) => s.id === sid);
    if (session?.name === "New Chat") {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sid
            ? { ...s, name: question.slice(0, 32) + (question.length > 32 ? "…" : "") }
            : s
        )
      );
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      updateMessages(sid, (msgs) => [
        ...msgs,
        {
          role: "ai",
          text: data.answer || data.response || "No response.",
          sources: data.sources || [],
        },
      ]);
    } catch {
      updateMessages(sid, (msgs) => [
        ...msgs,
        { role: "ai", text: "⚠️ Could not reach server.", sources: [] },
      ]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const uploadFile = async (e, endpoint, label) => {
    const file = e.target.files[0];
    if (!file) return;
    const sid = activeId;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setShowUploadMenu(false);
    updateMessages(sid, (msgs) => [...msgs, { role: "user", text: `${label}: ${file.name}` }]);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { method: "POST", body: formData });
      const data = await res.json();
      if (endpoint === "/upload-pdf") {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sid ? { ...s, name: file.name.replace(".pdf", "").slice(0, 32) } : s
          )
        );
        updateMessages(sid, (msgs) => [
          ...msgs,
          {
            role: "ai",
            text: `✅ PDF uploaded! ${data.chunks || ""} . Ask me anything about it.`,
            sources: [],
          },
        ]);
      } else {
        updateMessages(sid, (msgs) => [
          ...msgs,
          { role: "ai", text: data.answer || data.response || "Image processed.", sources: [] },
        ]);
      }
    } catch {
      updateMessages(sid, (msgs) => [
        ...msgs,
        { role: "ai", text: `❌ Upload failed.`, sources: [] },
      ]);
    }
    setLoading(false);
    e.target.value = "";
  };

  const newChat = () => {
    const id = ++sessionCounter;
    setSessions((prev) => [
      { id, name: "New Chat", messages: [{ role: "ai", text: WELCOME }] },
      ...prev,
    ]);
    setActiveId(id);
    closeSidebar();
  };

  const deleteSession = (e, id) => {
    e.stopPropagation();
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (next.length === 0) {
        const freshId = ++sessionCounter;
        setActiveId(freshId);
        return [{ id: freshId, name: "New Chat", messages: [{ role: "ai", text: WELCOME }] }];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const isWelcomeScreen = messages.length === 1 && messages[0].role === "ai";

  return (
    <>
      <style>{styles}</style>
      <div className="app-wrapper">

        {/* MOBILE TOPBAR */}
        <div className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="topbar-brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c96b3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              <polyline points="6 3 12 2 18 3"/>
              <polyline points="6 21 12 22 18 21"/>
            </svg>
            Law AI
          </span>
        </div>

        <div className="shell">
          <div className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`} onClick={closeSidebar} />

          {/* SIDEBAR */}
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-top">
              <div className="brand">
                <div className="brand-icon">⚖</div>
                <span className="brand-name">Law AI</span>
              </div>
              <button className="new-chat-btn" onClick={newChat}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New chat
              </button>
            </div>
            <div className="recents-label">Recents</div>
            <div className="sessions-list">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`session-item ${s.id === activeId ? "active" : ""}`}
                  onClick={() => { setActiveId(s.id); closeSidebar(); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span className="session-name">{s.name}</span>
                  <button className="delete-btn" onClick={(e) => deleteSession(e, s.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </aside>

          {/* MAIN */}
          <main className="main">
            {isWelcomeScreen ? (
              <div className="welcome-screen">
                <div className="welcome-hero">
                  <div className="hero-icon">⚖</div>
                  <h1 className="welcome-title">Welcome, Buddy</h1>
                  <p className="welcome-sub">Ask anything or upload a document to get started.</p>
                </div>
              </div>
            ) : (
              <div className="chat-area" ref={chatRef}>
                {messages.map((msg, i) => (
                  <div key={i} className={`msg-wrap ${msg.role}`}>
                    {msg.role === "ai" && <div className="ai-avatar">⚖</div>}
                    <div className="bubble-col">
                      <div className="bubble">{msg.text}</div>
                      {msg.role === "ai" && msg.sources?.length > 0 && (
                        <div className="source-pills">
                          {msg.sources.map((_, j) => (
                            <span key={j} className="pill">Source {j + 1}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="msg-wrap ai">
                    <div className="ai-avatar">⚖</div>
                    <div className="typing-dots"><span /><span /><span /></div>
                  </div>
                )}
                {/* Invisible anchor — always scroll here */}
                <div ref={bottomRef} style={{ height: 1, flexShrink: 0 }} />
              </div>
            )}

            {/* INPUT */}
            <div className="input-zone">
              <div className="input-card">
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  rows={1}
                  placeholder="Ask Law AI anything…"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                  }}
                  onKeyDown={handleKey}
                />
                <div className="input-actions">
                  <div className="upload-wrapper" ref={uploadMenuRef}>
                    <button className="action-btn" onClick={() => setShowUploadMenu((v) => !v)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                    {showUploadMenu && (
                      <div className="upload-menu">
                        <label className="upload-option">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <span>Upload PDF</span>
                          <input type="file" accept=".pdf" style={{ display: "none" }}
                            onChange={(e) => uploadFile(e, "/upload-pdf", "📄 Uploading PDF")} />
                        </label>
                        <label className="upload-option">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span>Upload Image</span>
                          <input type="file" accept="image/*" style={{ display: "none" }}
                            onChange={(e) => uploadFile(e, "/upload-image", "🖼️ Analyzing image")} />
                        </label>
                      </div>
                    )}
                  </div>
                  <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
                    {loading ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                        <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <p className="disclaimer">Law AI can make mistakes. Verify important legal information.</p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}