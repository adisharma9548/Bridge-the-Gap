# 🌉 Setu (सेतु) — Complex Information to Real-World Civic Action

> **Devlympics – Shunya 2026 Hackathon Submission: "Bridge the Gap"**  
> Connecting citizens separated by technical jargon, legal complexity, language barriers, and digital exclusion to plain-language clarity, evidence-grounded accountability, and verified civic resources.

---

## 📱 Mobile App — Direct Download for Android Phone

> 📥 **[Download Setu Mobile App (`setu-release.apk`)](https://github.com/adisharma9548/Bridge-the-Gap/raw/main/mobile/release/setu-release.apk)**  
> *Tap this link directly in your Android phone's web browser to download and install the native mobile app.*

### How to Install on Your Mobile Phone:
1. Tap the download link above on your Android phone:  
   👉 `https://github.com/adisharma9548/Bridge-the-Gap/raw/main/mobile/release/setu-release.apk`
2. When the download completes, tap **Open** or click the downloaded file in your notification bar.
3. If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*, tap **Settings** and enable **Allow from this source**.
4. Tap **Install** and launch **Setu (सेतु)**.
5. Tap the server status pill in the top app bar to configure the backend URL if running locally (e.g. `http://<your-computer-ip>:4000/api`) or keep the default.
6. Sign in with the exact same account you use on the website to access all your saved records and analyses across both devices!

---

## 🏛️ Executive Summary: Beyond the "AI Chatbot"

Most AI applications process a user prompt and return a conversational text answer. When an ordinary citizen, farmer, or senior receives a **bank default notice (SARFAESI Act)**, a **health insurance claim repudiation**, or an **abnormal clinical laboratory panel**, a conversational chatbot presents critical failure modes:
1. **No Verbatim Grounding:** Chatbots summarize broadly without holding themselves accountable to the exact clauses or numbers written in the original notice.
2. **False Confidence & Silence on Gaps:** General AI models hallucinate certainty instead of transparently flagging what the document *fails to state* (e.g., missing interest calculations, ambiguous waiting periods).
3. **No Practical Action Plan:** Users are left with explanatory text, but no structured checklist of immediate deadlines or prepared questions to ask the issuing official.
4. **Disconnection from Civic Remedies:** Explaining that an insurance claim was rejected under "Clause 4.1" is useless unless the citizen is connected to the **National Consumer Helpline (1915)** or **NALSA Free Legal Aid**.

**Setu (सेतु) bridges this gap.** It transforms complex documents into a **5-Stage Document Action Case File** that pairs plain-language interpretation with verbatim evidence quotes, explicit uncertainties, an interactive action checklist, and matched official statutory resources.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           THE SETU CIVIC BRIDGE WORKFLOW                         │
├─────────────────────┬─────────────────────────────────────┬─────────────────────┤
│ 1. INTAKE           │ 2. EVIDENCE & UNCERTAINTIES          │ 3. ACTION & CIVIC   │
│ • Text paste        │ • Grade-5 plain-language summary    │ • Prioritized tasks │
│ • Multimodal scan   │ • Verbatim clause quote pairing     │ • Questions to ask  │
│   (PDF/PNG/JPG/TXT) │ • In-context terminology phonetics  │ • Connected portals │
│ • Voice dictation   │ • Explicit gaps & missing facts     │   (NALSA, NCH,      │
│   (Web Speech API)  │ • Statutory legal/health disclaimers│   eSanjeevani, etc.)│
└─────────────────────┴─────────────────────────────────────┴─────────────────────┘
```

---

## 📋 The 5-Stage Document Action Case File

When a user submits a document, Setu generates a comprehensive Case File structured into 5 deliberate, task-oriented stages:

### Stage 1: Grade-5 Plain-Language Summary & Statutory Advisory
- Translates dense statutory language into concise, empathetic, Grade-5 reading level explanations in either **English** or **हिन्दी**.
- Automatically classifies document domain and attaches calibrated statutory disclaimers (e.g., *Legal Notice Notice*, *Clinical Health Advisory*, or *Consumer Rights Guidance*).

### Stage 2: Grounded Verbatim Evidence & Defined Terminology
- **Evidence-Grounded Pairing:** The interface pairs every critical interpretation with the exact verbatim quote extracted from the document, allowing the citizen to cross-reference what is stated versus what it means.
- **In-Context Defined Terms:** Difficult words (e.g., *SARFAESI*, *Lien*, *HbA1c*, *Co-payment*, *Repudiation*) are defined in plain language, paired with phonetic pronunciation guides and speech playback.

### Stage 3: Uncertainties & Missing Facts ("What This Document Does Not State")
- Identifies critical omissions that prevent a confident conclusion (e.g., *“This notice does not state the interest calculation breakdown”* or *“The report does not indicate whether this blood draw was fasting”*).
- Prevents false assumptions and directs the citizen on what facts must be gathered before making financial or medical decisions.

### Stage 4: Practical Action Checklist & Official Questions
- **Prioritized Checklist:** Step-by-step tasks categorized by urgency with explicit deadline tracking.
- **Questions for Officials:** Pre-formulated questions that citizens or their family members can read aloud or hand over to bank managers, insurance grievance officers, or physicians.
- Includes one-click audio pronunciation (`window.speechSynthesis`) and one-click copy to clipboard.

### Stage 5: Connected Official Civic & Legal Resources (The Bridge)
- **Automatic Civic Matching:** Automatically connects the citizen to verified statutory bodies based on document clauses:
  - 🏦 **Banking & SARFAESI Notices:** Matched to **NALSA Free Legal Aid (National Legal Services Authority)** and **National Consumer Helpline (NCH - 1915)**.
  - 🛡️ **Insurance Repudiation Letters:** Matched to **National Consumer Helpline (Department of Consumer Affairs)** and **DigiLocker** for digital policy retrieval.
  - 🏥 **Clinical Lab Panels:** Matched to **eSanjeevani National Telemedicine Service (MoHFW)** for free government doctor consultations.
- Each resource card explicitly displays:
  - The statutory provider and official verified badge.
  - *Why this resource was matched* to the specific document clauses.
  - *How it assists your next action step*.
  - *Prerequisites & required documents* to have ready before visiting or calling.
  - *Important statutory cautions* (e.g., Lok Adalat filing requirements).
  - Direct outbound links to verified government portals.

---

## 🌐 Complete Feature Suite

### 1. Document Explanation & Multimodal Intake (Flow 1)
- Supports direct text pasting and file uploads (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.txt`) up to 20MB.
- Real-world sample notices for instant evaluation:
  - 🏦 **Banking:** SARFAESI Section 13(2) 60-day demand notice with fixed deposit lien.
  - 🏥 **Clinical:** Elevated HbA1c (7.9%) diabetic panel with hyperlipidemia.
  - 🛡️ **Insurance:** Claim repudiation letter citing Pre-Existing Disease (PED) Clause 4.1.

