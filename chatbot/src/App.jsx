import { useState, useRef, useEffect, useCallback } from "react";

// ── TONE ─────────────────────────────────────────────────────────────────────
const CASUAL_RE = /\b(bro|yo|sup|wassup|hey|lol|omg|dude|bruh|ngl|tbh|fr|haha|lmao|fam|yoo|heyy|mann|yaar|da|machan|anna|bhai|wanna|gonna|idk|rn)\b/i;
const FORMAL_RE = /\b(hello|good (morning|afternoon|evening)|i would like|could you|please|regarding|kindly|dear|sir|madam|i am interested|i wish to|may i|greetings)\b/i;
const detectTone = (t) => CASUAL_RE.test(t) ? "casual" : FORMAL_RE.test(t) ? "formal" : null;

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const buildSystemPrompt = (tone) => `You are a warm assistant for XYZ College.
TONE: ${tone === "casual" ? "Talk like a chill senior student texting a friend. Short, real, use bro/fr/ngl." : tone === "formal" ? "Professional academic counselor. Clear, respectful, structured." : "Friendly, helpful, warm."}

When writing responses, use **double asterisks** to bold important numbers, key stats, and crucial info. Examples: **92%**, **₹42 LPA**, **NAAC A+**, **Apr 30**.

COLLEGE — XYZ College:
- NAAC A+, Est.1985, NIRF #48 Engg 2024, 12K+ students, 65-acre campus
- Depts: CSE, ECE, Mechanical, Biotechnology, Civil, MBA
- Placements: 92% overall, ₹42 LPA top (CSE-Google), ₹8.4 LPA avg, 350+ companies
- Fees: B.Tech ~₹1.2L/yr, MBA ~₹1.8L/yr | Loans: SBI, Canara, Indian Bank
- Scholarships: Top 5%→50% waiver, EWS→full waiver, SC/ST state scholarship
- Hostel: Separate boys & girls, 24/7 security, CCTV, wardens
- Safety: Zero-tolerance anti-ragging, women's cell, anonymous complaints, security escorts
- Mental health: 2 psychologists, free sessions, peer support
- Medical: 24/7 clinic, ambulance, City Hospital 2km
- Clubs: 40+ — coding, robotics, debate, music, drama, NSS, NCC
- Sports: Cricket, football, basketball, gym, annual sports fest
- Transport: Buses from 15+ points, ₹800/month
- Startup: Incubation centre, ₹10L seed funding
- Exchange: MoU with 3 UK universities

RULES: 3-5 lines max. Sound like a real person. Lead with empathy for parent questions. Only answer college-related stuff.`;

// ── DATA ─────────────────────────────────────────────────────────────────────
const DEPTS = {
  CSE:     { icon:"💻", color:"#6366f1", bg:"#eef2ff", tagline:"AI · Cloud · Cybersec",   stats:[["98%","placed"],["₹42L","top pkg"],["180","seats"]] },
  ECE:     { icon:"📡", color:"#0ea5e9", bg:"#f0f9ff", tagline:"VLSI · 5G · Robotics",   stats:[["89%","placed"],["₹28L","top pkg"],["120","seats"]] },
  Mech:    { icon:"⚙️", color:"#f59e0b", bg:"#fffbeb", tagline:"CAD · Thermal · PSU",    stats:[["85%","placed"],["₹18L","top pkg"],["120","seats"]] },
  Biotech: { icon:"🧬", color:"#10b981", bg:"#f0fdf4", tagline:"Genomics · Pharma",      stats:[["78%","placed"],["₹14L","top pkg"],["60","seats"]]  },
  Civil:   { icon:"🏗️", color:"#8b5cf6", bg:"#f5f3ff", tagline:"Infra · GIS · PSU",     stats:[["82%","placed"],["₹12L","top pkg"],["60","seats"]]  },
  MBA:     { icon:"📊", color:"#ec4899", bg:"#fdf2f8", tagline:"Finance · Mktg · HR",    stats:[["95%","placed"],["₹22L","top pkg"],["120","seats"]] },
};

