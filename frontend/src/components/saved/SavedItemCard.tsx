import React from 'react';
import { Trash2 } from 'lucide-react';
import type { SavedItem } from '../../types';

interface SavedItemCardProps {
  item: SavedItem;
  isConfirmingDelete: boolean;
  t: Record<string, any>;
  onViewDetails: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

export const SavedItemCard: React.FC<SavedItemCardProps> = ({
  item,
  isConfirmingDelete,
  t,
  onViewDetails,
  onConfirmDelete,
  onCancelDelete,
  onDelete,
}) => {
  const kindLabel =
    item.kind === 'understand'
      ? 'Document'
      : item.kind === 'resource'
      ? 'Civic Resource'
      : 'Public Data';

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border shadow-subtle flex flex-wrap items-center justify-between gap-4 hover:border-border-strong transition-all">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-aubergine-soft text-aubergine border border-aubergine/20">
            {kindLabel}
          </span>
          <span className="text-xs text-text-muted font-medium">
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
        <h3 className="font-extrabold text-base text-text-primary">
          {item.title}
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onViewDetails}
          className="px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover active:bg-[#4E2E5B] text-white font-bold text-xs border-b-2 border-aubergine-hover transition-all cursor-pointer shadow-xs"
        >
          {t.viewDetailsBtn}
        </button>
        {isConfirmingDelete ? (
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
            className="p-2.5 rounded-xl bg-semantic-error-soft hover:bg-semantic-error/20 text-semantic-error border border-semantic-error/30 transition-all cursor-pointer shadow-2xs"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
