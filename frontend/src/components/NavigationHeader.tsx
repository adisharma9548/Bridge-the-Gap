import React from 'react';
import { LayoutDashboard, FileText, Search, Briefcase, Bookmark, HelpCircle, User } from 'lucide-react';
import { Tab, AuthUser, SavedItem } from '../types';
import { AvatarDropdown } from './AvatarDropdown';

interface NavigationHeaderProps {
  activeTab: Tab;
  inspectingItem: SavedItem | null;
  savedCount: number;
  onTabChange: (tab: Tab) => void;
  onResetInspecting: () => void;
  onOpenTour: () => void;
  authUser: AuthUser | null;
  isAvatarMenuOpen: boolean;
  onToggleAvatarMenu: () => void;
  onCloseAvatarMenu: () => void;
  onOpenChangePassword: () => void;
  onSignOut: () => void;
  onOpenAuthModal: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  inspectingItem,
  savedCount,
  onTabChange,
  onResetInspecting,
  onOpenTour,
  authUser,
  isAvatarMenuOpen,
  onToggleAvatarMenu,
  onCloseAvatarMenu,
  onOpenChangePassword,
  onSignOut,
  onOpenAuthModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-subtle">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Mark */}
        <button
          type="button"
          onClick={() => {
            onTabChange('understand');
            onResetInspecting();
          }}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          aria-label="Setu Home"
        >
          {/* Bespoke Geometric Bridge Mark */}
          <div className="w-10 h-10 rounded-xl bg-aubergine text-white flex items-center justify-center shadow-xs group-hover:bg-aubergine-hover transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 17C4 12.0294 7.58172 8 12 8C16.4183 8 20 12.0294 20 17"
                stroke="#F7F4F0"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path d="M3 17H21" stroke="#E46D45" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="12" cy="5" r="1.5" fill="#E5BD55" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-text-primary tracking-tight leading-none">Setu</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-aubergine-soft text-aubergine border border-aubergine/20 uppercase tracking-wider">
                Civic AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-text-secondary leading-tight mt-0.5 hidden sm:block">
              Demystifying complex documents & public information
            </p>
          </div>
        </button>

        {/* Center: Segmented Navigation Pills (Desktop) */}
        <nav
          className="hidden md:flex items-center gap-1 rounded-xl bg-surface-muted/80 border border-border p-1 shadow-2xs"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dashboard'}
            onClick={() => {
              onTabChange('dashboard');
              onResetInspecting();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-aubergine text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'understand' && !inspectingItem}
            onClick={() => {
              onTabChange('understand');
              onResetInspecting();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'understand' && !inspectingItem
                ? 'bg-aubergine text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Understand Document</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'find'}
            onClick={() => {
              onTabChange('find');
              onResetInspecting();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'find'
                ? 'bg-aubergine text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Public Data</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'resources'}
            onClick={() => {
              onTabChange('resources');
              onResetInspecting();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-aubergine text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Civic Resources</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'saved'}
            onClick={() => onTabChange('saved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-aubergine text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Records</span>
            {savedCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brass text-text-primary">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Utilities: Guided Tour, Password Reset & Account Session */}
        <div className="flex items-center gap-2.5">
          {/* Interactive Tour Guide Button */}
          <button
            type="button"
            onClick={onOpenTour}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-muted text-text-primary font-bold text-xs border border-border shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Interactive App Walkthrough & Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-aubergine" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* User Session & Clickable Profile Avatar Menu */}
          {authUser ? (
            <AvatarDropdown
              authUser={authUser}
              isOpen={isAvatarMenuOpen}
              onToggle={onToggleAvatarMenu}
              onClose={onCloseAvatarMenu}
              savedCount={savedCount}
              onNavigateDashboard={() => {
                onTabChange('dashboard');
                onResetInspecting();
              }}
              onNavigateSaved={() => {
                onTabChange('saved');
                onResetInspecting();
              }}
              onOpenChangePassword={onOpenChangePassword}
              onSignOut={onSignOut}
            />
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 rounded-lg bg-aubergine hover:bg-aubergine-hover text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
