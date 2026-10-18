import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Trash2,
  PlusCircle,
  HelpCircle,
  LogOut,
  User as UserIcon,
  FolderOpen,
  Mail,
  Edit3,
  Check,
  X,
  Bookmark,
  Search,
  Briefcase,
} from 'lucide-react';
import gsap from 'gsap';

interface UserDashboardProps {
  authUser: { id: string; email: string; name: string } | null;
  savedItems: Array<{
    id: string;
    kind: string;
    title: string;
    payload: any;
    created_at: string;
  }>;
  onNavigateToExplain: () => void;
  onNavigateToResources: () => void;
  onNavigateToPublicData?: () => void;
  onNavigateToSaved: () => void;
  onInspectItem: (item: any) => void;
  onDeleteItem: (id: string) => void;
  onOpenPasswordModal: () => void;
  onOpenTour: () => void;
  onSignOut: () => void;
  onUpdateName?: (newName: string) => Promise<boolean>;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  authUser,
  savedItems,
  onNavigateToExplain,
  onNavigateToResources,
  onNavigateToPublicData,
  onNavigateToSaved,
  onInspectItem,
  onDeleteItem,
  onOpenPasswordModal,
  onOpenTour,
  onSignOut,
  onUpdateName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Profile editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(authUser?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser?.name) {
      setNameValue(authUser.name);
    }
  }, [authUser?.name]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.dashboard-card'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  const documentCases = savedItems.filter((i) => i.kind === 'understand');
  const savedResources = savedItems.filter((i) => i.kind === 'resource');

  // Calculate action tasks
  let totalTasks = 0;
  let completedTasks = 0;
  documentCases.forEach((item) => {
    if (item.payload && Array.isArray(item.payload.action_steps)) {
      totalTasks += item.payload.action_steps.length;
    }
  });

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }
    if (onUpdateName) {
      setIsSavingName(true);
      setNameError(null);
      const success = await onUpdateName(nameValue.trim());
      setIsSavingName(false);
      if (success) {
        setIsEditingName(false);
      } else {
        setNameError('Could not update name. Please try again.');
      }
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelName = () => {
    setNameValue(authUser?.name || '');
    setNameError(null);
    setIsEditingName(false);
  };

  return (
    <div ref={containerRef} className="space-y-8 animate-fade-in pb-12">
      {/* 1. USER PROFILE & CASE HUB HERO BANNER */}
      <div className="dashboard-card relative overflow-hidden bg-surface rounded-2xl border-2 border-border shadow-lg p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-aubergine-soft/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Profile Identity & Details */}
          <div className="flex items-start sm:items-center gap-4 max-w-xl">
            {/* Avatar Circle */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-aubergine text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-2 border-aubergine-hover shrink-0">
              {authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'S'}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-aubergine-soft text-aubergine border border-aubergine/20">
                  <Sparkles className="w-3 h-3 text-brass fill-brass" />
                  <span>Citizen Case Control</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-semantic-success-soft text-semantic-success border border-semantic-success/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified User</span>
                </span>
              </div>

              {/* Editable Name Display */}
              {isEditingName ? (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="px-3 py-1.5 bg-canvas border border-aubergine rounded-xl text-base font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-aubergine"
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-2 rounded-xl bg-aubergine text-white hover:bg-aubergine-hover transition-colors cursor-pointer"
                    title="Save name"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelName}
                    className="p-2 rounded-xl bg-canvas border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                    title="Cancel edit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {nameError && <span className="text-xs text-semantic-error block w-full">{nameError}</span>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight truncate">
                    {authUser?.name || 'Citizen Guest'}
                  </h1>
                  {authUser && onUpdateName && (
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-aubergine hover:bg-aubergine-soft transition-colors cursor-pointer"
                      title="Edit display name"
                      aria-label="Edit display name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span>{authUser?.email || 'Guest Session (Local Device)'}</span>
                </span>
                {authUser?.id && (
                  <>
                    <span>•</span>
                    <span className="text-text-muted font-mono text-[11px]">
                      UID: {authUser.id.slice(0, 12)}...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Launchers */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={onNavigateToExplain}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-xs sm:text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Analyze New Notice</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToSaved}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-aubergine bg-aubergine-soft text-aubergine hover:bg-aubergine hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Bookmark className="w-4 h-4" />
              <span>View Saved Records ({savedItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR KEY METRIC TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <button
          type="button"
          onClick={onNavigateToSaved}
          className="dashboard-card p-5 rounded-2xl bg-surface border-2 border-border shadow-xs hover:border-aubergine/50 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-aubergine-soft text-aubergine group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-text-muted">Total Cases</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary">{documentCases.length}</div>
          <p className="text-[11px] text-text-secondary mt-1">Notices & reports explained</p>
        </button>

        <div className="dashboard-card p-5 rounded-2xl bg-surface border-2 border-border shadow-xs hover:border-persimmon/50 transition-all text-left">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-persimmon-soft text-persimmon">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-text-muted">Pending Tasks</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary">
            {Math.max(totalTasks - completedTasks, 0)}
          </div>
          <p className="text-[11px] text-text-secondary mt-1">Actions requiring follow-up</p>
        </div>

        <button
          type="button"
          onClick={onNavigateToResources}
          className="dashboard-card p-5 rounded-2xl bg-surface border-2 border-border shadow-xs hover:border-semantic-success/50 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-semantic-success-soft text-semantic-success group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-text-muted">Civic Schemes</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary">{savedResources.length}</div>
          <p className="text-[11px] text-text-secondary mt-1">Bookmarked resources</p>
        </button>

        <button
          type="button"
          onClick={onNavigateToSaved}
          className="dashboard-card p-5 rounded-2xl bg-surface border-2 border-border shadow-xs hover:border-brass/50 transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-brass/15 text-text-primary group-hover:scale-105 transition-transform">
              <Bookmark className="w-5 h-5 text-aubergine" />
            </div>
            <span className="text-xs font-bold text-text-muted">All Saved</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary">{savedItems.length}</div>
          <p className="text-[11px] text-text-secondary mt-1">Dossiers & bookmarks stored</p>
        </button>
      </div>

      {/* 3. RECENT ACTIVITY & SAVED CASES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Saved Case Dossiers (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-aubergine" />
              <h2 className="text-lg font-black text-text-primary">Your Saved Case Dossiers</h2>
            </div>
            <button
              type="button"
              onClick={onNavigateToSaved}
              className="text-xs text-aubergine font-bold hover:underline cursor-pointer"
            >
              View All ({documentCases.length}) →
            </button>
          </div>

          {documentCases.length === 0 ? (
            <div className="dashboard-card p-8 rounded-2xl border-2 border-dashed border-border bg-surface text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-canvas flex items-center justify-center mx-auto text-text-secondary">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary">No Document Dossiers Saved Yet</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Paste any loan notice, insurance repudiation, or complex bill into the Document Explainer, and click "Save for Later" to track it in your profile.
              </p>
              <button
                type="button"
                onClick={onNavigateToExplain}
                className="mt-2 px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-all"
              >
                <span>Explain Your First Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {documentCases.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="dashboard-card p-4 sm:p-5 rounded-2xl border-2 border-border bg-surface hover:border-aubergine/40 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-aubergine-soft text-aubergine border border-aubergine/20">
                        {item.payload?.disclaimer_type || 'Case Dossier'}
                      </span>
                      <span className="text-[11px] text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-text-primary truncate">{item.title}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {item.payload?.result?.plain_english_summary ||
                        item.payload?.summary ||
                        'Evidence-backed explanation stored.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onInspectItem(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <span>Open Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-xl border border-border hover:bg-semantic-error-soft hover:text-semantic-error text-text-muted transition-colors cursor-pointer"
                      title="Delete dossier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Account Security & Workflow Shortcuts (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Account Profile & Security Card */}
          <div className="dashboard-card p-5 rounded-2xl border-2 border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-aubergine" />
                <h3 className="text-sm font-bold text-text-primary">Profile & Security</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-semantic-success-soft text-semantic-success">
                Active Session
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-canvas border border-border space-y-1">
                <div className="text-text-muted text-[11px]">Account Holder</div>
                <div className="font-bold text-text-primary text-sm">{authUser?.name || 'Guest User'}</div>
                <div className="text-text-secondary text-[11px] truncate">{authUser?.email || 'Not registered'}</div>
              </div>

              {authUser?.id && (
                <div className="p-2.5 rounded-xl bg-canvas border border-border text-[11px] text-text-secondary">
                  <span className="text-text-muted block text-[10px] uppercase font-bold">Account ID</span>
                  <span className="font-mono text-xs text-text-primary">{authUser.id}</span>
                </div>
              )}
            </div>

            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={onOpenPasswordModal}
                className="w-full py-2 px-3 rounded-xl border border-border bg-canvas hover:bg-surface text-xs font-bold text-text-primary flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-aubergine" />
                  <span>Change Password</span>
                </span>
                <span className="text-[10px] text-text-muted">via Gmail OTP</span>
              </button>

              <button
                type="button"
                onClick={onSignOut}
                className="w-full py-2 px-3 rounded-xl border border-semantic-error/30 bg-semantic-error-soft/30 hover:bg-semantic-error hover:text-white text-xs font-bold text-semantic-error flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out & Return Home</span>
              </button>
            </div>
          </div>

          {/* Quick Platform Shortcuts Card */}
          <div className="dashboard-card p-5 rounded-2xl border-2 border-border bg-surface shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-aubergine" />
                <span>Quick Actions</span>
              </h3>
              <button
                type="button"
                onClick={onOpenTour}
                className="text-[11px] text-aubergine font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>App Guide</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={onNavigateToExplain}
                className="w-full p-2.5 rounded-xl bg-canvas border border-border hover:border-aubergine/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-text-primary group-hover:text-aubergine transition-colors">
                    Explain a Document
                  </div>
                  <div className="text-[11px] text-text-muted">Upload notices, contracts, or bills</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-aubergine transition-colors" />
              </button>

              {onNavigateToPublicData && (
                <button
                  type="button"
                  onClick={onNavigateToPublicData}
                  className="w-full p-2.5 rounded-xl bg-canvas border border-border hover:border-aubergine/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-text-primary group-hover:text-aubergine transition-colors">
                      Explore Public Data
                    </div>
                    <div className="text-[11px] text-text-muted">Verified open datasets & mandi indices</div>
                  </div>
                  <Search className="w-3.5 h-3.5 text-text-muted group-hover:text-aubergine transition-colors" />
                </button>
              )}

              <button
                type="button"
                onClick={onNavigateToResources}
                className="w-full p-2.5 rounded-xl bg-canvas border border-border hover:border-aubergine/40 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-text-primary group-hover:text-aubergine transition-colors">
                    Civic Resources Directory
                  </div>
                  <div className="text-[11px] text-text-muted">Independent legal aid & citizen advocacy</div>
                </div>
                <Briefcase className="w-3.5 h-3.5 text-text-muted group-hover:text-aubergine transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