### 2. Public Data & Education Explorer (Flow 2)
- Democratizes access to official Indian government databases and public exam information:
  - 🌾 **Daily Mandi Crop Prices:** APMC wholesale rates and commodity prices across Indian states.
  - 🏥 **Public & PM-JAY Hospitals:** Directory of government hospitals with 24x7 emergency and Ayushman Bharat coverage.
  - 🌤️ **City Air Quality (AQI):** Live station readings with actionable health and morning-walk advisories for seniors.
  - 🎓 **National Competitive Exams:** Grounded details for major examinations (**UPSC Civil Services**, **SSC CGL**, **IBPS Bank PO/Clerk**, **RRB NTPC**) including conducting bodies, eligibility, examination stages, 2026 calendar dates, and family guidance tips.

### 3. Civic Resources Directory (Flow 3)
- Curated directory of verified civic services, legal aid portals, grievance helplines, and digital public infrastructure.
- Filterable by beneficiary groups (Seniors, Farmers, Low-Income Families, Patients, Youth) and categories.

### 4. Saved Case Records & Offline Persistence (Flow 4)
- Session-based persistence using anonymous UUID headers (`x-session-id`) stored in `localStorage`.
- Citizens can save any Case File or Public Data query and inspect the full 5-stage dossier offline at any time.

### 5. Citizen Authentication & OTP
- Lightweight email-based OTP sign-in allowing citizens to persist their case files across devices without requiring social media or third-party tracking.

---

