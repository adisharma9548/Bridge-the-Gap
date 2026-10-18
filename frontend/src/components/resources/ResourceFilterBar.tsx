import React from 'react';
import {
  Briefcase,
  Sparkles,
  Users,
  GraduationCap,
  Award,
  Landmark,
  Search,
  X,
} from 'lucide-react';
import type { Language } from '../../types';

interface ResourceFilterBarProps {
  t: Record<string, any>;
  lang: Language;
  selectedResourceCategory: string;
  onSelectCategory: (category: string) => void;
  selectedResourceTarget: string;
  onChangeTarget: (target: string) => void;
  resourceSearchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onSearchClear: () => void;
  onSearch: () => void;
  isFetchingResources: boolean;
}

export const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
  t,
  lang,
  selectedResourceCategory,
  onSelectCategory,
  selectedResourceTarget,
  onChangeTarget,
  resourceSearchQuery,
  onChangeSearchQuery,
  onSearchClear,
  onSearch,
  isFetchingResources,
}) => {
  const categories = [
    { id: 'all', label: t.catAll, icon: Sparkles },
    { id: 'mentors-orgs', label: t.catMentors, icon: Users },
    { id: 'scholarships-education', label: t.catScholarships, icon: GraduationCap },
    { id: 'internships-competitions', label: t.catInternships, icon: Award },
    { id: 'funding-grants', label: t.catFunding, icon: Landmark },
    { id: 'tools-services', label: t.catTools, icon: Briefcase },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aubergine-soft text-aubergine border border-aubergine/20 text-xs font-bold">
          <Briefcase className="w-3.5 h-3.5 text-aubergine" />
          <span>Verified Public Opportunities & Mentorship &bull; National Portals</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {t.resourcesHeading}
        </h1>
        <p className="text-text-secondary text-base font-normal max-w-3xl leading-relaxed">
          {t.resourcesSubtitle}
        </p>
      </div>

      {/* Category Navigation Pills */}
      <div className="space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-wider text-text-muted block">
          {lang === 'hi' ? 'संसाधन श्रेणी चुनें' : 'Filter by Opportunity Category'}
        </span>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedResourceCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-aubergine text-white shadow-xs border-b-2 border-aubergine-hover'
                    : 'bg-surface text-text-primary border border-border hover:bg-surface-raised hover:border-border-strong'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-brass' : 'text-aubergine'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Beneficiary Filter & Keyword Search */}
      <div className="bg-surface rounded-2xl border border-border shadow-card p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-5">
            <label htmlFor="resource-target-select" className="block text-xs uppercase font-extrabold tracking-wider text-text-muted">
              {t.filterTargetLabel}
            </label>
            <select
              id="resource-target-select"
              value={selectedResourceTarget}
              onChange={(e) => onChangeTarget(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-border bg-surface font-semibold text-text-primary outline-none focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft cursor-pointer"
            >
              <option value="all">{lang === 'hi' ? 'सभी नागरिक व लाभार्थी (All)' : 'All Beneficiaries & Citizens'}</option>
              <option value="senior">{lang === 'hi' ? 'वरिष्ठ नागरिक एवं बुजुर्ग (Senior Citizens & Elders)' : 'Senior Citizens & Elders'}</option>
              <option value="students">{lang === 'hi' ? 'छात्र, प्रतियोगी व युवा (Students, Youth & Aspirants)' : 'Students, Youth & Aspirants'}</option>
              <option value="women">{lang === 'hi' ? 'महिला उद्यमी व स्वयं सहायता समूह (Women Entrepreneurs)' : 'Women Entrepreneurs & SHGs'}</option>
              <option value="farmers">{lang === 'hi' ? 'लघु उद्यमी, कारीगर व किसान (Micro Business & Farmers)' : 'Micro Business, Artisans & Farmers'}</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-4">
            <label htmlFor="resource-search-input" className="block text-xs uppercase font-extrabold tracking-wider text-text-muted">
              {lang === 'hi' ? 'कीवर्ड खोज (उदा. पेंशन, स्टार्टअप, छात्रवृत्ति)' : 'Search by Keyword (e.g. pension, startup, scholarship)'}
            </label>
            <div className="relative">
              <input
                id="resource-search-input"
                type="text"
                value={resourceSearchQuery}
                onChange={(e) => onChangeSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch();
                  }
                }}
                placeholder={t.searchResourcesPlaceholder}
                className="w-full p-3.5 pl-10 pr-9 rounded-xl border border-border bg-surface font-semibold text-text-primary outline-none focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft text-sm"
              />
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-4" />
              {resourceSearchQuery && (
                <button
                  type="button"
                  onClick={onSearchClear}
                  className="absolute right-3 top-3.5 p-1 rounded-full text-text-muted hover:text-text-primary cursor-pointer"
                  aria-label="Clear keyword search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              disabled={isFetchingResources}
              onClick={onSearch}
              className="w-full min-h-[50px] px-6 rounded-xl bg-aubergine hover:bg-aubergine-hover active:bg-[#4E2E5B] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md border-b-4 border-[#3D2248] active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4 text-brass" />
              <span>{isFetchingResources ? t.fetchingData : (lang === 'hi' ? 'अवसर खोजें' : 'Find Opportunities')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
