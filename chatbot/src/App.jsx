import { useState, useRef, useEffect, useCallback } from "react";

const CASUAL_RE = /\b(bro|yo|sup|wassup|hey|lol|omg|dude|bruh|ngl|tbh|fr|lowkey|haha|lmao|fam|yoo|heyy|mann|yaar|da|machan|anna|bhai|wanna|gonna|idk|imo|rn|kya|chill|aye|pls|plz)\b/i;
const FORMAL_RE = /\b(hello|good (morning|afternoon|evening)|i would like|could you|please|regarding|kindly|dear|sir|madam|i am interested|i wish to|may i|greetings|i require|enquir)\b/i;
const detectTone = (t) => CASUAL_RE.test(t) ? "casual" : FORMAL_RE.test(t) ? "formal" : null;

const TH = {
  neutral: { grad:"linear-gradient(135deg,#6366f1,#818cf8)", accent:"#6366f1", soft:"#eef2ff", user:"linear-gradient(135deg,#6366f1,#4f46e5)", chipBd:"#e0e7ff", chipClr:"#6366f1", dot:"#a5b4fc" },
  casual:  { grad:"linear-gradient(135deg,#f97316,#ef4444)", accent:"#f97316", soft:"#fff7ed", user:"linear-gradient(135deg,#f97316,#ef4444)", chipBd:"#fed7aa", chipClr:"#ea580c", dot:"#fb923c" },
  formal:  { grad:"linear-gradient(135deg,#1e3a5f,#1e40af)", accent:"#1e40af", soft:"#dbeafe", user:"linear-gradient(135deg,#1e3a5f,#1e40af)", chipBd:"#bfdbfe", chipClr:"#1e40af", dot:"#93c5fd" },
};

