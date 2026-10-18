import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  User as UserIcon,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
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
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // REGISTRATION FLOW: Name, Email, Password, Confirm Password
    if (tab === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter a password.');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your confirm password.');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: cleanEmail,
            password,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccessMessage('Account created successfully! Please sign in with your password below.');
          setPassword('');
          setConfirmPassword('');
          setTab('signin');
          setAuthMethod('password');
        } else {
          setErrorMessage(data.message || 'Registration failed. Please try again.');
        }
      } catch {
        setErrorMessage('Failed to connect to the registration service.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // SIGN-IN FLOW: Password
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

    // SIGN-IN FLOW: Email OTP
    if (tab === 'signin' && authMethod === 'otp') {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            type: 'login',
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
          type: 'login',
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
        className="relative w-full max-w-md bg-surface rounded-2xl border-2 border-border shadow-2xl overflow-hidden p-6 sm:p-8 min-h-[540px] flex flex-col justify-between"
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-aubergine text-white flex items-center justify-center font-black text-sm">
                <span>S</span>
              </div>
              <div>
                <h2 className="text-base font-black text-text-primary">
                  {tab === 'signin' ? 'Welcome Back' : 'Welcome! Create Your Account'}
                </h2>
                <p className="text-[11px] text-text-secondary">
                  {tab === 'signin' ? 'Sign in to access your saved dossiers' : 'Create an account to save cases & access resources'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          {step === 'email' && (
            <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-xl bg-canvas border border-border">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
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
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'register' ? 'bg-aubergine text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="my-2 p-3 rounded-xl bg-semantic-error-soft border border-semantic-error/30 text-semantic-error flex items-start gap-2.5 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="my-2 p-3 rounded-xl bg-semantic-success-soft border border-semantic-success/30 text-semantic-success flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        {step === 'email' ? (
          <form onSubmit={handleAuthSubmit} className="space-y-3.5 my-auto">
            {tab === 'signin' && (
              <div className="flex items-center justify-end gap-3 text-[11px]">
                <span className="text-text-muted">Sign in with:</span>
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className={`font-bold transition-colors ${
                    authMethod === 'password' ? 'text-aubergine underline' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Password
                </button>
                <span className="text-border-strong">•</span>
                <button
                  type="button"
                  onClick={() => setAuthMethod('otp')}
                  className={`font-bold transition-colors ${
                    authMethod === 'otp' ? 'text-aubergine underline' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Email OTP
                </button>
              </div>
            )}

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Full Name <span className="text-semantic-error">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-text-secondary absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Email Address <span className="text-semantic-error">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                />
              </div>
            </div>

            {/* Password input for sign in or registration */}
            {((tab === 'signin' && authMethod === 'password') || tab === 'register') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-text-primary">
                    Password <span className="text-semantic-error">*</span>
                  </label>
                  {tab === 'signin' && onOpenForgotPassword && (
                    <button
                      type="button"
                      onClick={() => onOpenForgotPassword(email)}
                      className="text-[11px] text-aubergine font-bold hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                  {tab === 'register' && (
                    <span className="text-[10px] text-text-muted">Min. 8 characters</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary p-0.5 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Registration only) */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Confirm Password <span className="text-semantic-error">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary p-0.5 focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {tab === 'register'
                      ? 'Create Account'
                      : authMethod === 'password'
                      ? 'Sign In with Password'
                      : 'Send Verification Code'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 my-auto">
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
                  onClick={() => handleAuthSubmit()}
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
