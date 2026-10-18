import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  FileText,
  AlertTriangle,
  Landmark,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { UnderstandData } from '../../types';
import { TranslationDictionary, Language } from '../../i18n/translations';
import { TermsGlossaryCard } from './TermsGlossaryCard';
import { ActionRoadmapCard } from './ActionRoadmapCard';
import { QuestionsCard } from './QuestionsCard';

interface AnalysisResultCardProps {
  understandResult: UnderstandData;
  lang: Language;
  t: TranslationDictionary;
  isSpeaking: boolean;
  onSpeakAloud: () => void;
  onSpeakSection: (text: string, lang?: Language) => void;
  copiedCaseSummary: boolean;
  onCopyCaseFile: () => void;
  isSavedCurrentUnderstand: boolean;
  onSaveUnderstand: () => void;
  completedSteps: Record<number, boolean>;
  onToggleStep: (stepNumber: number) => void;
  copiedQuestionIndex: number | null;
  onCopyQuestion: (q: string, idx: number) => void;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  understandResult,
  lang,
  t,
  isSpeaking,
  onSpeakAloud,
  onSpeakSection,
  copiedCaseSummary,
  onCopyCaseFile,
  isSavedCurrentUnderstand,
  onSaveUnderstand,
  completedSteps,
  onToggleStep,
  copiedQuestionIndex,
  onCopyQuestion,
}) => {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-8 animate-fadeIn">
      {/* Dossier Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-semantic-success-soft text-semantic-success border border-semantic-success/30 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-semantic-success" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
              {t.caseDossierHeader}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-text-secondary">
                {lang === 'hi' ? 'सत्यापित साक्ष्य-आधारित व्याख्या' : 'Verified Evidence-Grounded Case Record'} &bull; Grade-5 Reading Level
              </span>
              {understandResult.disclaimer_type && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    understandResult.disclaimer_type === 'legal'
                      ? 'bg-semantic-info-soft text-semantic-info border border-semantic-info/30'
                      : understandResult.disclaimer_type === 'medical'
                      ? 'bg-semantic-success-soft text-semantic-success border border-semantic-success/30'
                      : 'bg-semantic-warning-soft text-semantic-warning border border-semantic-warning/30'
                  }`}
                >
                  {understandResult.disclaimer_type}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Read Entire Report Aloud */}
          <button
            type="button"
            onClick={onSpeakAloud}
            className={`min-h-[40px] px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer shadow-2xs ${
              isSpeaking
                ? 'bg-semantic-error text-white border-semantic-error'
                : 'bg-surface-raised hover:bg-surface-muted text-text-primary border-border'
            }`}
            aria-label="Listen aloud"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 text-white" />
                <span>{t.stopListeningBtn}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-aubergine" />
                <span>{t.listenAloudBtn}</span>
              </>
            )}
          </button>

          {/* Copy Case File */}
          <button
            type="button"
            onClick={onCopyCaseFile}
            className="min-h-[40px] px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 border border-border bg-surface-raised hover:bg-surface-muted text-text-primary transition-all cursor-pointer shadow-2xs"
          >
            {copiedCaseSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-semantic-success" />
                <span>{t.copiedBtn}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-text-secondary" />
                <span>{t.copyCaseSummaryBtn}</span>
              </>
            )}
          </button>

          {/* Save to Records (Persimmon High-Emphasis Action) */}
          <button
            type="button"
            onClick={onSaveUnderstand}
            disabled={isSavedCurrentUnderstand}
            className={`min-h-[40px] px-4 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer shadow-2xs ${
              isSavedCurrentUnderstand
                ? 'bg-semantic-success-soft text-semantic-success border-semantic-success/30 cursor-default'
                : 'bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white border-b-2 border-[#A83D1B]'
            }`}
          >
            {isSavedCurrentUnderstand ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-semantic-success" />
                <span>{t.savedSuccessBtn}</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-white" />
                <span>{t.saveForLaterBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. CORE PLAIN-LANGUAGE SUMMARY & RESPONSIBLE ADVISORY */}
      <div className="space-y-4">
        <div className="p-5 sm:p-6 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-aubergine flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.sectionMeaningTitle}</span>
            </span>
            <button
              type="button"
              onClick={() => onSpeakSection(understandResult.summary, lang)}
              className="p-1.5 rounded-lg bg-surface hover:bg-surface-muted text-text-secondary border border-border transition-all cursor-pointer shadow-2xs"
              title={t.listenSection}
            >
              <Volume2 className="w-3.5 h-3.5 text-aubergine" />
            </button>
          </div>
          <p className="text-base sm:text-lg font-semibold text-text-primary leading-relaxed">
            {understandResult.summary}
          </p>
        </div>

        {understandResult.disclaimer_text && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xs ${
              understandResult.disclaimer_type === 'medical'
                ? 'bg-semantic-success-soft border-semantic-success/30 text-semantic-success'
                : understandResult.disclaimer_type === 'financial'
                ? 'bg-semantic-warning-soft border-semantic-warning/30 text-semantic-warning'
                : understandResult.disclaimer_type === 'legal'
                ? 'bg-semantic-info-soft border-semantic-info/30 text-semantic-info'
                : 'bg-surface-muted border-border text-text-primary'
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <span className="font-extrabold uppercase tracking-wider block">
                {understandResult.disclaimer_type === 'medical'
                  ? t.disclaimerMedical
                  : understandResult.disclaimer_type === 'financial'
                  ? t.disclaimerFinancial
                  : understandResult.disclaimer_type === 'legal'
                  ? t.disclaimerLegal
                  : t.disclaimerCivic}
              </span>
              <p className="font-medium leading-relaxed">
                {understandResult.disclaimer_text}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. EVIDENCE-GROUNDED INTERPRETATION (Direct Quote + Plain Interpretation) */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-border pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase font-extrabold tracking-wider text-text-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-aubergine" />
              <span>{t.groundedEvidenceTitle}</span>
            </h3>
            <span className="text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2.5 py-0.5 rounded-full border border-semantic-success/30">
              {t.verifiedEvidenceBadge}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5 font-medium">
            {t.groundedEvidenceSubtitle}
          </p>
        </div>

        {/* Supporting Evidence Pairs */}
        {understandResult.supporting_evidence && understandResult.supporting_evidence.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {understandResult.supporting_evidence.map((ev, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface-raised border border-border space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs border-b border-border pb-1.5">
                  <span className="font-extrabold text-aubergine">
                    {ev.source_ref || 'Document Extract'}
                  </span>
                  <span className="text-[10px] font-bold text-text-secondary uppercase px-1.5 py-0.5 bg-surface rounded border border-border">
                    {t.verbatimQuoteLabel}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-text-primary italic border-l-2 border-aubergine pl-2.5 py-1 bg-surface rounded-r">
                  &ldquo;{ev.quote}&rdquo;
                </p>
                {ev.context && (
                  <div className="text-xs text-text-secondary font-medium pt-1">
                    <span className="font-bold text-text-primary block text-[11px]">
                      {t.plainMeaningLabel}
                    </span>
                    <p className="mt-0.5 leading-relaxed">{ev.context}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* In-Context Terminology Defined */}
        {understandResult.terms_explained && (
          <TermsGlossaryCard
            terms={understandResult.terms_explained}
            lang={lang}
            onSpeak={onSpeakSection}
            t={t}
          />
        )}
      </div>

      {/* 3. UNCERTAINTIES & MISSING FACTS ("Things This Document Does Not Make Clear") */}
      {understandResult.uncertainties && understandResult.uncertainties.length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl border-2 border-semantic-warning/40 bg-semantic-warning-soft space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 text-semantic-warning">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <h3 className="text-sm uppercase font-extrabold tracking-wider">
              {t.uncertaintiesTitle}
            </h3>
          </div>
          <p className="text-xs text-semantic-warning/90 font-medium">
            {t.uncertaintiesDesc}
          </p>
          <ul className="space-y-1.5 pt-1">
            {understandResult.uncertainties.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-semantic-warning font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-semantic-warning mt-2 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. PRACTICAL ACTION CHECKLIST & OFFICIAL QUESTIONS */}
      <div className="space-y-6 pt-2">
        {understandResult.action_steps && (
          <ActionRoadmapCard
            steps={understandResult.action_steps}
            completedSteps={completedSteps}
            onToggleStep={onToggleStep}
            t={t}
          />
        )}

        {understandResult.questions_to_ask && (
          <QuestionsCard
            questions={understandResult.questions_to_ask}
            copiedQuestionIndex={copiedQuestionIndex}
            onCopyQuestion={onCopyQuestion}
            onSpeak={onSpeakSection}
            lang={lang}
            t={t}
          />
        )}

        {/* Important Warnings & Critical Deadlines */}
        {understandResult.watch_out_for && understandResult.watch_out_for.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-sm uppercase font-extrabold tracking-wider text-semantic-warning flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-semantic-warning" />
                <span>{t.statutoryCautionTitle}</span>
              </h4>
            </div>

            <div className="space-y-2.5">
              {understandResult.watch_out_for.map((warn, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-semantic-warning-soft border border-semantic-warning/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-semantic-warning text-xs sm:text-sm">
                      {warn.warning}
                    </span>
                    {warn.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-semantic-success bg-surface px-2 py-0.5 rounded-full border border-semantic-success/30">
                        <Check className="w-3 h-3 text-semantic-success" />
                        <span>{t.verifiedEvidenceBadge}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-semantic-warning font-medium bg-surface/80 p-2 rounded-lg border border-semantic-warning/20">
                    <span className="font-bold text-semantic-warning block text-[10px] mb-0.5">
                      {t.originalTextQuoteLabel}
                    </span>
                    <span className="italic font-mono text-[11px]">&ldquo;{warn.exact_quote}&rdquo;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. CONNECTED OFFICIAL CIVIC & LEGAL RESOURCES (THE BRIDGE) */}
      {understandResult.matched_resources && understandResult.matched_resources.length > 0 && (
        <div className="space-y-4 pt-6 border-t-2 border-border">
          <div className="border-b border-border pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-aubergine-soft text-aubergine flex items-center justify-center font-bold">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-text-primary tracking-tight">
                    {t.matchedResourcesTitle}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-0.5">
                    {t.matchedResourcesSubtitle}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2.5 py-0.5 rounded-full border border-semantic-success/30">
                <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
                <span>{understandResult.matched_resources.length} Official Portals Matched</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {understandResult.matched_resources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl border border-border bg-surface hover:border-aubergine/40 transition-all shadow-card space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Provider & Verified Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-text-muted block truncate">
                        {lang === 'hi' ? res.provider_hi : res.provider_en}
                      </span>
                      <h4 className="font-extrabold text-text-primary text-sm sm:text-base leading-snug mt-0.5">
                        {lang === 'hi' ? res.title_hi : res.title_en}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-aubergine bg-aubergine-soft px-2 py-0.5 rounded border border-aubergine/20 shrink-0">
                      {res.verified_source}
                    </span>
                  </div>

                  {/* Why this matches the document */}
                  <div className="p-3 rounded-xl bg-aubergine-soft/50 border border-aubergine/20 space-y-1">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-aubergine block">
                      {t.resourceWhyMatched}
                    </span>
                    <p className="text-xs text-text-primary font-medium leading-relaxed">
                      {lang === 'hi' ? res.relevance_reason_hi : res.relevance_reason_en}
                    </p>
                  </div>

                  {/* Action Connection */}
                  <div className="p-3 rounded-xl bg-semantic-success-soft border border-semantic-success/20 space-y-1">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-semantic-success block">
                      {t.resourceActionConnection}
                    </span>
                    <p className="text-xs text-text-primary font-medium leading-relaxed">
                      {lang === 'hi' ? res.action_connection_hi : res.action_connection_en}
                    </p>
                  </div>

                  {/* Required Documents / Prerequisites */}
                  {res.eligibility_requirements_en && res.eligibility_requirements_en.length > 0 && (
                    <div className="text-xs space-y-1 pt-1">
                      <span className="font-bold text-text-primary block text-[10px] uppercase tracking-wider">
                        {t.resourcePrerequisites}
                      </span>
                      <ul className="space-y-1">
                        {(lang === 'hi' ? res.eligibility_requirements_hi : res.eligibility_requirements_en).map((req, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5 text-xs text-text-secondary font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Statutory Caution */}
                  {(res.eligibility_caution_en || res.eligibility_caution_hi) && (
                    <div className="p-2.5 rounded-lg bg-semantic-warning-soft border border-semantic-warning/30 text-xs text-semantic-warning font-medium space-y-0.5">
                      <span className="font-bold text-[10px] text-semantic-warning uppercase tracking-wider block">
                        {t.resourceCaution}
                      </span>
                      <p className="leading-relaxed">
                        {lang === 'hi' ? res.eligibility_caution_hi : res.eligibility_caution_en}
                      </p>
                    </div>
                  )}
                </div>

                {/* Portal Action Link */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-text-muted">
                    {res.deadline_or_schedule}
                  </span>
                  <a
                    href={res.official_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>{t.officialPortalBtn}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
