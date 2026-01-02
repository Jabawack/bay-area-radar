/**
 * TypeScript types for the job search dashboard.
 */

export interface Job {
  source: 'remotive' | 'greenhouse' | 'lever' | 'usajobs';
  source_id: string;
  company: string;
  title: string;
  description: string;
  location: string;
  work_type: 'remote' | 'hybrid' | 'onsite';
  salary_min: number | null;
  salary_max: number | null;
  url: string;
  posted_at: string | null;
  skills: string[];
  summary: string | null;
  distance_miles: number | null;
  is_commutable: boolean;
  latitude: number | null;
  longitude: number | null;
}

export interface JobsResponse {
  success: boolean;
  jobs: Job[];
  total_found: number;
  total_filtered: number;
  progress: string[];
  errors: string[];
  fetch_started_at: string;
  fetch_completed_at: string;
}

export interface FilterState {
  workType: ('remote' | 'hybrid' | 'onsite')[];
  maxDistance: number;
  minSalary: number;
  searchQuery: string;
  sortBy: 'distance' | 'salary' | 'recent' | 'company';
}

export const DEFAULT_FILTERS: FilterState = {
  workType: ['remote', 'hybrid', 'onsite'],
  maxDistance: 25,
  minSalary: 0,
  searchQuery: '',
  sortBy: 'distance',
};

// Home location (95118, Almaden, San Jose)
export const HOME_LOCATION = {
  lat: 37.2358,
  lng: -121.8606,
  zip: '95118',
  city: 'Almaden, San Jose',
};

export const MAX_COMMUTE_MILES = 25;