## ♿ Senior-First Accessibility & Dignified Civic UI

Setu avoids generic AI chat aesthetics and decorative clutter in favor of an intentional, task-oriented civic workbench:

- **Dignified Palette:**
  - Deep Civic Cobalt (`#0C4A60`) — Primary brand and actionable focal points.
  - Public Jade (`#059669`) — Verified status and positive validation.
  - Saffron Amber (`#D97706`) — Statutory cautions and deadline urgencies.
  - Clean Ivory (`#FAF8F5`) — Soft, readable canvas reducing ocular fatigue for elderly readers.
  - Deep Navy Slate (`#18181B`) — High-contrast typography exceeding WCAG 2.1 AAA contrast ratios.
- **Zero Emojis in Interface Controls:** Built strictly with crisp vector iconography via `lucide-react`.
- **Controlled Voice Input State Machine (`useSpeech`):**
  - Uses the native Web Speech API (`SpeechRecognition`).
  - **Safe Pauses:** Pausing recognition preserves the transcript safely without auto-submitting or discarding.
  - **Explicit Confirmation:** Analysis is never triggered automatically; the user must explicitly choose **Analyse** or **Cancel**.
  - **Cancellation Safety:** Canceling aborts cleanly without triggering network calls.
  - **Duplicate Submission Guards:** Multi-click guards prevent accidental repeated API calls.
- **Bilingual Support & Typography Scaling:**
  - Complete, professional bilingual support in **English** and **हिन्दी**.
  - Dynamic 3-stage typography scaler (**A** 16px, **A+** 18.5px, **A++** 21px).
  - Integrated text-to-speech read-aloud via `window.speechSynthesis`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Web Speech API |
| **Backend API** | Node.js, Express, TypeScript, CORS, Multer |
| **AI Integration** | Google Gemini 3.8 Flash (`@google/genai` SDK) with Groq Llama fallback |
| **Database & Cache** | PostgreSQL (pg) with resilient in-memory session cache fallback |
| **Security** | Server-side API key management, rate limiting, file MIME validation |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js (v20+)**
- **npm (v10+)**
- A Google Gemini API key (optional; built-in resilient client-side fallbacks allow complete offline evaluation of all core sample notices).

### 1. Clone & Configure
```bash
git clone https://github.com/adisharma9548/Bridge-the-Gap.git
cd Bridge-the-Gap
```

### 2. Configure Backend Environment
Create `backend/.env`:
```env
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
GROQ_API_KEY=your_groq_api_key_here
SESSION_SECRET=dev_session_secret_key_shunya_2026
```

### 3. Start Backend Server
```bash
cd backend
npm install
npm run build
npm start
```
*The backend runs on [http://localhost:4000](http://localhost:4000).*

### 4. Start Frontend Client
```bash
cd ../frontend
npm install
npm run build
npm run dev
```
*The client runs on [http://localhost:5173](http://localhost:5173).*

### 5. Start Native Flutter Mobile App
```bash
cd ../mobile
flutter pub get
# Run on Android Emulator (auto-routes to 10.0.2.2:4000)
flutter run
# Or test and build APK
flutter test
flutter build apk --debug
```

---

## 🧪 Verification & Build Status

- **Frontend Build (`tsc && vite build`):** Verified clean compile (0 errors, 1592 modules transformed).
- **Backend Build (`tsc`):** Verified clean compile (0 errors).
- **Mobile Static Analysis (`dart analyze lib test`):** 0 errors, 0 warnings.
- **Mobile Unit & Widget Tests (`flutter test`):** 6 tests passed (100% pass rate).
- **Mobile Android Build (`flutter build apk --debug`):** Verified clean build (`app-debug.apk` generated).
- **API Health Check (`GET /api/health`):** `status: healthy` on port 4000.
- **Multimodal Document Understanding (`POST /api/understand`):** Live verified with Gemini 2.5/3.8 Flash and deterministic statutory civic resource matching.

---

## 👥 Devlympics – Shunya 2026 Submission

- **Repository:** [https://github.com/adisharma9548/Bridge-the-Gap](https://github.com/adisharma9548/Bridge-the-Gap)
- **Challenge Track:** Bridge the Gap (Connecting ordinary citizens to complex legal, medical, and public information).
