import React, { useEffect, useRef } from 'react';
import { LayoutDashboard, Bookmark, KeyRound, LogOut } from 'lucide-react';
import { AuthUser } from '../types';

interface AvatarDropdownProps {
  authUser: AuthUser;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  savedCount: number;
  onNavigateDashboard: () => void;
  onNavigateSaved: () => void;
  onOpenChangePassword: () => void;
  onSignOut: () => void;
}

export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  authUser,
  isOpen,
  onToggle,
  onClose,
  savedCount,
  onNavigateDashboard,
  onNavigateSaved,
  onOpenChangePassword,
  onSignOut,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const initial = authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-9 h-9 rounded-full bg-aubergine text-white flex items-center justify-center font-black text-sm shadow-xs border-2 border-surface hover:ring-2 hover:ring-aubergine/40 transition-all cursor-pointer focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`${authUser.name} - Account Menu`}
      >
        <span>{initial}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-surface border-2 border-border shadow-2xl p-4 z-50 animate-fadeIn"
          role="menu"
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-aubergine text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-text-primary text-sm truncate">{authUser.name}</div>
              <div className="text-[11px] text-text-secondary truncate">{authUser.email}</div>
              <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-semantic-success-soft text-semantic-success">
                Verified Account
              </span>
            </div>
          </div>

          {/* Navigation & Action Links */}
          <div className="py-2 space-y-1 text-xs">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateDashboard();
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-bold text-text-primary hover:bg-aubergine-soft hover:text-aubergine transition-colors flex items-center gap-2.5 cursor-pointer"
              role="menuitem"
            >
              <LayoutDashboard className="w-4 h-4 text-aubergine" />
              <span>Profile & Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateSaved();
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-bold text-text-primary hover:bg-aubergine-soft hover:text-aubergine transition-colors flex items-center justify-between cursor-pointer"
              role="menuitem"
            >
              <span className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-aubergine" />
                <span>Saved Records</span>
              </span>
              {savedCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brass text-text-primary">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChangePassword();
              }}
              className="w-full px-3 py-2 rounded-xl text-left font-bold text-text-primary hover:bg-aubergine-soft hover:text-aubergine transition-colors flex items-center gap-2.5 cursor-pointer"
              role="menuitem"
            >
              <KeyRound className="w-4 h-4 text-aubergine" />
              <span>Change Password</span>
            </button>
          </div>

          {/* Sign Out Button */}
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-full py-2 px-3 rounded-xl bg-semantic-error-soft/40 hover:bg-semantic-error hover:text-white text-xs font-bold text-semantic-error flex items-center justify-center gap-2 transition-all cursor-pointer"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
