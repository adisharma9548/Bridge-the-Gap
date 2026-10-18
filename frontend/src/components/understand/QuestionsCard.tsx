import React from 'react';
import { Volume2, Check, Copy } from 'lucide-react';
import { TranslationDictionary, Language } from '../../i18n/translations';

interface QuestionsCardProps {
  questions: string[];
  copiedQuestionIndex: number | null;
  onCopyQuestion: (question: string, index: number) => void;
  onSpeak: (text: string, lang?: Language) => void;
  lang: Language;
  t: TranslationDictionary;
}

export const QuestionsCard: React.FC<QuestionsCardProps> = ({
  questions,
  copiedQuestionIndex,
  onCopyQuestion,
  onSpeak,
  lang,
  t,
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="border-b border-border pb-2">
        <h4 className="text-sm uppercase font-extrabold tracking-wider text-text-primary">
          {t.sectionQuestionsTitle}
        </h4>
        <span className="text-xs text-text-secondary font-medium">
          {t.officialQuestionsSubtitle}
        </span>
      </div>

      <div className="space-y-2.5">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-surface-raised border border-border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 hover:border-border-strong transition-all"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="font-extrabold text-aubergine text-sm shrink-0 mt-0.5">
                Q{idx + 1}.
              </span>
              <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
                &ldquo;{q}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
              <button
                type="button"
                onClick={() => onSpeak(q, lang)}
                className="p-1.5 rounded-lg bg-surface hover:bg-surface-muted text-text-secondary border border-border cursor-pointer transition-all shadow-2xs"
                title={t.listenAloudBtn}
              >
                <Volume2 className="w-3.5 h-3.5 text-aubergine" />
              </button>
              <button
                type="button"
                onClick={() => onCopyQuestion(q, idx)}
                className="min-h-[32px] px-3 rounded-lg bg-surface hover:bg-surface-muted border border-border text-xs font-bold text-text-primary flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                {copiedQuestionIndex === idx ? (
                  <>
                    <Check className="w-3 h-3 text-semantic-success" />
                    <span>{t.copiedBtn}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-text-secondary" />
                    <span>{t.copyBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
