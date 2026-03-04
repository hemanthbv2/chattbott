import { useState, useRef, useEffect, useCallback } from "react";

// ── TONE ─────────────────────────────────────────────────────────────────────
const CASUAL_RE = /\b(bro|yo|sup|wassup|hey|lol|omg|dude|bruh|ngl|tbh|fr|lowkey|haha|lmao|fam|yoo|heyy|mann|yaar|da|machan|anna|bhai|wanna|gonna|idk|imo|rn|kya|chill|aye)\b/i;
const FORMAL_RE = /\b(hello|good (morning|afternoon|evening)|i would like|could you|please|regarding|kindly|dear|sir|madam|i am interested|i wish to|may i|greetings|i require|enquir)\b/i;
const detectTone = (t) => CASUAL_RE.test(t) ? "casual" : FORMAL_RE.test(t) ? "formal" : null;

// ── THEMES ────────────────────────────────────────────────────────────────────
const THEMES = {
  neutral: { grad:"linear-gradient(135deg,#6366f1,#8b5cf6)", accent:"#6366f1", accentSoft:"#e0e7ff", userBubble:"linear-gradient(135deg,#6366f1,#4f46e5)", dot:"#a5b4fc", chipBorder:"#e0e7ff", chipColor:"#6366f1", bg:"linear-gradient(160deg,#f8faff,#f1f5f9,#faf5ff)", label:"online" },
  casual:  { grad:"linear-gradient(135deg,#f97316,#ef4444)", accent:"#f97316", accentSoft:"#ffedd5", userBubble:"linear-gradient(135deg,#f97316,#ef4444)", dot:"#fb923c", chipBorder:"#fed7aa", chipColor:"#f97316", bg:"linear-gradient(160deg,#fff7ed,#fef2f2,#fffbeb)", label:"buddy mode 🤙" },
  formal:  { grad:"linear-gradient(135deg,#0f172a,#1e3a5f)", accent:"#1e40af", accentSoft:"#dbeafe", userBubble:"linear-gradient(135deg,#1e3a5f,#1e40af)", dot:"#93c5fd", chipBorder:"#bfdbfe", chipColor:"#1e40af", bg:"linear-gradient(160deg,#f0f4ff,#f1f5f9,#f0f9ff)", label:"professional mode" },
};

// ── AI SYSTEM PROMPT ──────────────────────────────────────────────────────────
const buildSystemPrompt = (tone) => `You are a warm, intelligent guide for XYZ College.

TONE: ${tone === "casual" ? "Talk like a chill senior student — short, real, genuine. Use bro/fr/ngl naturally. No corporate speak." : tone === "formal" ? "Speak as a professional academic counselor. Clear, structured, empathetic." : "Friendly and helpful. Warm but professional."}

Use **double asterisks** around important numbers, key stats, and crucial facts.

XYZ COLLEGE FACTS:
- NAAC A+, Est.1985, NIRF #48 Engineering 2024, 12,000+ students, 65-acre campus
- AICTE approved, State University affiliated, NBA accredited (CSE, ECE, Mech)
- Departments: CSE, ECE, Mechanical, Biotechnology, Civil, MBA
- Placements: **92%** overall, **₹42 LPA** top (CSE-Google), **₹8.4 LPA** avg, **350+** companies
- Fees: B.Tech **~₹1.2L/yr**, MBA **~₹1.8L/yr**, M.Tech **~₹90K/yr**
- Education loans: SBI, Canara, Indian Bank — college helps process paperwork
- Scholarships: Top 5% → 50% waiver, EWS → full waiver, SC/ST state scholarship
- Hostel: Separate boys & girls, **24/7** security, CCTV, wardens on every floor
- Safety: Zero-tolerance anti-ragging, women's cell, anonymous complaint portal, security escorts at night
- Mental health: **2 psychologists** on campus, free confidential sessions, peer support program
- Medical: **24/7** clinic, ambulance, City Hospital 2km away
- Food: 3 canteens + central mess, veg & non-veg, monthly rotation
- Sports: Cricket, football, basketball courts, gymnasium, annual sports fest
- Clubs: **40+** — coding, robotics, debate, music, drama, photography, NSS, NCC
- Transport: Buses from **15+** city points, ₹800/month pass, 8km from railway station
- WiFi: 1Gbps campus-wide, labs open **24/7** with biometric access
- Attendance: **75%** minimum, medical exemptions considered
- Backlog: Max 2 supplementary attempts per subject
- Lateral entry: Direct 2nd year for diploma holders (Mech/ECE/CSE)
- Exchange: MoU with **3 UK universities** for semester exchange
- Startup: Incubation centre, **₹10L** seed funding for student startups
- Alumni: **45,000+** globally — Silicon Valley, Singapore, Dubai
- Diversity: Students from **22 states**, **4 countries**
- Library: **80,000+** books, digital access, research journals
- Dress code: Smart casuals Mon–Fri, no strict uniform

CONVERSATION RULES:
- Keep answers 3–5 lines. No walls of text.
- Parent questions → empathy first, safety & wellbeing lead
- Confused students → ask 1 qualifying question to guide them
- Ragging/mental health/safety → extra reassuring and thorough
- Fee concerns → acknowledge burden genuinely, mention aid options
- Comparisons → honest pros/cons, not marketing
- Unknown specifics → "Contact admissions for exact figures"
- Anxious/nervous users → validate feelings first, then reassure
- ONLY answer college-related questions. Politely redirect anything unrelated.
Sound like a real person, not a FAQ page.`;

