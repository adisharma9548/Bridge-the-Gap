import React, { useState } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Lock, Eye, Trash2 } from 'lucide-react';
import { Language } from '../i18n/translations';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: 'terms' | 'privacy';
  onClose: () => void;
  lang: Language;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
  lang: initialLang,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const [lang, setLang] = useState<Language>(initialLang);

  if (!isOpen) return null;

  const isHindi = lang === 'hi';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-surface rounded-2xl border-2 border-border shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 bg-aubergine-soft border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-aubergine text-white shadow-sm">
              {activeTab === 'terms' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-lg sm:text-xl font-black text-text-primary">
                {activeTab === 'terms'
                  ? isHindi
                    ? 'सेतु: सेवा की शर्तें व नियम'
                    : 'Setu: Terms & Conditions'
                  : isHindi
                  ? 'सेतु: गोपनीयता नीति व डेटा सुरक्षा'
                  : 'Setu: Privacy Policy & Data Safeguards'}
              </h2>
              <p className="text-xs text-text-secondary">
                {isHindi
                  ? 'नागरिक अधिकारों, दायित्वों व डेटा सुरक्षा की स्पष्ट व्याख्या'
                  : 'Plain-language disclosure of citizen rights, legal boundaries & data handling'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle inside modal */}
            <button
              type="button"
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-aubergine bg-white text-aubergine hover:bg-aubergine-soft transition-colors"
            >
              {isHindi ? 'English' : 'हिन्दी'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white transition-colors"
              aria-label={isHindi ? 'बंद करें' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-canvas px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'terms'
                ? 'border-aubergine text-aubergine'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {isHindi ? '1. सेवा की शर्तें (Terms of Service)' : '1. Terms of Service'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'privacy'
                ? 'border-aubergine text-aubergine'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {isHindi ? '2. गोपनीयता नीति व डेटा संग्रह (Privacy Policy)' : '2. Privacy & Data Policy'}
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 text-sm text-text-primary leading-relaxed">
          {activeTab === 'terms' ? (
            /* ========================================================================= */
            /* TERMS & CONDITIONS CONTENT                                                */
            /* ========================================================================= */
            <>
              {/* Important Statutory Disclaimer Banner */}
              <div className="p-4 rounded-xl border-l-4 border-semantic-warning bg-semantic-warning-soft">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-semantic-warning shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-semantic-warning text-sm">
                      {isHindi ? 'महत्वपूर्ण सूचना: विधिक व चिकित्सीय अस्वीकरण' : 'Critical Civic Notice: Non-Advisory Disclaimer'}
                    </h3>
                    <p className="text-xs text-text-primary mt-1">
                      {isHindi
                        ? 'सेतु एक नागरिक सहायता व सूचना अनुवादक मंच है। सेतु किसी भी प्रकार की आधिकारिक कानूनी, चिकित्सीय या वित्तीय सलाह प्रदान नहीं करता है। किसी भी नोटिस या रिपोर्ट पर कार्रवाई करने से पहले अधिकृत वकील, डॉक्टर या संबंधित सरकारी अधिकारी से सत्यापन अवश्य करें।'
                        : 'Setu is an informational bridge and accessibility platform. Setu does NOT provide certified legal counsel, licensed medical advice, or formal financial consultation. All plain-language interpretations must be verified with certified professionals or the issuing statutory authority.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">1</span>
                  {isHindi ? 'शर्तों की स्वीकृति व उद्देश्य' : 'Acceptance of Terms & Civic Purpose'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'सेतु ("हम", "हमारा" या "प्लेटफ़ॉर्म") का उपयोग करके आप इन नियमों और शर्तों से बाध्य होने के लिए अपनी सहमति व्यक्त करते हैं। सेतु का मुख्य उद्देश्य आम नागरिकों, वरिष्ठ नागरिकों और परिवारों को जटिल कानूनी नोटिस (जैसे बैंक SARFAESI), बीमा दावे की अस्वीकृति और चिकित्सा रिपोर्टों को सरल, साक्ष्य-आधारित भाषा में समझाना और उन्हें संबंधित सरकारी योजनाओं व निःशुल्क कानूनी सहायता से जोड़ना है।'
                    : 'By accessing or using Setu ("we", "our", or "the platform"), you agree to be bound by these Terms and Conditions. Setu is created as a civic utility to bridge the gap between complex legal, medical, and financial notices and everyday citizens through plain-language interpretations, evidence verification, and connected statutory resources.'}
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">2</span>
                  {isHindi ? 'साक्ष्य-आधारित व्याख्या व कृत्रिम बुद्धिमत्ता (AI) की सीमाएं' : 'Evidence-Grounded Interpretation & AI Limitations'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'सेतु गूगल जेमिनी (Google Gemini API) जैसी उन्नत तकनीक का उपयोग करता है। हम किसी भी अनुमान को सच मानने के बजाय मूल दस्तावेज़ से सटीक उद्धरण (Verbatim Evidence Quotes) प्रस्तुत करते हैं और जो बातें दस्तावेज़ में स्पष्ट नहीं हैं, उन्हें "अनिश्चितताएं" (Uncertainties) के रूप में चिह्नित करते हैं। यद्यपि हम अत्यधिक सटीकता बनाए रखने का प्रयास करते हैं, फिर भी एआई द्वारा उत्पन्न व्याख्याओं में मानवीय त्रुटि संभव है। नागरिक हमेशा मूल उद्धरणों की जांच करें।'
                    : 'Setu utilizes Google Gemini multimodal models to extract and explain document contents. We enforce strict anti-hallucination guardrails: interpretations are paired with verbatim quotes directly found in your notice, and missing facts are explicitly highlighted. However, automated interpretations can never replace human judicial or medical judgment. Always cross-reference the extracted evidence quotes against your physical document.'}
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">3</span>
                  {isHindi ? 'खाता सुरक्षा व एकबारगी पासवर्ड (OTP)' : 'Citizen Accounts & Email OTP Security'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'सेतु में साइन इन करने के लिए एकबारगी पासवर्ड (OTP) का उपयोग किया जाता है। नागरिक अपने पंजीकृत ईमेल पते की सुरक्षा के लिए स्वयं जिम्मेदार हैं। ओटीपी 10 मिनट के लिए मान्य होता है। किसी भी अन्य व्यक्ति के साथ अपना ओटीपी साझा न करें।'
                    : 'Access to citizen profiles is authenticated via 6-digit email One-Time Passwords (OTPs). You are responsible for maintaining the confidentiality and security of your email inbox. OTPs expire within 10 minutes. Setu will never ask for your passwords, bank PINs, or UPI credentials.'}
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">4</span>
                  {isHindi ? 'स्वीकार्य उपयोग व नागरिक आचार संहिता' : 'Acceptable Use & User Conduct'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'आप सहमत हैं कि आप सेतु पर कोई भी दुर्भावनापूर्ण सॉफ़्टवेयर, वायरस, कॉपीराइट का उल्लंघन करने वाली सामग्री या गैर-कानूनी दस्तावेज़ अपलोड नहीं करेंगे। सेतु केवल वास्तविक नागरिक समस्याओं (बैंक नोटिस, चिकित्सा रिपोर्ट, सरकारी आदेश) के विश्लेषण और सहायता के लिए है।'
                    : 'You agree to use Setu solely for lawful, personal, and civic purposes. You must not upload malicious files, trojans, defamatory materials, or unauthorized documents containing third-party classified state secrets. Automated scraping or denial-of-service attempts against Setu servers are strictly prohibited.'}
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">5</span>
                  {isHindi ? 'सरकारी डेटा व वैधानिक संसाधनों का संदर्भ' : 'Open Public Data & Statutory Portals'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'सेतु पर प्रदर्शित मंडी मूल्य, अस्पताल सूची, वायु गुणवत्ता और वैधानिक हेल्पलाइन (जैसे नालसा 15100, राष्ट्रीय उपभोक्ता हेल्पलाइन 1915, एल्डरलाइन 14567) आधिकारिक सार्वजनिक स्रोतों और data.gov.in पर आधारित हैं। इन संस्थाओं के नियम, कार्य समय और पात्रता शर्तें उनके अपने संबंधित मंत्रालयों द्वारा नियंत्रित होती हैं।'
                    : 'All open government data, mandi commodity prices, AQI indices, and statutory directory listings (including NALSA, National Consumer Helpline 1915, and Elderline 14567) are derived from official public sources and data.gov.in. Operational schedules, eligibility criteria, and helpline availability remain subject to the respective issuing authorities.'}
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">6</span>
                  {isHindi ? 'दायित्व की सीमा' : 'Limitation of Liability'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'कानून द्वारा अनुमत अधिकतम सीमा तक, सेतु या इसके डेवलपर किसी भी प्रत्यक्ष, अप्रत्यक्ष, आकस्मिक या दंडात्मक नुकसान (जैसे बैंक द्वारा संपत्ति जब्ती, छूटी हुई कानूनी समय-सीमा, या चिकित्सा जटिलताएं) के लिए उत्तरदायी नहीं होंगे। सेतु आपको सशक्त बनाने का एक माध्यम है, अंतिम निर्णयकर्ता नहीं।'
                    : 'To the fullest extent permitted by applicable law, Setu and its developers disclaim liability for any direct, indirect, incidental, or consequential damages resulting from reliance on simplified interpretations, missed procedural court deadlines, or loan recovery proceedings. Users retain ultimate responsibility for consulting qualified legal practitioners.'}
                </p>
              </section>
            </>
          ) : (
            /* ========================================================================= */
            /* PRIVACY POLICY CONTENT                                                    */
            /* ========================================================================= */
            <>
              {/* Privacy Highlights Banner */}
              <div className="p-4 rounded-xl border border-border bg-porcelain space-y-2">
                <div className="flex items-center gap-2 text-aubergine font-bold text-sm">
                  <Lock className="w-4 h-4 text-aubergine" />
                  {isHindi ? 'सेतु का नागरिक गोपनीयता संकल्प' : 'Setu Civic Privacy Commitment'}
                </div>
                <p className="text-xs text-text-secondary">
                  {isHindi
                    ? 'हम नागरिकों के संवेदनशील दस्तावेज़ों का सम्मान करते हैं। हम आपका व्यक्तिगत डेटा या अपलोड किए गए नोटिस कभी भी किसी विज्ञापनदाता, बैंक रिकवरी एजेंट या बीमा कंपनी को नहीं बेचते हैं।'
                    : 'We believe citizens have an inherent right to understand notices without surveillance. We never sell, broker, or monetize your personal health data, bank notices, or case dossiers.'}
                </p>
              </div>

              {/* Exact Disclosures: What gets saved in our app */}
              <section className="space-y-3">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <Eye className="w-5 h-5 text-aubergine" />
                  {isHindi ? 'सेतु में वास्तव में क्या जानकारी संसाधित व सहेजी जाती है?' : 'What Exactly Gets Collected & Saved in Setu?'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl border border-border bg-surface">
                    <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-persimmon" />
                      {isHindi ? '1. दस्तावेज़ पाठ व फाइलें' : '1. Notice Text & File Uploads'}
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1">
                      {isHindi
                        ? 'आपके द्वारा पेस्ट किया गया नोटिस का पाठ, पीडीएफ या फोटो (JPG/PNG)। इसे केवल विश्लेषण पूरा करने के लिए अस्थायी रूप से मेमोरी में प्रोसेस किया जाता है।'
                        : 'The document text you paste, or uploaded PDF/image files. Used solely to extract evidence and generate your plain-language dossier.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-surface">
                    <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />
                      {isHindi ? '2. सहेजी गई केस फाइलें (Dossiers)' : '2. Saved Case Dossiers & Checklists'}
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1">
                      {isHindi
                        ? 'जब आप "Save for Later" चुनते हैं, तो तैयार केस फाइल, चेकलिस्ट की स्थिति और जुड़े हुए सरकारी संसाधन आपके रिकॉर्ड में सुरक्षित रहते हैं।'
                        : 'When you choose to save, the simplified interpretation, verbatim quotes, action tasks, and bookmarked civic resources are saved for your clinic/bank visit.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-surface">
                    <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-aubergine" />
                      {isHindi ? '3. नागरिक प्रोफ़ाइल (Sign In/Up)' : '3. Citizen Account Information'}
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1">
                      {isHindi
                        ? 'आपका नाम, ईमेल पता और लॉगिन समय। पासवर्ड का कोई झंझट नहीं—केवल सुरक्षित 6-अंकीय ईमेल ओटीपी।'
                        : 'Your full name, verified email address, and authentication session timestamps. No permanent passwords stored.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-surface">
                    <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brass" />
                      {isHindi ? '4. स्थानीय प्राथमिकताएं (Preferences)' : '4. Local Device Preferences'}
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1">
                      {isHindi
                        ? 'आपकी चुनी हुई भाषा (हिन्दी/English), फ़ॉन्ट आकार (A/A+/A++) और अनाम सत्र आईडी आपके ब्राउज़र में ही रहती है।'
                        : 'Your chosen language (English/Hindi), elder reading size preference (A/A+/A++), and anonymous session tokens in localStorage.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2: AI Processing & Google Gemini */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">1</span>
                  {isHindi ? 'कृत्रिम बुद्धिमत्ता प्रसंस्करण (Google Gemini API)' : 'AI Processing Safeguards (Google Gemini)'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'दस्तावेज़ की व्याख्या और साक्ष्य निकालने के लिए पाठ को एन्क्रिप्टेड HTTPS कनेक्शन के माध्यम से Google Gemini API को भेजा जाता है। आपके दस्तावेज़ों का उपयोग सार्वजनिक वाणिज्यिक एआई मॉडल को प्रशिक्षित (Train) करने के लिए नहीं किया जाता है।'
                    : 'Document interpretation is processed via encrypted HTTPS calls to the official Google Gemini API (gemini-2.5-flash). Your sensitive personal notices are not licensed, retained, or utilized to train public foundation models.'}
                </p>
              </section>

              {/* Section 3: Voice Recognition */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">2</span>
                  {isHindi ? 'आवाज द्वारा श्रुतलेख (Voice Dictation)' : 'Voice Dictation & Speech Handling'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'आवाज नियंत्रण आपके डिवाइस के इन-बिल्ट वेब स्पीच इंजन द्वारा स्थानीय रूप से पाठ में परिवर्तित होता है। सेतु के सर्वर पर कोई भी ऑडियो रिकॉर्डिंग सहेजी नहीं जाती है।'
                    : 'Voice dictation is converted to text client-side via your browser’s standard Web Speech API. Setu never stores or records your raw audio files on remote servers.'}
                </p>
              </section>

              {/* Section 4: Data Storage - Local vs Cloud */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">3</span>
                  {isHindi ? 'स्थानीय बनाम क्लाउड डेटा संग्रहण' : 'Local Storage vs. Cloud Account Sync'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'यदि आप बिना साइन इन किए गेस्ट सत्र में सेतु का उपयोग करते हैं, तो सभी रिकॉर्ड केवल आपके वर्तमान ब्राउज़र में ही रहते हैं। साइन इन करने पर आपके सहेजे गए रिकॉर्ड सुरक्षित डेटाबेस में सिंक होते हैं ताकि आप फोन या कंप्यूटर पर उन्हें दोबारा देख सकें।'
                    : 'For guest sessions, case files are kept exclusively on your local device via browser storage. When signed in, records are securely synced to your private citizen database profile so you can access your case file when visiting your bank branch or clinic.'}
                </p>
              </section>

              {/* Section 5: Deletion & Full Control */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-semantic-error" />
                  {isHindi ? 'डेटा हटाने का पूर्ण अधिकार' : 'Right to Erasure & Instant Record Deletion'}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  {isHindi
                    ? 'आप "सहेजे गए रिकॉर्ड" (Saved Records) टैब से किसी भी समय किसी भी केस फाइल को एक क्लिक में स्थायी रूप से हटा सकते हैं। ब्राउज़र कैश साफ़ करने से सभी स्थानीय डेटा तुरंत मिट जाता है।'
                    : 'You maintain absolute ownership over your records. Any saved case dossier or bookmarked resource can be permanently deleted with a single tap in the "Saved Records" tab. Clearing your browser cache instantly wipes all local session records.'}
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 bg-canvas border-t border-border">
          <p className="text-[11px] text-text-muted">
            {isHindi
              ? 'अंतिम अद्यतन: अक्टूबर 2026 • सेतु नागरिक अधिकार परिषद'
              : 'Last Updated: October 2026 • Setu Citizen Rights Council'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-aubergine hover:bg-aubergine-hover text-white transition-colors shadow-sm"
          >
            {isHindi ? 'समझ लिया, बंद करें' : 'I Understand'}
          </button>
        </div>
      </div>
    </div>
  );
};
