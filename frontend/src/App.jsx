import { useState, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const TOPICS = [
  "Latest Power BI features and updates",
  "Business Intelligence trends",
  "Microsoft Fabric",
  "DAX best practices",
  "Data storytelling",
  "Executive dashboards",
  "Data governance",
  "AI in Business Intelligence",
  "Real-time analytics",
  "Custom topic",
];

const TONES     = ["Thought Leader", "Educational", "Provocative", "Storytelling"];
const AUDIENCES = ["Executives", "CFOs", "BI Managers", "Data Analysts", "Power BI Developers", "Data Engineers"];
const LENGTHS   = ["Short", "Medium", "Long"];

const VARIATIONS = [
  { id: "A", label: "Thought Leadership", icon: "◈", color: "#c9a84c" },
  { id: "B", label: "Educational",        icon: "◉", color: "#60a5fa" },
  { id: "C", label: "High Engagement",    icon: "◆", color: "#a78bfa" },
];

// ─── API ─────────────────────────────────────────────────────────────────────

async function generatePosts(topic, audience, length) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, audience, length }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data.posts;
}

// ─── Small Components ─────────────────────────────────────────────────────────

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "rgba(29,78,216,0.22)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? "rgba(29,78,216,0.55)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 5, padding: "5px 11px",
        color: active ? "#93b4ff" : "#4a5a7a",
        fontSize: 12, cursor: "pointer",
        fontFamily: "'DM Mono', monospace",
        transition: "all .15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 9, letterSpacing: 3, color: "#c9a84c",
        fontFamily: "'DM Mono', monospace", marginBottom: 10,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function PostPreview({ text, onCopy, copied }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", animation: "fadeUp .3s ease-out" }}>
      {/* LinkedIn header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 18px 12px", borderBottom: "1px solid #f0f2f5" }}>
        <div style={{
          width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#1d4ed8,#0f2d8a)",
          color: "#fff", display: "flex", alignItems: "center",
          justifyContent: "center", fontWeight: 700, fontSize: 15,
          fontFamily: "Inter, sans-serif",
        }}>BA</div>
        <div>
          <div style={{ fontFamily: "Inter", fontSize: 14, fontWeight: 700, color: "#000000e6" }}>Bekim Asani</div>
          <div style={{ fontFamily: "Inter", fontSize: 12, color: "#00000099", marginTop: 1 }}>BI Consultant · Rootalytix · 1st</div>
          <div style={{ fontFamily: "Inter", fontSize: 11, color: "#00000055", marginTop: 2 }}>Just now · 🌐</div>
        </div>
      </div>

      {/* Post body */}
      <div style={{ padding: "16px 20px 10px" }}>
        {text.split("\n").map((line, i) =>
          line.trim() === ""
            ? <br key={i} />
            : <p key={i} style={{ fontFamily: "Inter", fontSize: 14, lineHeight: 1.65, color: "#000000e6", marginBottom: 4 }}>{line}</p>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px 16px", borderTop: "1px solid #f0f2f5" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9aa0a6" }}>
          {text.length} chars
        </span>
        <button
          onClick={onCopy}
          style={{
            background: copied ? "#16a34a" : "#0a66c2",
            border: "none", borderRadius: 16,
            padding: "7px 20px", color: "#fff",
            fontSize: 13, fontFamily: "Inter", cursor: "pointer",
            transition: "background .2s",
          }}
        >
          {copied ? "✓ Copied!" : "Copy Post"}
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [topic,    setTopic]    = useState("Latest Power BI features and updates");
  const [custom,   setCustom]   = useState("");
  const [audience, setAudience] = useState("BI Managers");
  const [tone,     setTone]     = useState("Thought Leader");
  const [length,   setLength]   = useState("Medium");
  const [tab,      setTab]      = useState("A");
  const [posts,    setPosts]    = useState({ A: "", B: "", C: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [copied,   setCopied]   = useState({ A: false, B: false, C: false });
  const [history,  setHistory]  = useState([]);
  const [showHist, setShowHist] = useState(false);

  const effectiveTopic = topic === "Custom topic" ? custom : topic;

  const generate = useCallback(async () => {
    if (!effectiveTopic.trim()) return;
    setLoading(true);
    setError("");
    setPosts({ A: "", B: "", C: "" });

    try {
      const result = await generatePosts(effectiveTopic, audience, length);
      setPosts(result);
      setTab("A");
      setHistory(h => [
        { topic: effectiveTopic, audience, length, posts: result, ts: Date.now() },
        ...h.slice(0, 19),
      ]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [effectiveTopic, audience, length]);

  function copy(id) {
    navigator.clipboard.writeText(posts[id]);
    setCopied(p => ({ ...p, [id]: true }));
    setTimeout(() => setCopied(p => ({ ...p, [id]: false })), 2000);
  }

  function exportTXT() {
    const content = VARIATIONS
      .map(v => `=== ${v.label} ===\n\n${posts[v.id] || "(empty)"}`)
      .join("\n\n---\n\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([content], { type: "text/plain" })),
      download: `linkedin-posts-${Date.now()}.txt`,
    });
    a.click();
  }

  function exportPDF() {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>LinkedIn Posts · Rootalytix</title>
      <style>
        body{font-family:Georgia,serif;max-width:680px;margin:40px auto;color:#111;padding:20px;line-height:1.7}
        h1{color:#080c18;border-bottom:2px solid #1d4ed8;padding-bottom:10px}
        h2{color:#1d4ed8;margin-top:36px;font-size:16px}
        pre{white-space:pre-wrap;font-size:14px;background:#f8f9fa;padding:16px;border-radius:6px;border-left:3px solid #1d4ed8}
        .meta{color:#666;font-size:13px;margin-top:6px}
      </style></head><body>
      <h1>BI LinkedIn Posts</h1>
      <p class="meta">Topic: ${effectiveTopic} · Audience: ${audience} · Length: ${length} · ${new Date().toLocaleDateString()}</p>
      ${VARIATIONS.map(v => `<h2>${v.icon} ${v.label}</h2><pre>${posts[v.id] || "(not generated)"}</pre>`).join("")}
      </body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  const hasPosts = posts.A || posts.B || posts.C;

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -150, left: "25%", width: "50%", height: 350,
        background: "radial-gradient(ellipse,rgba(29,78,216,0.15) 0%,transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Sidebar ── */}
      <aside style={{
        width: 300, minHeight: "100vh", flexShrink: 0,
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 18px", display: "flex", flexDirection: "column",
        overflowY: "auto", position: "relative", zIndex: 1,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 22 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#1d4ed8,#0f2d8a)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: 17 }}>◈</div>
          <div>
            <div style={{ color: "#f0ebe0", fontSize: 13, fontWeight: 600, fontFamily: "Inter" }}>BI Post Agent</div>
            <div style={{ color: "#3a4a6a", fontSize: 9, letterSpacing: 2, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>ROOTALYTIX</div>
          </div>
        </div>

        <Section label="TOPIC">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: topic === "Custom topic" ? 10 : 0 }}>
            {TOPICS.map(t => <Chip key={t} label={t} active={topic === t} onClick={() => setTopic(t)} />)}
          </div>
          {topic === "Custom topic" && (
            <input
              placeholder="e.g. Power BI for supply chain analytics..."
              value={custom}
              onChange={e => setCustom(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6, padding: "9px 12px",
                color: "#e8e0d0", fontSize: 12,
                fontFamily: "'DM Mono', monospace", outline: "none",
              }}
            />
          )}
        </Section>

        <Section label="AUDIENCE">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {AUDIENCES.map(a => <Chip key={a} label={a} active={audience === a} onClick={() => setAudience(a)} />)}
          </div>
        </Section>

        <Section label="TONE (SINGLE POST)">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {TONES.map(t => <Chip key={t} label={t} active={tone === t} onClick={() => setTone(t)} />)}
          </div>
        </Section>

        <Section label="LENGTH">
          <div style={{ display: "flex", gap: 5 }}>
            {LENGTHS.map(l => <Chip key={l} label={l} active={length === l} onClick={() => setLength(l)} />)}
          </div>
        </Section>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading || !effectiveTopic.trim()}
          style={{
            width: "100%",
            background: "linear-gradient(135deg,#1d4ed8,#1e3a8a)",
            border: "1px solid rgba(29,78,216,0.4)",
            borderRadius: 8, padding: "13px 16px",
            color: "#e0eaff", fontSize: 12, letterSpacing: 1,
            fontFamily: "'DM Mono', monospace", cursor: "pointer",
            opacity: loading || !effectiveTopic.trim() ? 0.4 : 1,
            transition: "opacity .2s", marginTop: 6,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          {loading ? (
            <>
              <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
              Generating 3 posts...
            </>
          ) : "Generate All Variations →"}
        </button>

        {/* Export + history */}
        {hasPosts && !loading && (
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button onClick={exportTXT} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "8px 4px", color: "#6a7a9a", fontSize: 10, letterSpacing: 1, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>↓ TXT</button>
            <button onClick={exportPDF} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "8px 4px", color: "#6a7a9a", fontSize: 10, letterSpacing: 1, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>↓ PDF</button>
            <button onClick={() => setShowHist(s => !s)} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "8px 4px", color: "#6a7a9a", fontSize: 10, letterSpacing: 1, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>🕐 {history.length}</button>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 28px", gap: 16, overflowY: "auto", position: "relative", zIndex: 1 }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {VARIATIONS.map(v => (
            <button
              key={v.id}
              onClick={() => setTab(v.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: tab === v.id ? "rgba(29,78,216,0.12)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${tab === v.id ? "rgba(29,78,216,0.35)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 8, padding: "10px 18px",
                color: tab === v.id ? "#93b4ff" : "#3a4a6a",
                cursor: "pointer", fontFamily: "'DM Mono', monospace",
                transition: "all .15s", position: "relative",
              }}
            >
              <span style={{ color: v.color }}>{v.icon}</span>
              <span>
                <span style={{ display: "block", fontSize: 8, letterSpacing: 2, color: "#c9a84c" }}>VAR {v.id}</span>
                <span style={{ display: "block", fontSize: 11 }}>{v.label}</span>
              </span>
              {posts[v.id] && <span style={{ position: "absolute", top: 7, right: 7, width: 5, height: 5, borderRadius: "50%", background: v.color }} />}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div style={{ flex: 1, minHeight: 420, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
              <div style={{ width: 48, height: 48, border: "3px solid rgba(29,78,216,0.15)", borderTop: "3px solid #1d4ed8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ color: "#93b4ff", fontSize: 13, letterSpacing: 1, fontFamily: "'DM Mono', monospace" }}>Generating 3 AI variations...</div>
              <div style={{ color: "#2a3a5a", fontSize: 10, letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>Thought Leadership · Educational · High Engagement</div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ margin: 24, padding: 20, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8 }}>
              <div style={{ color: "#f87171", fontSize: 11, letterSpacing: 1, fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>⚠ GENERATION FAILED</div>
              <div style={{ color: "#9a5050", fontSize: 13, lineHeight: 1.6 }}>{error}</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && !posts[tab] && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
              <div style={{ fontSize: 48, color: "rgba(201,168,76,0.2)", animation: "pulse 3s ease-in-out infinite" }}>◈</div>
              <div style={{ color: "#2a3a5a", fontSize: 12, letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>READY TO GENERATE</div>
              <div style={{ color: "#1a2a3a", fontSize: 12, textAlign: "center", lineHeight: 1.9, fontFamily: "Inter" }}>
                Select your topic, audience and length,<br />then click Generate.
              </div>
            </div>
          )}

          {/* Post */}
          {!loading && !error && posts[tab] && (
            <PostPreview
              text={posts[tab]}
              onCopy={() => copy(tab)}
              copied={copied[tab]}
            />
          )}
        </div>

        {/* History panel */}
        {showHist && history.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 16, maxHeight: 260, overflowY: "auto" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#c9a84c", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>HISTORY ({history.length})</div>
            {history.map((item, i) => (
              <div
                key={i}
                onClick={() => { setPosts(item.posts); setShowHist(false); }}
                style={{ padding: "9px 12px", borderRadius: 6, cursor: "pointer", marginBottom: 5, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div style={{ color: "#93b4ff", fontSize: 12, fontFamily: "Inter", marginBottom: 2 }}>{item.topic}</div>
                <div style={{ color: "#2a3a5a", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>{item.audience} · {item.length}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
