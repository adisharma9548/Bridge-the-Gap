import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-surface rounded-2xl border border-border p-10 sm:p-12 text-center space-y-4 shadow-subtle ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-raised text-text-muted flex items-center justify-center mx-auto border border-border">
        <Icon className="w-6 h-6 text-aubergine" />
      </div>
      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-lg font-extrabold text-text-primary tracking-tight">{title}</h3>
        <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">{description}</p>
      </div>
      {(action || children) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {action}
          {children}
        </div>
      )}
    </div>
  );
};