// ── INSTANT RESPONSES (no API needed) ────────────────────────────────────────
const QUICK_ANSWERS = {
  admissions: {
    casual:  "admissions quick rundown 📋\n\n• need **10+2 with 60%+** marks\n• JEE / NEET / state board score valid\n• apply at xyz.edu.in — fee **₹800**\n• counselling: **Apr 20–30, 2025**\n• classes start **Jul 1, 2025**",
    formal:  "Admission Requirements:\n\n• **10+2** with minimum **60%** marks\n• Valid JEE / NEET / State Board score\n• Online application at xyz.edu.in — fee **₹800**\n• Counselling rounds: **Apr 20–30, 2025**\n• Documents: 10th & 12th marksheets, TC, Aadhaar, 4 photos",
    neutral: "Here's what you need for admissions:\n\n• **10+2 with 60%+** marks\n• JEE / NEET / State board score\n• Apply at xyz.edu.in — fee **₹800**\n• Counselling: **Apr 20–30, 2025** · Classes: **Jul 1**",
  },
  placements: {
    casual:  "placements here go crazy ngl 🚀\n\n• **92%** placed overall (2024)\n• highest — **₹42 LPA** at Google (CSE)\n• average — **₹8.4 LPA** across all depts\n• **350+** companies recruit on campus every year\n\nthat's real numbers, not just marketing",
    formal:  "Placement Statistics (2024):\n\n• **92%** overall placement rate\n• Highest package — **₹42 LPA** (CSE, Google)\n• Average package — **₹8.4 LPA**\n• **350+** recruiting companies visited campus\n• Training: aptitude, mock interviews, GDs, domain certifications",
    neutral: "2024 placement highlights:\n\n• **92%** placed overall\n• Highest: **₹42 LPA** — Google (CSE)\n• Average: **₹8.4 LPA**\n• **350+** companies | Training program from Sem 5 🎯",
  },
  scholarships: {
    casual:  "scholarships — actually solid options 💰\n\n• top **5%** of class → **50%** fee waiver\n• EWS / low income → up to **100%** waiver\n• SC/ST → state government scholarship\n• PM Scholarship, NSP Portal, Inspire (science) also available\n\ndef worth applying, deadlines hit Sept 15",
    formal:  "Available Scholarships:\n\n• Top **5%** of batch — **50%** tuition waiver\n• EWS category — up to **100%** waiver\n• SC/ST — State government scholarship\n• External: PM Scholarship, NSP Portal, Inspire Award\n• Apply by **Sept 15** with income + category certificates",
    neutral: "Scholarship options:\n\n• Top **5%** → **50%** fee waiver\n• EWS / Low income → up to **100%** waiver\n• SC/ST → State scholarship\n• PM Scholarship, NSP, Inspire also available 🏆\n• Apply by **Sept 15**",
  },
  fees: {
    casual:  "fees breakdown 👇\n\n• B.Tech — **~₹1.2L/year**\n• MBA — **~₹1.8L/year**\n• M.Tech — **~₹90K/year**\n\nloans available through SBI, Canara, Indian Bank — college literally helps you with the paperwork",
    formal:  "Fee Structure:\n\n• B.Tech — **~₹1.2 Lakh/year**\n• MBA — **~₹1.8 Lakh/year**\n• M.Tech — **~₹90,000/year**\n\nEducation loans available via SBI, Canara & Indian Bank with full college assistance for processing.",
    neutral: "Fees at a glance:\n\n• B.Tech — **~₹1.2L/yr**\n• MBA — **~₹1.8L/yr**\n• M.Tech — **~₹90K/yr**\n\nLoans via SBI, Canara, Indian Bank — college helps process them 💳",
  },
  hostel: {
    casual:  "hostel life 🏠\n\n• separate boys & girls hostels (fully different buildings)\n• **24/7** security + CCTV throughout\n• dedicated wardens on every floor\n• 3 canteens + central mess, veg & non-veg\n• campus-wide WiFi, late-night security escort if needed",
    formal:  "Hostel Facilities:\n\n• Separate and secure hostels for boys and girls\n• **24/7** CCTV surveillance and security personnel\n• Resident wardens assigned to every floor\n• 3 canteens + central mess with veg & non-veg options\n• Campus-wide WiFi connectivity",
    neutral: "Hostel overview:\n\n• Separate boys & girls hostels\n• **24/7** security + CCTV\n• Wardens on each floor\n• 3 canteens + mess (veg & non-veg)\n• Campus WiFi throughout 🏠",
  },
  safety: {
    casual:  "safety here is taken seriously fr 🛡️\n\n• **zero-tolerance** anti-ragging — strict enforcement\n• women's cell active on campus\n• anonymous complaint portal (no one knows it's you)\n• late-night security escorts for girls\n• **24/7** campus clinic + ambulance on standby",
    formal:  "Campus Safety Measures:\n\n• **Zero-tolerance** anti-ragging policy with active committee\n• Dedicated Women's Cell with direct escalation\n• Anonymous complaint portal available to all students\n• **24/7** security escort service for female students\n• **24/7** campus medical clinic with ambulance",
    neutral: "Safety at XYZ College:\n\n• **Zero-tolerance** anti-ragging policy\n• Women's cell + anonymous complaint portal\n• Night security escorts available\n• **24/7** campus clinic + ambulance 🛡️",
  },
  mentalhealth: {
    casual:  "mental health support — yes, it's real here 💙\n\n• **2 full-time psychologists** on campus\n• sessions are **free and confidential** — no stigma\n• peer support program run by trained student volunteers\n• no appointment needed in crisis — just walk in",
    formal:  "Mental Health Support Services:\n\n• **2 full-time psychologists** on campus\n• Free, confidential counseling sessions year-round\n• Structured peer support program\n• Accessible to all students — no referral required",
    neutral: "Mental health support:\n\n• **2 psychologists** on campus — free sessions\n• Fully confidential\n• Peer support program run by students\n• Open to everyone, anytime 💙",
  },
  clubs: {
    casual:  "life outside class hits different here 🎉\n\n• **40+** clubs — coding, robotics, debate, music, drama, photography, NSS, NCC\n• sports: cricket, football, basketball, gym\n• annual sports fest + cultural fest (SYNERGY)\n• startup incubation centre + **₹10L** seed funding\n• exchange: **3 UK university** MoUs for semester abroad",
    formal:  "Co-curricular Activities:\n\n• **40+** registered student clubs across disciplines\n• Sports: cricket, football, basketball courts, gymnasium\n• Annual sports & cultural festivals\n• Startup incubation centre with **₹10L** seed funding\n• Semester exchange with **3 UK partner universities**",
    neutral: "Campus life beyond class:\n\n• **40+** clubs — coding, music, debate, NSS & more\n• Cricket, football, basketball, gym\n• Annual sports & cultural fests\n• Startup incubation + **₹10L** seed funding 🚀",
  },
  about: {
    casual:  "the college in a nutshell 🏛️\n\n• est. **1985** · NAAC **A+** · NIRF **#48** Engineering nationally\n• **65-acre** green campus · **12,000+** students\n• NBA accredited: CSE, ECE, Mech\n• library: **80,000+** books · **24/7** WiFi + labs\n• **45,000+** alumni worldwide",
    formal:  "About XYZ College:\n\n• Established **1985** · NAAC **A+** · NIRF **#48** Engineering 2024\n• **65-acre** campus · **12,000+** enrolled students\n• NBA Accreditation: CSE, ECE, Mechanical\n• Library: **80,000+** volumes, digital access\n• Alumni network: **45,000+** globally",
    neutral: "XYZ College at a glance:\n\n• Est. **1985** · NAAC **A+** · NIRF **#48** Engineering\n• **65-acre** campus · **12,000+** students\n• NBA: CSE, ECE, Mech · Library: **80,000+** books\n• **45,000+** alumni worldwide 🏛️",
  },
};

