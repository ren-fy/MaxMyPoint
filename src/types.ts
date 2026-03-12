export type Chain = 'Hyatt' | 'Hilton' | 'Marriott' | 'IHG';
export type Language = 'zh' | 'en';
export type SortOption = 'recommended' | 'points_asc' | 'cash_asc' | 'net_cost_asc' | 'cpp_desc' | 'return_rate_desc' | 'return_points_desc' | 'points_drop_desc' | 'cash_drop_desc';

export const CHAIN_TIERS = {
  Marriott: ['Member', 'Silver Elite', 'Gold Elite', 'Platinum Elite', 'Titanium Elite', 'Ambassador Elite'],
  Hilton: ['Member', 'Silver', 'Gold', 'Diamond'],
  Hyatt: ['Member', 'Discoverist', 'Explorist', 'Globalist'],
  IHG: ['Club', 'Silver Elite', 'Gold Elite', 'Platinum Elite', 'Diamond Elite']
} as const;

export const CHAIN_NAMES_ZH: Record<Chain, string> = {
  Marriott: '万豪 (Marriott)',
  Hilton: '希尔顿 (Hilton)',
  Hyatt: '凯悦 (Hyatt)',
  IHG: '洲际 (IHG)'
};

export const CHAIN_TIERS_ZH: Record<Chain, Record<string, string>> = {
  Marriott: {
    'Member': '会员',
    'Silver Elite': '银卡尊贵级别',
    'Gold Elite': '金卡尊贵级别',
    'Platinum Elite': '白金卡尊贵级别',
    'Titanium Elite': '钛金卡尊贵级别',
    'Ambassador Elite': '大使尊贵级别'
  },
  Hilton: {
    'Member': '会员',
    'Silver': '银卡会员',
    'Gold': '金卡会员',
    'Diamond': '钻石卡会员'
  },
  Hyatt: {
    'Member': '会员',
    'Discoverist': '探索者',
    'Explorist': '冒险家',
    'Globalist': '环球客'
  },
  IHG: {
    'Club': '俱乐部会员',
    'Silver Elite': '银卡精英会员',
    'Gold Elite': '金卡精英会员',
    'Platinum Elite': '白金卡精英会员',
    'Diamond Elite': '钻石卡精英会员'
  }
};

export type UserTier = typeof CHAIN_TIERS[Chain][number];

export type UserTiers = {
  [K in Chain]: typeof CHAIN_TIERS[K][number];
};

export type PointValuations = Record<Chain, number>;

export interface UserSettings {
  tiers: UserTiers;
  pointValues: PointValuations;
  exchangeRate: number;
  taxRate: number;
}

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
  pointsDrop?: number; // Compared to yesterday
  cashDrop?: number; // Compared to yesterday
}

export interface HotelAvailability {
  hotelId: string;
  days: DayAvailability[];
}

export interface HotelMetrics {
  minPoints: number;
  minPointsDate?: string;
  minCash: number;
  minCashDate?: string;
  minNetCost: number;
  minNetCostDate?: string;
  maxReturnPoints: number;
  maxReturnPointsDate?: string;
  maxReturnRate: number;
  maxReturnRateDate?: string;
  maxCpp: number;
  maxCppDate?: string;
  fifthNightFree: number | null;
  hasAvailability: boolean;
  maxPointsDrop?: number;
  maxCashDrop?: number;
  maxPointsDropDate?: string;
  maxCashDropDate?: string;
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
  maxCash?: number;
  maxPoints?: number;
  maxNetCost?: number;
  minReturnRate?: number;
  minCpp?: number;
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