// REAL RVCE DATA from rvce.edu.in + verified sources
const QA = {
  admissions: {
    casual: `okay RVCE admissions — real talk 📋\n\n**Karnataka students (KCET):**\n• Appear for KCET (April 22, 2026)\n• Apply on KEA website after results\n• Fees only **~₹1.21L/year** (government quota — killer deal)\n\n**Non-Karnataka / All India (COMEDK):**\n• COMEDK UGET: **May 9, 2026** | Register by March 16\n• Fees **~₹3L/year**\n\n**Management quota:** Direct, based on 10+2 marks, ~₹2L/yr\n\nEligibility: 10+2 PCM, minimum **45%** marks`,
    formal:  `RVCE Admission Process 2026:\n\n**KCET (Karnataka Government Quota):**\n• KCET 2026 Exam: April 22, 2026\n• Apply via KEA (kea.kar.nic.in)\n• Annual fees: **~₹1.21 Lakhs** (highly subsidised)\n\n**COMEDK UGET (All-India Merit Quota):**\n• Exam Date: May 9, 2026 | Registration closes: March 16, 2026\n• Annual fees: **~₹3 Lakhs**\n\n**Eligibility:** 10+2 with PCM, minimum **45%** marks (40% for SC/ST)\n**Management quota** also available — contact RVCE admissions cell directly`,
    neutral: `RVCE Admissions:\n\n• **KCET 2026** (Karnataka): April 22 | Fees **~₹1.21L/yr** ✅\n• **COMEDK UGET** (All India): May 9 | Fees **~₹3L/yr**\n• **Management quota** — direct admission via RVCE\n• Eligibility: 10+2 PCM with **45%+** marks 📋`,
  },
  placements: {
    casual: `RVCE placements slap fr 🚀\n\n• **₹92 LPA** — highest ever (2025)\n• **₹15.2 LPA** — overall average B.E. 2025\n• **831 students placed** | **262 companies** visited\n• CSE specifically: avg **₹28.1 LPA**, **~100%** placed 🔥\n\nGoogle, Microsoft, Amazon, Goldman Sachs, Uber all come here every year\n\nBangalore location is a massive cheat code — **5,000+ companies** within hiring distance`,
    formal:  `RVCE Placement Statistics (2025):\n\n• Highest Package: **₹92 LPA**\n• B.E. Average Package: **₹15.2 LPA**\n• Students Placed: **831 UG students**\n• Companies Visited: **262**\n• Total Offers Made: **1,009+**\n\n**2026 (ongoing):** Highest ₹67 LPA, Average ₹16.86 LPA, 192 companies\n\nTop Recruiters: Google, Microsoft, Amazon, Adobe, Uber, Cisco, Goldman Sachs, Deloitte, Intel, Samsung, Flipkart, L&T`,
    neutral: `RVCE Placements 2025:\n\n• Highest: **₹92 LPA** | Average B.E.: **₹15.2 LPA**\n• **831 students placed** | **262 companies** | **1,009 offers**\n• CSE average: **₹28.1 LPA** 🔥\n• Bangalore = 5,000+ companies in hiring radius 🚀`,
  },
  fees: {
    casual: `fees — here's where it gets real 💸\n\n**KCET (Karnataka, best deal):**\n• **~₹1.21L/year** | Total 4 yrs: **~₹5.30L** 👏\n\n**COMEDK (All India):**\n• **~₹3L/year** | Total 4 yrs: **~₹12L**\n\n**Management quota:**\n• **~₹2–2.08L/year** | Total: ~₹8L\n\n**Hostel:** **₹80K–1.2L/year** (includes 4 meals/day + WiFi + gym)\n\nFor COMEDK students — ₹12L for ₹28L avg salary (CSE) is insane ROI ngl`,
    formal:  `RVCE Fee Structure:\n\n• **KCET (Govt Quota):** ~₹1.21L/year | Total ~₹5.30L (4 yrs)\n• **COMEDK:** ~₹3L/year | Total ~₹12L (4 yrs)\n• **Management Quota:** ~₹2–2.08L/year | Total ~₹8L (4 yrs)\n• **M.Tech:** ~₹1.5L/year | **MCA:** ~₹1.5L/year\n• **Hostel:** ₹80,000–1,20,000/year (meals, WiFi, gym included)\n\nEducation loans available through SBI, Canara Bank, Indian Bank via RVCE`,
    neutral: `RVCE Fees:\n\n• KCET: **~₹1.21L/yr** (total ~₹5.3L) ✅\n• COMEDK: **~₹3L/yr** (total ~₹12L)\n• Management: **~₹2L/yr** (total ~₹8L)\n• Hostel: **₹80K–1.2L/yr** (4 meals + WiFi + gym) 💳`,
  },
  hostel: {
    casual: `hostel at RVCE 🏠\n\n• **5 boys blocks** (on-campus) + **2 girls blocks** (on/off-campus)\n• **4 meals/day** — breakfast, lunch, snacks, dinner in mess\n• WiFi in all blocks · CCTV throughout · Wardens every floor\n• Gym included in hostel fee, medical facility on campus\n• Cost: **₹80K–1.2L/year** all inclusive\n\nFood quality reviews are mixed ngl but basics are fully covered`,
    formal:  `RVCE Hostel Facilities:\n\n• **7 hostel blocks** — 5 for boys (on-campus), 2 for girls (on/off-campus)\n• **4 meals per day** — central mess with vegetarian & non-vegetarian options\n• Campus-wide WiFi connectivity, 24/7 CCTV surveillance\n• Dedicated wardens on each floor\n• Gymnasium access included in hostel fee\n• 24/7 medical facility on campus\n• Annual fees: **₹80,000–1,20,000** (fully inclusive)`,
    neutral: `RVCE Hostels:\n\n• 7 blocks — **5 boys** (on-campus), **2 girls**\n• **4 meals/day** | WiFi | CCTV | Wardens | Gym\n• Fee: **₹80K–1.2L/yr** (all inclusive) 🏠`,
  },
  safety: {
    casual: `safety at RVCE — solid overall 🛡️\n\n• **Zero-tolerance anti-ragging** — committee is active, not just paperwork\n• Anonymous complaint portal on rvce.edu.in\n• **Internal Complaints Committee (ICC)** for women's concerns\n• Girls' hostel separate, dedicated warden + CCTV\n• **Every student gets a faculty mentor** from Day 1 — personal point of contact\n• Campus dispensary for medical emergencies\n\nCulture is academically focused. Not a rowdy campus`,
    formal:  `Campus Safety at RVCE:\n\n• **Anti-Ragging:** Zero-tolerance policy. Active committee. Anonymous complaint portal on rvce.edu.in\n• **Women's Safety:** Separate women's hostel. Dedicated wardens. Internal Complaints Committee (ICC) operational\n• **Medical:** Campus dispensary available round the clock\n• **Mentoring:** Every student assigned a dedicated faculty mentor from Semester 1\n• **CCTV:** Surveillance across campus and all hostel blocks\n• **Environment:** Autonomous academic institution with structured, disciplined culture`,
    neutral: `Safety at RVCE:\n\n• **Zero-tolerance anti-ragging** — active committee + anonymous portal\n• Girls' hostel with dedicated wardens + CCTV\n• ICC (Internal Complaints Committee) operational\n• **Faculty mentor** assigned to every student from Day 1\n• Campus dispensary 24/7 🛡️`,
  },
  rankings: {
    casual: `RVCE rankings — honest version 📊\n\n• **NIRF 2024:** Rank **99** (Engineering)\n• **NIRF 2025:** **101–150 band** (slight dip, still top nationally)\n• **IIRF 2025:** **#1 private engineering college in India** 🏆\n• **The Week 2025:** Rank **33** | **Outlook 2025:** Rank **7** in Karnataka\n\nFor private colleges in Karnataka — RVCE is literally the name fr`,
    formal:  `RVCE Rankings Summary:\n\n• **NIRF Engineering 2024:** Rank **99**\n• **NIRF Engineering 2025:** **101–150 band**\n• **IIRF 2025:** **#1 Private Engineering College in India**\n• **The Week 2025:** Rank **33** | **Outlook 2025:** Rank **7** in Karnataka\n• **Bangalore Position:** Consistently #1 private engineering institution`,
    neutral: `RVCE Rankings:\n\n• **NIRF 2024:** Rank **99** | **2025:** 101–150 band\n• **IIRF 2025:** **#1 private engineering college in India** 🏆\n• **The Week 2025:** Rank **33** | **Outlook:** #7 in Karnataka`,
  },
  scholarships: {
    casual: `scholarships at RVCE 🏆\n\n**Free government money:**\n• SC/ST scholarship (Karnataka govt)\n• OBC/Minority scholarships\n• PMSSS — PM Special Scholarship Scheme\n• NSP portal (national scholarships)\n\n**College trust (RSST) scholarships:**\n• Vidhya Siri, Vidhya Saarthi — merit + income based\n\n**External:**\n• Corporate: Infosys, TCS, Google scholarships\n• NGO + alumni-funded ones\n\nStrict eligibility — need income proof + marks. Check rvce.edu.in for deadlines`,
    formal:  `RVCE Scholarship Options:\n\n**Government Scholarships:**\n• SC/ST — Karnataka Government scholarship\n• OBC/Minority — State and Central government\n• PMSSS — PM Special Scholarship Scheme (J&K / NE students)\n• NSP — National Scholarship Portal\n\n**RSST Trust Scholarships:**\n• Vidhya Siri, Vidhya Saarthi (merit-cum-means based)\n\n**External Scholarships:**\n• Corporate: Infosys Foundation, TCS, Google\n• NGO and alumni-funded scholarships\n\nApply through RVCE scholarship portal. Income proof + academic records required.`,
    neutral: `Scholarships at RVCE:\n\n• **Govt:** SC/ST, OBC, PMSSS, NSP portal\n• **College Trust:** Vidhya Siri, Vidhya Saarthi (merit-cum-means)\n• **External:** Corporate (Infosys, TCS, Google) + NGO scholarships\n• **Education loans** via SBI, Canara, Indian Bank 🏆`,
  },
  cutoffs: {
    casual: `RVCE cutoffs 2025 — straight facts 📊\n\n**KCET (General Merit, Round 1):**\n• CSE: **234–499** (brutal competition)\n• ISE: ~360–600 · ECE: ~800–1500\n• Mechanical: ~3000–7000 · Biotech: **~8000–12000**\n• Civil: ~9000–17000 (most accessible)\n\n**COMEDK (General Merit):**\n• CSE: **307–542** · ECE: ~1500–4000\n• Biotech: ~12000–18000\n\nHyderabad-Karnataka region gets relaxed cutoffs. SC/ST category even more relaxed`,
    formal:  `RVCE Branch-wise Cutoff Ranks 2025:\n\n**KCET (General Merit):**\n• CSE: **234–499** | ISE: ~360–600 | ECE: ~800–1500\n• EEE: ~2000–5000 | Mechanical: ~3000–7000\n• Biotechnology: **~8000–12000** | Civil: ~9000–17000\n\n**COMEDK UGET (General):**\n• CSE: **307–542** | ECE: ~1500–4000 | Biotech: ~12000–18000\n• Overall COMEDK range: **310–18,500**\n\nManagement quota seats available beyond these ranks. Reserved category cutoffs are significantly relaxed.`,
    neutral: `RVCE Cutoffs 2025:\n\n**KCET:** CSE **234–499** | ECE ~800–1500 | Biotech ~8000–12000\n**COMEDK:** CSE **307–542** | ECE ~1500–4000\n\nManagement quota available if rank isn't enough 📊`,
  },
  location: {
    casual: `location is low-key RVCE's secret weapon 📍\n\n• Mysore Road, Bangalore — **13 km from city center**\n• India's Silicon Valley = **5,000+** companies within recruiting range\n• BMTC buses connect campus · Rajarajeshwari depot **7 km away**\n• Kempegowda (main) bus station **13 km**\n• Metro corridor on Mysore Road under development\n• Surrounding area: safe, suburban, well-connected`,
    formal:  `RVCE Location Details:\n\n• **Address:** RV Vidyaniketan Post, Mysore Road, Bengaluru – 560059\n• **Distance:** 13 km from Bangalore city center\n• **Strategic Advantage:** Bengaluru's Silicon Valley — 5,000+ tech & core companies within hiring radius\n• **Transport:** BMTC bus network, Rajarajeshwari depot 7 km, Kempegowda station 13 km\n• **Metro:** Mysore Road corridor under active development`,
    neutral: `RVCE Location:\n\n• Mysore Road, Bengaluru — **13 km from city center**\n• India's Silicon Valley → **5,000+ companies** in hiring radius\n• BMTC buses | Rajarajeshwari depot 7 km | Metro incoming 📍`,
  },
  campus: {
    casual: `campus life at RVCE 🎓\n\n• **73 computer labs**, **155+ departmental labs**, smart classrooms\n• Library: **1.24 lakh books** + IEEE/Springer digital journals\n• **40+ clubs** — coding, robotics, IEEE, NSS, NCC, music, drama, dance\n• **8th Mile** — annual techno-cultural fest, one of Bangalore's biggest 🎉\n• Cricket, football, basketball, badminton, tennis, gym\n• WiFi across campus, banking on campus, canteens + food courts\n• Major construction for new sports complex ongoing`,
    formal:  `RVCE Campus Facilities:\n\n• **Labs:** 73 computer labs, 155+ departmental labs across all disciplines\n• **Classrooms:** 90% multimedia-enabled smart classrooms\n• **Library:** 1,24,708 volumes + IEEE/Springer/Elsevier digital subscriptions\n• **Clubs:** 40+ technical and cultural clubs — IEEE Student Branch, SAE, NSS, NCC, Robotics\n• **Sports:** Cricket, football, basketball, badminton, tennis courts, indoor gym\n• **Annual Fest:** '8th Mile' — RVCE's signature techno-cultural festival\n• **Other:** Campus WiFi, banking, dispensary, multiple canteens`,
    neutral: `RVCE Campus Life:\n\n• **73 computer labs** | **1.24L library volumes** + digital access\n• **40+ clubs** | **'8th Mile'** — Bangalore's biggest college fest 🎉\n• Cricket, football, basketball, tennis, gym\n• Smart classrooms, campus WiFi, banking on campus 🎓`,
  },
  about: {
    casual: `RVCE in a nutshell 🏛️\n\n• Est. **1963** by RSST Trust — **62 years** running\n• **NAAC A+** · NIRF **99** (2024) · IIRF **#1** private engg college India\n• **15 departments**, **35+ courses** — UG, PG, Doctoral\n• **VTU affiliated**, autonomous since **2007** (design own curriculum)\n• Campus: **16.85 acres**, Mysore Road, Bangalore\n• In India's tech capital — massive placement edge\n• **30,000+ alumni** globally · **60+ international collaborations**`,
    formal:  `About R.V. College of Engineering (RVCE):\n\n• **Established:** 1963 by Rashtreeya Sikshana Samithi Trust (RSST)\n• **Accreditation:** NAAC A+ (2024), NBA (multiple programs), AICTE approved, UGC recognized\n• **Rankings:** NIRF Rank 99 (2024), IIRF #1 Private Engineering College in India\n• **Affiliation:** VTU, Belagavi — Autonomous since 2007 (UG), 2016 (PG)\n• **Campus:** 16.85 acres, Mysore Road, Bengaluru\n• **Scale:** 15 departments, 35+ programs, 6,500+ annual intake\n• **Legacy:** 62 years of excellence, 30,000+ global alumni, 60+ international collaborations`,
    neutral: `About RVCE:\n\n• Est. **1963** | **NAAC A+** | **NIRF 99** (2024) | **62-year** legacy\n• **15 departments**, **35+ courses** | VTU affiliated, autonomous since 2007\n• **16.85-acre** campus on Mysore Road, Bangalore 🏛️`,
  },
  mentalhealth: {
    casual: `mental health support at RVCE 💙\n\n• **Student Counseling Cell** — professional counselors on campus\n• **Faculty mentor system** — every student gets a personal mentor from Sem 1\n• Can talk about academic pressure, personal stuff, anything\n• NSS and peer support programs by student volunteers\n• Career counseling from Placement Cell from Sem 3\n\nengineering is intense. don't push through alone — these systems exist for a reason`,
    formal:  `Student Support & Mental Health at RVCE:\n\n• **Counseling Cell:** Professional counselors available on campus\n• **Faculty Mentoring:** Every student is assigned a dedicated faculty mentor from Semester 1 for academic and personal guidance\n• **Career Counseling:** Training & Placement Cell provides structured career guidance from Semester 3\n• **Peer Support:** NSS student volunteers and structured peer programs\n• **Scope:** Academic guidance, personal wellbeing, career planning`,
    neutral: `Mental Health Support at RVCE:\n\n• **Counseling cell** with professional counselors on campus\n• **Faculty mentor** assigned to every student from Day 1\n• NSS peer support programs\n• Career counseling from Semester 3 💙`,
  },
  biotech: {
    casual: `RVCE Biotech — the full story 🧬\n\n• **NBA accredited** · VTU Research Center · **Centre of Excellence in Computational Genomics**\n• **3,067 sq meter** dept spread — serious labs\n• Programs: **B.E. (60 seats)** · **M.Tech Biotech (18)** · **M.Tech Bioinformatics (18)** · Ph.D\n• Placements: **77% placed**, avg **₹9.28 LPA**, top **₹14.81 LPA**\n• Recruiters: Biocon, Syngene, AstraZeneca, Dr. Reddy's, Thermo Fisher, GSK\n• **~25–30%** go for MS/PhD abroad\n• KCET cutoff: **~8000–12000** — way less competitive than CSE`,
    formal:  `RVCE Department of Biotechnology:\n\n• **Accreditation:** NBA (accredited 2008–13, reaccredited 2015–2021) | VTU Research Center\n• **Infrastructure:** 3,067.69 sq. meters | Centre of Excellence in Computational Genomics (2018)\n• **Programs:** B.E. (**60 seats**) | M.Tech Biotechnology (**18 seats**) | M.Tech Bioinformatics (**18 seats**) | Ph.D\n• **Placements 2025:** 77% placed | Avg **₹9.28 LPA** | Highest **₹14.81 LPA**\n• **Top Recruiters:** Biocon, Syngene International, AstraZeneca, Dr. Reddy's, GSK, Thermo Fisher, Jubilant Biosys\n• **Higher Studies:** ~25–30% pursue MS/PhD abroad\n• **KCET Cutoff:** ~8,000–12,000 (General Merit)`,
    neutral: `RVCE Biotechnology:\n\n• NBA accredited | VTU Research Center | **Centre of Excellence in Computational Genomics**\n• **B.E. 60 seats** | **M.Tech Biotech 18 seats** | **M.Tech Bioinformatics 18 seats** | Ph.D\n• Placements: **77% placed** | Avg **₹9.28 LPA** | Top **₹14.81 LPA**\n• Biocon, Syngene, AstraZeneca, Dr. Reddy's, Thermo Fisher recruit 🧬`,
  },
  cse: {
    casual: `CSE at RVCE is THE department honestly 💻\n\n• **~100%** placed every year consistently\n• Avg package: **₹28.1 LPA** (not a typo)\n• Highest: **₹92 LPA** (2025) — from Google\n• KCET cutoff: **234–499** (Karnataka's most competitive private seat)\n• Google, Microsoft, Amazon, Adobe, Goldman Sachs recruit every year\n• Autonomous curriculum with AI/ML, Cybersecurity, Cloud specializations\n• Bangalore location = internship + off-campus opportunities non-stop`,
    formal:  `CSE Department at RVCE:\n\n• **Placements:** ~100% placed annually | Avg **₹28.1 LPA** | Highest **₹92 LPA** (2025, Google)\n• **Recruiters:** Google, Microsoft, Amazon, Adobe, Uber, Cisco, Goldman Sachs, Flipkart, Intel, Samsung\n• **KCET Cutoff:** 234–499 (most competitive seat in Karnataka private engineering)\n• **Programs:** B.E. CSE with specializations — AI & ML, Data Science, Cybersecurity\n• **Curriculum:** Autonomous, updated annually with industry inputs\n• **Bangalore advantage:** 5,000+ companies within immediate hiring radius`,
    neutral: `CSE at RVCE:\n\n• **~100% placed** | Avg **₹28.1 LPA** | Highest **₹92 LPA** 🔥\n• KCET cutoff: **234–499** (very competitive)\n• Google, Microsoft, Amazon, Goldman Sachs recruit annually\n• AI/ML, Cybersecurity, Cloud specializations 💻`,
  },
};

