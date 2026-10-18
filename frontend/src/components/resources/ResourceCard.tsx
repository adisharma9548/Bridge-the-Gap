import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Check,
  AlertTriangle,
  Clock,
  ExternalLink,
  Volume2,
  BookmarkCheck,
  Bookmark,
} from 'lucide-react';
import type { Language, CivicResource } from '../../types';

interface ResourceCardProps {
  resource: CivicResource;
  isSaved: boolean;
  lang: Language;
  t: Record<string, any>;
  onSpeak: (text: string) => void;
  onSave: (resource: CivicResource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isSaved,
  lang,
  t,
  onSpeak,
  onSave,
}) => {
  const title = lang === 'hi' ? resource.title_hi : resource.title_en;
  const desc = lang === 'hi' ? resource.description_hi : resource.description_en;
  const provider = lang === 'hi' ? resource.provider_hi : resource.provider_en;
  const whyMatches = lang === 'hi' ? resource.why_it_matches_hi : resource.why_it_matches_en;
  const eligibility = lang === 'hi' ? resource.eligibility_requirements_hi : resource.eligibility_requirements_en;
  const warning = lang === 'hi' ? resource.missing_requirements_warning_hi : resource.missing_requirements_warning_en;

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface hover:border-border-strong hover:shadow-card transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize bg-aubergine-soft text-aubergine border-aubergine/20">
              {resource.category.replace(/-/g, ' ')}
            </span>
            <span className="text-[11px] font-semibold text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border">
              {resource.location_coverage}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2.5 py-0.5 rounded-full border border-semantic-success/30">
            <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
            <span>{t.verifiedDateLabel}: {resource.verification_date}</span>
          </span>
        </div>

        {/* Title & Provider */}
        <div>
          <h3 className="font-extrabold text-text-primary text-lg sm:text-xl leading-snug">
            {title}
          </h3>
          <p className="text-xs font-bold text-aubergine mt-1">
            {provider}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm font-medium text-text-secondary leading-relaxed">
          {desc}
        </p>

        {/* Why this matches callout */}
        <div className="p-3.5 rounded-xl bg-aubergine-soft/50 border border-aubergine/20 space-y-1">
          <span className="text-[11px] font-extrabold uppercase text-aubergine flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-aubergine" />
            <span>{t.whyItMatchesTitle}</span>
          </span>
          <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
            {whyMatches}
          </p>
        </div>

        {/* Eligibility Requirements Checklist */}
        <div className="p-3.5 rounded-xl bg-surface-raised border border-border space-y-2">
          <span className="text-[11px] font-extrabold uppercase text-text-muted block">
            {t.eligibilityChecklistTitle}
          </span>
          <ul className="space-y-1.5">
            {eligibility.map((req, rIdx) => (
              <li key={rIdx} className="flex items-start gap-2 text-xs font-semibold text-text-secondary">
                <Check className="w-3.5 h-3.5 text-semantic-success shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Requirements Warning */}
        <div className="p-3.5 rounded-xl bg-semantic-warning-soft border border-semantic-warning/30 space-y-1">
          <span className="text-[11px] font-extrabold uppercase text-semantic-warning flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{t.missingRequirementsTitle}</span>
          </span>
          <p className="text-xs font-medium text-semantic-warning leading-relaxed">
            {warning}
          </p>
        </div>

        {/* Schedule / Deadline */}
        <div className="text-xs flex items-center gap-1.5 text-text-muted">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <span className="font-medium">Timeline / Schedule:</span>
          <span className="font-bold text-text-primary">{resource.deadline_or_schedule}</span>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <a
          href={resource.official_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white font-bold text-xs shadow-xs border-b-2 border-aubergine-hover transition-colors"
        >
          <span>{t.officialPortalLink}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSpeak(`${title}. ${desc}`)}
            className="p-2 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-secondary border border-border cursor-pointer shadow-2xs"
            title={t.listenAloudBtn}
          >
            <Volume2 className="w-3.5 h-3.5 text-aubergine" />
          </button>

          {isSaved ? (
            <button
              type="button"
              disabled
              className="px-3.5 py-2 rounded-xl bg-semantic-success-soft text-semantic-success border border-semantic-success/30 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-semantic-success" />
              <span>{t.savedSuccessBtn}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSave(resource)}
              className="px-3.5 py-2 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-primary font-bold text-xs border border-border flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-text-secondary" />
              <span>{t.saveForLaterBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
