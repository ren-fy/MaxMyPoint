export type Chain = 'Hyatt' | 'Hilton' | 'Marriott' | 'IHG';
export type Language = 'zh' | 'en';
export type SortOption = 'recommended' | 'points_asc' | 'cash_asc' | 'net_cost_asc' | 'cpp_desc';
export type UserTier = 'Member' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export type UserTiers = Record<Chain, UserTier>;

export interface Hotel {
  id: string;
  name: string;
  chain: Chain;
  city: string;
  country: string;
  image: string;
  pointsPrice: number; // Standard room points (baseline)
  cashPrice: number; // Average cash price in RMB (baseline)
  availabilityScore: number; // e.g., 45%
  category?: string; // e.g., Category 8
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  available: boolean;
  points: number;
  cash: number; // RMB
}

export interface HotelAvailability {
  hotelId: string;
  days: DayAvailability[];
}

export interface HotelMetrics {
  minPoints: number;
  minCash: number;
  minNetCost: number;
  maxReturnPoints: number;
  maxCpp: number;
  fifthNightFree: number | null;
  hasAvailability: boolean;
}

export interface HotelWithMetrics extends Hotel {
  metrics: HotelMetrics;
}

export interface SearchFilters {
  query: string;
  chain: Chain | null;
  startDate: string;
  endDate: string;
  sortBy: SortOption;
}

export interface SavedCalculation {
  id: string;
  date: string;
  name: string;
  inputs: {
    chain: Chain;
    tier: UserTier;
    roomRate: number;
    exchangeRate: number;
    taxRate: number;
    welcomePoints: number;
    quarterlyPromo: number;
    targetedPromo: number;
    otherPoints: number;
    pointValue: number;
  };
  results: {
    totalPoints: number;
    returnRate: number;
    netCost: number;
  };
}
