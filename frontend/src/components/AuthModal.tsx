import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, User as UserIcon, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import gsap from 'gsap';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id: string; email: string; name: string }, token: string) => void;
  apiBaseUrl: string;
  onOpenForgotPassword?: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  apiBaseUrl,
  onOpenForgotPassword,
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (tab === 'register' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    // Password sign-in path
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
          onAuthSuccess(data.user, data.token);
          onClose();
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

    // Email OTP path
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
        setSuccessMessage(`A 6-digit verification code has been sent to ${cleanEmail}.`);
        setResendCooldown(45);
        setTimeout(() => otpInputs.current[0]?.focus(), 150);
      } else {
        setErrorMessage(data.message || 'Failed to send verification code. Please try again.');
      }
    } catch {
      setErrorMessage('Failed to connect to the authentication service.');
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
      setErrorMessage('Please enter all 6 digits of the code.');
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
        setErrorMessage(data.message || 'Invalid or expired code. Please try again.');
      }
    } catch {
      setErrorMessage('Verification failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-surface rounded-2xl border-2 border-border shadow-2xl overflow-hidden p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-aubergine text-white flex items-center justify-center font-black text-sm">
              <span>S</span>
            </div>
            <div>
              <h2 className="text-base font-black text-text-primary">
                {tab === 'signin' ? 'Sign In to Setu' : 'Create Citizen Account'}
              </h2>
              <p className="text-[11px] text-text-secondary">Save dossiers & access verified civic resources</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {step === 'email' && (
          <div className="grid grid-cols-2 gap-2 my-4 p-1 rounded-xl bg-canvas border border-border">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'signin' ? 'bg-aubergine text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
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
                tab === 'register' ? 'bg-aubergine text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Status Alerts */}
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

        {/* Form Body */}
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
                <label className="block text-xs font-bold text-text-primary mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                />
              </div>
            </div>

            {tab === 'signin' && authMethod === 'password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-text-primary">Password</label>
                  {onOpenForgotPassword && (
                    <button
                      type="button"
                      onClick={() => onOpenForgotPassword(email)}
                      className="text-[11px] text-aubergine font-bold hover:underline"
                    >
                      Forgot / Set Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                  />
                </div>
              </div>
            )}

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
                    {tab === 'signin' && authMethod === 'password' ? 'Sign In with Password' : 'Send Verification Code'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center">
              <p className="text-xs text-text-secondary">
                Enter the 6-digit code sent to <strong>{email}</strong>:
              </p>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-[11px] text-aubergine font-bold hover:underline mt-1"
              >
                Change email address
              </button>
            </div>

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
              type="submit"
              disabled={loading || otp.some((d) => d === '')}
              className="w-full py-3 px-4 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Enter</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              {resendCooldown > 0 ? (
                <span className="text-[11px] text-text-muted">Resend code in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-xs text-aubergine font-bold hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend code</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
