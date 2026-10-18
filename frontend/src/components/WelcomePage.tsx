import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Mail,
  User as UserIcon,
  Sparkles,
  PhoneCall,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Language } from '../i18n/translations';
import { LegalModal } from './LegalModal';

interface WelcomePageProps {
  lang: Language;
  onToggleLang: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onCycleFontSize: () => void;
  apiBaseUrl: string;
  onAuthSuccess: (user: { id: string; email: string; name: string }, token: string) => void;
  onContinueGuest: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  lang,
  onToggleLang,
  fontSize,
  onCycleFontSize,
  apiBaseUrl,
  onAuthSuccess,
  onContinueGuest,
}) => {
  const isHindi = lang === 'hi';

  // Auth Card State
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConsentWarning, setShowConsentWarning] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devOtpPreview, setDevOtpPreview] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Legal Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const openLegal = (tabType: 'terms' | 'privacy') => {
    setLegalModalTab(tabType);
    setLegalModalOpen(true);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowConsentWarning(false);

    if (!agreedToTerms) {
      setShowConsentWarning(true);
      setErrorMessage(
        isHindi
          ? 'आगे बढ़ने के लिए कृपया नियम और शर्तों तथा गोपनीयता नीति को स्वीकार करें।'
          : 'Please review and tick the Terms & Conditions and Privacy Policy checkbox to proceed.'
      );
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(isHindi ? 'कृपया एक मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    if (tab === 'register' && !name.trim()) {
      setErrorMessage(isHindi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          type: tab === 'register' ? 'register' : 'login',
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep('otp');
        setSuccessMessage(
          data.message ||
            (isHindi
              ? `6-अंकीय सत्यापन कोड ${cleanEmail} पर भेज दिया गया है।`
              : `6-digit verification code sent to ${cleanEmail}.`)
        );
        if (data.otpPreview) {
          setDevOtpPreview(data.otpPreview);
        }
        setResendCooldown(45);
        setTimeout(() => otpInputs.current[0]?.focus(), 150);
      } else {
        setErrorMessage(data.message || (isHindi ? 'ओटीपी भेजने में असमर्थ। कृपया पुनः प्रयास करें।' : 'Failed to send OTP. Please try again.'));
      }
    } catch {
      setErrorMessage(
        isHindi
          ? 'सर्वर से संपर्क करने में असमर्थ। कृपया जांचें कि बैकएंड सक्रिय है।'
          : 'Unable to contact server. Please verify backend service is active.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '') && index === 5) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputs.current[nextFocus]?.focus();
      if (pasted.length === 6) {
        handleVerifyOtp(pasted);
      }
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      setErrorMessage(isHindi ? 'कृपया 6-अंकीय कोड दर्ज करें।' : 'Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: code,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user && data.token) {
        localStorage.setItem('setu_terms_accepted', 'true');
        onAuthSuccess(data.user, data.token);
      } else {
        setErrorMessage(data.message || (isHindi ? 'गलत या समाप्त हो चुका ओटीपी।' : 'Invalid or expired OTP code.'));
      }
    } catch {
      setErrorMessage(isHindi ? 'सत्यापन विफल रहा। पुनः प्रयास करें।' : 'Verification failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    setShowConsentWarning(false);
    setErrorMessage(null);

    if (!agreedToTerms) {
      setShowConsentWarning(true);
      setErrorMessage(
        isHindi
          ? 'अनाम सत्र में भी आगे बढ़ने के लिए कृपया नियम व शर्तें तथा गोपनीयता नीति को स्वीकार करें।'
          : 'Please tick the Terms & Conditions and Privacy Policy checkbox to continue as Guest.'
      );
      return;
    }

    localStorage.setItem('setu_terms_accepted', 'true');
    onContinueGuest();
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between selection:bg-brand-primary-soft selection:text-aubergine">
      {/* Top Civic Masthead */}
      <header className="w-full border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Mark */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center px-3 py-1.5 rounded-xl bg-aubergine text-white font-black text-lg tracking-wide shadow-sm border border-aubergine-hover">
              <span>सेतु</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-text-primary tracking-tight">
                  Setu <span className="text-text-secondary font-semibold text-xs sm:text-sm">(सेतु)</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-aubergine-soft text-aubergine border border-aubergine/20">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-brass fill-brass" /> Devlympics 2026
                </span>
              </div>
              <p className="text-[11px] text-text-secondary hidden sm:block">
                {isHindi ? 'जटिल सूचना से साक्ष्य-आधारित नागरिक समाधान' : 'Complex Information to Grounded Citizen Action'}
              </p>
            </div>
          </div>

          {/* Senior Accessibility Cluster: Font Scaler & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font Scaler Pill */}
            <button
              type="button"
              onClick={onCycleFontSize}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-canvas text-text-primary text-xs font-bold transition-all shadow-xs"
              title={isHindi ? 'अक्षर का आकार बदलें' : 'Change reading font size'}
              aria-label="Toggle font scale"
            >
              <span className="text-[11px] text-text-secondary">Text:</span>
              <span className="text-aubergine font-black">
                {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
              </span>
            </button>

            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-aubergine bg-aubergine-soft text-aubergine hover:bg-aubergine hover:text-white text-xs font-black transition-all shadow-xs"
              title="Switch Language / भाषा बदलें"
            >
              {isHindi ? 'English' : 'हिन्दी'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Authentication Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Civic Value Pillars & Product Mission */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-persimmon-soft text-persimmon border border-persimmon/20">
              <span className="w-2 h-2 rounded-full bg-persimmon animate-pulse" />
              {isHindi ? 'आधिकारिक नागरिक सूचना सेतु' : 'Official Citizen Information Bridge'}
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-[1.15]">
                {isHindi ? (
                  <>
                    जटिल नोटिस और चिकित्सा रिपोर्टों को बदलें{' '}
                    <span className="text-aubergine underline decoration-persimmon decoration-4 underline-offset-6">
                      स्पष्ट नागरिक कदमों में।
                    </span>
                  </>
                ) : (
                  <>
                    Transform intimidating notices into{' '}
                    <span className="text-aubergine underline decoration-persimmon decoration-4 underline-offset-6">
                      grounded, actionable citizen steps.
                    </span>
                  </>
                )}
              </h1>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
                {isHindi
                  ? 'बैंक SARFAESI नोटिस, बीमा दावे की अस्वीकृति और अस्पताल की जाँच रिपोर्टों को सरल बनाएं। सटीक साक्ष्य उद्धरण, प्राथमिकता वाली चेकलिस्ट और मुफ़्त सरकारी कानूनी व स्वास्थ्य सेवाओं से तुरंत जुड़ें।'
                  : 'Setu bridges the divide between adversarial statutory language and everyday citizens. Extract verifiable quotes, generate step-by-step action checklists, and connect directly to official legal aid and statutory helplines.'}
              </p>
            </div>

            {/* 4 Superpower Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-aubergine-soft text-aubergine shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                    {isHindi ? 'साक्ष्य-आधारित व्याख्या' : 'Evidence-Grounded Dossier'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                    {isHindi ? 'मूल दस्तावेज़ से सटीक उद्धरण व अज्ञात बातों की स्पष्ट पहचान।' : 'Exact verbatim quotes paired with plain meaning; zero AI guessing.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-persimmon-soft text-persimmon shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                    {isHindi ? 'नागरिक कार्य चेकलिस्ट' : 'Practical Action Checklist'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                    {isHindi ? 'महत्वपूर्ण समय-सीमाएं और अधिकारियों से पूछे जाने वाले सटीक प्रश्न।' : 'Prioritized deadlines, missing facts, and exact questions to ask.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-semantic-success-soft text-semantic-success shrink-0 mt-0.5">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                    {isHindi ? 'वैधानिक हेल्पलाइन व पोर्टल' : 'Connected Statutory Redressal'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                    {isHindi ? 'नालसा (15100), उपभोक्ता हेल्पलाइन (1915) व एल्डरलाइन (14567)।' : 'NALSA Free Legal Aid, Consumer Helpline 1915 & Elderline 14567.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-brass/15 text-text-primary shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-aubergine" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                    {isHindi ? 'गोपनीयता व वरिष्ठ-सुविधा' : 'Senior A11y & Data Privacy'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                    {isHindi ? 'स्थानीय डेटा सुरक्षा, आवाज नियंत्रण और वरिष्ठ फ़ॉन्ट स्केलिंग।' : 'Zero data selling, client-side speech controls & WCAG AAA contrast.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Sign In / Sign Up & Consent Gate */}
          <div className="lg:col-span-5">
            <div className="bg-surface rounded-2xl border-2 border-border shadow-xl overflow-hidden p-6 sm:p-8">
              {/* Card Header & Tab Switcher */}
              <div className="mb-6">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-persimmon" />
                    <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                      {isHindi ? 'नागरिक प्रवेश द्वार' : 'Citizen Access Gate'}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted font-medium">
                    {step === 'email' ? (isHindi ? 'चरण 1 / 2' : 'Step 1 of 2') : (isHindi ? 'चरण 2 / 2' : 'Step 2 of 2')}
                  </span>
                </div>

                {step === 'email' && (
                  <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-xl bg-canvas border border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signin');
                        setErrorMessage(null);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        tab === 'signin'
                          ? 'bg-aubergine text-white shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {isHindi ? 'साइन इन करें' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('register');
                        setErrorMessage(null);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        tab === 'register'
                          ? 'bg-aubergine text-white shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {isHindi ? 'नया खाता बनाएं' : 'Create Account'}
                    </button>
                  </div>
                )}
              </div>

              {/* Status Alert Banners */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-semantic-error-soft border border-semantic-error/30 text-semantic-error flex items-start gap-2.5 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-semantic-success-soft border border-semantic-success/30 text-semantic-success flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{successMessage}</span>
                </div>
              )}

              {/* STEP 1: Email & Name Input */}
              {step === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {tab === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1.5">
                        {isHindi ? 'आपका पूरा नाम' : 'Full Name'}
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={isHindi ? 'उदा. आरव शर्मा' : 'e.g. Aarav Sharma'}
                          className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">
                      {isHindi ? 'ईमेल पता' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="citizen@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">
                      {isHindi
                        ? 'पासवर्ड की आवश्यकता नहीं है। हम आपके ईमेल पर 6-अंकीय सुरक्षित कोड भेजेंगे।'
                        : 'No password needed. We will send a secure 6-digit login OTP.'}
                    </p>
                  </div>

                  {/* MANDATORY TERMS & PRIVACY POLICY CHECKBOX */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      showConsentWarning
                        ? 'border-semantic-error bg-semantic-error-soft/30'
                        : agreedToTerms
                        ? 'border-aubergine/40 bg-aubergine-soft/30'
                        : 'border-border bg-canvas'
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked);
                          if (e.target.checked) setShowConsentWarning(false);
                        }}
                        className="mt-1 w-4 h-4 rounded border-border-strong text-aubergine focus:ring-aubergine cursor-pointer accent-aubergine shrink-0"
                      />
                      <span className="text-xs text-text-primary leading-relaxed">
                        {isHindi ? (
                          <>
                            मैं सेतु के{' '}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                openLegal('terms');
                              }}
                              className="font-black text-aubergine underline hover:text-aubergine-hover cursor-pointer"
                            >
                              नियम और शर्तों
                            </button>{' '}
                            तथा{' '}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                openLegal('privacy');
                              }}
                              className="font-black text-aubergine underline hover:text-aubergine-hover cursor-pointer"
                            >
                              गोपनीयता नीति
                            </button>{' '}
                            से पूरी तरह सहमत हूं। मैं समझता/ती हूं कि मेरे दस्तावेज़ केवल सहायता हेतु संसाधित होते हैं।
                          </>
                        ) : (
                          <>
                            I have read and agree to Setu's{' '}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                openLegal('terms');
                              }}
                              className="font-black text-aubergine underline hover:text-aubergine-hover cursor-pointer"
                            >
                              Terms & Conditions
                            </button>{' '}
                            and{' '}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                openLegal('privacy');
                              }}
                              className="font-black text-aubergine underline hover:text-aubergine-hover cursor-pointer"
                            >
                              Privacy Policy
                            </button>
                            . I understand what is processed and how my records are safeguarded.
                          </>
                        )}
                      </span>
                    </label>
                  </div>

                  {/* Primary High-Emphasis Action: Persimmon Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isHindi ? 'सत्यापन कोड (OTP) भेजें' : 'Send Verification OTP'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Zero-Friction Civic Fallback: Continue as Guest (Still Requires Terms Check) */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleGuestEntry}
                      className="text-xs font-bold text-text-secondary hover:text-aubergine underline transition-colors"
                    >
                      {isHindi
                        ? 'या बिना खाते के सीधे ब्राउज़र में जारी रखें (Guest Mode) →'
                        : 'Or continue as Anonymous Citizen (Device-only session) →'}
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: 6-Digit OTP Verification */
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-text-secondary">
                      {isHindi
                        ? `कृपया ईमेल ${email} पर प्राप्त 6-अंकीय कोड दर्ज करें:`
                        : `Please enter the 6-digit code sent to ${email}:`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[11px] text-aubergine font-bold hover:underline mt-1"
                    >
                      {isHindi ? 'ईमेल पता बदलें' : 'Change email address'}
                    </button>
                  </div>

                  {/* Dev / Hackathon Preview Banner */}
                  {devOtpPreview && (
                    <div className="p-2.5 rounded-lg bg-brass/15 border border-brass/30 text-text-primary text-xs flex items-center justify-between">
                      <span className="font-semibold text-[11px]">
                        Demo Auto-Code: <strong className="font-mono text-aubergine">{devOtpPreview}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const digits = devOtpPreview.split('');
                          setOtp(digits);
                          handleVerifyOtp(devOtpPreview);
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-aubergine text-white"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  {/* 6 Digit Inputs */}
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        className="w-10 sm:w-12 h-12 text-center text-lg font-black bg-canvas border border-border-strong rounded-xl text-aubergine focus:outline-none focus:ring-2 focus:ring-aubergine transition-all shadow-xs"
                      />
                    ))}
                  </div>

                  {/* Action Verify Button */}
                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={loading || otp.some((d) => d === '')}
                    className="w-full py-3 px-4 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isHindi ? 'सत्यापित करें व सेतु में प्रवेश करें' : 'Verify & Enter Setu'}</span>
                      </>
                    )}
                  </button>

                  {/* Resend Cooldown */}
                  <div className="text-center pt-1">
                    {resendCooldown > 0 ? (
                      <span className="text-[11px] text-text-muted">
                        {isHindi ? `पुनः भेजें (${resendCooldown} सेकंड)` : `Resend code in ${resendCooldown}s`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-xs text-aubergine font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {isHindi ? 'कोड दोबारा भेजें' : 'Resend code'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Dignified Civic Footer with Legal Links */}
      <footer className="w-full border-t border-border bg-surface px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-aubergine">Setu (सेतु)</span>
            <span>•</span>
            <span>{isHindi ? 'निःशुल्क नागरिक सूचना व साक्ष्य सेतु' : 'Free Civic Knowledge & Accessibility Bridge'}</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-semibold">
            <button
              type="button"
              onClick={() => openLegal('terms')}
              className="hover:text-aubergine transition-colors cursor-pointer"
            >
              {isHindi ? 'सेवा की शर्तें' : 'Terms & Conditions'}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openLegal('privacy')}
              className="hover:text-aubergine transition-colors cursor-pointer"
            >
              {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </button>
            <span>•</span>
            <span className="text-text-muted">
              {isHindi ? 'देवॉलिम्पिक्स 2026' : 'Devlympics 2026'}
            </span>
          </div>
        </div>
      </footer>

      {/* Full Interactive Terms & Privacy Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setLegalModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};