const BIOTECH_DETAIL = {
  "Placements": [
    `Overall placement rate: **77%** (NIRF 2024 data)`,
    `Average package 2025: **₹9.28 LPA**`,
    `Highest package 2025: **₹14.81 LPA**`,
    `Top recruiters: Biocon, Syngene International, AstraZeneca, Dr. Reddy's, Thermo Fisher, GSK, Jubilant Biosys, Eurofins, Strand Life Sciences`,
    `Career paths: Research Scientist, Bioprocess Engineer, Bioinformatics Analyst, Clinical Research, Quality Control, Patent Analyst`,
    `Higher Studies: **~25–30%** pursue MS/PhD (USA, Germany, Canada, Australia, UK)`,
    `GATE guidance provided in-house — strong IISc/IIT pipeline`,
  ],
  "Labs & Research": [
    `Department spread: **3,067.69 sq. meters** — serious dedicated infrastructure`,
    `Biochemistry & Microbiology Lab | Downstream Processing Lab`,
    `Bioinformatics & Computational Biology Lab | Fermentation Technology Lab`,
    `Cell Culture & Tissue Engineering Lab | Molecular Biology Lab`,
    `Analytical Instrumentation Lab | Bioprocess Engineering Lab`,
    `**Centre of Excellence in Computational Genomics** (established 2018)`,
    `Research funding from **DBT, DST, ICMR, SERB** — active projects running`,
    `**50+ publications/year** | Active patent applications in drug delivery`,
  ],
  "Programs": [
    `B.E. Biotechnology — **60 seats** · 4 years · Autonomous since 2007`,
    `Eligibility: 10+2 with PCM/PCB + Chemistry`,
    `KCET fees: **~₹1.21L/yr** | COMEDK fees: **~₹3L/yr**`,
    `M.Tech Biotechnology — **18 seats** · 2 years · Started 2011`,
    `M.Tech Bioinformatics — **18 seats** · 2 years · Started 2012`,
    `Both M.Tech programs autonomous since 2016`,
    `Ph.D under VTU Research Center — active research scholars`,
  ],
  "Industry Links": [
    `MoU Partners: Biocon Limited, Syngene International, Jubilant Biosys, Anthem Biosciences`,
    `Mandatory internship in Semesters 7–8 — strong pharma corridor access`,
    `Bangalore's biotech corridor is among India's strongest — Biocon, Strides, Syngene all nearby`,
    `Guest lectures from executives at Biocon, Syngene, GSK, AstraZeneca`,
    `RVCE Innovation Centre supports biotech student startups`,
    `BIOME — annual departmental biotechnology symposium`,
  ],
  "Pros & Cons": [
    `✅ NBA accredited — quality and curriculum are verified`,
    `✅ Centre of Excellence in Computational Genomics`,
    `✅ Strong MS/PhD abroad pathway (~25–30% go abroad)`,
    `✅ Growing Bangalore pharma/biotech corridor — Biocon, Syngene, Strides nearby`,
    `✅ KCET cutoff ~8,000–12,000 — significantly more accessible than CSE`,
    `✅ VTU Research Center — active funded research from Sem 5`,
    `⚠️ Average salary (~₹9.28L) is lower than CS branches (~₹28L)`,
    `⚠️ Fewer companies visit compared to CSE/ECE — more niche`,
    `⚠️ Needs genuine interest in biology and chemistry`,
    `⚠️ Not ideal if goal is software jobs — better off in CSE/ISE`,
  ],
};

