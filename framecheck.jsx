import { useState, useRef, useCallback } from "react";

const PLATFORMS = ["YouTube", "TikTok", "Instagram Reels", "LinkedIn", "Twitter/X", "Facebook"];

const scoreColor = (n) => {
  if (n >= 70) return "#2d6a4f";
  if (n >= 40) return "#c77b1a";
  return "#d4470c";
};

const severityColors = {
  high: { border: "#d4470c", badge: "#fff0ec", text: "#d4470c" },
  medium: { border: "#c77b1a", badge: "#fff8ec", text: "#c77b1a" },
  low: { border: "#1a3a5c", badge: "#ecf1f8", text: "#1a3a5c" },
};

export default function FrameCheck() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [platform, setPlatform] = useState("YouTube");
  const [niche, setNiche] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [selectedName, setSelectedName] = useState(null);
  const fileInput = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("video/")) {
      setError("Please drop a video file (mp4, mov, avi, mkv, webm).");
      return;
    }
    setFile(f);
    setResults(null);
    setError("");
    setSelectedName(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setError("");
    setLoading(true);
    setResults(null);
    setSelectedName(null);

    const existingName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

    const prompt = `You are an expert video strategist and content creator coach. Analyze this video metadata and generate strategic recommendations.

VIDEO FILE INFO:
- Filename: ${file.name}
- Current title/name: "${existingName}"
- File size: ${(file.size / 1024 / 1024).toFixed(1)} MB
- Type: ${file.type}
- Platform target: ${platform}
- Niche/Topic: ${niche || "Not specified"}
- Creator's description: ${description || "Not provided"}

Return ONLY a valid JSON object (no markdown, no backticks, no commentary):

{
  "scores": {
    "titleScore": <0-100, how strong the current filename is as a title>,
    "viralPotential": <0-100, estimated viral potential>,
    "optimizationScore": <0-100, how well optimized the setup seems>
  },
  "namesuggestions": [
    { "name": "<compelling title for ${platform}>", "reason": "<1-2 sentences why this title works>" },
    { "name": "<second title, different angle>", "reason": "<why>" },
    { "name": "<third title, bold/experimental>", "reason": "<why>" }
  ],
  "issues": [
    { "severity": "high", "category": "<e.g. Title Hook>", "problem": "<specific issue>", "fix": "<concrete fix>" },
    { "severity": "high", "category": "<category>", "problem": "<issue>", "fix": "<fix>" },
    { "severity": "medium", "category": "<category>", "problem": "<issue>", "fix": "<fix>" },
    { "severity": "medium", "category": "<category>", "problem": "<issue>", "fix": "<fix>" },
    { "severity": "low", "category": "<category>", "problem": "<issue>", "fix": "<fix>" }
  ]
}

Be specific to ${platform}'s algorithm and culture. Name suggestions must feel genuinely clickable. Issues should be direct and actionable.`;

    try {
      setLoadingMsg("Sending to Claude...");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error ${res.status}`);
      }

      setLoadingMsg("Parsing analysis...");
      const data = await res.json();
      const text = data.content.map((b) => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed);
    } catch (err) {
      setError("Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f0e8",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#0a0a08",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23f5f0e8'/%3E%3Crect width='1' height='1' fill='%23e8e2d6' opacity='0.4'/%3E%3C/svg%3E")`,
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "2px solid #0a0a08",
        background: "#ede8da",
        padding: "18px 36px",
        display: "flex",
        alignItems: "baseline",
        gap: 16,
      }}>
        <span style={{
          fontFamily: "Georgia, serif",
          fontWeight: 900,
          fontSize: "1.9rem",
          letterSpacing: "0.08em",
          color: "#d4470c",
          textTransform: "uppercase",
        }}>FRAMECHECK</span>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#8a8070", textTransform: "uppercase" }}>
          Video Intelligence Engine
        </span>
        <span style={{
          marginLeft: "auto",
          fontSize: "0.58rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          border: "1px solid #c8c0b0",
          padding: "3px 10px",
          color: "#8a8070",
        }}>Powered by Claude</span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "50px 32px 80px" }}>

        {/* Headline */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2.6rem, 7vw, 4.5rem)",
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "0.01em",
            marginBottom: 8,
          }}>
            Name it. <span style={{ color: "#d4470c", fontStyle: "italic" }}>Fix it.</span> Post it.
          </h1>
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8070" }}>
            Drop your video — get a great title & why it's underperforming
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            border: "1px solid #d4470c",
            background: "#fff5f2",
            padding: "14px 18px",
            fontSize: "0.72rem",
            color: "#d4470c",
            marginBottom: 20,
            lineHeight: 1.6,
          }}>{error}</div>
        )}

        {/* Drop Zone */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInput.current.click()}
            style={{
              border: `2px ${dragging ? "solid" : "dashed"} ${dragging ? "#d4470c" : "#c8c0b0"}`,
              background: dragging ? "#fff5f2" : "#ede8da",
              padding: "56px 40px",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 28,
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "2.8rem", marginBottom: 14 }}>🎬</div>
            <div style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              marginBottom: 8,
            }}>Drop your video here</div>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8070" }}>
              or click to browse · mp4 / mov / avi / mkv / webm
            </div>
            <input ref={fileInput} type="file" accept="video/*" style={{ display: "none" }}
              onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
          </div>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 18px",
            background: "#ede8da",
            border: "1px solid #1a3a5c",
            marginBottom: 24,
          }}>
            <div style={{
              width: 56, height: 38,
              background: "#0a0a08",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#d4470c", fontSize: "1.1rem", flexShrink: 0,
            }}>▶</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                {file.name}
              </div>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8070" }}>
                {(file.size / 1024 / 1024).toFixed(1)} MB · {file.type || "video"}
              </div>
            </div>
            <button onClick={() => { setFile(null); setResults(null); setError(""); }}
              style={{
                background: "none", border: "1px solid #c8c0b0",
                padding: "4px 12px", cursor: "pointer",
                fontFamily: "inherit", fontSize: "0.6rem",
                letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8070",
              }}>Remove</button>
          </div>
        )}

        {/* Fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8070", marginBottom: 6 }}>
              Platform
            </label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}
              style={{
                width: "100%", background: "#ede8da", border: "1px solid #c8c0b0",
                padding: "10px 12px", fontFamily: "inherit", fontSize: "0.75rem",
                color: "#0a0a08", outline: "none",
              }}>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8070", marginBottom: 6 }}>
              Niche / Topic
            </label>
            <input value={niche} onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. fitness, cooking, tech reviews"
              style={{
                width: "100%", background: "#ede8da", border: "1px solid #c8c0b0",
                padding: "10px 12px", fontFamily: "inherit", fontSize: "0.75rem",
                color: "#0a0a08", outline: "none",
              }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8070", marginBottom: 6 }}>
              What's this video about? (optional — helps Claude give better advice)
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the content, vibe, and target audience..."
              rows={3}
              style={{
                width: "100%", background: "#ede8da", border: "1px solid #c8c0b0",
                padding: "10px 12px", fontFamily: "inherit", fontSize: "0.75rem",
                color: "#0a0a08", outline: "none", resize: "vertical",
              }} />
          </div>
        </div>

        {/* Analyze Button */}
        <button
          disabled={!file || loading}
          onClick={analyze}
          style={{
            width: "100%",
            background: !file || loading ? "#8a8070" : "#0a0a08",
            color: "#f5f0e8",
            border: "none",
            padding: "18px 32px",
            fontFamily: "Georgia, serif",
            fontSize: "1.2rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            cursor: !file || loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? `⏳ ${loadingMsg}` : "⚡ Analyze with Claude"}
        </button>

        {/* Loading bar */}
        {loading && (
          <div style={{ marginTop: 16, height: 2, background: "#c8c0b0", overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "#d4470c", width: "40%",
              animation: "scan 1.4s ease-in-out infinite",
            }} />
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ marginTop: 48 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              borderBottom: "2px solid #0a0a08", paddingBottom: 14, marginBottom: 28,
            }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", fontWeight: 900 }}>
                Analysis Complete
              </span>
              <span style={{
                marginLeft: "auto", fontSize: "0.58rem", letterSpacing: "0.15em",
                textTransform: "uppercase", border: "1px solid #c8c0b0", padding: "3px 8px", color: "#8a8070",
              }}>{platform} · {new Date().toLocaleTimeString()}</span>
            </div>

            {/* Scores */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 36 }}>
              {[
                { label: "Title Score", val: results.scores?.titleScore },
                { label: "Viral Potential", val: results.scores?.viralPotential },
                { label: "Optimization", val: results.scores?.optimizationScore },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  background: "#ede8da", border: "1px solid #c8c0b0",
                  padding: "20px 16px", textAlign: "center",
                }}>
                  <div style={{
                    fontFamily: "Georgia, serif", fontSize: "3rem", lineHeight: 1,
                    fontWeight: 900, color: scoreColor(val), marginBottom: 4,
                  }}>{val ?? "—"}</div>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8070" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Name Suggestions */}
            <div style={{ fontSize: "0.58rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#8a8070", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              Recommended Names
              <span style={{ flex: 1, height: 1, background: "#c8c0b0", display: "block" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 36 }}>
              {(results.namesuggestions || []).map((n, i) => (
                <div key={i}
                  onClick={() => setSelectedName(i)}
                  style={{
                    border: `1px solid ${selectedName === i ? "#d4470c" : "#c8c0b0"}`,
                    background: selectedName === i ? "#fff8f5" : "#ede8da",
                    padding: "16px 18px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    position: "relative",
                  }}>
                  {selectedName === i && (
                    <span style={{ position: "absolute", top: 8, right: 10, color: "#d4470c", fontSize: "0.75rem" }}>✓</span>
                  )}
                  <div style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8070", marginBottom: 6 }}>
                    {["Best Pick", "Strong Alt", "Bold Choice"][i] || `Option ${i + 1}`}
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.3, marginBottom: 8 }}>
                    {n.name}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "#8a8070", lineHeight: 1.55 }}>
                    {n.reason}
                  </div>
                </div>
              ))}
            </div>

            {/* Issues */}
            <div style={{ fontSize: "0.58rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#8a8070", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              Why It Might Underperform
              <span style={{ flex: 1, height: 1, background: "#c8c0b0", display: "block" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {(results.issues || []).map((issue, i) => {
                const sc = severityColors[issue.severity] || severityColors.low;
                return (
                  <div key={i} style={{
                    borderLeft: `3px solid ${sc.border}`,
                    background: "#ede8da",
                    padding: "14px 18px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{
                        fontSize: "0.52rem", letterSpacing: "0.15em", textTransform: "uppercase",
                        border: `1px solid ${sc.text}`, padding: "2px 7px", color: sc.text,
                      }}>{issue.severity}</span>
                      <span style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.04em" }}>{issue.category}</span>
                    </div>
                    <div style={{ fontSize: "0.73rem", lineHeight: 1.6, color: "#3a3530", marginBottom: 6 }}>{issue.problem}</div>
                    <div style={{ fontSize: "0.65rem", color: "#8a8070", fontStyle: "italic", lineHeight: 1.5 }}>
                      → Fix: {issue.fix}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => { setFile(null); setResults(null); setError(""); setSelectedName(null); }}
              style={{
                background: "none", border: "1px solid #c8c0b0", padding: "10px 24px",
                fontFamily: "inherit", fontSize: "0.65rem", letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: "pointer", color: "#8a8070",
              }}>↩ Analyze Another Video</button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes scan {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
        * { box-sizing: border-box; }
        button:hover { opacity: 0.85; }
        select, input, textarea { appearance: none; }
      `}</style>
    </div>
  );
}
