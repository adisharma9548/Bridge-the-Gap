# 🌉 Setu (सेतु) — Public Knowledge & Accessibility Platform
> **Bridging the gap between complex public information, legal notices, medical test reports, and official government data for ordinary and elderly citizens.**

Built for the **Devlympics – Shunya 2026 "Bridge the Gap" Hackathon** organized by GDG On Campus NSUT.

---

## 🏛️ Executive Summary & Product Architecture

Setu is an assistive civic-access platform designed to eliminate the informational divide faced by ordinary citizens and seniors when encountering confusing technical jargon in bank default notices, hospital lab reports, and insurance claims, as well as navigating raw open government databases.

### Key Capabilities
1. **Plain-Language Document Explainer (Flow 1):**
   - Ingests complex legal clauses, bank recovery letters, blood panel reports, health insurance repudiation notices, and **multimodal scanned files / PDFs**.
   - Accepts direct drag-and-drop file attachments (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.txt`) analyzed via multimodal **Google Gemini 3.8 Flash**.
   - Outputs a **5-part structured dossier**:
     - **Executive Summary:** Grade-5 reading level in English or हिन्दी.
     - **Key Terminology:** Definitions paired with phonetic pronunciation guides and individual impact assessments.
     - **Recommended Action Plan:** Interactive, accessible task checklist with deadline urgency badges.
     - **Prepared Questions for Officials:** Verbatim questions citizens can read out loud to doctors or bank managers, with one-click audio playback.
     - **Risk Alerts & Evidence Verification:** Substring-verified quotes with anti-hallucination indicators.
   - **One-Click Real-World Scenarios:**
     - 🏦 *Banking:* SARFAESI Section 13(2) NPA notice with ₹45,000 Fixed Deposit lien.
     - 🏥 *Clinical:* Elevated HbA1c (7.9%) and LDL cholesterol (168 mg/dL) with statin therapy.
     - 🛡️ *Insurance:* Claim repudiated under Pre-Existing Disease (PED) clause 4.1 with a 36-month waiting period and 20% co-payment.

2. **Official Government Data & Education Explorer (Flow 2):**
   - Connects to official Indian public data and live Gemini knowledge retrieval:
     - 🌾 **Daily Mandi Crop Prices:** APMC wholesale rates across states and mandis.
     - 🏥 **Public & PM-JAY Hospitals:** Directory of government hospitals with 24x7 trauma care and free treatment.
     - 🌤️ **City Air Quality & Pollution (AQI):** Live station readings with senior morning walk advisories.
     - 🎓 **Education & Competitive Exams:** Real-time grounded information on major national exams (UPSC Civil Services, SSC CGL, IBPS Bank PO/Clerk, RRB NTPC/Group D) including conducting bodies, eligibility, examination stages, 2026 calendar timelines, official government portals, and family guidance tips for seniors advising grandchildren.
   - Generates plain-language narrative summaries explaining statistical numbers, renders high-contrast responsive tables on desktop and stacked cards on mobile, and displays official provenance badges.

3. **Saved Reference Records (Flow 3):**
   - Zero-friction anonymous session persistence using UUIDs in `localStorage` and `x-session-id` request headers.
   - Offline-accessible cache allowing users to review saved notices or hospital directories anytime.

4. **Senior-First Accessibility & High-Contrast Design System:**
   - **Bright, Distinctive Button Color Tokens:** High-contrast, tactile colored buttons (Royal Blue, Emerald Jade, Amber Saffron, Radiant Sky, and Coral Rose)—strictly eliminating low-contrast or generic white buttons.
   - **SVG Icon System:** Precision `lucide-react` vector icons with accessible labels—zero emojis in interface components.
   - **Always-Visible Top Bar:** Brand mark, quick Home shortcut, bilingual language switcher (`English` | `हिन्दी`), and 3-stage font scaler (`A` 16px | `A+` 18.5px | `A++` 21px).
   - **Web Speech API:** Built-in voice dictation (`window.SpeechRecognition`) and audio read-aloud playback (`window.speechSynthesis`).
   - **Zero Dead Links & Zero Clutter:** Purposeful layout with single legal/medical disclaimer sentence.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js (v20+)**
- **npm (v10+)**
- Optional: PostgreSQL (an automatic in-memory fallback engine ensures 100% uninterrupted local evaluation if PostgreSQL is not installed)

### 2. Setup Environment
```bash
cp .env.example backend/.env
```

### 3. Start Backend (Port 4000)
```bash
cd backend
npm install
npm run build
npm run dev
```

### 4. Start Frontend (Port 5173)
```bash
cd frontend
npm install
npm run build
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