const DEPTS = {
  CSE:       { icon:"💻", color:"#6366f1", bg:"#eef2ff", tagline:"AI · Cloud · Full-Stack",  stats:[["~100%","placed"],["₹92L","top"],["₹28.1L","avg"]], qaKey:"cse" },
  ISE:       { icon:"🖥️", color:"#7c3aed", bg:"#f5f3ff", tagline:"InfoSec · ML · DevOps",   stats:[["~98%","placed"],["₹92L","top"],["₹24L","avg"]], qaKey:null },
  ECE:       { icon:"📡", color:"#0891b2", bg:"#ecfeff", tagline:"VLSI · 5G · Embedded",     stats:[["~90%","placed"],["₹45L","top"],["₹12L","avg"]], qaKey:null },
  EEE:       { icon:"⚡", color:"#dc2626", bg:"#fef2f2", tagline:"Power · Control · Drives", stats:[["~82%","placed"],["₹18L","top"],["₹8L","avg"]], qaKey:null },
  Mechanical:{ icon:"⚙️", color:"#d97706", bg:"#fffbeb", tagline:"CAD · Thermal · Mercedes", stats:[["~80%","placed"],["₹20L","top"],["₹7L","avg"]], qaKey:null },
  Civil:     { icon:"🏗️", color:"#059669", bg:"#f0fdf4", tagline:"Infra · GIS · Structures",  stats:[["~75%","placed"],["₹12L","top"],["₹6L","avg"]], qaKey:null },
  Aerospace: { icon:"✈️", color:"#0f172a", bg:"#f8fafc", tagline:"Aero · ISRO · Defence",    stats:[["~78%","placed"],["₹15L","top"],["₹7L","avg"]], qaKey:null },
  Chemical:  { icon:"⚗️", color:"#9333ea", bg:"#faf5ff", tagline:"Process · Pharma · R&D",   stats:[["~70%","placed"],["₹12L","top"],["₹6L","avg"]], qaKey:null },
  Biotech:   { icon:"🧬", color:"#059669", bg:"#ecfdf5", tagline:"Genomics · Pharma · Biocon",stats:[["77%","placed"],["₹14.8L","top"],["₹9.28L","avg"]], qaKey:"biotech", isFull:true },
  MBA:       { icon:"📊", color:"#be185d", bg:"#fdf2f8", tagline:"Finance · Mktg · Strategy", stats:[["~90%","placed"],["₹20L","top"],["₹10L","avg"]], qaKey:null },
};

const MAIN_TOPICS = [
  { label:"Admissions",  icon:"📋", key:"admissions" },
  { label:"Departments", icon:"🏛️", key:"depts"      },
  { label:"Placements",  icon:"💼", key:"placements" },
  { label:"Fees",        icon:"💰", key:"fees"        },
  { label:"Scholarships",icon:"🏆", key:"scholarships"},
  { label:"Campus Life", icon:"🎓", key:"campus"      },
  { label:"Hostel",      icon:"🏠", key:"hostel"      },
  { label:"About RVCE",  icon:"ℹ️",  key:"about"      },
];

const TRENDING = [
  { label:"CSE vs ECE — honest?",         q:"Compare CSE and ECE at RVCE honestly, pros and cons" },
  { label:"KCET rank for RVCE CSE?",       q:"What KCET rank do I need to get CSE at RVCE?" },
  { label:"Is RVCE worth COMEDK fees?",    q:"Is RVCE worth the higher COMEDK fees?" },
  { label:"Girls safety & hostel?",        q:"Is RVCE safe for girl students? Tell me about girls hostel" },
  { label:"Average student placements?",   q:"What about placements for average students at RVCE, not just toppers?" },
  { label:"RVCE Biotech — good choice?",   q:"Tell me about Biotechnology at RVCE — is it a good choice?" },
  { label:"Fees + education loan?",        q:"RVCE fees and education loan options?" },
  { label:"Shy kid — will they fit in?",   q:"My child is introverted and shy, will they fit in at RVCE?" },
];

const FUN_FACTS = [
  "🚀 RVCE placed students at ₹92 LPA in 2025 — highest in college history!",
  "🏆 IIRF 2025 ranked RVCE #1 private engineering college in India",
  "🧬 RVCE Biotech has a Centre of Excellence in Computational Genomics (est. 2018)",
  "📚 Library holds 1,24,708 volumes + IEEE/Springer/Elsevier digital access",
  "🎉 '8th Mile' — one of Bangalore's biggest annual techno-cultural fests",
  "⚡ Mercedes-Benz R&D actively recruits from RVCE Mechanical dept",
  "💡 25+ Centres of Excellence across research domains",
  "✈️ One of India's few private colleges with an Aerospace Engineering department",
  "🌍 60+ international academic collaborations globally",
  "🏛️ Est. 1963 — 62 unbroken years of engineering excellence in Bangalore",
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const matchIntent = (text) => {
  const t = text.toLowerCase();
  if (/(admission|apply|eligib|how to get in|selection|join rvce|get into rvce)/i.test(t)) return { type:"qa", key:"admissions" };
  if (/(placement|placed|job|package|salary|recruit|lpa|hire)/i.test(t) && !/biotech|cse|ece|specific/i.test(t)) return { type:"qa", key:"placements" };
  if (/(fee|cost|how much|tuition|afford|price|payment)/i.test(t)) return { type:"qa", key:"fees" };
  if (/(hostel|room|stay|accommodation|dorm|mess)/i.test(t)) return { type:"qa", key:"hostel" };
  if (/(safe|security|ragging|women|daughter|girl student)/i.test(t)) return { type:"qa", key:"safety" };
  if (/(scholarship|waiver|stipend|financial aid)/i.test(t)) return { type:"qa", key:"scholarships" };
  if (/(rank|nirf|naac|accredit|ranking)/i.test(t)) return { type:"qa", key:"rankings" };
  if (/(cutoff|cut.off|rank needed|kcet rank|comedk rank)/i.test(t)) return { type:"qa", key:"cutoffs" };
  if (/(location|address|where|mysore road|distance|transport|bus|metro)/i.test(t)) return { type:"qa", key:"location" };
  if (/(campus|club|sport|fest|8th mile|library|gym|infrastructure|life)/i.test(t)) return { type:"qa", key:"campus" };
  if (/(about|history|established|founded|overview|what is rvce)/i.test(t)) return { type:"qa", key:"about" };
  if (/(mental|psycholog|counsel|stress|anxiet|pressure)/i.test(t)) return { type:"qa", key:"mentalhealth" };
  if (/(biotech|biotechnology)/i.test(t)) return { type:"dept", key:"Biotech" };
  if (/(^cse|computer science)/i.test(t)) return { type:"qa", key:"cse" };
  if (/(department|all dept|all branch|which dept)/i.test(t)) return { type:"depts" };
  for (const k of Object.keys(DEPTS)) {
    if (t.includes(k.toLowerCase())) return { type:"dept", key:k };
  }
  return { type:"ai" };
};

const followUps = (key, isC) => ({
  admissions:   [isC?"KCET cutoff?":"KCET Cutoff Ranks","COMEDK fees?","Documents needed?","Scholarships?"],
  placements:   ["CSE placements?","Biotech placements?","Average student placed?","Top companies?"],
  fees:         ["Scholarships?","Education loan?","Hostel cost?","KCET vs COMEDK value?"],
  hostel:       ["Girls hostel safety?","Hostel fees breakdown?","Day scholar option?"],
  safety:       ["Anti-ragging details?","Girls hostel security?","Mental health?"],
  scholarships: ["How to apply?","Income criteria?","Education loan?"],
  rankings:     ["Placement data?","Why RVCE over MSRIT?","Campus life?"],
  cutoffs:      ["Biotech cutoff?","CSE cutoff?","Management quota?"],
  campus:       ["Clubs list?","8th Mile fest?","Sports facilities?"],
  about:        ["Departments?","Placements?","Campus life?"],
  mentalhealth: ["Is it confidential?","Faculty mentor?","Counseling availability?"],
  biotech:      ["Biotech placements?","Biotech labs?","MS abroad from Biotech?","Biotech vs CSE?"],
  cse:          ["CSE placements?","CSE cutoff?","AI/ML at RVCE?"],
  location:     ["Transport options?","Nearby areas?","Hostel vs Day scholar?"],
}[key] || ["Tell me more","All Departments","🏠 Main Menu"]);

function RichText({ text, accent }) {
  if (!text) return null;
  return <>{text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**"))
      return <strong key={i} style={{ fontWeight:700, color:accent }}>{seg.slice(2,-2)}</strong>;
    return seg.split(/(₹[\d,.]+\s*(?:LPA|L|K|Cr)?|\d+(?:\.\d+)?%|\d+\+(?:\s*\w+)?)/gi).map((s,j) =>
      /(₹|%|\d+\+)/.test(s) && s.trim()
        ? <strong key={`${i}-${j}`} style={{ fontWeight:700, color:accent }}>{s}</strong>
        : <span key={`${i}-${j}`}>{s}</span>
    );
  })}</>;
}

