import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Volume2,
  Bookmark,
  Info,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { PublicDataResult } from '../../types';
import { TranslationDictionary, Language } from '../../i18n/translations';

interface PublicDataTableProps {
  publicDataResult: PublicDataResult;
  publicSearchQuery: string;
  lang: Language;
  t: TranslationDictionary;
  isSavedCurrentData: boolean;
  onSavePublicData: () => void;
  onSpeak: (text: string, lang?: Language) => void;
}

export const PublicDataTable: React.FC<PublicDataTableProps> = ({
  publicDataResult,
  publicSearchQuery,
  lang,
  t,
  isSavedCurrentData,
  onSavePublicData,
  onSpeak,
}) => {
  const displayRows = publicDataResult.rows.filter((row: any) => {
    if (!publicSearchQuery.trim()) return true;
    const q = publicSearchQuery.toLowerCase();
    return Object.values(row).some((val) => String(val).toLowerCase().includes(q));
  });

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-6 animate-fadeIn">
      {/* Result Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-aubergine bg-aubergine-soft px-2.5 py-0.5 rounded border border-aubergine/20">
              {lang === 'hi' ? publicDataResult.catalog.title_hi : publicDataResult.catalog.title_en}
            </span>
            <span className="text-xs font-semibold text-text-secondary">
              {publicDataResult.filter_value}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-success bg-semantic-success-soft px-2 py-0.5 rounded-full border border-semantic-success/30">
              <ShieldCheck className="w-3 h-3 text-semantic-success" />
              {t.verifiedSourceBadge}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-semantic-info bg-semantic-info-soft px-2 py-0.5 rounded-full border border-semantic-info/30">
              <Sparkles className="w-3 h-3 text-semantic-info" />
              {t.aiGroundedBadge}
            </span>
          </div>
          <span className="text-[11px] text-text-muted font-medium mt-1 block">
            {publicDataResult.source_badge.source} &bull; Resource ID: {publicDataResult.source_badge.resource_id} &bull; Verified: {new Date(publicDataResult.source_badge.timestamp).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSpeak(publicDataResult.summary.summary, lang)}
            className="min-h-[40px] px-4 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-primary font-bold text-xs border border-border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-aubergine" />
            <span>{t.listenAloudBtn}</span>
          </button>
          <button
            type="button"
            onClick={onSavePublicData}
            disabled={isSavedCurrentData}
            className={`min-h-[40px] px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
              isSavedCurrentData
                ? 'bg-semantic-success-soft text-semantic-success border-semantic-success/30'
                : 'bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white border-b-2 border-[#A83D1B]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSavedCurrentData ? t.savedSuccessBtn : t.saveForLaterBtn}</span>
          </button>
        </div>
      </div>

      {/* Gemini AI Civic Summary Callout */}
      <div className="p-5 rounded-xl bg-surface-raised border-l-4 border-aubergine border border-border space-y-2">
        <span className="text-xs uppercase font-extrabold text-aubergine block">
          {t.officialSummaryTitle}
        </span>
        <p className="font-semibold text-text-primary leading-relaxed text-base">
          {publicDataResult.summary.summary}
        </p>
        {publicDataResult.summary.advice && (
          <div className="pt-2 border-t border-border flex items-start gap-2 text-xs">
            <Info className="w-4 h-4 text-aubergine shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-text-primary uppercase tracking-wider block text-[10px]">
                {t.practicalAdviceTitle}
              </span>
              <p className="text-text-secondary mt-0.5 font-medium">
                {publicDataResult.summary.advice}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Clean Official Data Table OR Competitive Exam Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold text-text-muted tracking-wider block">
            {t.recordsTableTitle}
          </span>
          <span className="text-xs font-semibold text-text-secondary">
            {displayRows.length} {lang === 'hi' ? 'प्रविष्टियां उपलब्ध' : 'matching records'}
          </span>
        </div>

        {displayRows.length === 0 ? (
          <div className="p-8 text-center bg-surface-raised rounded-xl border border-border text-text-muted text-sm font-medium">
            {lang === 'hi'
              ? 'आपकी खोज के अनुसार कोई रिकॉर्ड नहीं मिला। कृपया कीवर्ड बदलकर देखें।'
              : 'No records matched your search term. Try a different keyword or clear the search field.'}
          </div>
        ) : publicDataResult.catalog.slug === 'competitive-exams' || Boolean(publicDataResult.rows[0]?.exam_name) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayRows.map((exam: any, idx: number) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border bg-surface hover:border-border-strong hover:shadow-card transition-all space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
                    <div>
                      <h4 className="font-extrabold text-text-primary text-base leading-snug">
                        {exam.exam_name}
                      </h4>
                      <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-aubergine-soft text-aubergine border border-aubergine/20">
                        {exam.conducting_body}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-aubergine-soft text-aubergine flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>

                  {exam.target_posts && (
                    <div className="text-xs">
                      <span className="font-bold text-text-muted block uppercase tracking-wider text-[10px]">
                        {t.targetPostsLabel}
                      </span>
                      <span className="font-semibold text-text-primary mt-0.5 block">
                        {exam.target_posts}
                      </span>
                    </div>
                  )}

                  {exam.eligibility && (
                    <div className="text-xs">
                      <span className="font-bold text-text-muted block uppercase tracking-wider text-[10px]">
                        {t.eligibilityLabel}
                      </span>
                      <span className="font-medium text-text-secondary mt-0.5 block">
                        {exam.eligibility}
                      </span>
                    </div>
                  )}

                  {exam.exam_stages && (
                    <div className="text-xs">
                      <span className="font-bold text-text-muted block uppercase tracking-wider text-[10px]">
                        {t.examStagesLabel}
                      </span>
                      <span className="font-medium text-text-secondary mt-0.5 block bg-surface-raised p-2 rounded-lg border border-border">
                        {exam.exam_stages}
                      </span>
                    </div>
                  )}

                  {exam.key_timelines_2026 && (
                    <div className="text-xs">
                      <span className="font-bold text-text-muted block uppercase tracking-wider text-[10px]">
                        {t.timelinesLabel}
                      </span>
                      <span className="font-bold text-semantic-warning mt-0.5 block">
                        {exam.key_timelines_2026}
                      </span>
                    </div>
                  )}

                  {exam.senior_family_tip && (
                    <div className="p-3 rounded-xl bg-semantic-warning-soft border border-semantic-warning/30 text-xs text-semantic-warning font-medium space-y-1">
                      <span className="font-bold text-[10px] block uppercase tracking-wider">
                        {t.familyGuidanceTip}
                      </span>
                      <p className="leading-relaxed">{exam.senior_family_tip}</p>
                    </div>
                  )}
                </div>

                {exam.official_portal && (
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] font-mono text-text-muted truncate max-w-[180px]">
                      {exam.official_portal}
                    </span>
                    <a
                      href={
                        exam.official_portal.startsWith('http')
                          ? exam.official_portal
                          : `https://${exam.official_portal}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <span>{t.officialPortalBtn}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left border-collapse bg-surface text-sm">
                <thead>
                  <tr className="bg-surface-raised border-b border-border text-text-primary font-bold">
                    {Object.keys(displayRows[0] || {}).map((col) => (
                      <th key={col} className="p-3 capitalize tracking-tight">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium text-text-primary">
                  {displayRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-surface-raised transition-colors">
                      {Object.values(row).map((val, cIdx) => (
                        <td key={cIdx} className="p-3">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden space-y-2.5">
              {displayRows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  className="p-4 rounded-xl border border-border bg-surface space-y-1.5 shadow-subtle"
                >
                  {Object.entries(row).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 text-sm">
                      <span className="font-semibold text-text-muted capitalize">
                        {k.replace(/_/g, ' ')}:
                      </span>
                      <span className="font-bold text-text-primary text-right">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