// ── DEPT DATA ─────────────────────────────────────────────────────────────────
const DEPTS = {
  CSE:     { icon:"💻", color:"#6366f1", bg:"#eef2ff", tagline:"AI · Cloud · Cybersec",     stats:[["98%","placed"],["₹42L","top pkg"],["180","seats"]], quick:{ casual:"CSE here is straight up the best dept — **98% placed**, **₹42L** top package 💻\nngl if you're into tech this is the one. what do you wanna know?", formal:"CSE is our flagship department with the strongest placement record — **98%** placed, top package **₹42 LPA**.\nExcellent focus on AI, Cloud, and Cybersecurity. What would you like to explore?", neutral:"CSE — **98% placed**, **₹42L** top package\nFlagship dept with AI, Cloud & Cybersec specializations. What would you like to know? 💻" } },
  ECE:     { icon:"📡", color:"#0ea5e9", bg:"#f0f9ff", tagline:"VLSI · 5G · Robotics",      stats:[["89%","placed"],["₹28L","top pkg"],["120","seats"]], quick:{ casual:"ECE is lowkey underrated here — **89% placed**, **₹28L** top pkg 📡\nwe literally have ex-ISRO faculty. what do you wanna dig into?", formal:"ECE is NBA-accredited with a solid **89%** placement rate and top package of **₹28 LPA**.\nStrong in VLSI, 5G and robotics with ex-ISRO faculty. What aspect interests you?", neutral:"ECE — **89% placed**, **₹28L** top package\nEx-ISRO faculty, strong semiconductor & telecom placements 📡" } },
  MECH:    { icon:"⚙️", color:"#f59e0b", bg:"#fffbeb", tagline:"CAD · Thermal · PSU",       stats:[["85%","placed"],["₹18L","top pkg"],["120","seats"]], quick:{ casual:"Mech is the OG — been here **40 years** and still going strong\n**85% placed**, heavy PSU pipeline (BHEL, NTPC, L&T) ⚙️", formal:"Mechanical Engineering is one of our most established NBA-accredited departments.\n**85%** placement rate with strong PSU connections including BHEL, NTPC and L&T.", neutral:"Mech — **85% placed**, **₹18L** top pkg\nStrong PSU pipeline, 40-year legacy ⚙️" } },
  BIOTECH: { icon:"🧬", color:"#10b981", bg:"#f0fdf4", tagline:"Genomics · Pharma · Life",  stats:[["78%","placed"],["₹14L","top pkg"],["60","seats"]],  quick:{ casual:"Biotech is actually slept on — only college in the state with an **Illumina sequencer** fr 🧬\n**78% placed**, and **30%** go abroad for MS/PhD", formal:"Biotechnology features unique infrastructure including the state's only **Illumina MiSeq** sequencer.\n**78%** placement rate with strong pharma connections. **30%** of graduates pursue MS/PhD abroad.", neutral:"Biotech — **78% placed**, **₹14L** top pkg\nState's only Illumina sequencer · **30%** go for MS/PhD abroad 🧬" } },
  CIVIL:   { icon:"🏗️", color:"#8b5cf6", bg:"#f5f3ff", tagline:"Infra · GIS · PSU",        stats:[["82%","placed"],["₹12L","top pkg"],["60","seats"]],  quick:{ casual:"Civil is solid if you wanna do govt infra or PSU work\n**82% placed**, strong UPSC/SSC-JE pipeline here 🏗️", formal:"Civil Engineering has strong PSU and government sector placements.\n**82%** placement rate with dedicated UPSC/SSC-JE coaching available.", neutral:"Civil — **82% placed**, **₹12L** top pkg\nStrong PSU & UPSC pipeline, NHAI consultancy projects 🏗️" } },
  MBA:     { icon:"📊", color:"#ec4899", bg:"#fdf2f8", tagline:"Finance · Mktg · Strategy", stats:[["95%","placed"],["₹22L","top pkg"],["120","seats"]], quick:{ casual:"MBA here genuinely slaps — **95%** placement is insane\nDeloitte, EY, Amazon all come here 📊", formal:"The MBA programme achieves our highest placement rate at **95%**, with top recruiters including Deloitte, EY and Amazon.\nBloomberg Finance Lab, IIM-alumni faculty.", neutral:"MBA — **95% placed**, **₹22L** top pkg\nBloomberg lab, IIM-alumni faculty, Deloitte/EY/Amazon recruit here 📊" } },
};

const DEPT_SUBTOPICS = {
  Programs:        { icon:"🎓", desc:"Degrees, seats & specializations" },
  Placements:      { icon:"🏢", desc:"Stats, companies & packages" },
  "Labs & Faculty":{ icon:"🔬", desc:"Infrastructure & teaching staff" },
  Research:        { icon:"📖", desc:"Projects, funding & patents" },
};

const DEPT_DETAIL = {
  CSE: {
    Programs:   ["B.Tech CSE — **180 seats**","M.Tech AI/ML — **30 seats**","Ph.D · Minor: Data Science","Lateral entry available","Specializations: AI & ML · Cybersec · Cloud · IoT"],
    Placements: ["**98%** placed (2024)","Highest: **₹42 LPA** — Google","Average: **₹14.2 LPA**","**60+** CSE companies annually","Training from Sem 5 — aptitude, mock interviews"],
    "Labs & Faculty": ["AI/ML Lab (NVIDIA GPU cluster)","Cybersecurity Lab · AWS/Azure Cloud Lab","**42 faculty** · **28 PhDs**","**8 ex-FAANG/MNC** faculty members","HOD: Dr. Priya Mehta — IIT Bombay"],
    Research:   ["NLP · Computer Vision projects","Funded: DST · SERB · DRDO","**₹1.2 Cr** research budget/yr","**10 patents** filed (2020–24)","Collab: IIT Madras · CDAC"],
  },
  ECE: {
    Programs:   ["B.Tech ECE — **120 seats**","M.Tech VLSI — **24 seats**","Ph.D · Minor: Embedded Systems","Certificate course: IoT","Specializations: VLSI · 5G · Signal Processing · Robotics"],
    Placements: ["**89%** placed (2024)","Highest: **₹28 LPA** — Qualcomm","Average: **₹9.8 LPA**","Qualcomm · Intel · TI · Bosch recruit here","GATE coaching available in-house"],
    "Labs & Faculty": ["VLSI & Semiconductor Lab","DSP Lab · RF Lab · Robotics Lab","PCB Fabrication Unit","**35 faculty** · **22 PhDs** · Ex-ISRO & DRDO","HOD: Dr. Ramesh Iyer — ex-ISRO"],
    Research:   ["VLSI chip design · 5G research","Funded: ISRO · DRDO · DST","**7 patents** (2021–24)","MoU with ISRO SAC"],
  },
  MECH: {
    Programs:   ["B.Tech Mech — **120 seats**","M.Tech Thermal / Manufacturing","Ph.D · Minor: Robotics","Specializations: CAD/CAM · Thermal Sciences"],
    Placements: ["**85%** placed (2024)","Highest: **₹18 LPA** — L&T","Average: **₹7.2 LPA**","BHEL · NTPC · Mahindra recruit here","GATE coaching within department"],
    "Labs & Faculty": ["CNC · 3D Printing Centre","CAD/CAM (CATIA · ANSYS) · Thermal & Fluid Lab","Equipment worth **₹3.5 Cr**","**38 faculty** · **25 PhDs** · Consultants from L&T/BHEL","HOD: Dr. Suresh Babu — ex-L&T R&D"],
    Research:   ["Additive manufacturing · Composites","Renewable energy research","Funded: DST · NITI Aayog","Collab: NIT Trichy · CMTI"],
  },
  BIOTECH: {
    Programs:   ["B.Tech Biotech — **60 seats**","M.Tech Bioinformatics · M.Sc · Ph.D","Minor in Biotechnology","Requires Biology + Chemistry in 10+2"],
    Placements: ["**78%** placed (2024)","Highest: **₹14 LPA** — Biocon","Average: **₹6.4 LPA**","**30%** go for MS/PhD abroad","GRE/GATE guidance provided"],
    "Labs & Faculty": ["BSL-2 Microbiology Lab","Illumina MiSeq Genomics Lab — **only one in state**","Fermentation Lab · Cell Culture Lab","**24 faculty** · **18 PhDs** · 2 ex-CSIR scientists","HOD: Dr. Ananya Krishnan — ex-CSIR"],
    Research:   ["Cancer biomarkers · Drug delivery","Funded: DBT · ICMR · DST","**1 patent** licensed to pharma startup","Biotech Incubation Centre on campus"],
  },
  CIVIL: {
    Programs:   ["B.Tech Civil — **60 seats**","M.Tech Structural / Environmental Engg","Ph.D · Certificate: AutoCAD","Accredited: Institution of Engineers India"],
    Placements: ["**82%** placed (2024)","Highest: **₹12 LPA** — L&T","Average: **₹6.8 LPA**","Strong UPSC/SSC-JE pipeline","Govt. sector coaching provided"],
    "Labs & Faculty": ["Structural Testing Lab (200T UTM)","Geotechnical · Surveying · GIS Lab","Environmental Lab · CAD Lab","**28 faculty** · **20 PhDs** · 3 State PWD consultants","HOD: Dr. Kavitha Nair — ex-CPWD"],
    Research:   ["Green concrete · Smart city GIS","Funded: MoRTH · DST · NMCG","Collab: NIT Warangal · IIT Roorkee"],
  },
  MBA: {
    Programs:   ["MBA — **120 seats** (2 years)","Specializations: Finance · Marketing · HR · Operations","Dual specialization · Executive MBA","Entry: CAT/MAT/XAT · Min: Any graduate 50%+"],
    Placements: ["**95%** placed (2024)","Highest: **₹22 LPA** — Deloitte","Average: **₹9.6 LPA** · Internship: **₹30K/month**","**4,000+** alumni network","Deloitte · EY · Amazon · KPMG recruit here"],
    "Labs & Faculty": ["Bloomberg Finance Lab (live terminal)","Business Simulation Lab · SAP ERP Lab","**30 faculty** · **15 IIM PhDs/FPMs**","**8 faculty** with 10+ yrs corporate exp","HOD: Prof. Sanjay Khanna — IIM-A"],
    Research:   ["HBR India case studies","Behavioral finance · Supply chain","Annual fest: SYNERGY","AICTE Centre of Excellence: Entrepreneurship"],
  },
};

