import React from 'react';
import { Check, CheckSquare, Square, Clock } from 'lucide-react';
import { TranslationDictionary } from '../../i18n/translations';

export interface ActionStep {
  step_number: number;
  action: string;
  deadline_or_urgency: string;
}

interface ActionRoadmapCardProps {
  steps: ActionStep[];
  completedSteps: Record<number, boolean>;
  onToggleStep: (stepNumber: number) => void;
  t: TranslationDictionary;
}

export const ActionRoadmapCard: React.FC<ActionRoadmapCardProps> = ({
  steps,
  completedSteps,
  onToggleStep,
  t,
}) => {
  if (!steps || steps.length === 0) return null;

  const totalSteps = steps.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div>
          <h3 className="text-sm uppercase font-extrabold tracking-wider text-text-primary">
            {t.actionPlanTitle}
          </h3>
          <span className="text-xs text-text-secondary font-medium">
            {t.actionPlanSubtitle}
          </span>
        </div>

        {totalSteps > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-semantic-success bg-semantic-success-soft px-3 py-1 rounded-full border border-semantic-success/30">
            <Check className="w-3.5 h-3.5 text-semantic-success" />
            <span>
              {completedCount} of {totalSteps} {t.actionProgress}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {steps.map((step) => {
          const isDone = Boolean(completedSteps[step.step_number]);
          return (
            <div
              key={step.step_number}
              onClick={() => onToggleStep(step.step_number)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                isDone
                  ? 'bg-semantic-success-soft/30 border-semantic-success/30 text-text-muted'
                  : 'bg-surface border-border hover:border-border-strong'
              }`}
            >
              <div className="pt-0.5 shrink-0">
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-semantic-success" />
                ) : (
                  <Square className="w-5 h-5 text-border-strong hover:text-aubergine" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <span
                  className={`text-sm sm:text-base font-bold text-text-primary ${
                    isDone ? 'line-through text-text-muted' : ''
                  }`}
                >
                  {step.action}
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-semantic-warning-soft text-semantic-warning border border-semantic-warning/30">
                    <Clock className="w-3 h-3 text-semantic-warning" />
                    <span>{step.deadline_or_urgency}</span>
                  </span>
                  {isDone && (
                    <span className="text-[11px] font-bold text-semantic-success">
                      {t.actionDoneLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
