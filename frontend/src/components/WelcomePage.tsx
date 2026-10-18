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
  Lock,
} from 'lucide-react';
import gsap from 'gsap';
import { LegalModal } from './LegalModal';

interface WelcomePageProps {
  apiBaseUrl: string;
  onAuthSuccess: (user: { id: string; email: string; name: string }, token: string) => void;
  onContinueGuest: () => void;
  onOpenIntroTour?: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  apiBaseUrl,
  onAuthSuccess,
  onContinueGuest,
  onOpenIntroTour,
}) => {
  // Auth Card State
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConsentWarning, setShowConsentWarning] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Legal Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (heroRef.current && cardRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, x: -25 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.15 }
      );
    }
  }, []);

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
      setErrorMessage('Please review and tick the Terms & Conditions and Privacy Policy checkbox to proceed.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (tab === 'register' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    // If signing in with password
    if (tab === 'signin' && authMethod === 'password') {
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/auth/login-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.user && data.token) {
          localStorage.setItem('setu_terms_accepted', 'true');
          onAuthSuccess(data.user, data.token);
        } else {
          setErrorMessage(data.message || 'Incorrect password or account not found.');
        }
      } catch {
        setErrorMessage('Network error while signing in. Please check your connection.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Default: Email OTP Login or Register
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
        setSuccessMessage(`A 6-digit verification code has been sent to ${cleanEmail}. Please check your Gmail.`);
        setResendCooldown(45);
        setTimeout(() => otpInputs.current[0]?.focus(), 150);
      } else {
        setErrorMessage(data.message || 'Failed to send OTP code. Please try again.');
      }
    } catch {
      setErrorMessage('Unable to contact the server. Please verify the backend service is running.');
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
      setErrorMessage('Please enter the full 6-digit code received in your email.');
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
          name: name.trim() || undefined,
          type: tab === 'register' ? 'register' : 'login',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user && data.token) {
        localStorage.setItem('setu_terms_accepted', 'true');
        onAuthSuccess(data.user, data.token);
      } else {
        setErrorMessage(data.message || 'Invalid or expired code. Please request a fresh code.');
      }
    } catch {
      setErrorMessage('Verification request failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    setShowConsentWarning(false);
    setErrorMessage(null);

    if (!agreedToTerms) {
      setShowConsentWarning(true);
      setErrorMessage('Please tick the Terms & Conditions and Privacy Policy checkbox to continue as Guest.');
      return;
    }

    localStorage.setItem('setu_terms_accepted', 'true');
    onContinueGuest();
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col justify-between selection:bg-aubergine-soft selection:text-aubergine">
      {/* Top Header */}
      <header className="w-full border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center px-3 py-1.5 rounded-xl bg-aubergine text-white font-black text-lg tracking-wide shadow-sm border border-aubergine-hover">
              <span>Setu</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-text-primary tracking-tight">
                  Setu
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-aubergine-soft text-aubergine border border-aubergine/20">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-brass fill-brass" /> Devlympics 2026
                </span>
              </div>
              <p className="text-[11px] text-text-secondary hidden sm:block">
                Complex Information to Grounded Citizen Action
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenIntroTour && (
              <button
                type="button"
                onClick={onOpenIntroTour}
                className="text-xs font-bold text-aubergine hover:text-aubergine-hover flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-aubergine-soft/50 hover:bg-aubergine-soft transition-all"
              >
                <span>How Setu Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Gate */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Product Value Hero */}
          <div ref={heroRef} className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-persimmon-soft text-persimmon border border-persimmon/20">
              <span className="w-2 h-2 rounded-full bg-persimmon animate-pulse" />
              <span>Public Information & Action Platform</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-[1.12]">
                Transform intimidating notices into{' '}
                <span className="text-aubergine underline decoration-persimmon decoration-4 underline-offset-6">
                  grounded, actionable steps.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
                Break down complex SARFAESI loan defaults, denied insurance claims, and clinical lab values. Get verifiable evidence extracts, prioritized action checklists, and immediate connections to statutory legal aid and public helplines.
              </p>
            </div>

            {/* 4 Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex items-start gap-3 hover:border-aubergine/40 transition-all">
                <div className="p-2 rounded-lg bg-aubergine-soft text-aubergine shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                    Evidence-Grounded Dossiers
                  </h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                    Exact verbatim citations paired with plain English; zero AI guesswork.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex items-start gap-3 hover:border-persimmon/40 transition-all">
                <div className="p-2 rounded-lg bg-persimmon-soft text-persimmon shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                    Action Checklists & Deadlines
                  </h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                    Prioritized tasks, deadline warnings, and exact questions to ask officials.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex items-start gap-3 hover:border-semantic-success/40 transition-all">
                <div className="p-2 rounded-lg bg-semantic-success-soft text-semantic-success shrink-0 mt-0.5">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                    Direct Statutory Redressal
                  </h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                    One-tap links to NALSA Legal Aid (15100), Consumer Helpline (1915), and Elderline.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex items-start gap-3 hover:border-brass/40 transition-all">
                <div className="p-2 rounded-lg bg-brass/15 text-text-primary shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-aubergine" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-text-primary">
                    Private & Secure by Design
                  </h4>
                  <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
                    Zero data selling. Real-time Gemini 2.5 Flash analysis with client-side privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Auth Gate Card */}
          <div ref={cardRef} className="lg:col-span-5">
            <div className="bg-surface rounded-2xl border-2 border-border shadow-2xl p-6 sm:p-8 space-y-5">
              {/* Card Header & Tab Switcher */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-persimmon animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                      {tab === 'signin' ? 'Sign In to Your Case Hub' : 'Create Free Account'}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted font-medium">
                    {step === 'email' ? 'Step 1 of 2' : 'Step 2 of 2'}
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
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('register');
                        setAuthMethod('otp');
                        setErrorMessage(null);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        tab === 'register'
                          ? 'bg-aubergine text-white shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>

              {/* Status Alert Banners */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-semantic-error-soft border border-semantic-error/30 text-semantic-error flex items-start gap-2.5 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-semantic-success-soft border border-semantic-success/30 text-semantic-success flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{successMessage}</span>
                </div>
              )}

              {/* STEP 1: Inputs & Method Toggle */}
              {step === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {tab === 'signin' && (
                    <div className="flex items-center justify-end gap-3 text-[11px]">
                      <span className="text-text-muted">Sign in with:</span>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('otp')}
                        className={`font-bold transition-colors ${
                          authMethod === 'otp' ? 'text-aubergine underline' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Email OTP
                      </button>
                      <span className="text-border-strong">•</span>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('password')}
                        className={`font-bold transition-colors ${
                          authMethod === 'password' ? 'text-aubergine underline' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Password
                      </button>
                    </div>
                  )}

                  {tab === 'register' && (
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                      />
                    </div>
                  </div>

                  {tab === 'signin' && authMethod === 'password' && (
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                        />
                      </div>
                    </div>
                  )}

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
                        . I understand how my notices are explained and that Setu never sells my data.
                      </span>
                    </label>
                  </div>

                  {/* High-Emphasis Persimmon Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {tab === 'signin' && authMethod === 'password'
                            ? 'Sign In with Password'
                            : 'Send Security Code (OTP)'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Device-Only Session Fallback */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleGuestEntry}
                      className="text-xs font-bold text-text-secondary hover:text-aubergine underline transition-colors"
                    >
                      Or explore as Anonymous Citizen (Device-only session) →
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: 6-Digit OTP Verification */
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-text-secondary">
                      Enter the 6-digit verification code sent to <strong>{email}</strong>:
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-[11px] text-aubergine font-bold hover:underline mt-1"
                    >
                      Change email address
                    </button>
                  </div>

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
                        <span>Verify & Enter Dashboard</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    {resendCooldown > 0 ? (
                      <span className="text-[11px] text-text-muted">
                        Resend security code in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-xs text-aubergine font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend code</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-surface px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-aubergine">Setu</span>
            <span>•</span>
            <span>Free Public Knowledge & Action Bridge</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-semibold">
            <button
              type="button"
              onClick={() => openLegal('terms')}
              className="hover:text-aubergine transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openLegal('privacy')}
              className="hover:text-aubergine transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <span className="text-text-muted">Devlympics 2026</span>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
};