const MAIN_TOPICS = [
  { label:"Admissions",  icon:"📋", key:"admissions"  },
  { label:"Departments", icon:"🏛️", key:"departments" },
  { label:"Placements",  icon:"💼", key:"placements"  },
  { label:"Scholarships",icon:"🏆", key:"scholarships" },
  { label:"Campus Life", icon:"🎓", key:"clubs"        },
  { label:"About",       icon:"ℹ️",  key:"about"       },
];

const TRENDING = [
  { label:"Is it safe for my daughter?",    q:"Is the campus safe for girl students?" },
  { label:"CSE vs ECE — which is better?",  q:"Compare CSE and ECE departments honestly" },
  { label:"My kid is shy — will they fit?", q:"My child is introverted and sensitive, will they fit in?" },
  { label:"Average student placements?",    q:"What about placements for average students, not just toppers?" },
  { label:"Fees + loan help",               q:"Tell me about fees and education loan options" },
  { label:"Which dept for highest salary?", q:"Which department gives the highest salary?" },
  { label:"Mental health support?",         q:"Does the college have mental health counseling?" },
  { label:"Hostel life experience?",        q:"What is hostel life actually like here?" },
];

const FUN_FACTS = [
  "🎯 92% of students placed before they graduate",
  "🔬 Only college in the state with an Illumina gene sequencer",
  "🏆 #48 NIRF Engineering — Top 50 nationally",
  "💡 10 student patents filed in just 4 years",
  "🌍 30% of Biotech grads pursue MS/PhD abroad",
  "🚀 Google paid ₹42 LPA to our CSE topper",
  "🏠 2 fully separated hostels — 24/7 security",
  "🧠 2 full-time psychologists — free sessions for all",
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── INTENT MATCHING ───────────────────────────────────────────────────────────
// FIX #1 & #5: Returns a type that handleFreeInput uses WITHOUT calling sub-handlers that push user messages
const matchIntent = (text) => {
  const t = text.toLowerCase();
  if (/(admission|apply|eligib|enrol|join|how to get in)/i.test(t)) return { type:"instant", key:"admissions" };
  if (/(scholarship|waiver|stipend|financial aid)/i.test(t)) return { type:"instant", key:"scholarships" };
  if (/(^place|placed|job|package|salary|recruit|lpa|hire)/i.test(t)) return { type:"instant", key:"placements" };
  if (/(^fee|cost|how much|tuition|afford|price)/i.test(t)) return { type:"instant", key:"fees" };
  if (/(hostel|room|stay|accommodation|dorm)/i.test(t)) return { type:"instant", key:"hostel" };
  if (/(safe|security|ragging|women.s cell|daughter)/i.test(t)) return { type:"instant", key:"safety" };
  if (/(mental|psycholog|counsell|stress|anxiet)/i.test(t)) return { type:"instant", key:"mentalhealth" };
  if (/(club|sport|campus life|activity|canteen|food|fest|extracurr)/i.test(t)) return { type:"instant", key:"clubs" };
  if (/(about|naac|nirf|accredit|ranking|history|overview)/i.test(t)) return { type:"instant", key:"about" };
  if (/(department|all dept|all course|all branch|which dept)/i.test(t) && !/(cse|ece|mech|bio|civil|mba)/i.test(t)) return { type:"depts" };
  for (const k of Object.keys(DEPTS)) {
    if (t.includes(k.toLowerCase()) || (k==="MECH" && /mechanic/i.test(t)) || (k==="BIOTECH" && /\bbiotech\b|\bbio\b/i.test(t))) return { type:"dept", key:k };
  }
  return { type:"ai" };
};

const getFollowUps = (key) => ({
  admissions:   ["Fee structure?","Documents needed?","Scholarship options?","Key dates"],
  placements:   ["CSE placements?","Average students placed?","Top companies?"],
  scholarships: ["How to apply?","Education loan?","Fee structure?"],
  fees:         ["Scholarship options?","Education loan?","Hostel fees?"],
  hostel:       ["Girls' safety?","Hostel fees?","Day scholar option?"],
  safety:       ["Anti-ragging details?","Women's cell?","Mental health?"],
  mentalhealth: ["Is it confidential?","How to reach out?","Peer support?"],
  clubs:        ["Startup incubation?","Sports facilities?","Clubs list?"],
  about:        ["Admissions process?","Departments","Placements?"],
}[key] || ["Tell me more","🏠 Main menu"]);

// ── RICH TEXT ─────────────────────────────────────────────────────────────────
function RichText({ text, accent }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>
    {parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i} style={{ fontWeight:700, color:accent, fontFamily:"'Syne',sans-serif", letterSpacing:"-0.2px" }}>{p.slice(2,-2)}</strong>;
      return p.split(/(₹[\d,.]+\s*(?:LPA|L|K|Cr)?|\d+(?:\.\d+)?%|\d+\+(?:\s*\w+)?)/g).map((s,j) =>
        /(₹[\d,.]+|%|\d+\+)/.test(s) && s.trim()
          ? <strong key={`${i}-${j}`} style={{ fontWeight:700, color:accent, fontFamily:"'Syne',sans-serif" }}>{s}</strong>
          : <span key={`${i}-${j}`}>{s}</span>
      );
    })}
  </>;
}

