import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label,
  size = 'md',
  className = '',
  centered = false,
}) => {
  const sizeStyles = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-10 h-10 border-4',
  };

  const spinner = (
    <div
      role="status"
      aria-label={label || 'Loading...'}
      className={`${sizeStyles[size]} border-aubergine/20 border-t-aubergine rounded-full animate-spin ${className}`}
    />
  );

  if (centered || label) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center">
        {spinner}
        {label && <p className="text-xs sm:text-sm font-semibold text-text-secondary">{label}</p>}
      </div>
    );
  }

  return spinner;
};
