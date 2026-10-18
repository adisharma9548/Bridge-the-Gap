import React, { useEffect, useRef } from 'react';
import {
  FileText,
  PhoneCall,
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
  onInspectItem: (item: any) => void;
  onDeleteItem: (id: string) => void;
  onOpenPasswordModal: () => void;
  onOpenTour: () => void;
  onSignOut: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  authUser,
  savedItems,
  onNavigateToExplain,
  onNavigateToResources,
  onInspectItem,
  onDeleteItem,
  onOpenPasswordModal,
  onOpenTour,
  onSignOut,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.dashboard-card'),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.45, ease: 'power2.out' }
      );
    }
  }, []);

  const documentCases = savedItems.filter((i) => i.kind === 'understand');
  const savedResources = savedItems.filter((i) => i.kind === 'resource');
  const savedPublicData = savedItems.filter((i) => i.kind === 'public_data');

  // Calculate action tasks
  let totalTasks = 0;
  let completedTasks = 0;
  documentCases.forEach((item) => {
    if (item.payload && Array.isArray(item.payload.action_steps)) {
      totalTasks += item.payload.action_steps.length;
    }
  });

  return (
    <div ref={containerRef} className="space-y-8 animate-fade-in pb-12">
      {/* 1. WELCOME HERO CARD */}
      <div className="dashboard-card relative overflow-hidden bg-surface rounded-2xl border-2 border-border shadow-lg p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-aubergine-soft/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-aubergine-soft text-aubergine border border-aubergine/20">
              <Sparkles className="w-3.5 h-3.5 text-brass fill-brass" />
              <span>Citizen Case Control Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              Welcome, {authUser?.name || 'Citizen'}!
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Here is your centralized civic overview of analyzed notices, active compliance tasks, and verified statutory helplines.
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToExplain}
              className="px-5 py-3 rounded-xl bg-persimmon hover:bg-persimmon-hover active:bg-[#C95431] text-white font-black text-xs sm:text-sm tracking-wide shadow-md border-b-4 border-[#A83D1B] flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Analyze New Notice</span>
            </button>
            <button
              type="button"
              onClick={onOpenTour}
              className="px-4 py-3 rounded-xl border border-aubergine bg-aubergine-soft text-aubergine hover:bg-aubergine hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How It Works (Tour)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR KEY METRIC TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="dashboard-card p-5 rounded-2xl bg-surface border-2 border-border shadow-xs hover:border-aubergine/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-aubergine-soft text-aubergine">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-text-muted">Total Cases</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary">{documentCases.length}</div>
          <p className="text-[11px] text-text-secondary mt-1">Notices & reports explained</p>
        </div>

        <div className="dashboard-card p-5 rounded-2xl bg-surface border-2 border-border shadow-xs hover:border-persimmon/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-persimmon-soft text-persimmon">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-text-muted">Pending Tasks</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary">
            {Math.max(totalTasks - completedTasks, 0)}
          </div>
          <p className="text-[11px] text-text-secondary mt-1">Actions requiring verification</p>
        </div>

        <div className="dashboard-card p-5 rounded-2xl bg-surface border-2 border-border shadow-xs hover:border-semantic-success/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-semantic-success-soft text-semantic-success">
              <PhoneCall className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-text-muted">Statutory Directory</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary">11</div>
          <p className="text-[11px] text-text-secondary mt-1">Free legal aid & helplines</p>
        </div>

        <div className="dashboard-card p-5 rounded-2xl bg-surface border-2 border-border shadow-xs hover:border-brass/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-brass/15 text-text-primary">
              <ShieldCheck className="w-5 h-5 text-aubergine" />
            </div>
            <span className="text-xs font-bold text-text-muted">Saved Bookmarks</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-text-primary">
            {savedResources.length + savedPublicData.length}
          </div>
          <p className="text-[11px] text-text-secondary mt-1">Portals & schemes saved</p>
        </div>
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
            <span className="text-xs text-text-muted font-bold">
              {documentCases.length} {documentCases.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>

          {documentCases.length === 0 ? (
            <div className="dashboard-card p-8 rounded-2xl border-2 border-dashed border-border bg-surface text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-canvas flex items-center justify-center mx-auto text-text-secondary">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary">No Document Dossiers Saved Yet</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Paste any SARFAESI loan notice, health insurance repudiation, or medical report in the Document Explainer, and click "Save for Later" to track it here.
              </p>
              <button
                type="button"
                onClick={onNavigateToExplain}
                className="mt-2 px-4 py-2 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Explain Your First Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {documentCases.map((item) => (
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
                      {item.payload?.summary || 'No summary preview available.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onInspectItem(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-aubergine hover:bg-aubergine-hover text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
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

        {/* Right Column: Account Security & Statutory Portals (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Account Profile & Security Card */}
          <div className="dashboard-card p-5 rounded-2xl border-2 border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-aubergine" />
                <h3 className="text-sm font-bold text-text-primary">Citizen Account</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-semantic-success-soft text-semantic-success">
                Verified
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-text-muted">Logged in as:</div>
              <div className="font-bold text-text-primary text-sm">{authUser?.name || 'Citizen Guest'}</div>
              <div className="text-text-secondary text-[11px] truncate">{authUser?.email || 'Device Session'}</div>
            </div>

            <div className="pt-2 space-y-2">
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

          {/* Connected Statutory Helplines Card */}
          <div className="dashboard-card p-5 rounded-2xl border-2 border-border bg-surface shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-persimmon" />
                <span>Direct Statutory Dials</span>
              </h3>
              <button
                type="button"
                onClick={onNavigateToResources}
                className="text-[11px] text-aubergine font-bold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-canvas border border-border">
                <div className="font-bold text-text-primary">NALSA Free Legal Aid</div>
                <div className="text-aubergine font-mono font-bold mt-0.5">📞 15100</div>
                <div className="text-[10px] text-text-muted">Civil, tenancy, and bank recovery counsel</div>
              </div>

              <div className="p-2.5 rounded-xl bg-canvas border border-border">
                <div className="font-bold text-text-primary">National Consumer Helpline</div>
                <div className="text-persimmon font-mono font-bold mt-0.5">📞 1915</div>
                <div className="text-[10px] text-text-muted">Insurance claim denials & wrongful charges</div>
              </div>

              <div className="p-2.5 rounded-xl bg-canvas border border-border">
                <div className="font-bold text-text-primary">Elderline Senior Support</div>
                <div className="text-semantic-success font-mono font-bold mt-0.5">📞 14567</div>
                <div className="text-[10px] text-text-muted">Daily 8 AM to 8 PM nationwide</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
