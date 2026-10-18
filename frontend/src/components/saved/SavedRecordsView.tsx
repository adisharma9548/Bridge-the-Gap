import React from 'react';
import { Bookmark, FileText, Briefcase } from 'lucide-react';
import type { Language, SavedItem } from '../../types';
import { SavedItemCard } from './SavedItemCard';
import { SavedItemInspector } from './SavedItemInspector';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';

interface SavedRecordsViewProps {
  t: Record<string, any>;
  lang: Language;
  inspectingItem: SavedItem | null;
  isLoadingSaved: boolean;
  savedItems: SavedItem[];
  confirmDeleteId: string | null;
  copiedQuestionIndex: number | null;
  onSpeak: (text: string) => void;
  onSetInspectingItem: (item: SavedItem | null) => void;
  onSetConfirmDeleteId: (id: string | null) => void;
  onDeleteSavedItem: (id: string) => void;
  onCopyQuestion: (question: string, index: number) => void;
  onNavigateTab: (tab: 'understand' | 'resources') => void;
}

export const SavedRecordsView: React.FC<SavedRecordsViewProps> = ({
  t,
  lang,
  inspectingItem,
  isLoadingSaved,
  savedItems,
  confirmDeleteId,
  copiedQuestionIndex,
  onSpeak,
  onSetInspectingItem,
  onSetConfirmDeleteId,
  onDeleteSavedItem,
  onCopyQuestion,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aubergine-soft text-aubergine border border-aubergine/20 text-xs font-bold">
          <Bookmark className="w-3.5 h-3.5 text-aubergine" />
          <span>Anonymous Offline Persistence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {t.savedHeading}
        </h1>
        <p className="text-text-secondary text-base font-normal max-w-3xl leading-relaxed">
          {t.savedSubtitle}
        </p>
      </div>

      {inspectingItem ? (
        <SavedItemInspector
          item={inspectingItem}
          confirmDelete={confirmDeleteId === inspectingItem.id}
          lang={lang}
          t={t}
          copiedQuestionIndex={copiedQuestionIndex}
          onSpeak={onSpeak}
          onConfirmDelete={() => onSetConfirmDeleteId(inspectingItem.id)}
          onCancelDelete={() => onSetConfirmDeleteId(null)}
          onDelete={() => onDeleteSavedItem(inspectingItem.id)}
          onCopyQuestion={onCopyQuestion}
        />
      ) : (
        <div className="space-y-3">
          {isLoadingSaved ? (
            <div className="bg-surface rounded-2xl border border-border p-8 text-center shadow-subtle">
              <LoadingSpinner label="Loading your saved records..." size="lg" centered />
            </div>
          ) : savedItems.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title={t.savedEmptyTitle}
              description={t.savedEmptyDesc}
            >
              <button
                type="button"
                onClick={() => onNavigateTab('understand')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer border-b-2 border-aubergine-hover"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Explain a Document</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('resources')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-raised hover:bg-surface-muted text-text-primary border border-border text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-aubergine" />
                <span>Browse Civic Resources</span>
              </button>
            </EmptyState>
          ) : (
            savedItems.map((item) => (
              <SavedItemCard
                key={item.id}
                item={item}
                isConfirmingDelete={confirmDeleteId === item.id}
                t={t}
                onViewDetails={() => onSetInspectingItem(item)}
                onConfirmDelete={() => onSetConfirmDeleteId(item.id)}
                onCancelDelete={() => onSetConfirmDeleteId(null)}
                onDelete={() => onDeleteSavedItem(item.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
