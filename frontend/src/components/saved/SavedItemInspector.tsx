import React from 'react';
import {
  Volume2,
  Trash2,
  Info,
  AlertTriangle,
  Landmark,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { Language, SavedItem } from '../../types';

interface SavedItemInspectorProps {
  item: SavedItem;
  confirmDelete: boolean;
  lang: Language;
  t: Record<string, any>;
  copiedQuestionIndex: number | null;
  onSpeak: (text: string) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
  onCopyQuestion: (question: string, index: number) => void;
}

export const SavedItemInspector: React.FC<SavedItemInspectorProps> = ({
  item,
  confirmDelete,
  lang,
  t,
  copiedQuestionIndex,
  onSpeak,
  onConfirmDelete,
  onCancelDelete,
  onDelete,
  onCopyQuestion,
}) => {
  const kindBadge =
    item.kind === 'understand'
      ? 'Document Breakdown'
      : item.kind === 'resource'
      ? 'Civic Resource'
      : 'Public Data Query';

  const handleSpeakContent = () => {
    const content =
      item.kind === 'understand'
        ? item.payload?.result?.summary
        : item.kind === 'resource'
        ? `${item.title}. ${lang === 'hi' ? item.payload?.description_hi : item.payload?.description_en}. ${lang === 'hi' ? item.payload?.why_it_matches_hi : item.payload?.why_it_matches_en}`
        : item.payload?.summary?.summary;
    if (content) onSpeak(content);
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="text-xs font-bold text-aubergine bg-aubergine-soft px-2.5 py-0.5 rounded border border-aubergine/20">
            {kindBadge}
          </span>
          <h2 className="text-xl font-extrabold text-text-primary mt-1">
            {item.title}
          </h2>
          <span className="text-xs text-text-muted font-medium mt-0.5 block">
            Saved on {new Date(item.created_at).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSpeakContent}
            className="px-4 py-2 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-primary font-bold text-xs border border-border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-aubergine" />
            <span>{t.listenAloudBtn}</span>
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <button
                type="button"
                onClick={onDelete}
                className="px-3.5 py-1.5 rounded-lg bg-semantic-error hover:bg-semantic-error/90 text-white font-bold text-xs cursor-pointer shadow-xs border-b-2 border-semantic-error/80"
              >
                {t.deleteBtn}
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                className="px-3.5 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-muted text-text-secondary font-bold text-xs cursor-pointer border border-border"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConfirmDelete}
              className="px-3.5 py-2 rounded-xl bg-semantic-error-soft hover:bg-semantic-error/20 text-semantic-error border border-semantic-error/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.deleteBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Flow 1 Full Dossier when inspected */}
      {item.kind === 'understand' && (
        <div className="space-y-6">
          {/* Original Source */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border">
            <span className="text-xs uppercase font-extrabold text-text-muted block mb-1">
              Original Document Text / File:
            </span>
            <p className="text-sm font-medium text-text-primary leading-relaxed">
              {item.payload?.text || item.payload?.file_name}
            </p>
          </div>

          {/* Summary & Advisory */}
          <div className="space-y-3">
            <div className="p-5 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase font-extrabold text-aubergine">
                  {t.sectionMeaningTitle}
                </span>
                {item.payload?.result?.reading_level && (
                  <span className="text-[10px] font-bold text-aubergine bg-aubergine-soft px-2 py-0.5 rounded border border-aubergine/20">
                    {item.payload.result.reading_level}
                  </span>
                )}
              </div>
              <p className="font-semibold text-text-primary text-base leading-relaxed">
                {item.payload?.result?.summary}
              </p>
            </div>

            {item.payload?.result?.disclaimer && (
              <div className="p-3.5 rounded-xl bg-surface-muted border border-border text-xs flex items-start gap-2 text-text-secondary">
                <Info className="w-4 h-4 text-aubergine shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">
                  {item.payload.result.disclaimer}
                </p>
              </div>
            )}
          </div>

          {/* Grounded Verbatim Evidence */}
          {item.payload?.result?.grounded_evidence?.length > 0 && (
            <div className="space-y-3">
              <div className="border-b border-border pb-2">
                <h3 className="text-sm uppercase font-extrabold tracking-wider text-text-primary">
                  {t.groundedEvidenceTitle}
                </h3>
                <span className="text-xs text-text-secondary font-medium">
                  {t.groundedEvidenceSubtitle}
                </span>
              </div>
              <div className="space-y-3">
                {item.payload.result.grounded_evidence.map((evidenceItem: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-surface border border-border space-y-2.5 shadow-2xs">
                    <div className="p-3 rounded-lg bg-surface-raised border-l-4 border-aubergine border border-border">
                      <span className="font-bold text-aubergine block text-[10px] uppercase tracking-wider mb-1">
                        {t.verbatimQuoteLabel}
                      </span>
                      <p className="italic font-mono text-xs sm:text-sm text-text-primary leading-relaxed">
                        &ldquo;{evidenceItem.quote}&rdquo;
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-text-primary block text-[10px] uppercase tracking-wider">
                        {t.plainMeaningLabel}
                      </span>
                      <p className="text-xs sm:text-sm text-text-secondary font-medium leading-relaxed">
                        {evidenceItem.plain_meaning}
                      </p>
                    </div>
                    {evidenceItem.why_it_matters && (
                      <div className="text-xs text-aubergine bg-aubergine-soft/50 p-2 rounded-lg flex items-start gap-1.5 border border-aubergine/20">
                        <Info className="w-3.5 h-3.5 text-aubergine shrink-0 mt-0.5" />
                        <span>{evidenceItem.why_it_matters}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms */}
          {item.payload?.result?.terms_explained?.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
                {t.sectionTermsTitle}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {item.payload.result.terms_explained.map((termItem: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-surface border border-border space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-baseline border-b border-border pb-1.5">
                      <span className="font-extrabold text-text-primary text-sm">{termItem.term}</span>
                      <span className="text-xs font-semibold text-aubergine bg-aubergine-soft px-2 py-0.5 rounded border border-aubergine/20">
                        {termItem.phonetic}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary font-medium">{termItem.simple_meaning}</p>
                    {termItem.why_it_matters && (
                      <p className="text-[11px] text-aubergine font-medium pt-1 border-t border-border">
                        {termItem.why_it_matters}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uncertainties */}
          {item.payload?.result?.uncertainties?.length > 0 && (
            <div className="p-4 rounded-xl border-2 border-semantic-warning/40 bg-semantic-warning-soft space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-semantic-warning">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <h4 className="text-xs uppercase font-extrabold tracking-wider">
                  {t.uncertaintiesTitle}
                </h4>
              </div>
              <ul className="space-y-1.5 pt-1">
                {item.payload.result.uncertainties.map((unc: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-semantic-warning font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-semantic-warning mt-1.5 shrink-0"></span>
                    <span>{unc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {item.payload?.result?.action_steps?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
                {t.sectionActionsTitle}
              </span>
              {item.payload.result.action_steps.map((actionItem: any) => (
                <div key={actionItem.step_number} className="p-3 rounded-xl bg-surface border border-border text-sm flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-aubergine-soft text-aubergine font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {actionItem.step_number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-text-primary">{actionItem.action}</span>
                    <span className="block text-xs text-text-muted mt-0.5">Deadline: {actionItem.deadline_or_urgency}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Questions to Ask */}
          {item.payload?.result?.questions_to_ask?.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
                {t.sectionQuestionsTitle}
              </span>
              {item.payload.result.questions_to_ask.map((q: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-text-primary">
                  <p className="min-w-0">&ldquo;{q}&rdquo;</p>
                  <button
                    type="button"
                    onClick={() => onCopyQuestion(q, idx)}
                    className="px-2.5 py-1 rounded bg-surface hover:bg-surface-muted border border-border text-xs font-bold text-text-primary cursor-pointer shadow-2xs shrink-0"
                  >
                    {copiedQuestionIndex === idx ? t.copiedBtn : t.copyBtn}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Matched Resources (The Bridge in Saved Records) */}
          {item.payload?.result?.matched_resources?.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-aubergine" />
                  <h3 className="text-sm uppercase font-extrabold tracking-wider text-text-primary">
                    {t.matchedResourcesTitle}
                  </h3>
                </div>
                <span className="text-xs font-bold text-semantic-success bg-semantic-success-soft px-2 py-0.5 rounded border border-semantic-success/30">
                  {item.payload.result.matched_resources.length} Official Portals
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {item.payload.result.matched_resources.map((res: any) => (
                  <div key={res.id} className="p-4 rounded-xl border border-border bg-surface space-y-3 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2 border-b border-border pb-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-text-muted block">
                            {lang === 'hi' ? res.provider_hi : res.provider_en}
                          </span>
                          <h4 className="font-bold text-text-primary text-sm mt-0.5">
                            {lang === 'hi' ? res.title_hi : res.title_en}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold text-aubergine bg-aubergine-soft px-2 py-0.5 rounded border border-aubergine/20 shrink-0">
                          {res.verified_source}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-aubergine-soft/50 border border-aubergine/20 text-xs">
                        <span className="font-bold text-aubergine block text-[10px] uppercase mb-0.5">
                          {t.resourceWhyMatched}
                        </span>
                        <p className="text-text-primary font-medium">
                          {lang === 'hi' ? res.relevance_reason_hi : res.relevance_reason_en}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-semantic-success-soft border border-semantic-success/20 text-xs">
                        <span className="font-bold text-semantic-success block text-[10px] uppercase mb-0.5">
                          {t.resourceActionConnection}
                        </span>
                        <p className="text-text-primary font-medium">
                          {lang === 'hi' ? res.action_connection_hi : res.action_connection_en}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href={res.official_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-aubergine hover:bg-aubergine-hover text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
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
      )}

      {/* Flow 2 Full Dossier when inspected */}
      {item.kind === 'public_data' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border">
            <span className="text-xs uppercase font-extrabold text-aubergine block mb-1">
              {t.officialSummaryTitle}
            </span>
            <p className="font-semibold text-text-primary text-base leading-relaxed">
              {item.payload?.summary?.summary}
            </p>
          </div>

          {item.payload?.rows?.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left border-collapse bg-surface text-xs sm:text-sm">
                <thead>
                  <tr className="bg-surface-raised border-b border-border text-text-primary font-bold">
                    {Object.keys(item.payload.rows[0] || {}).map((col) => (
                      <th key={col} className="p-2.5 capitalize">{col.replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium text-text-primary">
                  {item.payload.rows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-surface-raised">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="p-2.5">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Flow 3 Full Dossier when inspected */}
      {item.kind === 'resource' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-aubergine bg-aubergine-soft px-2.5 py-0.5 rounded border border-aubergine/20 capitalize">
              {item.payload?.category?.replace(/-/g, ' ')}
            </span>
            <span className="text-xs font-semibold text-text-muted bg-surface-raised px-2 py-0.5 rounded border border-border">
              {item.payload?.location_coverage}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2.5 py-0.5 rounded-full border border-semantic-success/30">
              <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
              Verified: {item.payload?.verification_date} &bull; {item.payload?.verified_source}
            </span>
          </div>

          <div className="p-5 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border space-y-2">
            <span className="text-xs uppercase font-extrabold text-aubergine block">
              {lang === 'hi' ? 'संसाधन विवरण' : 'Resource Overview'}
            </span>
            <p className="font-semibold text-text-primary text-base leading-relaxed">
              {lang === 'hi' ? item.payload?.description_hi : item.payload?.description_en}
            </p>
            <span className="text-xs text-text-muted block font-medium">
              Provider: {lang === 'hi' ? item.payload?.provider_hi : item.payload?.provider_en}
            </span>
          </div>

          {/* Why this matches */}
          <div className="p-4 rounded-xl bg-aubergine-soft/50 border border-aubergine/20 space-y-1.5">
            <span className="text-xs font-extrabold uppercase text-aubergine flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-aubergine" />
              {t.whyItMatchesTitle}
            </span>
            <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
              {lang === 'hi' ? item.payload?.why_it_matches_hi : item.payload?.why_it_matches_en}
            </p>
          </div>

          {/* Eligibility criteria */}
          {item.payload?.eligibility_requirements_en && (
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
                {t.eligibilityChecklistTitle}
              </span>
              <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
                {(lang === 'hi'
                  ? item.payload?.eligibility_requirements_hi
                  : item.payload?.eligibility_requirements_en
                )?.map((crit: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary font-medium">
                    <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing requirements warning */}
          <div className="p-4 rounded-xl bg-semantic-warning-soft border border-semantic-warning/30 space-y-1.5">
            <span className="text-xs font-extrabold uppercase text-semantic-warning flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {t.missingRequirementsTitle}
            </span>
            <p className="text-xs sm:text-sm font-medium text-semantic-warning leading-relaxed">
              {lang === 'hi'
                ? item.payload?.missing_requirements_warning_hi
                : item.payload?.missing_requirements_warning_en}
            </p>
          </div>

          {/* Portal link */}
          {item.payload?.official_link && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-muted font-mono truncate max-w-sm">
                {item.payload.official_link}
              </span>
              <a
                href={item.payload.official_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white font-bold text-xs shadow-xs border-b-2 border-aubergine-hover"
              >
                <span>{t.officialPortalLink}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
