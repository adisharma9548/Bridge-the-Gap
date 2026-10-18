import React from 'react';
import { LayoutDashboard, FileText, Search, Briefcase, Bookmark } from 'lucide-react';
import { Tab } from '../types';

interface MobileNavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  savedCount: number;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  onTabChange,
  savedCount,
}) => {
  const tabs: Array<{ id: Tab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'understand', label: 'Explain', icon: FileText },
    { id: 'find', label: 'Data', icon: Search },
    { id: 'resources', label: 'Schemes', icon: Briefcase },
    { id: 'saved', label: 'Saved', icon: Bookmark },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border p-2 shadow-lg">
      <div className="max-w-lg mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] rounded-xl font-bold text-[10px] sm:text-xs flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive
                  ? 'bg-aubergine text-white shadow-xs'
                  : 'text-text-secondary bg-surface-raised hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{tab.label}</span>
              {tab.id === 'saved' && savedCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-brass ring-2 ring-surface" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
