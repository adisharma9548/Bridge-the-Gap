import React, { useState } from 'react';
import { X, Lock, Mail, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  apiBaseUrl: string;
  onSuccess?: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  apiBaseUrl,
  onSuccess,
}) => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/send-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('verify');
        setSuccessMessage(`A 6-digit verification code has been sent to ${cleanEmail}. Please check your Gmail.`);
      } else {
        setErrorMessage(data.message || 'Failed to send verification code. Please verify your email.');
      }
    } catch {
      setErrorMessage('Unable to contact the security service. Please ensure the backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code received in your email.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Your password has been successfully updated! You can now use it to sign in.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1800);
      } else {
        setErrorMessage(data.message || 'Password update failed. Code may be invalid or expired.');
      }
    } catch {
      setErrorMessage('Network error while updating password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
    >
      <div className="relative w-full max-w-md bg-surface rounded-2xl border-2 border-border shadow-2xl overflow-hidden p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-aubergine text-white shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 id="password-modal-title" className="text-lg font-black text-text-primary">
                Account Security
              </h2>
              <p className="text-xs text-text-secondary">Set or change password via Gmail verification</p>
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

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-semantic-error-soft border border-semantic-error/30 text-semantic-error flex items-start gap-2.5 text-xs">
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

        {step === 'request' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Registered Email Address
              </label>
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
              <p className="text-[11px] text-text-muted mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-semantic-success inline" />
                We will send an encrypted 6-digit verification code to this inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Security Code to Gmail</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest bg-canvas border border-border-strong rounded-xl text-aubergine focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
              />
              <p className="text-[11px] text-text-muted mt-1 text-center">
                Sent to {email}. Code expires in 10 minutes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-border-strong rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="py-2.5 px-4 rounded-xl border border-border bg-canvas hover:bg-surface text-xs font-bold text-text-secondary transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Set Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
