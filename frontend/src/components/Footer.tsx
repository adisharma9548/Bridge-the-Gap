import React from 'react';

interface FooterProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onReturnWelcome: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTerms,
  onOpenPrivacy,
  onReturnWelcome,
}) => {
  return (
    <footer className="border-t border-border bg-surface/80 py-6 px-4 text-center">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-text-primary">Setu</span>
          <span>&bull;</span>
          <span>Independent Civic Information Tool &bull; Not affiliated with any government agency</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-aubergine transition-colors cursor-pointer"
          >
            Terms & Conditions
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-aubergine transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={onReturnWelcome}
            className="hover:text-aubergine transition-colors cursor-pointer text-text-muted"
            title="Return to Welcome Screen"
          >
            Welcome Screen
          </button>
        </div>
      </div>
    </footer>
  );
};