// ── MASCOT ────────────────────────────────────────────────────────────────────
function Mascot({ mood = "idle", size = 40 }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const id = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 140); }, 2800 + Math.random()*2000);
    return () => clearInterval(id);
  }, []);

  const colors = { idle:"#6366f1", casual:"#f97316", formal:"#1e3a5f", talking:"#8b5cf6", happy:"#10b981", thinking:"#6366f1" };
  const c = colors[mood] || "#6366f1";
  const eyeRy = blink ? 0.5 : 3.5;
  const eyeY  = blink ? 19.5 : 18;
  const cheekO = (mood==="happy"||mood==="casual") ? 0.55 : 0.15;
  const mouthD = mood==="happy" ? "M17 29 Q24 35 31 29" : mood==="thinking" ? "M19 30 Q24 29 29 30" : "M18 29 Q24 33 30 29";

  return (
    <div style={{ width:size, height:size, flexShrink:0,
      animation: mood==="talking" ? "mascotWiggle .45s ease infinite alternate"
               : mood==="happy"   ? "mascotBounce .5s cubic-bezier(.34,1.56,.64,1)"
               : "mascotFloat 3.2s ease-in-out infinite",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="45.5" rx="9" ry="2" fill="rgba(0,0,0,0.07)"/>
        <circle cx="24" cy="24" r="18" fill={c} style={{ transition:"fill .5s" }}/>
        <circle cx="17" cy="16" r="5" fill="rgba(255,255,255,0.15)"/>
        <ellipse cx="17.5" cy={eyeY} rx="4" ry={eyeRy} fill="white" style={{ transition:"all .1s" }}/>
        <ellipse cx="30.5" cy={eyeY} rx="4" ry={eyeRy} fill="white" style={{ transition:"all .1s" }}/>
        {!blink && <>
          <circle cx={mood==="thinking"?"18.5":"17.5"} cy="18.8" r="2.2" fill="#0f172a"/>
          <circle cx={mood==="thinking"?"31.5":"30.5"} cy="18.8" r="2.2" fill="#0f172a"/>
          <circle cx={mood==="thinking"?"19.2":"18.2"} cy="17.9" r="0.7" fill="white"/>
          <circle cx={mood==="thinking"?"32.2":"31.2"} cy="17.9" r="0.7" fill="white"/>
        </>}
        <circle cx="12.5" cy="25" r="3.5" fill="#ef4444" opacity={cheekO} style={{ transition:"opacity .4s" }}/>
        <circle cx="35.5" cy="25" r="3.5" fill="#ef4444" opacity={cheekO} style={{ transition:"opacity .4s" }}/>
        <path d={mouthD} stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {mood==="thinking" && [0,1,2].map(i =>
          <circle key={i} cx={32+i*4} cy={12-i*3} r={1.3+i*0.3} fill="white" opacity="0.7"
            style={{ animation:`thinkDot 1s ease ${i*.15}s infinite` }}/>
        )}
        <path d="M24 6.5 L24 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <circle cx="24" cy="2.2" r="1.4" fill="white" opacity="0.6"/>
      </svg>
    </div>
  );
}

// ── UI COMPONENTS ─────────────────────────────────────────────────────────────
function BotMsg({ text, isAI, theme, mood }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:18, animation:"msgIn .28s cubic-bezier(.34,1.56,.64,1) both" }}>
      <Mascot mood={mood||"idle"} size={34}/>
      <div style={{ maxWidth:"80%", display:"flex", flexDirection:"column", gap:3 }}>
        <div style={{ background:"#fff", borderRadius:"4px 18px 18px 18px", padding:"11px 15px", boxShadow:"0 2px 14px rgba(0,0,0,0.07)" }}>
          {lines.map((line, i) => {
            const isBullet = line.startsWith("•");
            const isHeader = i===0 && lines.length>1 && lines[1]?.startsWith("•");
            if (isBullet) return (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:i<lines.length-1?5:0 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:theme.accent, flexShrink:0, marginTop:7 }}/>
                <span style={{ fontSize:13.5, color:"#334155", lineHeight:1.68 }}><RichText text={line.slice(1).trim()} accent={theme.accent}/></span>
              </div>
            );
            if (isHeader) return <div key={i} style={{ fontSize:13, fontWeight:600, color:"#0f172a", marginBottom:7 }}><RichText text={line} accent={theme.accent}/></div>;
            return <p key={i} style={{ fontSize:13.5, color:"#334155", lineHeight:1.72, margin:i>0?"5px 0 0":0 }}><RichText text={line} accent={theme.accent}/></p>;
          })}
        </div>
        {isAI && <div style={{ fontSize:10, color:"#cbd5e1", marginLeft:4, display:"flex", gap:4, alignItems:"center" }}><span style={{ width:4, height:4, borderRadius:"50%", background:`${theme.accent}80`, display:"block" }}/>AI · live</div>}
      </div>
    </div>
  );
}

function UserMsg({ text, theme }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:18, animation:"msgIn .22s cubic-bezier(.34,1.56,.64,1) both" }}>
      <div style={{ background:theme.userBubble, borderRadius:"18px 4px 18px 18px", padding:"10px 16px", fontSize:13.5, lineHeight:1.65, color:"#fff", maxWidth:"70%", boxShadow:`0 4px 14px ${theme.accent}30` }}>{text}</div>
    </div>
  );
}

function ThinkDots({ theme }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:18 }}>
      <Mascot mood="thinking" size={34}/>
      <div style={{ background:"#fff", borderRadius:"4px 18px 18px 18px", padding:"13px 16px", boxShadow:"0 2px 14px rgba(0,0,0,0.06)", display:"flex", gap:5, alignItems:"center" }}>
        {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:"50%", background:theme.dot, display:"block", animation:`bop 1.1s ease ${i*.18}s infinite` }}/>)}
      </div>
    </div>
  );
}

