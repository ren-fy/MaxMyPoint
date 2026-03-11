import { Chain, UserTiers } from '../types';

const USD_TO_RMB = 7.2;

export const CHAIN_POLICIES = {
  Hyatt: {
    basePtsPerUSD: 5,
    valuePerPointRMB: 0.12, // ~1200 RMB / 10k pts
    bonuses: { Member: 0, Silver: 0.1, Gold: 0.2, Platinum: 0.3, Diamond: 0.3 } // Discoverist, Explorist, Globalist
  },
  Marriott: {
    basePtsPerUSD: 10,
    valuePerPointRMB: 0.05, // ~500 RMB / 10k pts
    bonuses: { Member: 0, Silver: 0.1, Gold: 0.25, Platinum: 0.5, Diamond: 0.75 } // Titanium/Ambassador
  },
  Hilton: {
    basePtsPerUSD: 10,
    valuePerPointRMB: 0.03, // ~300 RMB / 10k pts
    bonuses: { Member: 0, Silver: 0.2, Gold: 0.8, Platinum: 1.0, Diamond: 1.0 }
  },
  IHG: {
    basePtsPerUSD: 10,
    valuePerPointRMB: 0.035, // ~350 RMB / 10k pts
    bonuses: { Member: 0, Silver: 0.2, Gold: 0.4, Platinum: 0.6, Diamond: 1.0 }
  }
};

export function calculateMetrics(chain: Chain, cashRMB: number, points: number, userTiers: UserTiers) {
  const policy = CHAIN_POLICIES[chain];
  const cashUSD = cashRMB / USD_TO_RMB;
  const tier = userTiers[chain];
  
  // Calculate base points
  const basePoints = cashUSD * policy.basePtsPerUSD;
  
  // Apply tier bonus multiplier
  const bonusMultiplier = policy.bonuses[tier];
  const returnPoints = Math.round(basePoints * (1 + bonusMultiplier));
  
  // Calculate value of returned points in RMB
  const returnPointsValueRMB = returnPoints * policy.valuePerPointRMB;
  
  // Calculate net cost
  const netCost = Math.round(cashRMB - returnPointsValueRMB);
  
  // Calculate CPP (RMB per 10k points)
  const cpp = Number(((cashRMB / points) * 10000).toFixed(0));

  // Calculate Return Rate (%)
  const returnRate = Number(((returnPointsValueRMB / cashRMB) * 100).toFixed(1));

  return { returnPoints, netCost, cpp, returnRate };
}