const QUICK_TOPICS = [
  { label:"Admissions", icon:"📋" }, { label:"Departments", icon:"🏛️" },
  { label:"Placements", icon:"💼" }, { label:"Scholarships", icon:"🏆" },
  { label:"Campus Life", icon:"🎓" },
];
const DEPT_SUBTOPICS = ["Programs", "Placements", "Labs & Faculty", "Research"];

// ── THEMES ────────────────────────────────────────────────────────────────────
const THEMES = {
  neutral: {
    grad: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    accent: "#6366f1", accentSoft: "#e0e7ff",
    userBubble: "linear-gradient(135deg,#6366f1,#4f46e5)",
    dotColor: "#a5b4fc", chipBorder: "#e0e7ff", chipColor: "#6366f1",
    bg: "linear-gradient(160deg,#f8faff,#f1f5f9,#faf5ff)",
    label: "online",
  },
  casual: {
    grad: "linear-gradient(135deg,#f97316,#ef4444)",
    accent: "#f97316", accentSoft: "#ffedd5",
    userBubble: "linear-gradient(135deg,#f97316,#ef4444)",
    dotColor: "#fb923c", chipBorder: "#fed7aa", chipColor: "#f97316",
    bg: "linear-gradient(160deg,#fff7ed,#fef2f2,#fffbeb)",
    label: "buddy mode 🤙",
  },
  formal: {
    grad: "linear-gradient(135deg,#0f172a,#1e3a5f)",
    accent: "#1e40af", accentSoft: "#dbeafe",
    userBubble: "linear-gradient(135deg,#1e3a5f,#1e40af)",
    dotColor: "#93c5fd", chipBorder: "#bfdbfe", chipColor: "#1e40af",
    bg: "linear-gradient(160deg,#f0f4ff,#f1f5f9,#f0f9ff)",
    label: "professional mode",
  },
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const getIntent = (text) => {
  const t = text.toLowerCase();
  if (/(department|dept|branch|all dept)/i.test(t) && !/(cse|ece|mech|bio|civil|mba)/i.test(t)) return "departments";
  for (const k of Object.keys(DEPTS)) if (t.includes(k.toLowerCase())) return `dept_${k}`;
  return "ai";
};

const getFollowUps = (text) => {
  if (/(hostel|room|stay)/i.test(text)) return ["Girls hostel?","Hostel fees?","Day scholar?"];
  if (/(safe|security|girl|daughter|women)/i.test(text)) return ["Anti-ragging?","Women's cell","Mental health?"];
  if (/(fee|cost|loan|afford)/i.test(text)) return ["Scholarships?","Education loan?","Fee structure"];
  if (/(placement|job|salary|package)/i.test(text)) return ["CSE placements","Average students?","Top companies?"];
  if (/(sensitive|shy|introvert|fit|social|anxiety)/i.test(text)) return ["Mental health support","Student clubs","Campus vibe?"];
  if (/(parent|son|daughter|kid|child)/i.test(text)) return ["Campus safety","Hostel details","Academic support?"];
  if (/(which|best|suggest|recommend|compare)/i.test(text)) return ["CSE vs ECE?","Highest salary dept?","MBA worth it?"];
  return ["Tell me more","🏠 Back to menu"];
};

// ── RICH TEXT RENDERER ────────────────────────────────────────────────────────
// Parses **bold**, detects ₹ numbers, % stats and renders them styled
function RichText({ text, accent }) {
  // Split on **...**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const inner = part.slice(2, -2);
          return (
            <strong key={i} style={{
              fontWeight: 700,
              color: accent,
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "-0.3px",
            }}>{inner}</strong>
          );
        }
        // Auto-bold ₹ amounts and % numbers inline (not already wrapped)
        const autoStyled = part.split(/(₹[\d,.]+\s*(?:LPA|L|K|Cr)?|\d+(?:\.\d+)?%|\d+\+(?:\s*(?:companies|clubs|students|years))?)/g);
        return autoStyled.map((seg, j) => {
          if (/(₹[\d,.]+|%|\d+\+)/.test(seg) && seg.trim()) {
            return (
              <strong key={`${i}-${j}`} style={{
                fontWeight: 700,
                color: accent,
                fontFamily: "'Syne', sans-serif",
                letterSpacing: "-0.2px",
              }}>{seg}</strong>
            );
          }
          return <span key={`${i}-${j}`}>{seg}</span>;
        });
      })}
    </>
  );
}

