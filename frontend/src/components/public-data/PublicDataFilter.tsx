import React from 'react';
import { Search, Wheat, Building2, Wind, GraduationCap, X } from 'lucide-react';
import { TranslationDictionary, Language } from '../../i18n/translations';

interface PublicDataFilterProps {
  selectedSlug: string;
  onSelectCatalog: (slug: string, defaultFilter: string) => void;
  selectedFilterVal: string;
  onFilterChange: (val: string) => void;
  currentCatalog: any;
  publicSearchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClear: () => void;
  onQueryData: () => void;
  isFetchingData: boolean;
  t: TranslationDictionary;
  lang: Language;
}

export const PublicDataFilter: React.FC<PublicDataFilterProps> = ({
  selectedSlug,
  onSelectCatalog,
  selectedFilterVal,
  onFilterChange,
  currentCatalog,
  publicSearchQuery,
  onSearchChange,
  onSearchClear,
  onQueryData,
  isFetchingData,
  t,
  lang,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aubergine-soft text-aubergine border border-aubergine/20 text-xs font-bold">
          <Search className="w-3.5 h-3.5" />
          <span>Open Government Data Platform &bull; data.gov.in</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {t.findHeading}
        </h1>
        <p className="text-text-secondary text-base font-normal max-w-3xl leading-relaxed">
          {t.findSubtitle}
        </p>
      </div>

      {/* Catalog Selector - Cohesive Architectural Cards */}
      <div className="space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-wider text-text-muted block">
          {t.selectCatalogTitle}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Mandi Prices */}
          <button
            type="button"
            onClick={() => onSelectCatalog('mandi-prices', 'Uttar Pradesh')}
            className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
              selectedSlug === 'mandi-prices'
                ? 'bg-aubergine-soft border-aubergine ring-4 ring-aubergine-soft/60 shadow-md'
                : 'bg-surface border-border hover:border-border-strong hover:bg-surface-raised'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-2 border ${
                selectedSlug === 'mandi-prices'
                  ? 'bg-aubergine text-white border-aubergine'
                  : 'bg-surface-raised text-aubergine border-border'
              }`}
            >
              <Wheat className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-text-primary text-base">{t.mandiTitle}</h3>
            <p className="text-xs text-text-secondary mt-1 line-clamp-2 font-medium">{t.mandiDesc}</p>
          </button>

          {/* Hospitals */}
          <button
            type="button"
            onClick={() => onSelectCatalog('hospital-directory', 'Delhi')}
            className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
              selectedSlug === 'hospital-directory'
                ? 'bg-aubergine-soft border-aubergine ring-4 ring-aubergine-soft/60 shadow-md'
                : 'bg-surface border-border hover:border-border-strong hover:bg-surface-raised'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-2 border ${
                selectedSlug === 'hospital-directory'
                  ? 'bg-aubergine text-white border-aubergine'
                  : 'bg-surface-raised text-aubergine border-border'
              }`}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-text-primary text-base">{t.hospitalTitle}</h3>
            <p className="text-xs text-text-secondary mt-1 line-clamp-2 font-medium">{t.hospitalDesc}</p>
          </button>

          {/* AQI */}
          <button
            type="button"
            onClick={() => onSelectCatalog('air-quality', 'Delhi')}
            className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
              selectedSlug === 'air-quality' || selectedSlug === 'air-quality-index'
                ? 'bg-aubergine-soft border-aubergine ring-4 ring-aubergine-soft/60 shadow-md'
                : 'bg-surface border-border hover:border-border-strong hover:bg-surface-raised'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-2 border ${
                selectedSlug === 'air-quality' || selectedSlug === 'air-quality-index'
                  ? 'bg-aubergine text-white border-aubergine'
                  : 'bg-surface-raised text-aubergine border-border'
              }`}
            >
              <Wind className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-text-primary text-base">{t.aqiTitle}</h3>
            <p className="text-xs text-text-secondary mt-1 line-clamp-2 font-medium">{t.aqiDesc}</p>
          </button>

          {/* Education & Competitive Exams */}
          <button
            type="button"
            onClick={() => onSelectCatalog('competitive-exams', 'All')}
            className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
              selectedSlug === 'competitive-exams'
                ? 'bg-aubergine-soft border-aubergine ring-4 ring-aubergine-soft/60 shadow-md'
                : 'bg-surface border-border hover:border-border-strong hover:bg-surface-raised'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-2 border ${
                selectedSlug === 'competitive-exams'
                  ? 'bg-aubergine text-white border-aubergine'
                  : 'bg-surface-raised text-aubergine border-border'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-text-primary text-base">{t.educationTitle}</h3>
            <p className="text-xs text-text-secondary mt-1 line-clamp-2 font-medium">{t.educationDesc}</p>
          </button>
        </div>
      </div>

      {/* Filter Control & Query Action */}
      <div className="bg-surface rounded-2xl border border-border shadow-card p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-5">
            <label
              htmlFor="filter-select"
              className="block text-xs uppercase font-extrabold tracking-wider text-text-muted"
            >
              {t.filterLabel}
            </label>
            <select
              id="filter-select"
              value={selectedFilterVal}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-border bg-surface font-semibold text-text-primary outline-none focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft cursor-pointer"
            >
              {currentCatalog?.filter_options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {lang === 'hi' ? opt.label_hi : opt.label_en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-4">
            <label
              htmlFor="public-search-input"
              className="block text-xs uppercase font-extrabold tracking-wider text-text-muted"
            >
              {lang === 'hi' ? 'खोजें (विषय, पद या कीवर्ड)' : 'Search Records (Keyword, Post, City)'}
            </label>
            <div className="relative">
              <input
                id="public-search-input"
                type="text"
                value={publicSearchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPublicInfoPlaceholder}
                className="w-full p-3.5 pl-10 pr-9 rounded-xl border border-border bg-surface font-semibold text-text-primary outline-none focus:border-aubergine focus:ring-2 focus:ring-aubergine-soft text-sm"
              />
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-4" />
              {publicSearchQuery && (
                <button
                  type="button"
                  onClick={onSearchClear}
                  className="absolute right-3 top-3.5 p-1 rounded-full text-text-muted hover:text-text-primary cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              disabled={isFetchingData}
              onClick={onQueryData}
              className="w-full min-h-[50px] px-6 rounded-xl bg-aubergine hover:bg-aubergine-hover active:bg-[#4E2E5B] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md border-b-4 border-[#3D2248] active:border-b-0 active:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4 text-brass" />
              <span>{isFetchingData ? t.fetchingData : t.showInfoBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
