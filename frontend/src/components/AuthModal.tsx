import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, User as UserIcon, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language, TranslationDictionary } from '../i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id: string; email: string; name: string }, token: string) => void;
  lang: Language;
  t: TranslationDictionary;
  apiBaseUrl: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  lang,
  t,
  apiBaseUrl,
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devOtpPreview, setDevOtpPreview] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setDevOtpPreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(lang === 'hi' ? 'कृपया एक मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    if (tab === 'register' && !name.trim()) {
      setErrorMessage(lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
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
        setSuccessMessage(data.message || t.otpSentMessage);
        if (data.otpPreview) {
          setDevOtpPreview(data.otpPreview);
        }
        setResendCooldown(45);
        setTimeout(() => otpInputs.current[0]?.focus(), 150);
      } else {
        setErrorMessage(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(t.errorFailedFetch);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance to next input
    if (digit && index < 5) {
      otpInputs.current[index + 1]?.focus();
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
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputs.current[nextIndex]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrorMessage(lang === 'hi' ? 'कृपया सभी 6 अंक दर्ज करें।' : 'Please enter all 6 digits of the code.');
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
          otp: otpCode,
          name: name.trim() || undefined,
          type: tab === 'register' ? 'register' : 'login',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user && data.token) {
        onAuthSuccess(data.user, data.token);
        onClose();
      } else {
        setErrorMessage(data.message || 'Verification failed. Incorrect code.');
      }
    } catch (err) {
      setErrorMessage(t.errorFailedFetch);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#29232B]/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-surface rounded-2xl border border-border shadow-elevated overflow-hidden text-text-primary">
        {/* Header (Aubergine) */}
        <div className="bg-aubergine text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {step === 'otp' ? t.enterOtpTitle : t.signInOrRegisterTitle}
                </h2>
                <p className="text-sm text-aubergine-soft">
                  {step === 'otp' ? `${t.enterOtpSubtitle} ${email}` : t.brandTagline}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab bar if in email step */}
          {step === 'email' && (
            <div className="flex gap-2 mt-5 p-1 bg-white/10 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-white text-aubergine shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {t.signInTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'bg-white text-aubergine shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {t.registerTab}
              </button>
            </div>
          )}
        </div>

        {/* Content Body (Canvas / Surface) */}
        <div className="p-6 md:p-8 bg-canvas">
          {errorMessage && (
            <div className="mb-5 p-4 rounded-xl bg-semantic-error-soft border border-semantic-error/30 text-semantic-error flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-semantic-error shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-4 rounded-xl bg-semantic-success-soft border border-semantic-success/30 text-semantic-success flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-semantic-success shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* Dev OTP Helper Pill */}
          {devOtpPreview && step === 'otp' && (
            <div className="mb-5 p-3 rounded-lg bg-aubergine-soft border border-aubergine/20 text-aubergine text-xs flex items-center justify-between">
              <span><strong>Live OTP Code:</strong> {devOtpPreview}</span>
              <button
                type="button"
                onClick={() => {
                  const digits = devOtpPreview.split('');
                  setOtp(digits);
                }}
                className="px-2.5 py-1 bg-aubergine text-white rounded font-bold hover:bg-aubergine-hover cursor-pointer"
              >
                Auto Fill
              </button>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {tab === 'register' && (
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-aubergine" />
                    {t.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine focus:border-transparent text-base"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-aubergine" />
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine focus:border-transparent text-base"
                  required
                />
                <p className="mt-2 text-xs text-text-secondary">
                  {lang === 'hi'
                    ? 'हम आपको 6-अंकों का सुरक्षित सत्यापन कोड ईमेल करेंगे। कोई पासवर्ड याद रखने की ज़रूरत नहीं।'
                    : 'We will send a secure 6-digit verification code to your email. No passwords needed!'}
                </p>
              </div>

              {/* High-Emphasis Action: Persimmon */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t.sendingOtp}</span>
                  </>
                ) : (
                  <>
                    <span>{t.sendOtpBtn}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-sm font-bold text-center text-text-primary mb-4">
                  {lang === 'hi' ? 'ईमेल में प्राप्त 6 अंकों का कोड दर्ज करें:' : 'Enter 6-digit code from email:'}
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
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
                      className="w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-bold font-mono rounded-xl border border-border-strong bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine focus:border-transparent shadow-xs"
                    />
                  ))}
                </div>
              </div>

              <div className="bg-semantic-info-soft p-3.5 rounded-xl border border-semantic-info/20 text-xs text-text-primary leading-relaxed">
                <span className="font-bold text-semantic-info">💡 {t.otpSpamHint}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp(['', '', '', '', '', '']);
                    setErrorMessage(null);
                  }}
                  className="text-aubergine font-bold hover:underline cursor-pointer"
                >
                  {lang === 'hi' ? '← ईमेल बदलें' : '← Change Email'}
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={() => handleSendOtp()}
                  className="text-aubergine font-bold hover:underline disabled:text-text-muted disabled:no-underline cursor-pointer"
                >
                  {resendCooldown > 0
                    ? `${t.resendCountdown} ${resendCooldown}s`
                    : t.resendOtpBtn}
                </button>
              </div>

              {/* High-Emphasis Action: Persimmon */}
              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{t.verifyingOtp}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{t.verifyAndContinueBtn}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
