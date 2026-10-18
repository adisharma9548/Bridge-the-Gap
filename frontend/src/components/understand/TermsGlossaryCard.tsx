import React from 'react';
import { Volume2, Info } from 'lucide-react';
import { TranslationDictionary, Language } from '../../i18n/translations';

export interface TermExplained {
  term: string;
  phonetic: string;
  simple_meaning: string;
  why_it_matters: string;
}

interface TermsGlossaryCardProps {
  terms: TermExplained[];
  lang: Language;
  onSpeak: (text: string, lang?: Language) => void;
  t: TranslationDictionary;
}

export const TermsGlossaryCard: React.FC<TermsGlossaryCardProps> = ({
  terms,
  lang,
  onSpeak,
  t,
}) => {
  if (!terms || terms.length === 0) return null;

  return (
    <div className="pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-extrabold tracking-wider text-text-primary">
          {t.sectionTermsTitle}
        </span>
        <span className="text-xs text-text-muted font-medium">
          {terms.length} terms simplified
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {terms.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-border bg-surface space-y-2 shadow-2xs"
          >
            <div className="flex items-baseline justify-between gap-2 border-b border-border pb-2">
              <span className="font-extrabold text-text-primary text-sm sm:text-base">
                {item.term}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-aubergine-soft text-aubergine border border-aubergine/20">
                  {item.phonetic}
                </span>
                <button
                  type="button"
                  onClick={() => onSpeak(item.term, lang)}
                  className="p-1 rounded bg-surface-raised hover:bg-surface-muted text-text-secondary cursor-pointer shadow-2xs border border-border"
                  title={t.pronounceTerm}
                >
                  <Volume2 className="w-3.5 h-3.5 text-aubergine" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary font-medium leading-relaxed">
              {item.simple_meaning}
            </p>

            <div className="pt-2 border-t border-border text-xs flex items-start gap-1.5 bg-aubergine-soft/40 p-2 rounded-lg">
              <Info className="w-3.5 h-3.5 text-aubergine shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-aubergine uppercase tracking-wider text-[10px]">
                  {t.whyItMattersLabel}
                </span>
                <span className="text-text-primary font-medium">{item.why_it_matters}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