function Mascot({ mood="idle", size=40 }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const id = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 130); }, 3200 + Math.random()*2000);
    return () => clearInterval(id);
  }, []);
  const c = { idle:"#6366f1",casual:"#f97316",formal:"#1e3a5f",talking:"#8b5cf6",happy:"#059669",thinking:"#6366f1" }[mood]||"#6366f1";
  const eyeRy = blink ? 0.4 : 3.5, eyeY = blink ? 19.5 : 18;
  const cheekO = (mood==="happy"||mood==="casual") ? 0.5 : 0.12;
  const mouthD = mood==="happy"?"M17 29 Q24 35 31 29":mood==="thinking"?"M19 30 Q24 29 29 30":"M18 29 Q24 33 30 29";
  return (
    <div style={{ width:size, height:size, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
      animation:mood==="talking"?"mascotWiggle .4s ease infinite alternate":mood==="happy"?"mascotBounce .5s cubic-bezier(.34,1.56,.64,1)":"mascotFloat 3s ease-in-out infinite" }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="46" rx="9" ry="2" fill="rgba(0,0,0,0.07)"/>
        <circle cx="24" cy="24" r="18" fill={c} style={{ transition:"fill .5s" }}/>
        <circle cx="17" cy="16" r="5" fill="rgba(255,255,255,0.15)"/>
        <ellipse cx="17.5" cy={eyeY} rx="4" ry={eyeRy} fill="white"/>
        <ellipse cx="30.5" cy={eyeY} rx="4" ry={eyeRy} fill="white"/>
        {!blink&&<><circle cx={mood==="thinking"?"18.5":"17.5"} cy="18.8" r="2.2" fill="#0f172a"/>
          <circle cx={mood==="thinking"?"31.5":"30.5"} cy="18.8" r="2.2" fill="#0f172a"/>
          <circle cx={mood==="thinking"?"19.2":"18.2"} cy="17.9" r="0.7" fill="white"/>
          <circle cx={mood==="thinking"?"32.2":"31.2"} cy="17.9" r="0.7" fill="white"/></>}
        <circle cx="12.5" cy="25" r="3.5" fill="#ef4444" opacity={cheekO}/>
        <circle cx="35.5" cy="25" r="3.5" fill="#ef4444" opacity={cheekO}/>
        <path d={mouthD} stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {mood==="thinking"&&[0,1,2].map(i=><circle key={i} cx={32+i*4} cy={12-i*3} r={1.2+i*0.3} fill="white" opacity="0.7" style={{ animation:`thinkDot 1s ease ${i*.15}s infinite` }}/>)}
        <path d="M24 6.5 L24 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <circle cx="24" cy="2" r="1.4" fill="white" opacity="0.6"/>
      </svg>
    </div>
  );
}