function BotMsg({ text, isAI, theme }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:20, animation:"msgIn .3s cubic-bezier(.34,1.56,.64,1) both" }}>
      <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0,
        background: theme.grad,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: theme === THEMES.casual ? 14 : 10,
        fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", letterSpacing:"-0.5px",
        boxShadow:`0 3px 10px ${theme.accent}35` }}>
        {theme === THEMES.casual ? "🤙" : "XY"}
      </div>

      <div style={{ maxWidth:"80%", display:"flex", flexDirection:"column", gap:3 }}>
        <div style={{
          background:"#fff",
          borderRadius:"4px 18px 18px 18px",
          padding:"12px 15px",
          boxShadow:"0 2px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {lines.map((line, i) => {
            const isBullet = line.startsWith("•");
            const isHeader = i === 0 && lines.length > 1 && lines[1]?.startsWith("•");
            if (isBullet) return (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom: i < lines.length-1 ? 5 : 0 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:theme.accent, flexShrink:0, marginTop:7 }}/>
                <span style={{ fontSize:13.5, color:"#334155", lineHeight:1.68 }}>
                  <RichText text={line.slice(1).trim()} accent={theme.accent}/>
                </span>
              </div>
            );
            if (isHeader) return (
              <div key={i} style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:8, lineHeight:1.5 }}>
                <RichText text={line} accent={theme.accent}/>
              </div>
            );
            return (
              <p key={i} style={{ fontSize:13.5, color:"#334155", lineHeight:1.72, margin: i > 0 ? "6px 0 0" : 0 }}>
                <RichText text={line} accent={theme.accent}/>
              </p>
            );
          })}
        </div>
        {isAI && (
          <div style={{ fontSize:10, color:"#cbd5e1", marginLeft:4, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:4, height:4, borderRadius:"50%", background:`${theme.accent}80`, display:"inline-block" }}/>
            AI · live
          </div>
        )}
      </div>
    </div>
  );
}

function UserMsg({ text, theme }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20, animation:"msgIn .25s cubic-bezier(.34,1.56,.64,1) both" }}>
      <div style={{
        background: theme.userBubble,
        borderRadius:"18px 4px 18px 18px",
        padding:"11px 16px",
        fontSize:13.5, lineHeight:1.65, color:"#fff",
        maxWidth:"70%",
        boxShadow:`0 4px 14px ${theme.accent}30`,
      }}>{text}</div>
    </div>
  );
}

function Dots({ theme }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:20 }}>
      <div style={{ width:30, height:30, borderRadius:"50%", background:theme.grad,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:10, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", flexShrink:0 }}>
        {theme === THEMES.casual ? "🤙" : "XY"}
      </div>
      <div style={{ background:"#fff", borderRadius:"4px 18px 18px 18px",
        padding:"14px 18px", boxShadow:"0 2px 16px rgba(0,0,0,0.07)",
        display:"flex", gap:5, alignItems:"center" }}>
        {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:"50%",
          background:theme.dotColor, display:"block",
          animation:`bop 1.1s ease ${i*.18}s infinite` }}/>)}
      </div>
    </div>
  );
}

