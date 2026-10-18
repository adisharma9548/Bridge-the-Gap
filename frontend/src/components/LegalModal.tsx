import React, { useState } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Lock, Eye, Trash2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: 'terms' | 'privacy';
  onClose: () => void;
  lang?: string;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

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
                {activeTab === 'terms' ? 'Setu: Terms & Conditions' : 'Setu: Privacy Policy & Data Safeguards'}
              </h2>
              <p className="text-xs text-text-secondary">
                Plain-language disclosure of citizen rights, legal boundaries & data handling
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
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
            1. Terms of Service
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
            2. Privacy & Data Policy
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 text-sm text-text-primary leading-relaxed">
          {activeTab === 'terms' ? (
            /* TERMS & CONDITIONS */
            <>
              <div className="p-4 rounded-xl border-l-4 border-semantic-warning bg-semantic-warning-soft">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-semantic-warning shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-semantic-warning text-sm">
                      Critical Civic Notice: Non-Advisory Disclaimer
                    </h3>
                    <p className="text-xs text-text-primary mt-1">
                      Setu is an informational bridge and accessibility platform. Setu does NOT provide certified legal counsel, licensed medical advice, or formal financial consultation. All plain-language interpretations must be verified with certified professionals or the issuing statutory authority.
                    </p>
                  </div>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">1</span>
                  Acceptance of Terms & Civic Purpose
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  By accessing or using Setu, you agree to be bound by these Terms and Conditions. Setu is created as a civic utility to bridge the gap between complex legal, medical, and financial notices and everyday citizens through plain-language interpretations, evidence verification, and connected statutory resources.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">2</span>
                  Evidence-Grounded Interpretation & AI Limitations
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  Setu utilizes Google Gemini multimodal models to extract and explain document contents. We enforce strict anti-hallucination guardrails: interpretations are paired with verbatim quotes directly found in your notice, and missing facts are explicitly highlighted. However, automated interpretations can never replace human judicial or medical judgment. Always cross-reference the extracted evidence quotes against your physical document.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">3</span>
                  Citizen Accounts & Security Verification
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  Access to citizen profiles is authenticated via 6-digit email One-Time Passwords (OTPs) or encrypted passwords set through Gmail verification. You are responsible for maintaining the confidentiality of your credentials. Setu will never ask for your bank passwords, PINs, or financial secrets.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">4</span>
                  Acceptable Use & Conduct
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  You agree to use Setu solely for lawful, personal, and civic purposes. You must not upload malicious files, trojans, defamatory materials, or unauthorized documents containing third-party classified state secrets. Automated scraping or denial-of-service attempts against Setu servers are strictly prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">5</span>
                  Open Public Data & Statutory Portals
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  All open government data, mandi commodity prices, AQI indices, and statutory directory listings (including NALSA, National Consumer Helpline 1915, and Elderline 14567) are derived from official public sources and data.gov.in. Operational schedules, eligibility criteria, and helpline availability remain subject to the respective issuing authorities.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">6</span>
                  Limitation of Liability
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  To the fullest extent permitted by applicable law, Setu and its developers disclaim liability for any direct, indirect, incidental, or consequential damages resulting from reliance on simplified interpretations, missed procedural court deadlines, or loan recovery proceedings. Users retain ultimate responsibility for consulting qualified legal practitioners.
                </p>
              </section>
            </>
          ) : (
            /* PRIVACY POLICY */
            <>
              <div className="p-4 rounded-xl border border-border bg-porcelain space-y-2">
                <div className="flex items-center gap-2 text-aubergine font-bold text-sm">
                  <Lock className="w-4 h-4 text-aubergine" />
                  Setu Civic Privacy Commitment
                </div>
                <p className="text-xs text-text-secondary">
                  We believe citizens have an inherent right to understand notices without surveillance. We never sell, broker, or monetize your personal health data, bank notices, or case dossiers.
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <Eye className="w-5 h-5 text-aubergine" />
                  What Exactly Gets Collected & Saved in Setu?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-border bg-surface">
                    <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-persimmon" />
                      1. Notice Text & File Uploads
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1">
                      The document text you paste, or uploaded PDF/image files. Used solely in memory to extract evidence and generate your plain-language dossier.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-surface">
                    <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />
                      2. Saved Case Dossiers & Checklists
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1">
                      When you choose to save, the simplified interpretation, verbatim quotes, action tasks, and bookmarked civic resources are saved for your clinic/bank visit.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-surface">
                    <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-aubergine" />
                      3. Citizen Account Information
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1">
                      Your full name, verified email address, hashed password, and authentication session timestamps.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border bg-surface">
                    <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brass" />
                      4. Local Device Preferences
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-1">
                      Your reading preferences and anonymous session tokens in localStorage.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">1</span>
                  AI Processing Safeguards (Google Gemini)
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  Document interpretation is processed via encrypted HTTPS calls to the official Google Gemini API (gemini-2.5-flash). Your sensitive personal notices are not licensed, retained, or utilized to train public foundation models.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">2</span>
                  Voice Dictation & Speech Handling
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  Voice dictation is converted to text client-side via your browser’s standard Web Speech API. Setu never stores or records your raw audio files on remote servers.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-aubergine-soft text-aubergine text-xs flex items-center justify-center font-black">3</span>
                  Local Storage vs. Cloud Account Sync
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  For guest sessions, case files are kept exclusively on your local device via browser storage. When signed in, records are securely synced to your private citizen database profile so you can access your case file when visiting your bank branch or clinic.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-aubergine flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-semantic-error" />
                  Right to Erasure & Instant Record Deletion
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm">
                  You maintain absolute ownership over your records. Any saved case dossier or bookmarked resource can be permanently deleted with a single tap in the "Saved Records" tab. Clearing your browser cache instantly wipes all local session records.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 bg-canvas border-t border-border">
          <p className="text-[11px] text-text-muted">
            Last Updated: October 2026 • Setu Citizen Rights Council
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-aubergine hover:bg-aubergine-hover text-white transition-colors shadow-sm"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
