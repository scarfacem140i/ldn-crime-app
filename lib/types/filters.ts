/**
 * Shared types for crime filter parameters used across components
 */

// Crime categories available in the application
export const crimeCategories = [
  "all-crime",
  "anti-social-behaviour",
  "bicycle-theft",
  "burglary",
  "criminal-damage-arson",
  "drugs",
  "other-theft",
  "possession-of-weapons",
  "public-order",
  "robbery",
  "shoplifting",
  "theft-from-the-person",
  "vehicle-crime",
  "violent-crime",
  "other-crime",
];

// Type for filter parameters used in URL query state
export interface CrimeFilterParams {
  categories: string[];
  startDate: string | null;
  endDate: string | null;
  distance: number;
  showVerified: boolean;
  showUnverified: boolean;
}

// Type for filter parameters used in component props
export interface CrimeFilterChangeParams {
  categories: string[];
  startDate: Date | null;
  endDate: Date | null;
  distance: number;
  showPoliceData: boolean | null;
}