function Chips({ items, onSelect, theme }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginLeft:38, marginBottom:18, animation:"chipIn .4s ease both" }}>
      {items.map((item, i) => {
        const label = typeof item === "object" ? `${item.icon} ${item.label}` : item;
        const isNav = /↩|🏠/.test(label);
        return (
          <button key={i} onClick={() => onSelect(label)}
            style={{
              background: isNav ? "transparent" : "#fff",
              border: `1.5px solid ${isNav ? "#e2e8f0" : theme.chipBorder}`,
              borderRadius:20, padding:"6px 14px",
              fontSize:12.5, fontWeight:500,
              color: isNav ? "#94a3b8" : theme.chipColor,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              transition:"all .15s",
              boxShadow: isNav ? "none" : "0 1px 6px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={e => {
              if (!isNav) { e.target.style.background=theme.accent; e.target.style.color="#fff"; e.target.style.borderColor=theme.accent; }
              else e.target.style.color="#475569";
            }}
            onMouseLeave={e => {
              if (!isNav) { e.target.style.background="#fff"; e.target.style.color=theme.chipColor; e.target.style.borderColor=theme.chipBorder; }
              else e.target.style.color="#94a3b8";
            }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function DeptScroll({ onSelect }) {
  return (
    <div style={{ marginLeft:38, marginBottom:18, animation:"chipIn .38s ease both" }}>
      <div style={{ display:"flex", gap:9, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
        {Object.entries(DEPTS).map(([key,d]) => (
          <button key={key} onClick={() => onSelect(key)}
            style={{ flexShrink:0, background:d.bg, border:`1.5px solid ${d.color}22`,
              borderRadius:16, padding:"11px 13px", textAlign:"left", cursor:"pointer",
              minWidth:106, transition:"all .18s", fontFamily:"'DM Sans',sans-serif" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 20px ${d.color}22`;e.currentTarget.style.borderColor=d.color+"60";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=d.color+"22";}}>
            <div style={{ fontSize:20 }}>{d.icon}</div>
            <div style={{ fontSize:12.5, fontWeight:700, color:"#0f172a", marginTop:5 }}>{key}</div>
            <div style={{ fontSize:10, color:d.color, marginTop:2, fontWeight:500 }}>{d.tagline}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DeptCard({ deptKey, onSubtopic }) {
  const d = DEPTS[deptKey];
  return (
    <div style={{ marginLeft:38, marginBottom:18, animation:"chipIn .35s ease both" }}>
      <div style={{ background:"#fff", border:`1.5px solid ${d.color}20`,
        borderRadius:18, overflow:"hidden", boxShadow:`0 4px 20px ${d.color}10` }}>
        <div style={{ background:`linear-gradient(135deg,${d.color}15,${d.color}08)`,
          padding:"12px 15px", display:"flex", alignItems:"center", gap:10,
          borderBottom:`1px solid ${d.color}12` }}>
          <span style={{ fontSize:24 }}>{d.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", fontFamily:"'Syne',sans-serif" }}>{deptKey}</div>
            <div style={{ fontSize:11, color:d.color, marginTop:1 }}>{d.tagline}</div>
          </div>
        </div>
        <div style={{ display:"flex", borderBottom:`1px solid ${d.color}10` }}>
          {d.stats.map(([val,label],i) => (
            <div key={i} style={{ flex:1, padding:"9px 0", textAlign:"center",
              borderRight: i<2?`1px solid ${d.color}10`:"none" }}>
              <div style={{ fontSize:14, fontWeight:800, color:d.color, fontFamily:"'Syne',sans-serif" }}>{val}</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 12px", display:"flex", gap:7, flexWrap:"wrap" }}>
          {DEPT_SUBTOPICS.map(topic => (
            <button key={topic} onClick={() => onSubtopic(deptKey, topic)}
              style={{ background:`${d.color}0c`, border:`1.5px solid ${d.color}20`,
                borderRadius:20, padding:"5px 13px", fontSize:12, color:d.color,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:500, transition:"all .15s" }}
              onMouseEnter={e=>{e.target.style.background=d.color;e.target.style.color="#fff";}}
              onMouseLeave={e=>{e.target.style.background=d.color+"0c";e.target.style.color=d.color;}}>
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateDivider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <div style={{ flex:1, height:1, background:"#f1f5f9" }}/>
      <span style={{ fontSize:10.5, color:"#cbd5e1", fontWeight:500 }}>{label}</span>
      <div style={{ flex:1, height:1, background:"#f1f5f9" }}/>
    </div>
  );
}

// ── MODE TRANSITION OVERLAY ───────────────────────────────────────────────────
function ModeTransition({ show, fromTheme, toTheme, label, onDone }) {
  const [phase, setPhase] = useState(0);
  // phase 0=idle, 1=sweep in, 2=hold+show label, 3=sweep out
  useEffect(() => {
    if (!show) return;
    setPhase(1);
    const t1 = setTimeout(() => setPhase(2), 350);
    const t2 = setTimeout(() => setPhase(3), 1400);
    const t3 = setTimeout(() => { setPhase(0); onDone(); }, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show]);

  if (phase === 0) return null;

  const isComing = phase === 1 || phase === 2;
  const scale = phase === 1 ? "scale(60)" : phase === 2 ? "scale(60)" : "scale(0)";
  const opacity = phase === 3 ? 0 : 1;

  return (
    <div style={{
      position:"absolute", inset:0, zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"center",
      pointerEvents: phase > 0 ? "all" : "none",
      overflow:"hidden",
    }}>
      {/* Ripple circle */}
      <div style={{
        width:60, height:60, borderRadius:"50%",
        background: toTheme.grad,
        transform: scale,
        opacity,
        transition: phase === 1
          ? "transform .5s cubic-bezier(.25,.46,.45,.94)"
          : phase === 3
          ? "transform .45s cubic-bezier(.55,.06,.68,.19), opacity .35s ease"
          : "none",
        position:"absolute",
      }}/>
      {/* Label */}
      {phase === 2 && (
        <div style={{
          position:"relative", zIndex:1, textAlign:"center",
          animation:"labelPop .3s cubic-bezier(.34,1.56,.64,1) both",
        }}>
          <div style={{ fontSize:36, marginBottom:8 }}>
            {toTheme === THEMES.casual ? "🤙" : toTheme === THEMES.formal ? "🎓" : "👋"}
          </div>
          <div style={{ fontSize:18, fontWeight:800, color:"#fff",
            fontFamily:"'Syne',sans-serif", letterSpacing:"-0.5px" }}>
            {label}
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginTop:4 }}>
            {toTheme === THEMES.casual ? "keeping it real with you" : "switching to professional mode"}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function CollegeChatbot() {
  const [msgs, setMsgs] = useState([]);
  const [tone, setTone] = useState(null);
  const [theme, setTheme] = useState(THEMES.neutral);
  const [pendingTheme, setPendingTheme] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionLabel, setTransitionLabel] = useState("");
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [showClear, setShowClear] = useState(false);

  const toneRef = useRef(null);
  const themeRef = useRef(THEMES.neutral);
  const aiHistory = useRef([]);
  const bottom = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);
  useEffect(() => { boot(); }, []);

  const push = useCallback(n => setMsgs(p => [...p, n]), []);
  const getTheme = () => themeRef.current;

  const tryTone = (text) => {
    if (toneRef.current !== null) return;
    const d = detectTone(text);
    if (!d) return;
    toneRef.current = d;
    setTone(d);
    const newTheme = THEMES[d];
    themeRef.current = newTheme;
    setPendingTheme(newTheme);
    setTransitionLabel(d === "casual" ? "Buddy Mode" : "Professional Mode");
    setShowTransition(true);
  };

  const onTransitionDone = () => {
    setShowTransition(false);
    if (pendingTheme) { setTheme(pendingTheme); setPendingTheme(null); }
  };

  const boot = async () => {
    setTyping(true);
    await sleep(500);
    push({ t:"divider", label:"Today" });
    push({ t:"bot", text:"Hey! Welcome to XYZ College 👋" });
    await sleep(700);
    push({ t:"bot", text:"What do you want to know?" });
    await sleep(200);
    setTyping(false);
    push({ t:"chips", items:QUICK_TOPICS, handler:handleQuickTopic });
  };

  const callAI = async (text) => {
    aiHistory.current = [...aiHistory.current.slice(-8), { role:"user", content:text }];
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:400,
        system: buildSystemPrompt(toneRef.current || "neutral"),
        messages: aiHistory.current,
      })
    });
    const data = await res.json();
    const reply = data.content?.map(b=>b.text||"").join("") || "Something went wrong — try again?";
    aiHistory.current = [...aiHistory.current, { role:"assistant", content:reply }];
    return reply;
  };

  const handleQuickTopic = async (rawLabel) => {
    const label = rawLabel.replace(/^[^\w🏛️📋💼🏆🎓]*/,"").trim();
    tryTone(label);
    push({ t:"user", text:label });
    const key = label.toLowerCase().replace(/[\s🏛️📋💼🏆🎓]/g,"");
    setTyping(true); await sleep(450); setTyping(false);

    if (key === "departments") {
      push({ t:"bot", text: toneRef.current==="casual"?"pick your dept 👇":"Select a department to explore:" });
      push({ t:"dept_scroll" });
    } else if (key === "admissions") {
      push({ t:"bot", text:"Here's the quick rundown:\n• **10+2** with **60%+** marks\n• JEE / NEET / State board score\n• Apply at xyz.edu.in — fee **₹800**\n• Counselling: **Apr 20–30, 2025**" });
      push({ t:"chips", items:["Fee structure?","Documents needed?","Scholarships?","Key dates"], handler:handleFree });
    } else if (key === "placements") {
      push({ t:"bot", text:"2024 placement snapshot:\n• **92%** overall placed\n• Highest — **₹42 LPA**, Google (CSE)\n• Average — **₹8.4 LPA**\n• **350+** companies on campus" });
      push({ t:"chips", items:["CSE placements?","Average students?","Top companies?","Training & prep?"], handler:handleFree });
    } else if (key === "scholarships") {
      push({ t:"bot", text:"Scholarship options:\n• Top **5%** → **50%** fee waiver\n• EWS / Low income → up to **100%** waiver\n• SC/ST → state government scholarship\n• External: PM Scholarship, NSP, Inspire" });
      push({ t:"chips", items:["How to apply?","Education loan?","Any other aid?"], handler:handleFree });
    } else if (/campus|life/.test(key)) {
      setTyping(true);
      const reply = await callAI("Brief engaging overview of campus life — hostel, food, clubs, vibe. 4 lines max. Use **bold** for key highlights.");
      setTyping(false);
      push({ t:"bot", text:reply, isAI:true });
      push({ t:"chips", items:["Hostel life?","Girls' safety?","Mental health?","Clubs & sports?"], handler:handleFree });
    }
  };

  const handleDept = async (key) => {
    push({ t:"user", text:`${DEPTS[key].icon} ${key}` });
    setTyping(true); await sleep(400); setTyping(false);
    const d = DEPTS[key]; const isC = toneRef.current === "casual";
    push({ t:"bot", text: isC
      ? `${d.icon} ${key} — **${d.stats[0][0]}** placed, **${d.stats[1][0]}** top package\nngl it's one of the better ones here. what do you wanna know?`
      : `${d.icon} ${key} — **${d.stats[0][0]}** placed · **${d.stats[1][0]}** top package\nHere's a breakdown — what aspect interests you?`
    });
    push({ t:"dept_card", deptKey:key });
  };

  const handleSubtopic = async (deptKey, topic) => {
    push({ t:"user", text:topic });
    setTyping(true);
    const reply = await callAI(`Tell me about ${topic} for the ${deptKey} department at XYZ College. Be concise. Use **bold** for important numbers and key stats.`);
    setTyping(false);
    push({ t:"bot", text:reply, isAI:true });
    const remaining = DEPT_SUBTOPICS.filter(t => t !== topic);
    push({ t:"chips", items:[...remaining,"↩ All depts","🏠 Menu"], handler:(l) => {
      const clean = l.replace(/^[^\w]*/,"").trim();
      if (/all dept/i.test(clean)) { push({t:"user",text:"All depts"}); setTimeout(()=>push({t:"dept_scroll"}),300); }
      else if (/menu/i.test(clean)) { push({t:"user",text:"Menu"}); setTimeout(()=>push({t:"chips",items:QUICK_TOPICS,handler:handleQuickTopic}),300); }
      else handleSubtopic(deptKey, clean);
    }});
  };

  const handleFree = async (rawText) => {
    const text = rawText.replace(/^[^\w₹🏠↩]*/,"").trim();
    if (!text) return;
    tryTone(text);
    push({ t:"user", text });
    const intent = getIntent(text);
    setTyping(true);

    if (intent === "departments") {
      await sleep(350); setTyping(false);
      push({ t:"bot", text: toneRef.current==="casual"?"departments 👇":"Here are all departments:" });
      push({ t:"dept_scroll" });
    } else if (intent.startsWith("dept_")) {
      const key = intent.replace("dept_","");
      await sleep(350); setTyping(false);
      handleDept(key);
    } else {
      const reply = await callAI(text);
      setTyping(false);
      push({ t:"bot", text:reply, isAI:true });
      const chips = getFollowUps(text);
      if (chips.length) push({ t:"chips", items:chips, handler:handleFree });
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    handleFree(text);
    inputRef.current?.focus();
  };

  const clearChat = async () => {
    setShowClear(false);
    toneRef.current = null; themeRef.current = THEMES.neutral;
    setTone(null); setTheme(THEMES.neutral);
    aiHistory.current = []; setMsgs([]);
    await sleep(80); boot();
  };

  const th = theme;
  const isC = tone === "casual";

  const render = (node, i) => {
    switch(node.t) {
      case "bot":        return <BotMsg key={i} text={node.text} isAI={node.isAI} theme={th}/>;
      case "user":       return <UserMsg key={i} text={node.text} theme={th}/>;
      case "chips":      return <Chips key={i} items={node.items} onSelect={node.handler} theme={th}/>;
      case "dept_scroll":return <DeptScroll key={i} onSelect={handleDept}/>;
      case "dept_card":  return <DeptCard key={i} deptKey={node.deptKey} onSubtopic={handleSubtopic}/>;
      case "divider":    return <DateDivider key={i} label={node.label}/>;
      default: return null;
    }
  };

  return (
    <div style={{
      minHeight:"100vh",
      background: th.bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans',sans-serif", padding:16,
      transition:"background 1.2s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:0px;}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes chipIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bop{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-5px);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes labelPop{from{opacity:0;transform:scale(.8) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        input:focus,button:focus{outline:none;}
      `}</style>

      <div style={{
        width:"100%", maxWidth:420, height:"88vh", maxHeight:740,
        borderRadius:24, overflow:"hidden",
        display:"flex", flexDirection:"column",
        background:"#f8fafc", position:"relative",
        boxShadow:"0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,.9)",
        transition:"box-shadow 0.6s ease",
      }}>

        {/* Mode transition overlay */}
        <ModeTransition
          show={showTransition}
          fromTheme={theme}
          toTheme={pendingTheme || theme}
          label={transitionLabel}
          onDone={onTransitionDone}
        />

        {/* Header */}
        <div style={{ padding:"13px 16px", background:"#fff", borderBottom:"1px solid #f1f5f9",
          display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative" }}>
            <div style={{
              width:36, height:36, borderRadius:"50%",
              background: th.grad,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: isC?15:10, fontWeight:800, color:"#fff",
              fontFamily:"'Syne',sans-serif", letterSpacing:"-0.5px",
              boxShadow:`0 3px 12px ${th.accent}40`,
              transition:"background 0.5s ease, box-shadow 0.5s ease",
            }}>
              {isC ? "🤙" : "XY"}
            </div>
            <span style={{ position:"absolute", bottom:0, right:0, width:9, height:9,
              borderRadius:"50%", background:"#4ade80", border:"2px solid #fff",
              animation:"pulse 2.5s infinite" }}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#0f172a", fontFamily:"'Syne',sans-serif" }}>XYZ College</div>
            <div style={{ fontSize:11, marginTop:1, display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ color: th.accent, fontWeight:500, transition:"color 0.5s" }}>{th.label}</span>
              {tone && <span style={{ color:"#e2e8f0", cursor:"pointer", fontSize:10 }}
                onClick={() => { toneRef.current=null; themeRef.current=THEMES.neutral; setTone(null); setTheme(THEMES.neutral); }}>· reset</span>}
            </div>
          </div>
          <button onClick={() => setShowClear(true)}
            style={{ width:30, height:30, borderRadius:"50%", background:"#f8fafc",
              border:"1px solid #f1f5f9", cursor:"pointer", display:"flex",
              alignItems:"center", justifyContent:"center", color:"#cbd5e1",
              fontSize:12, transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#fee2e2";e.currentTarget.style.color="#ef4444";e.currentTarget.style.borderColor="#fecaca";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#f8fafc";e.currentTarget.style.color="#cbd5e1";e.currentTarget.style.borderColor="#f1f5f9";}}>
            ✕
          </button>
        </div>

        {/* Thin accent bar that shifts color with mode */}
        <div style={{ height:2, background: th.grad, transition:"background 0.6s ease", flexShrink:0 }}/>

        {/* Chat */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 14px 6px" }}>
          {msgs.map((n,i) => render(n,i))}
          {typing && <Dots theme={th}/>}
          <div ref={bottom}/>
        </div>

        {/* Input */}
        <div style={{ padding:"10px 12px 12px", background:"#fff",
          borderTop:"1px solid #f1f5f9", display:"flex", gap:8, alignItems:"center" }}>
          <input ref={inputRef}
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter") handleSend(); }}
            placeholder={isC ? "ask anything bro…" : "Ask about XYZ College…"}
            style={{ flex:1, border:"1.5px solid #f1f5f9", borderRadius:22,
              padding:"9px 15px", fontSize:13.5,
              fontFamily:"'DM Sans',sans-serif", color:"#0f172a", background:"#f8fafc",
              transition:"border .15s, box-shadow .15s",
            }}
            onFocus={e=>{e.target.style.borderColor=th.accent+"60";e.target.style.boxShadow=`0 0 0 3px ${th.accent}10`;}}
            onBlur={e=>{e.target.style.borderColor="#f1f5f9";e.target.style.boxShadow="none";}}
          />
          <button onClick={handleSend} disabled={!input.trim()||typing} style={{
            width:38, height:38, borderRadius:"50%", border:"none",
            background: !input.trim()||typing ? "#f1f5f9" : th.grad,
            cursor: !input.trim()||typing ? "not-allowed" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0, transition:"all .2s",
            boxShadow: !input.trim()||typing ? "none" : `0 4px 12px ${th.accent}40`
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={!input.trim()||typing?"#cbd5e1":"white"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Clear modal */}
      {showClear && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.45)",
          backdropFilter:"blur(4px)", display:"flex", alignItems:"center",
          justifyContent:"center", zIndex:200, animation:"msgIn .2s ease both" }}>
          <div style={{ background:"#fff", borderRadius:20, padding:24, maxWidth:290,
            width:"90%", textAlign:"center", boxShadow:"0 24px 60px rgba(0,0,0,.2)" }}>
            <div style={{ fontSize:28, marginBottom:10 }}>🗑️</div>
            <div style={{ fontSize:15, fontWeight:800, color:"#0f172a", marginBottom:6, fontFamily:"'Syne',sans-serif" }}>
              {isC ? "clear everything?" : "Clear conversation?"}
            </div>
            <div style={{ fontSize:12.5, color:"#94a3b8", lineHeight:1.6, marginBottom:18 }}>
              {isC ? "resets chat + vibe detection 🔄" : "Resets chat and tone detection from scratch."}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setShowClear(false)} style={{ flex:1, padding:"9px 0",
                background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:12,
                fontSize:13, color:"#64748b", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                {isC?"nah":"Cancel"}
              </button>
              <button onClick={clearChat} style={{ flex:1, padding:"9px 0",
                background:"linear-gradient(135deg,#ef4444,#dc2626)",
                border:"none", borderRadius:12, fontSize:13, color:"#fff",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                {isC?"yep":"Clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
