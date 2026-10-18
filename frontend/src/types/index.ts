import { Language } from '../i18n/translations';
import { UnderstandData } from '../utils/demoData';

export type Tab = 'dashboard' | 'understand' | 'find' | 'resources' | 'saved';
export type FontSize = 'normal' | 'large' | 'xlarge';
export type DemoId = 'bank' | 'medical' | 'insurance' | null;

export interface CivicResource {
  id: string;
  category:
    | 'mentors-orgs'
    | 'scholarships-education'
    | 'internships-competitions'
    | 'funding-grants'
    | 'tools-services'
    | string;
  title_en: string;
  title_hi: string;
  provider_en: string;
  provider_hi: string;
  description_en: string;
  description_hi: string;
  official_link: string;
  target_audience_en: string;
  target_audience_hi: string;
  eligibility_requirements_en: string[];
  eligibility_requirements_hi: string[];
  why_it_matches_en: string;
  why_it_matches_hi: string;
  missing_requirements_warning_en: string;
  missing_requirements_warning_hi: string;
  deadline_or_schedule: string;
  verification_date: string;
  verified_source: string;
  location_coverage: string;
}

export interface AttachedFile {
  name: string;
  type: string;
  size: number;
  base64: string;
  previewUrl?: string;
}

export interface PublicDataResult {
  catalog: {
    slug: string;
    resource_id: string;
    title_en: string;
    title_hi: string;
    filter_label_en: string;
    filter_label_hi: string;
    filter_key: string;
    filter_options: Array<{
      label_en: string;
      label_hi: string;
      value: string;
    }>;
  };
  filter_value: string;
  rows: Record<string, any>[];
  summary: {
    summary: string;
    advice: string;
    cached?: boolean;
  };
  source_badge: {
    source: string;
    is_live: boolean;
    timestamp: string;
    resource_id: string;
  };
}

export interface SavedItem {
  id: string;
  session_id: string;
  user_id?: string;
  kind: 'understand' | 'public_data' | 'resource';
  title: string;
  payload: any;
  created_at: string;
}

export interface StatusBannerState {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: 'citizen' | 'senior' | 'student';
}

export type { Language, UnderstandData };
