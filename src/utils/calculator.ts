import { Chain, UserSettings } from '../types';

export const DEFAULT_EXCHANGE_RATE = 7.2;

export const DEFAULT_POINT_VALUES: Record<Chain, number> = {
  Hyatt: 0.12,
  Marriott: 0.05,
  Hilton: 0.03,
  IHG: 0.035
};

export const CHAIN_POLICIES = {
  Hyatt: {
    basePtsPerUSD: 5,
    bonuses: { Member: 0, Silver: 0.1, Gold: 0.2, Platinum: 0.3, Diamond: 0.3 } // Discoverist, Explorist, Globalist
  },
  Marriott: {
    basePtsPerUSD: 10,
    bonuses: { Member: 0, Silver: 0.1, Gold: 0.25, Platinum: 0.5, Diamond: 0.75 } // Titanium/Ambassador
  },
  Hilton: {
    basePtsPerUSD: 10,
    bonuses: { Member: 0, Silver: 0.2, Gold: 0.8, Platinum: 1.0, Diamond: 1.0 }
  },
  IHG: {
    basePtsPerUSD: 10,
    bonuses: { Member: 0, Silver: 0.2, Gold: 0.4, Platinum: 0.6, Diamond: 1.0 }
  }
};

export function calculateMetrics(chain: Chain, cashRMB: number, points: number, settings: UserSettings) {
  const policy = CHAIN_POLICIES[chain];
  const cashUSD = cashRMB / settings.exchangeRate;
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
