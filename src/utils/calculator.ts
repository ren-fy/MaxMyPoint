import { Chain, UserSettings } from '../types';

export const DEFAULT_EXCHANGE_RATE = 7.2;

export const DEFAULT_POINT_VALUES: Record<Chain, number> = {
  Hyatt: 0.12,
  Marriott: 0.05,
  Hilton: 0.03,
  IHG: 0.035
};

// Standard promotional buy points cost in USD per point
export const BUY_POINTS_COST_USD: Record<Chain, number> = {
  Hyatt: 0.017, // ~1.7 cents
  Marriott: 0.008, // ~0.8 cents
  Hilton: 0.005, // ~0.5 cents
  IHG: 0.005 // ~0.5 cents
};

export const CHAIN_POLICIES = {
  Hyatt: {
    basePtsPerUSD: 5,
    bonuses: { Member: 0, Discoverist: 0.1, Explorist: 0.2, Globalist: 0.3 } as Record<string, number>
  },
  Marriott: {
    basePtsPerUSD: 10,
    bonuses: { Member: 0, 'Silver Elite': 0.1, 'Gold Elite': 0.25, 'Platinum Elite': 0.5, 'Titanium Elite': 0.75, 'Ambassador Elite': 0.75 } as Record<string, number>
  },
  Hilton: {
    basePtsPerUSD: 10,
    bonuses: { Member: 0, Silver: 0.2, Gold: 0.8, Diamond: 1.0 } as Record<string, number>
  },
  IHG: {
    basePtsPerUSD: 10,
    bonuses: { Club: 0, 'Silver Elite': 0.2, 'Gold Elite': 0.4, 'Platinum Elite': 0.6, 'Diamond Elite': 1.0 } as Record<string, number>
  }
};

export function calculateMetrics(chain: Chain, cashRMB: number, points: number, settings: UserSettings) {
  const policy = CHAIN_POLICIES[chain];
  
  // Strip tax from the total cash price to get the base room rate for points calculation
  const preTaxCashRMB = cashRMB / (1 + (settings.taxRate || 0) / 100);
  const cashUSD = preTaxCashRMB / settings.exchangeRate;
  
  const tier = settings.tiers[chain];
  const valuePerPointRMB = settings.pointValues[chain];
  
  // Calculate base points
  const basePoints = cashUSD * policy.basePtsPerUSD;
  
  // Apply tier bonus multiplier
  const bonusMultiplier = policy.bonuses[tier];
  const returnPoints = Math.round(basePoints * (1 + bonusMultiplier));
  
  // Calculate value of returned points in RMB
  const returnPointsValueRMB = returnPoints * valuePerPointRMB;
  
  // Calculate net cost
  const netCost = Math.round(cashRMB - returnPointsValueRMB);
  
  // Calculate CPP (RMB per 10k points)
  const cpp = Number(((cashRMB / points) * 10000).toFixed(0));

  // Calculate Return Rate (%)
  const returnRate = Number(((returnPointsValueRMB / cashRMB) * 100).toFixed(1));

  return { returnPoints, netCost, cpp, returnRate };
}