function Chips({ items, onSelect, theme }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginLeft:42, marginBottom:16, animation:"chipIn .35s ease both" }}>
      {items.map((item, i) => {
        const label = typeof item==="object" ? `${item.icon} ${item.label}` : item;
        const isNav = /↩|🏠/.test(label);
        return (
          <button key={i} onClick={() => onSelect(label)}
            style={{ background:isNav?"transparent":"#fff", border:`1.5px solid ${isNav?"#e2e8f0":theme.chipBorder}`, borderRadius:20, padding:"6px 13px", fontSize:12.5, fontWeight:500, color:isNav?"#94a3b8":theme.chipColor, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s", boxShadow:isNav?"none":"0 1px 5px rgba(0,0,0,0.05)" }}
            onMouseEnter={e=>{ if(!isNav){e.target.style.background=theme.accent;e.target.style.color="#fff";e.target.style.borderColor=theme.accent;}else e.target.style.color="#475569"; }}
            onMouseLeave={e=>{ if(!isNav){e.target.style.background="#fff";e.target.style.color=theme.chipColor;e.target.style.borderColor=theme.chipBorder;}else e.target.style.color="#94a3b8"; }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function DeptScroll({ onSelect }) {
  return (
    <div style={{ marginLeft:42, marginBottom:16, animation:"chipIn .35s ease both" }}>
      <div style={{ display:"flex", gap:9, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
        {Object.entries(DEPTS).map(([key,d]) => (
          <button key={key} onClick={() => onSelect(key)}
            style={{ flexShrink:0, background:d.bg, border:`1.5px solid ${d.color}22`, borderRadius:16, padding:"11px 13px", textAlign:"left", cursor:"pointer", minWidth:106, transition:"all .18s", fontFamily:"'DM Sans',sans-serif" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 20px ${d.color}25`;e.currentTarget.style.borderColor=d.color+"60";}}
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

// FIX #3: Dedicated DeptCard — no dept.overview reference, clean stat display
function DeptCard({ deptKey, onSubtopic }) {
  const d = DEPTS[deptKey];
  return (
    <div style={{ marginLeft:42, marginBottom:16, animation:"chipIn .32s ease both" }}>
      <div style={{ background:"#fff", border:`1.5px solid ${d.color}20`, borderRadius:18, overflow:"hidden", boxShadow:`0 4px 18px ${d.color}10` }}>
        <div style={{ background:`linear-gradient(135deg,${d.color}14,${d.color}07)`, padding:"12px 15px", display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${d.color}12` }}>
          <span style={{ fontSize:24 }}>{d.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#0f172a", fontFamily:"'Syne',sans-serif" }}>{deptKey}</div>
            <div style={{ fontSize:11, color:d.color, marginTop:1 }}>{d.tagline}</div>
          </div>
        </div>
        <div style={{ display:"flex", borderBottom:`1px solid ${d.color}10` }}>
          {d.stats.map(([val,lbl],i) => (
            <div key={i} style={{ flex:1, padding:"9px 0", textAlign:"center", borderRight:i<2?`1px solid ${d.color}10`:"none" }}>
              <div style={{ fontSize:14, fontWeight:800, color:d.color, fontFamily:"'Syne',sans-serif" }}>{val}</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 12px", display:"flex", gap:7, flexWrap:"wrap" }}>
          {Object.entries(DEPT_SUBTOPICS).map(([topic,{icon}]) => (
            <button key={topic} onClick={() => onSubtopic(deptKey, topic)}
              style={{ background:`${d.color}0b`, border:`1.5px solid ${d.color}20`, borderRadius:20, padding:"5px 12px", fontSize:12, color:d.color, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:500, transition:"all .15s", display:"flex", alignItems:"center", gap:5 }}
              onMouseEnter={e=>{e.currentTarget.style.background=d.color;e.currentTarget.querySelector("span").style.color="#fff";e.currentTarget.style.borderColor=d.color;}}
              onMouseLeave={e=>{e.currentTarget.style.background=d.color+"0b";e.currentTarget.querySelector("span").style.color=d.color;e.currentTarget.style.borderColor=d.color+"20";}}>
              <span style={{ color:d.color, transition:"color .15s" }}>{icon} {topic}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubtopicCard({ deptKey, topic }) {
  const d = DEPTS[deptKey];
  const items = DEPT_DETAIL[deptKey]?.[topic] || [];
  return (
    <div style={{ marginLeft:42, marginBottom:16, animation:"chipIn .3s ease both" }}>
      <div style={{ background:"#fff", border:`1.5px solid ${d.color}22`, borderRadius:16, overflow:"hidden", boxShadow:`0 3px 16px ${d.color}10` }}>
        <div style={{ background:`${d.color}0d`, borderBottom:`1px solid ${d.color}14`, padding:"10px 14px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>{DEPT_SUBTOPICS[topic]?.icon}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:d.color }}>{topic}</div>
            <div style={{ fontSize:11, color:"#64748b" }}>{d.icon} {deptKey}</div>
          </div>
        </div>
        <div style={{ padding:"11px 14px" }}>
          {items.map((item,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:i<items.length-1?6:0 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:d.color, flexShrink:0, marginTop:7 }}/>
              <span style={{ fontSize:13, color:"#334155", lineHeight:1.65 }}><RichText text={item} accent={d.color}/></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBar({ theme }) {
  const stats = [["92%","Placed"],["₹42L","Top Pkg"],["350+","Companies"],["A+","NAAC"],["#48","NIRF"],["12K+","Students"]];
  return (
    <div style={{ marginLeft:42, marginBottom:14, display:"flex", gap:8, overflowX:"auto", paddingBottom:2, scrollbarWidth:"none", animation:"chipIn .4s ease both" }}>
      {stats.map(([val,lbl],i) => (
        <div key={i} style={{ flexShrink:0, background:"#fff", border:"1px solid #f1f5f9", borderRadius:12, padding:"9px 13px", textAlign:"center", boxShadow:"0 1px 6px rgba(0,0,0,0.05)", minWidth:70 }}>
          <div style={{ fontSize:14, fontWeight:800, color:theme.accent, fontFamily:"'Syne',sans-serif" }}>{val}</div>
          <div style={{ fontSize:10, color:"#94a3b8", fontWeight:500, marginTop:1 }}>{lbl}</div>
        </div>
      ))}
    </div>
  );
}

function TrendingStrip({ onSelect, theme }) {
  return (
    <div style={{ marginLeft:42, marginBottom:14, animation:"chipIn .42s ease both" }}>
      <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:"0.08em", marginBottom:7 }}>🔥 PEOPLE ASK</div>
      <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:3, scrollbarWidth:"none" }}>
        {TRENDING.map((t,i) => (
          <button key={i} onClick={() => onSelect(t.q)}
            style={{ flexShrink:0, background:"#fff", border:`1.5px solid ${theme.chipBorder}`, borderRadius:20, padding:"6px 13px", fontSize:12, color:theme.chipColor, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", transition:"all .15s" }}
            onMouseEnter={e=>{e.target.style.background=theme.accent;e.target.style.color="#fff";e.target.style.borderColor=theme.accent;}}
            onMouseLeave={e=>{e.target.style.background="#fff";e.target.style.color=theme.chipColor;e.target.style.borderColor=theme.chipBorder;}}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FunFact({ theme }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random()*FUN_FACTS.length));
  useEffect(() => { const id = setInterval(() => setIdx(i => (i+1)%FUN_FACTS.length), 4500); return () => clearInterval(id); }, []);
  return (
    <div style={{ marginLeft:42, marginBottom:14, animation:"chipIn .4s ease both" }}>
      <div style={{ background:theme.accentSoft, border:`1.5px solid ${theme.accent}25`, borderRadius:14, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:theme.accent, letterSpacing:"0.06em", marginBottom:2 }}>DID YOU KNOW?</div>
          <div style={{ fontSize:12.5, color:"#334155", lineHeight:1.55 }}>{FUN_FACTS[idx]}</div>
        </div>
      </div>
    </div>
  );
}

// ── MODE TRANSITION ────────────────────────────────────────────────────────────
function ModeTransition({ show, toTheme, label, onDone }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!show) return;
    setPhase(1);
    const t1 = setTimeout(() => setPhase(2), 380);
    const t2 = setTimeout(() => setPhase(3), 1550);
    const t3 = setTimeout(() => { setPhase(0); onDone(); }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [show]);
  if (!phase) return null;
  return (
    <div style={{ position:"absolute", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", pointerEvents:"all" }}>
      <div style={{ width:64, height:64, borderRadius:"50%", background:toTheme?.grad, position:"absolute",
        transform: phase===3 ? "scale(0)" : "scale(55)",
        opacity: phase===3 ? 0 : 1,
        transition: phase===1 ? "transform .55s cubic-bezier(.25,.46,.45,.94)" : phase===3 ? "transform .4s cubic-bezier(.55,.06,.68,.19),opacity .3s ease" : "none" }}/>
      {phase===2 && (
        <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"labelPop .3s cubic-bezier(.34,1.56,.64,1) both" }}>
          <Mascot mood={toTheme===THEMES.casual?"casual":"formal"} size={64}/>
          <div style={{ fontSize:18, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", marginTop:10 }}>{label}</div>
          <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.75)", marginTop:5 }}>
            {toTheme===THEMES.casual ? "keeping it real with you 🤙" : "switching to professional mode 🎓"}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CollegeChatbot() {
  const [msgs, setMsgs] = useState([]);
  const [tone, setTone] = useState(null);
  const [theme, setTheme] = useState(THEMES.neutral);
  const [pendingTheme, setPendingTheme] = useState(null);
  const [showTransition, setShowTransition] = useState(false);
  const [transLabel, setTransLabel] = useState("");
  const [typing, setTyping] = useState(false);
  const [mascotMood, setMascotMood] = useState("idle");
  const [input, setInput] = useState("");
  const [showClear, setShowClear] = useState(false);
  // FIX #2: activeDept in a ref so it's always current, never null crash
  const activeDeptRef = useRef(null);
  const toneRef = useRef(null);
  const themeRef = useRef(THEMES.neutral);
  const aiHistory = useRef([]);
  const bottom = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);
  useEffect(() => { boot(); }, []);

  const push = useCallback(n => setMsgs(p => [...p, n]), []);
  const getTone = () => toneRef.current || "neutral";

  const tryTone = (text) => {
    if (toneRef.current !== null) return;
    const d = detectTone(text);
    if (!d) return;
    toneRef.current = d;
    setTone(d);
    const nt = THEMES[d];
    themeRef.current = nt;
    // FIX #9: Apply theme immediately, not after transition
    setTheme(nt);
    setPendingTheme(nt);
    setTransLabel(d==="casual" ? "Buddy Mode!" : "Professional Mode!");
    setShowTransition(true);
  };

  const boot = async () => {
    setMascotMood("happy");
    setTyping(true);
    await sleep(400);
    push({ t:"bot", text:"Hey! 👋 Welcome to XYZ College.", mood:"happy" });
    await sleep(600);
    push({ t:"bot", text:"What do you want to know? I'll keep it straight.", mood:"idle" });
    setTyping(false);
    setMascotMood("idle");
    push({ t:"stats" });
    push({ t:"trending" });
    push({ t:"chips", items:MAIN_TOPICS.map(m=>`${m.icon} ${m.label}`), handler:handleMainMenu });
  };

  const callAI = async (text) => {
    aiHistory.current = [...aiHistory.current.slice(-8), { role:"user", content:text }];
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:450, system:buildSystemPrompt(toneRef.current||"neutral"), messages:aiHistory.current })
    });
    const data = await res.json();
    const reply = data.content?.map(b=>b.text||"").join("") || "Something went wrong — try again!";
    aiHistory.current = [...aiHistory.current, { role:"assistant", content:reply }];
    return reply;
  };

  const getInstant = (key) => {
    const t = getTone();
    return QUICK_ANSWERS[key]?.[t] || QUICK_ANSWERS[key]?.neutral;
  };

  // FIX #4: handleMainMenu uses proper key matching, not fragile .includes()
  const handleMainMenu = async (rawLabel) => {
    const label = rawLabel.replace(/^\S+\s/, "").trim(); // strip leading emoji+space
    tryTone(label);
    push({ t:"user", text:rawLabel });
    const key = label.toLowerCase().replace(/\s+/g,"");
    setMascotMood("talking"); setTyping(true); await sleep(300); setTyping(false); setMascotMood("happy");

    const keyMap = { admissions:"admissions", departments:"departments", placements:"placements", scholarships:"scholarships", campuslife:"clubs", about:"about" };
    const matched = keyMap[key];

    if (matched === "departments") {
      push({ t:"bot", text: getTone()==="casual"?"pick your dept 👇":"Select a department:", mood:"happy" });
      push({ t:"dept_scroll" });
    } else if (matched && QUICK_ANSWERS[matched]) {
      push({ t:"bot", text:getInstant(matched), mood:"happy" });
      if (matched === "clubs") push({ t:"fun_fact" });
      push({ t:"chips", items:getFollowUps(matched), handler:handleFree });
    }
    setTimeout(() => setMascotMood("idle"), 900);
  };

  // FIX #1: handleDept does NOT push user message — caller handles it
  const showDept = async (key) => {
    activeDeptRef.current = key;
    const d = DEPTS[key];
    setMascotMood("talking"); setTyping(true); await sleep(280); setTyping(false); setMascotMood("happy");
    const t = getTone();
    push({ t:"bot", text:d.quick[t]||d.quick.neutral, mood:"happy" });
    push({ t:"dept_card", deptKey:key });
    setTimeout(() => setMascotMood("idle"), 900);
  };

  // FIX #2: handleSubtopic checks activeDeptRef before using it
  const showSubtopic = async (deptKey, topic) => {
    // deptKey is always passed explicitly — no null crash
    activeDeptRef.current = deptKey;
    push({ t:"user", text:`${DEPT_SUBTOPICS[topic].icon} ${topic}` });
    setMascotMood("thinking"); setTyping(true);
    // Use static data if available — much faster
    const hasData = DEPT_DETAIL[deptKey]?.[topic]?.length > 0;
    if (!hasData) {
      const reply = await callAI(`Tell me about ${topic} for ${deptKey} dept at XYZ College. Use **bold** for key numbers. Keep it concise.`);
      setTyping(false);
      push({ t:"bot", text:reply, isAI:true, mood:"happy" });
    } else {
      await sleep(250);
      setTyping(false);
      const t = getTone();
      push({ t:"bot", text:t==="casual"?`${topic} in ${deptKey} — here's the full breakdown 👇`:`${topic} details for ${deptKey}:`, mood:"happy" });
      push({ t:"subtopic_card", deptKey, topic });
    }
    setMascotMood("happy");
    const others = Object.keys(DEPT_SUBTOPICS).filter(x => x !== topic);
    push({ t:"chips", items:[...others, "↩ All depts", "🏠 Menu"], handler:(l) => handleNavChip(l, deptKey) });
    setTimeout(() => setMascotMood("idle"), 800);
  };

  // FIX #8: handleNavChip takes deptKey explicitly — no stale ref issues
  const handleNavChip = async (label, deptKey) => {
    const clean = label.replace(/^[^\w]*/,"").trim();
    if (/all dept/i.test(clean)) {
      push({ t:"user", text:"All Departments" });
      setTyping(true); await sleep(250); setTyping(false);
      push({ t:"bot", text: getTone()==="casual"?"all depts 👇":"Here are all departments:", mood:"idle" });
      push({ t:"dept_scroll" });
    } else if (/menu/i.test(clean)) {
      push({ t:"user", text:"Main Menu" });
      setTyping(true); await sleep(250); setTyping(false);
      push({ t:"bot", text: getTone()==="casual"?"back to main 👇":"Back to main menu:", mood:"idle" });
      push({ t:"chips", items:MAIN_TOPICS.map(m=>`${m.icon} ${m.label}`), handler:handleMainMenu });
    } else {
      // It's a subtopic name — deptKey is passed in, never stale
      showSubtopic(deptKey, clean);
    }
  };

  // FIX #1 & #5 & #6: handleFree is THE only entry point that pushes user messages
  // Sub-handlers (showDept, showSubtopic) do NOT push user messages
  const handleFree = async (rawText) => {
    const text = rawText.replace(/^[^\w₹🏠↩]*/,"").trim();
    if (!text) return;
    tryTone(text);

    // Check if it's a navigation chip (no user bubble needed for ↩/🏠)
    const isNav = /↩|🏠/.test(rawText);

    if (!isNav) push({ t:"user", text });

    const intent = matchIntent(text);

    if (intent.type === "instant") {
      // Fast — no API
      setMascotMood("talking"); setTyping(true); await sleep(290); setTyping(false); setMascotMood("happy");
      push({ t:"bot", text:getInstant(intent.key), mood:"happy" });
      const chips = getFollowUps(intent.key);
      if (chips.length) push({ t:"chips", items:chips, handler:handleFree });
      setTimeout(() => setMascotMood("idle"), 800);

    } else if (intent.type === "depts") {
      setTyping(true); await sleep(260); setTyping(false);
      push({ t:"bot", text: getTone()==="casual"?"departments 👇":"Here are all departments:", mood:"idle" });
      push({ t:"dept_scroll" });

    } else if (intent.type === "dept") {
      // FIX #1: showDept doesn't push user message — already done above
      await showDept(intent.key);

    } else {
      // FIX #6: AI receives actual user text, not hardcoded string
      setMascotMood("thinking"); setTyping(true);
      try {
        const reply = await callAI(text);
        setTyping(false); setMascotMood("happy");
        push({ t:"bot", text:reply, isAI:true, mood:"happy" });
        const smartChips = getSmartChips(text);
        if (smartChips.length) push({ t:"chips", items:smartChips, handler:handleFree });
      } catch {
        setTyping(false); setMascotMood("idle");
        push({ t:"bot", text:getTone()==="casual"?"ugh something broke, try again 😅":"An error occurred — please try again.", mood:"idle" });
      }
      setTimeout(() => setMascotMood("idle"), 1000);
    }
  };

  const getSmartChips = (text) => {
    if (/(hostel|room|stay)/i.test(text)) return ["Girls hostel?","Hostel fees?","Day scholar?"];
    if (/(safe|security|women|daughter)/i.test(text)) return ["Anti-ragging?","Women's cell?","Mental health?"];
    if (/(fee|loan|cost|afford)/i.test(text)) return ["Scholarships?","Education loan?","Fee structure?"];
    if (/(placement|job|salary)/i.test(text)) return ["CSE placements?","Average students?","Top companies?"];
    if (/(introvert|shy|sensitive|anxiet|fit in)/i.test(text)) return ["Mental health support","Clubs & activities","Campus community?"];
    if (/(parent|son|daughter|kid|child)/i.test(text)) return ["Campus safety","Hostel details","Academic support?"];
    if (/(which|best|compare|suggest)/i.test(text)) return ["CSE details","ECE details","MBA details","All departments"];
    return ["Tell me more","All departments","🏠 Menu"];
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput(""); handleFree(text);
    inputRef.current?.focus();
  };

  const clearChat = async () => {
    setShowClear(false);
    // Full reset — tone, theme, history all wiped
    toneRef.current = null; themeRef.current = THEMES.neutral;
    activeDeptRef.current = null;
    setTone(null); setTheme(THEMES.neutral);
    aiHistory.current = []; setMsgs([]);
    await sleep(60); boot();
  };

  const th = theme;
  const isC = tone === "casual";

  const render = (node, i) => {
    switch (node.t) {
      case "bot":          return <BotMsg key={i} text={node.text} isAI={node.isAI} theme={th} mood={node.mood}/>;
      case "user":         return <UserMsg key={i} text={node.text} theme={th}/>;
      case "chips":        return <Chips key={i} items={node.items} onSelect={node.handler} theme={th}/>;
      case "dept_scroll":  return <DeptScroll key={i} onSelect={(k) => { push({t:"user",text:`${DEPTS[k].icon} ${k}`}); showDept(k); }}/>;
      case "dept_card":    return <DeptCard key={i} deptKey={node.deptKey} onSubtopic={showSubtopic}/>;
      case "subtopic_card":return <SubtopicCard key={i} deptKey={node.deptKey} topic={node.topic}/>;
      case "stats":        return <StatBar key={i} theme={th}/>;
      case "trending":     return <TrendingStrip key={i} onSelect={handleFree} theme={th}/>;
      case "fun_fact":     return <FunFact key={i} theme={th}/>;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:16, transition:"background 1s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:0px;}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes chipIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bop{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-5px);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes labelPop{from{opacity:0;transform:scale(.8) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes mascotFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes mascotBounce{0%{transform:scale(1)}40%{transform:scale(1.25) translateY(-5px)}100%{transform:scale(1)}}
        @keyframes mascotWiggle{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}
        @keyframes thinkDot{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        input:focus,button:focus{outline:none;}
      `}</style>

      <div style={{ width:"100%", maxWidth:440, height:"88vh", maxHeight:750, borderRadius:24, overflow:"hidden", display:"flex", flexDirection:"column", background:"#f8fafc", position:"relative", boxShadow:"0 24px 64px rgba(0,0,0,.12), 0 0 0 1px rgba(255,255,255,.8)" }}>

        <ModeTransition show={showTransition} toTheme={pendingTheme||th} label={transLabel} onDone={() => setShowTransition(false)}/>

        {/* Header */}
        <div style={{ padding:"12px 15px", background:"#fff", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative" }}>
            <Mascot mood={mascotMood} size={40}/>
            <span style={{ position:"absolute", bottom:1, right:1, width:8, height:8, borderRadius:"50%", background:"#4ade80", border:"2px solid #fff", animation:"pulse 2.5s infinite" }}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#0f172a", fontFamily:"'Syne',sans-serif" }}>XYZ College</div>
            <div style={{ fontSize:11, marginTop:1, display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ color:th.accent, fontWeight:500, transition:"color .5s" }}>{th.label}</span>
              {tone && <span style={{ color:"#e2e8f0", cursor:"pointer", fontSize:10, marginLeft:4 }}
                onClick={() => { toneRef.current=null; themeRef.current=THEMES.neutral; setTone(null); setTheme(THEMES.neutral); }}>· reset</span>}
            </div>
          </div>
          <button onClick={() => setShowClear(true)}
            style={{ width:30, height:30, borderRadius:"50%", background:"#f8fafc", border:"1px solid #f1f5f9", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#cbd5e1", fontSize:12, transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#fee2e2";e.currentTarget.style.color="#ef4444";e.currentTarget.style.borderColor="#fecaca";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#f8fafc";e.currentTarget.style.color="#cbd5e1";e.currentTarget.style.borderColor="#f1f5f9";}}>✕</button>
        </div>

        <div style={{ height:2.5, background:th.grad, transition:"background .6s ease", flexShrink:0 }}/>

        {/* Chat */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 13px 6px" }}>
          {msgs.map((n,i) => render(n,i))}
          {typing && <ThinkDots theme={th}/>}
          <div ref={bottom}/>
        </div>

        {/* Input */}
        <div style={{ padding:"10px 12px 12px", background:"#fff", borderTop:"1px solid #f1f5f9", display:"flex", gap:8, alignItems:"center" }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter") handleSend(); }}
            placeholder={isC ? "ask anything bro…" : "Ask about XYZ College…"}
            style={{ flex:1, border:"1.5px solid #f1f5f9", borderRadius:22, padding:"9px 15px", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#0f172a", background:"#f8fafc", transition:"border .15s, box-shadow .15s" }}
            onFocus={e=>{e.target.style.borderColor=th.accent+"60";e.target.style.boxShadow=`0 0 0 3px ${th.accent}10`;}}
            onBlur={e=>{e.target.style.borderColor="#f1f5f9";e.target.style.boxShadow="none";}}
          />
          <button onClick={handleSend} disabled={!input.trim()||typing}
            style={{ width:38, height:38, borderRadius:"50%", border:"none", background:!input.trim()||typing?"#f1f5f9":th.grad, cursor:!input.trim()||typing?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s", boxShadow:!input.trim()||typing?"none":`0 4px 12px ${th.accent}40` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={!input.trim()||typing?"#cbd5e1":"white"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Clear modal */}
      {showClear && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.45)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, animation:"msgIn .2s ease both" }}>
          <div style={{ background:"#fff", borderRadius:20, padding:24, maxWidth:285, width:"90%", textAlign:"center", boxShadow:"0 24px 60px rgba(0,0,0,.2)" }}>
            <Mascot mood="thinking" size={52}/>
            <div style={{ fontSize:15, fontWeight:800, color:"#0f172a", marginTop:12, marginBottom:6, fontFamily:"'Syne',sans-serif" }}>{isC?"clear everything?":"Clear conversation?"}</div>
            <div style={{ fontSize:12.5, color:"#94a3b8", lineHeight:1.6, marginBottom:18 }}>{isC?"resets chat + vibe detection 🔄":"Resets chat and tone detection from scratch."}</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>setShowClear(false)} style={{ flex:1, padding:"9px 0", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:12, fontSize:13, color:"#64748b", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{isC?"nah":"Cancel"}</button>
              <button onClick={clearChat} style={{ flex:1, padding:"9px 0", background:"linear-gradient(135deg,#ef4444,#dc2626)", border:"none", borderRadius:12, fontSize:13, color:"#fff", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{isC?"yep":"Clear"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