function BotMsg({ text, isAI, theme, mood }) {
  const lines = (text||"").split("\n");
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:14, animation:"msgIn .28s cubic-bezier(.34,1.56,.64,1) both" }}>
      <Mascot mood={mood||"idle"} size={32}/>
      <div style={{ maxWidth:"83%", display:"flex", flexDirection:"column", gap:3 }}>
        <div style={{ background:"#fff", borderRadius:"4px 16px 16px 16px", padding:"10px 13px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
          {lines.map((line,i) => {
            const isBullet = line.trim().startsWith("•");
            if (isBullet) return (
              <div key={i} style={{ display:"flex", gap:7, marginBottom:i<lines.length-1?4:0 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:theme.accent, flexShrink:0, marginTop:8 }}/>
                <span style={{ fontSize:13.5, color:"#334155", lineHeight:1.68 }}><RichText text={line.trim().slice(1).trim()} accent={theme.accent}/></span>
              </div>
            );
            if (!line.trim()) return <div key={i} style={{ height:4 }}/>;
            return <p key={i} style={{ fontSize:13.5, color:"#334155", lineHeight:1.7, margin:`${i>0?"4px":0} 0 0` }}><RichText text={line} accent={theme.accent}/></p>;
          })}
        </div>
        {isAI&&<div style={{ fontSize:10, color:"#cbd5e1", marginLeft:3, display:"flex", gap:4, alignItems:"center" }}><span style={{ width:4,height:4,borderRadius:"50%",background:`${theme.accent}70`,display:"block" }}/>AI · live</div>}
      </div>
    </div>
  );
}
function UserMsg({ text, theme }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14, animation:"msgIn .2s ease both" }}>
      <div style={{ background:theme.user, borderRadius:"16px 4px 16px 16px", padding:"9px 14px", fontSize:13.5, color:"#fff", maxWidth:"70%", lineHeight:1.6, boxShadow:`0 3px 10px ${theme.accent}30` }}>{text}</div>
    </div>
  );
}
function ThinkDots({ theme }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:14 }}>
      <Mascot mood="thinking" size={32}/>
      <div style={{ background:"#fff", borderRadius:"4px 16px 16px 16px", padding:"11px 14px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", display:"flex", gap:5, alignItems:"center" }}>
        {[0,1,2].map(i=><span key={i} style={{ width:7,height:7,borderRadius:"50%",background:theme.dot,display:"block",animation:`bop 1.1s ease ${i*.18}s infinite` }}/>)}
      </div>
    </div>
  );
}
function Chips({ items, onSelect, theme }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginLeft:40, marginBottom:12, animation:"chipIn .3s ease both" }}>
      {items.map((item,i) => {
        const label = typeof item==="object"?`${item.icon} ${item.label}`:item;
        const isNav = /🏠|Main Menu|menu/i.test(label);
        return (
          <button key={i} onClick={()=>onSelect(label)}
            style={{ background:isNav?"transparent":"#fff", border:`1.5px solid ${isNav?"#e2e8f0":theme.chipBd}`, borderRadius:20, padding:"5px 12px", fontSize:12.5, fontWeight:500, color:isNav?"#94a3b8":theme.chipClr, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .14s" }}
            onMouseEnter={e=>{ if(!isNav){e.target.style.background=theme.accent;e.target.style.color="#fff";e.target.style.borderColor=theme.accent;}}}
            onMouseLeave={e=>{ if(!isNav){e.target.style.background="#fff";e.target.style.color=theme.chipClr;e.target.style.borderColor=theme.chipBd;}}}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// KEY FIX: DeptScroll — horizontal scroll that actually works
function DeptScroll({ onSelect, theme }) {
  const ref = useRef(null);
  const [fade, setFade] = useState(true);
  const onScroll = () => { const el=ref.current; if(el) setFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 10); };
  return (
    <div style={{ marginLeft:40, marginBottom:12, animation:"chipIn .3s ease both" }}>
      <div style={{ fontSize:10, color:"#94a3b8", letterSpacing:"0.07em", marginBottom:7, fontWeight:700 }}>
        DEPARTMENTS — scroll right to see all ›
      </div>
      <div style={{ position:"relative" }}>
        <div ref={ref} onScroll={onScroll} className="dept-scroll"
          style={{ display:"flex", gap:9, overflowX:"scroll", paddingBottom:6, WebkitOverflowScrolling:"touch",
            // KEY: scrollbar-color makes it visible enough to hint at scrollability
            scrollbarWidth:"thin", scrollbarColor:`${theme.accent}50 transparent` }}>
          {Object.entries(DEPTS).map(([key,d]) => (
            <button key={key} onClick={()=>onSelect(key)}
              style={{ flexShrink:0, background:d.bg, border:`1.5px solid ${d.color}22`, borderRadius:15, padding:"11px 12px", textAlign:"left", cursor:"pointer", width:115, fontFamily:"'DM Sans',sans-serif", transition:"all .17s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 7px 18px ${d.color}28`;e.currentTarget.style.borderColor=d.color+"55";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=d.color+"22";}}>
              <div style={{ fontSize:19 }}>{d.icon}</div>
              <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", marginTop:4, lineHeight:1.2 }}>{key}</div>
              <div style={{ fontSize:10, color:d.color, marginTop:3, fontWeight:500, lineHeight:1.3 }}>{d.tagline}</div>
              <div style={{ marginTop:7 }}>
                {d.stats.map(([val,lbl],i)=>(
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:2 }}>
                    <span style={{ color:"#94a3b8" }}>{lbl}</span>
                    <span style={{ fontWeight:700, color:d.color }}>{val}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
        {fade && <div style={{ position:"absolute", right:0, top:0, bottom:6, width:36, background:"linear-gradient(to right, transparent, #f8fafc)", pointerEvents:"none", display:"flex", alignItems:"center", justifyContent:"flex-end" }}>
          <span style={{ fontSize:16, color:"#94a3b8", marginRight:2 }}>›</span>
        </div>}
      </div>
    </div>
  );
}

function BiotechCard({ theme, onAction }) {
  const c = "#059669";
  return (
    <div style={{ marginLeft:40, marginBottom:12, animation:"chipIn .28s ease both" }}>
      <div style={{ background:"#fff", border:`1.5px solid ${c}20`, borderRadius:17, overflow:"hidden", boxShadow:`0 4px 18px ${c}0e` }}>
        <div style={{ background:`linear-gradient(135deg,${c}14,${c}07)`, padding:"11px 14px", borderBottom:`1px solid ${c}10`, display:"flex", alignItems:"center", gap:9 }}>
          <span style={{ fontSize:22 }}>🧬</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:800, color:"#0f172a" }}>Biotechnology</div>
            <div style={{ fontSize:11, color:c, marginTop:1 }}>RVCE · NBA Accredited · VTU Research Center</div>
          </div>
          <div style={{ background:`${c}15`, borderRadius:9, padding:"3px 8px", fontSize:11, fontWeight:700, color:c }}>77% placed</div>
        </div>
        <div style={{ display:"flex", borderBottom:`1px solid ${c}10` }}>
          {[["₹9.28L","avg pkg"],["₹14.8L","top pkg"],["~30%","MS abroad"]].map(([val,lbl],i)=>(
            <div key={i} style={{ flex:1, padding:"7px 0", textAlign:"center", borderRight:i<2?`1px solid ${c}10`:"none" }}>
              <div style={{ fontSize:13, fontWeight:800, color:c }}>{val}</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 13px" }}>
          <div style={{ fontSize:11.5, fontWeight:700, color:"#0f172a", marginBottom:6 }}>Programs</div>
          {[["B.E. Biotechnology","60 seats"],["M.Tech Biotechnology","18 seats"],["M.Tech Bioinformatics","18 seats"],["Ph.D","VTU Research Center"]].map(([prog,info],i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:3, color:"#475569" }}>
              <span>{prog}</span><span style={{ fontWeight:600, color:c }}>{info}</span>
            </div>
          ))}
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:7, fontStyle:"italic" }}>KCET cutoff: ~8,000–12,000 · Much easier than CSE</div>
        </div>
        <div style={{ padding:"0 13px 11px", display:"flex", gap:6, flexWrap:"wrap" }}>
          {["Placements","Labs & Research","Programs","Industry Links","Pros & Cons"].map(t=>(
            <button key={t} onClick={()=>onAction(t)}
              style={{ background:`${c}0d`, border:`1.5px solid ${c}20`, borderRadius:18, padding:"5px 11px", fontSize:12, color:c, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .14s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=c;e.currentTarget.style.color="#fff";}}
              onMouseLeave={e=>{e.currentTarget.style.background=c+"0d";e.currentTarget.style.color=c;}}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
function BiotechDetail({ section, theme }) {
  const c = "#059669";
  const items = BIOTECH_DETAIL[section] || [];
  return (
    <div style={{ marginLeft:40, marginBottom:12, animation:"chipIn .26s ease both" }}>
      <div style={{ background:"#fff", border:`1.5px solid ${c}18`, borderRadius:14, overflow:"hidden", boxShadow:`0 3px 12px ${c}0d` }}>
        <div style={{ background:`${c}0d`, borderBottom:`1px solid ${c}10`, padding:"8px 13px", display:"flex", gap:7, alignItems:"center" }}>
          <span style={{ fontSize:15 }}>🧬</span>
          <span style={{ fontSize:13, fontWeight:700, color:c }}>{section}</span>
          <span style={{ fontSize:11, color:"#94a3b8" }}>— Biotechnology, RVCE</span>
        </div>
        <div style={{ padding:"10px 13px" }}>
          {items.map((item,i)=>(
            <div key={i} style={{ display:"flex", gap:6, alignItems:"flex-start", marginBottom:i<items.length-1?5:0 }}>
              {!item.startsWith("✅")&&!item.startsWith("⚠️")&&<span style={{ width:5,height:5,borderRadius:"50%",background:c,flexShrink:0,marginTop:8 }}/>}
              <span style={{ fontSize:13, color:"#334155", lineHeight:1.65 }}><RichText text={item} accent={c}/></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function StatBar({ theme }) {
  const ref = useRef(null);
  const stats=[["NIRF","#99 (2024)"],["NAAC","A+"],["IIRF","#1 Pvt"],["₹92L","Top Pkg"],["₹15.2L","Avg"],["262","Companies"],["831","Placed"],["62yrs","Legacy"]];
  return (
    <div style={{ marginLeft:40, marginBottom:10, animation:"chipIn .36s ease both" }}>
      <div ref={ref} style={{ display:"flex", gap:8, overflowX:"scroll", paddingBottom:3, scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        {stats.map(([lbl,val],i)=>(
          <div key={i} style={{ flexShrink:0, background:"#fff", border:"1px solid #f1f5f9", borderRadius:11, padding:"7px 10px", textAlign:"center", minWidth:66 }}>
            <div style={{ fontSize:11, fontWeight:800, color:theme.accent, lineHeight:1.2 }}>{val}</div>
            <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function TrendingStrip({ onSelect, theme }) {
  const ref = useRef(null);
  return (
    <div style={{ marginLeft:40, marginBottom:10, animation:"chipIn .38s ease both" }}>
      <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, letterSpacing:"0.07em", marginBottom:6 }}>🔥 PEOPLE ALSO ASK</div>
      <div ref={ref} style={{ display:"flex", gap:7, overflowX:"scroll", paddingBottom:3, scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        {TRENDING.map((t,i)=>(
          <button key={i} onClick={()=>onSelect(t.q)}
            style={{ flexShrink:0, background:"#fff", border:`1.5px solid ${theme.chipBd}`, borderRadius:18, padding:"6px 12px", fontSize:12, color:theme.chipClr, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", transition:"all .13s" }}
            onMouseEnter={e=>{e.target.style.background=theme.accent;e.target.style.color="#fff";}}
            onMouseLeave={e=>{e.target.style.background="#fff";e.target.style.color=theme.chipClr;}}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
function FunFact({ theme }) {
  const [idx, setIdx] = useState(()=>Math.floor(Math.random()*FUN_FACTS.length));
  useEffect(()=>{ const id=setInterval(()=>setIdx(i=>(i+1)%FUN_FACTS.length),4500); return ()=>clearInterval(id); },[]);
  return (
    <div style={{ marginLeft:40, marginBottom:12, animation:"chipIn .38s ease both" }}>
      <div style={{ background:theme.soft, border:`1.5px solid ${theme.accent}1e`, borderRadius:13, padding:"9px 13px", display:"flex", gap:8, alignItems:"center" }}>
        <span style={{ fontSize:17, flexShrink:0 }}>💡</span>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:theme.accent, letterSpacing:"0.05em", marginBottom:2 }}>DID YOU KNOW?</div>
          <div style={{ fontSize:12.5, color:"#334155", lineHeight:1.55 }}>{FUN_FACTS[idx]}</div>
        </div>
      </div>
    </div>
  );
}

export default function RVCEChatbot() {
  const [msgs, setMsgs] = useState([]);
  const [tone, setTone] = useState(null);
  const [theme, setTheme] = useState(TH.neutral);
  const [typing, setTyping] = useState(false);
  const [mascotMood, setMascotMood] = useState("idle");
  const [input, setInput] = useState("");
  const [showClear, setShowClear] = useState(false);
  const [transition, setTransition] = useState({ show:false, label:"", theme:TH.neutral });
  const toneRef = useRef(null);
  const aiHistory = useRef([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[msgs,typing]);
  useEffect(()=>{ boot(); },[]);

  const push = useCallback(n=>setMsgs(p=>[...p,n]),[]);
  const getTone = () => toneRef.current || "neutral";
  const getInst = (key) => { const t=getTone(); return QA[key]?.[t]||QA[key]?.neutral; };

  const tryTone = (text) => {
    if (toneRef.current) return;
    const d = detectTone(text);
    if (!d) return;
    toneRef.current = d;
    setTone(d);
    const nt = TH[d];
    setTheme(nt);
    setTransition({ show:true, label:d==="casual"?"Buddy Mode 🤙":"Professional Mode 🎓", theme:nt });
    setTimeout(()=>setTransition(p=>({...p,show:false})), 2000);
  };

  const boot = async () => {
    setMascotMood("happy"); setTyping(true);
    await sleep(400);
    push({ t:"bot", text:"👋 Hi! I'm your RVCE guide.", mood:"happy" });
    await sleep(700);
    push({ t:"bot", text:"Ask me anything about RVCE — admissions, fees, placements, Biotech department, hostel, safety, or anything else. Real answers, no fluff.\n\nWhat would you like to know?", mood:"idle" });
    setTyping(false); setMascotMood("idle");
    push({ t:"stats" });
    push({ t:"trending" });
    push({ t:"chips", items:MAIN_TOPICS.map(m=>`${m.icon} ${m.label}`), handler:handleMenu });
  };

  // FIXED: Retry + meaningful fallback for "something went wrong" error
  const callAI = async (userText) => {
    aiHistory.current = [...aiHistory.current.slice(-8), { role:"user", content:userText }];
    const sys = `You are a knowledgeable, warm guide for R.V. College of Engineering (RVCE), Bangalore.
TONE: ${getTone()==="casual"?"Talk like a helpful RVCE senior — real, short, genuine. Use bro/fr/ngl naturally.":getTone()==="formal"?"Academic counselor style — professional, empathetic, structured.":"Friendly and helpful."}
Use **bold** for key numbers. Max 120 words. Only answer RVCE/college-related questions.
Key facts: Est.1963, NAAC A+, NIRF 99 (2024), IIRF #1 Pvt. Placements: ₹92L top, ₹15.2L avg, 831 placed, 262 companies. CSE avg ₹28.1L. Biotech 77% placed, avg ₹9.28L, top ₹14.81L. Fees: KCET ~₹1.21L/yr, COMEDK ~₹3L/yr. 7 hostels, ₹80K–1.2L/yr. CSE KCET cutoff 234–499. Biotech KCET cutoff ~8000–12000. Campus 16.85 acres Mysore Road Bangalore. 40+ clubs, 8th Mile fest. Library 1.24L books. Anti-ragging active, ICC for women, faculty mentor per student.`;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:350, system:sys, messages:aiHistory.current }),
        });
        if (!resp.ok) {
          if (resp.status===529||resp.status===503) { await sleep(1500*(attempt+1)); continue; }
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        if (data.error) throw new Error(data.error.message);
        const reply = data.content?.map(b=>b.text||"").join("")||"Could you rephrase that?";
        aiHistory.current = [...aiHistory.current, { role:"assistant", content:reply }];
        return reply;
      } catch(e) {
        if (attempt < 2) { await sleep(1200*(attempt+1)); continue; }
        // Meaningful fallback — not a generic error
        const t = getTone();
        const fallbacks = {
          casual: "bro my connection's acting up rn 😅 Try asking again or pick from the chips below — I've got instant answers for most RVCE questions!",
          formal: "I'm experiencing a temporary connectivity issue. Please try your question again, or use the topic buttons below for instant answers.",
          neutral: "I had a connection hiccup — try again or use the quick buttons below for instant answers about RVCE!"
        };
        return fallbacks[t] || fallbacks.neutral;
      }
    }
  };

  const handleMenu = async (rawLabel) => {
    const label = rawLabel.replace(/^\S+\s/,"").trim();
    tryTone(label);
    push({ t:"user", text:rawLabel });
    setMascotMood("talking"); setTyping(true); await sleep(300); setTyping(false); setMascotMood("happy");
    const isC = getTone()==="casual";
    const keyMap = { admissions:"admissions",departments:"depts",placements:"placements",fees:"fees",scholarships:"scholarships","campus life":"campus","about rvce":"about",hostel:"hostel" };
    const matched = keyMap[label.toLowerCase()];
    if (matched==="depts") {
      push({ t:"bot", text:isC?"pick a dept 👇 — scroll right to see all!":"Select a department to explore:", mood:"happy" });
      push({ t:"dept_scroll" });
    } else if (matched && getInst(matched)) {
      push({ t:"bot", text:getInst(matched), mood:"happy" });
      if (["campus","about"].includes(matched)) push({ t:"fun_fact" });
      push({ t:"chips", items:followUps(matched,isC), handler:handleFree });
    }
    setTimeout(()=>setMascotMood("idle"),900);
  };

  const handleDept = async (key) => {
    const d = DEPTS[key];
    push({ t:"user", text:`${d.icon} ${key}` });
    setMascotMood("talking"); setTyping(true); await sleep(280); setTyping(false); setMascotMood("happy");
    const isC = getTone()==="casual";
    if (d.isFull) {
      push({ t:"bot", text:isC?`🧬 RVCE Biotech — full breakdown below 👇`:`Here is a comprehensive overview of the RVCE Biotechnology Department:`, mood:"happy" });
      push({ t:"biotech_card" });
    } else if (d.qaKey && getInst(d.qaKey)) {
      push({ t:"bot", text:getInst(d.qaKey), mood:"happy" });
      push({ t:"chips", items:[`${key} placements?`,`${key} cutoff?`,`${key} labs?`,"All Departments","🏠 Main Menu"], handler:handleFree });
    } else {
      push({ t:"bot", text:isC?`looking up ${key} for you 🔍`:`Fetching details for ${key} at RVCE:`, mood:"thinking" });
      setTyping(true);
      const reply = await callAI(`Tell me about ${key} department at RVCE Bangalore — placements, labs, programs, career prospects. Key stats please.`);
      setTyping(false);
      push({ t:"bot", text:reply, isAI:true, mood:"happy" });
      push({ t:"chips", items:[`${key} placements?`,`${key} cutoff?`,"All Departments","🏠 Main Menu"], handler:handleFree });
    }
    setTimeout(()=>setMascotMood("idle"),900);
  };

  const handleBiotechAction = async (section) => {
    push({ t:"user", text:`Biotech → ${section}` });
    setTyping(true); await sleep(200); setTyping(false);
    push({ t:"biotech_detail", section });
    push({ t:"chips", items:["Placements","Labs & Research","Programs","Industry Links","Pros & Cons","🏠 Main Menu"], handler:handleFree });
  };

  const handleFree = async (rawText) => {
    const text = rawText.trim();
    if (!text) return;
    tryTone(text);
    const isNav = /🏠|Main Menu|All Departments/i.test(text);
    const isBioAction = /^Biotech →/i.test(text);
    if (!isNav && !isBioAction) push({ t:"user", text });

    if (/🏠|Main Menu/i.test(text)) {
      setTyping(true); await sleep(200); setTyping(false);
      push({ t:"bot", text:getTone()==="casual"?"back to main 🏠":"Returning to main menu:", mood:"idle" });
      push({ t:"chips", items:MAIN_TOPICS.map(m=>`${m.icon} ${m.label}`), handler:handleMenu });
      return;
    }
    if (/All Departments/i.test(text)||/^departments$/i.test(text)) {
      setTyping(true); await sleep(200); setTyping(false);
      push({ t:"bot", text:getTone()==="casual"?"all departments — scroll right 👇":"Here are all RVCE departments:", mood:"idle" });
      push({ t:"dept_scroll" });
      return;
    }
    if (isBioAction) { handleBiotechAction(text.replace(/^Biotech → /,"")); return; }
    if (["Placements","Labs & Research","Programs","Industry Links","Pros & Cons"].includes(text)) { handleBiotechAction(text); return; }

    const intent = matchIntent(text);
    if (intent.type==="qa") {
      const ans = getInst(intent.key);
      if (ans) {
        setMascotMood("talking"); setTyping(true); await sleep(300); setTyping(false); setMascotMood("happy");
        push({ t:"bot", text:ans, mood:"happy" });
        push({ t:"chips", items:followUps(intent.key, getTone()==="casual"), handler:handleFree });
        setTimeout(()=>setMascotMood("idle"),800);
      } else { await doAI(text); }
    } else if (intent.type==="depts") {
      setTyping(true); await sleep(220); setTyping(false);
      push({ t:"bot", text:getTone()==="casual"?"all depts — scroll right 👇":"Here are all departments:", mood:"idle" });
      push({ t:"dept_scroll" });
    } else if (intent.type==="dept") {
      await handleDept(intent.key);
    } else {
      await doAI(text);
    }
  };

  const doAI = async (text) => {
    setMascotMood("thinking"); setTyping(true);
    const reply = await callAI(text);
    setTyping(false); setMascotMood("happy");
    push({ t:"bot", text:reply, isAI:true, mood:"happy" });
    push({ t:"chips", items:getSmartChips(text), handler:handleFree });
    setTimeout(()=>setMascotMood("idle"),900);
  };

  const getSmartChips = (text) => {
    if (/(hostel|food|mess)/i.test(text)) return ["Girls safety?","Hostel fees?","Day scholar?"];
    if (/(safe|security|daughter|women)/i.test(text)) return ["Anti-ragging?","Girls hostel?","Mental health?"];
    if (/(fee|loan|cost)/i.test(text)) return ["Scholarships?","Education loan?","KCET vs COMEDK?"];
    if (/(placement|job|salary)/i.test(text)) return ["CSE placements?","Biotech placements?","Top companies?"];
    if (/(introvert|shy|sensitive|anxiet)/i.test(text)) return ["Mental health support?","Clubs & activities?","Hostel culture?"];
    if (/(parent|son|daughter|kid)/i.test(text)) return ["Campus safety?","Hostel details?","Faculty mentor?"];
    if (/(which|best|compare|suggest)/i.test(text)) return ["CSE details?","Biotech details?","All Departments"];
    if (/(biotech)/i.test(text)) return ["Biotech placements?","Biotech cutoff?","Biotech vs CSE?"];
    if (/(cse|computer)/i.test(text)) return ["CSE placements?","CSE cutoff?","CSE vs ISE?"];
    return ["All Departments","Placements?","🏠 Main Menu"];
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text||typing) return;
    setInput(""); handleFree(text);
    inputRef.current?.focus();
  };

  const clearChat = async () => {
    setShowClear(false);
    toneRef.current=null; setTone(null); setTheme(TH.neutral);
    aiHistory.current=[]; setMsgs([]);
    await sleep(60); boot();
  };

  const th = theme;
  const isC = tone==="casual";

  const render = (n,i) => {
    switch(n.t) {
      case "bot":          return <BotMsg key={i} text={n.text} isAI={n.isAI} theme={th} mood={n.mood}/>;
      case "user":         return <UserMsg key={i} text={n.text} theme={th}/>;
      case "chips":        return <Chips key={i} items={n.items} onSelect={n.handler} theme={th}/>;
      case "dept_scroll":  return <DeptScroll key={i} onSelect={k=>handleDept(k)} theme={th}/>;
      case "biotech_card": return <BiotechCard key={i} theme={th} onAction={handleBiotechAction}/>;
      case "biotech_detail":return <BiotechDetail key={i} section={n.section} theme={th}/>;
      case "stats":        return <StatBar key={i} theme={th}/>;
      case "trending":     return <TrendingStrip key={i} onSelect={handleFree} theme={th}/>;
      case "fun_fact":     return <FunFact key={i} theme={th}/>;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#eef2f7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:12 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{height:3px;width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.25);border-radius:10px;}
        .dept-scroll::-webkit-scrollbar{height:3px;}
        .dept-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.18);border-radius:10px;}
        @keyframes msgIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @keyframes chipIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bop{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-5px);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes mascotFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes mascotBounce{0%{transform:scale(1)}40%{transform:scale(1.22) translateY(-5px)}100%{transform:scale(1)}}
        @keyframes mascotWiggle{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}
        @keyframes thinkDot{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        @keyframes ripple{from{transform:scale(0);opacity:1}to{transform:scale(55);opacity:0}}
        @keyframes popIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
        button:focus{outline:none;} input:focus{outline:none;}
      `}</style>
      <div style={{ width:"100%", maxWidth:440, height:"90vh", maxHeight:780, borderRadius:24, overflow:"hidden", display:"flex", flexDirection:"column", background:"#f8fafc", boxShadow:"0 24px 60px rgba(0,0,0,.13), 0 0 0 1px rgba(255,255,255,.8)", position:"relative" }}>

        {/* Tone transition */}
        {transition.show && (
          <div style={{ position:"absolute", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", pointerEvents:"none" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:transition.theme.grad, position:"absolute", animation:"ripple 1.8s ease-out both" }}/>
            <div style={{ position:"relative", zIndex:1, textAlign:"center", animation:"popIn .35s ease .5s both" }}>
              <Mascot mood={isC?"casual":"formal"} size={54}/>
              <div style={{ fontSize:16, fontWeight:800, color:"#fff", marginTop:10, textShadow:"0 2px 8px rgba(0,0,0,.3)" }}>{transition.label}</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ background:"#fff", padding:"11px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ position:"relative" }}>
            <Mascot mood={mascotMood} size={40}/>
            <span style={{ position:"absolute", bottom:0, right:0, width:9, height:9, borderRadius:"50%", background:"#22c55e", border:"2px solid #fff", animation:"pulse 2.5s infinite" }}/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14.5, fontWeight:800, color:"#0f172a", fontFamily:"'Syne',sans-serif" }}>RVCE Guide</div>
            <div style={{ fontSize:11, color:th.accent, fontWeight:500, transition:"color .5s", marginTop:1 }}>
              {tone===null?"R.V. College of Engineering, Bangalore":isC?"buddy mode · ask anything 🤙":"professional mode · here to help"}
            </div>
          </div>
          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
            {tone&&<button onClick={()=>{toneRef.current=null;setTone(null);setTheme(TH.neutral);}} style={{ background:"transparent", border:"none", fontSize:11, color:"#94a3b8", cursor:"pointer", padding:"3px 6px", fontFamily:"'DM Sans',sans-serif" }}>reset tone</button>}
            <button onClick={()=>setShowClear(true)} style={{ width:30,height:30,borderRadius:"50%",background:"#f8fafc",border:"1px solid #f1f5f9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#cbd5e1",transition:"all .14s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="#fee2e2";e.currentTarget.style.color="#ef4444";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#f8fafc";e.currentTarget.style.color="#cbd5e1";}}>✕</button>
          </div>
        </div>
        <div style={{ height:3, background:th.grad, transition:"background .6s ease", flexShrink:0 }}/>

        {/* Chat */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 12px 6px", display:"flex", flexDirection:"column" }}>
          {msgs.map((n,i)=>render(n,i))}
          {typing&&<ThinkDots theme={th}/>}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{ background:"#fff", padding:"10px 12px 12px", borderTop:"1px solid #f1f5f9", display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey) handleSend(); }}
            placeholder={isC?"ask anything about RVCE…":"Ask about RVCE — admissions, Biotech, placements…"}
            style={{ flex:1, border:"1.5px solid #f1f5f9", borderRadius:22, padding:"9px 14px", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#0f172a", background:"#f8fafc", transition:"all .14s" }}
            onFocus={e=>{e.target.style.borderColor=th.accent+"60";e.target.style.background="#fff";e.target.style.boxShadow=`0 0 0 3px ${th.accent}0e`;}}
            onBlur={e=>{e.target.style.borderColor="#f1f5f9";e.target.style.background="#f8fafc";e.target.style.boxShadow="none";}}
          />
          <button onClick={handleSend} disabled={!input.trim()||typing}
            style={{ width:38,height:38,borderRadius:"50%",border:"none",background:!input.trim()||typing?"#f1f5f9":th.grad,cursor:!input.trim()||typing?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .18s",boxShadow:!input.trim()||typing?"none":`0 3px 12px ${th.accent}40` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={!input.trim()||typing?"#cbd5e1":"white"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Clear modal */}
      {showClear&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,animation:"msgIn .18s ease both" }}>
          <div style={{ background:"#fff",borderRadius:20,padding:24,maxWidth:275,width:"90%",textAlign:"center",boxShadow:"0 24px 60px rgba(0,0,0,.25)" }}>
            <Mascot mood="thinking" size={50}/>
            <div style={{ fontSize:15,fontWeight:800,color:"#0f172a",marginTop:12,marginBottom:6,fontFamily:"'Syne',sans-serif" }}>{isC?"reset everything?":"Clear conversation?"}</div>
            <div style={{ fontSize:12.5,color:"#94a3b8",lineHeight:1.65,marginBottom:18 }}>{isC?"wipes chat + vibe detection 🔄":"Resets chat history and tone detection from scratch."}</div>
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>setShowClear(false)} style={{ flex:1,padding:"9px 0",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,fontSize:13,color:"#64748b",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>{isC?"nah":"Cancel"}</button>
              <button onClick={clearChat} style={{ flex:1,padding:"9px 0",background:"linear-gradient(135deg,#ef4444,#dc2626)",border:"none",borderRadius:12,fontSize:13,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>{isC?"yeah clear it":"Clear & Reset"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
