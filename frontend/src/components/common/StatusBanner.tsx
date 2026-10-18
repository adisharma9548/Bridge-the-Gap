import React from 'react';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { StatusBannerState } from '../../types';

interface StatusBannerProps {
  banner: StatusBannerState | null;
  onDismiss: () => void;
  dismissAriaLabel?: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  banner,
  onDismiss,
  dismissAriaLabel = 'Dismiss notification',
}) => {
  if (!banner) return null;

  const typeStyles = {
    error: 'bg-semantic-error-soft border-semantic-error/30 text-semantic-error',
    warning: 'bg-semantic-warning-soft border-semantic-warning/30 text-semantic-warning',
    success: 'bg-semantic-success-soft border-semantic-success/30 text-semantic-success',
    info: 'bg-semantic-info-soft border-semantic-info/30 text-semantic-info',
  };

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-sm font-semibold transition-all animate-fadeIn ${
        typeStyles[banner.type] || typeStyles.info
      }`}
    >
      <div className="flex items-center gap-2.5">
        {banner.type === 'error' || banner.type === 'warning' ? (
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-semantic-warning" />
        ) : banner.type === 'success' ? (
          <Check className="w-5 h-5 flex-shrink-0 text-semantic-success" />
        ) : (
          <Info className="w-5 h-5 flex-shrink-0 text-semantic-info" />
        )}
        <span>{banner.message}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="p-1.5 rounded-lg bg-surface hover:bg-surface-muted text-text-primary font-bold cursor-pointer border border-border transition-all"
        aria-label={dismissAriaLabel}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
