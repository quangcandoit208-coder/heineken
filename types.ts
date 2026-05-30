
export interface ProgramEvent {
  id: string;
  city: string;
  ward?: string; // New: Phường/Xã
  district?: string;
  province?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm - HH:mm
  venue: string;
  address: string;
  mapLink?: string; // Optional custom link
  brand: string;
  description?: string;
  eventCode?: string;
  eventName?: string;
  programId?: string;
  checkInTime?: string;
  checkOutTime?: string;
  sourceSheet?: string;
  sourceRow?: number;
  
  // New fields for extended information
  scale?: string;    // Full/Basic
  bu?: string;       // Business Unit
  region?: string;   // Region
  outletId?: string; // Outlet ID
  saleRep?: string;  // Sales Rep Name
  hardPhoneContactSale?: string;
  act?: string;
  typeOfOutlet?: string;
  updated?: string;
}

export type ProgramType = 'Activation' | 'AWO';
// Added 'SE' and 'SW' to Region type to match promotion and event data
export type Region = 'NTW' | 'GHCM' | 'CE' | 'NO' | 'MKD' | 'SE' | 'SW';

export interface Promotion {
  id: string;
  title: string;
  brand: string;
  content: string;
  
  // Two unified image fields
  image: string;       // For Laptop/Desktop (1920x1080)
  mobileImage: string; // For Mobile (1080x1350 or 1080x1920)

  // Fields
  type: ProgramType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  regions: Region[];
  cities: string[];      // New: List of cities for filtering
  bu?: string;           // New: Business Unit scope
  venueListLink?: string; // Only for AWO
}

export interface AppSettings {
  logoUrl: string;
  
  // Hero Section (Home)
  heroImage: string; 
  heroTitle: string;
  heroSubtitle: string;

  // CTA Section (Home)
  ctaTitle: string;
  ctaDescription: string;

  // Schedule Section
  scheduleTitle: string;
  scheduleSubtitle: string;

  promotions: Promotion[];
}

export type SortField = keyof ProgramEvent;
export type PromotionSortField = keyof Promotion;
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface PromotionSortConfig {
  field: PromotionSortField;
  order: SortOrder;
}

export interface FilterState {
  search: string;
  city: string;
  brand: string;
  dateFrom: string;
  dateTo: string;
  bu?: string; // Added optional bu field
}

export interface DataWarning {
  sheet: string;
  row: number;
  field: string;
  message: string;
}

export interface CalendarDataResponse {
  promotions: Promotion[];
  activationEvents: ProgramEvent[];
  warnings: DataWarning[];
  updatedAt: string;
}

export type View = 'home' | 'activation' | 'awo-schedule' | 'program-detail' | 'program-list';
