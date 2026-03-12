import React, { useState, useEffect } from 'react';
import { Chain, Language, UserTier, SavedCalculation, UserSettings, CHAIN_TIERS, CHAIN_NAMES_ZH, CHAIN_TIERS_ZH } from '../types';
import { CHAIN_POLICIES, DEFAULT_POINT_VALUES, BUY_POINTS_COST_USD } from '../utils/calculator';
import { translations } from '../i18n/translations';
import { Calculator, DollarSign, Percent, Gift, Activity, Target, PlusCircle, Coins, Save, Trash2, Clock } from 'lucide-react';

interface Props {
  language: Language;
  userSettings?: UserSettings;
}

export default function CalculatorView({ language, userSettings }: Props) {
  const t = translations[language];

  // Form State
  const [chain, setChain] = useState<Chain>('Marriott');
  const [tier, setTier] = useState<UserTier>('Platinum Elite');
  const [roomRate, setRoomRate] = useState<number>(1000); // Pre-tax room rate in local currency
  const [exchangeRate, setExchangeRate] = useState<number>(userSettings?.exchangeRate || 6.8); // Local currency to USD (e.g., 6.8 RMB = 1 USD)
  const [taxRate, setTaxRate] = useState<number>(userSettings?.taxRate || 16.0); // Tax rate %
  const [welcomePoints, setWelcomePoints] = useState<number>(1000);
  const [quarterlyPromo, setQuarterlyPromo] = useState<number>(0);
  const [targetedPromo, setTargetedPromo] = useState<number>(0);
  const [otherPoints, setOtherPoints] = useState<number>(0);
  const [pointValue, setPointValue] = useState<number>(DEFAULT_POINT_VALUES['Marriott'] * 10000); // Value per 10k points

  // Saved Calculations State
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);

  useEffect(() => {
    if (userSettings) {
      setExchangeRate(userSettings.exchangeRate);
      setTaxRate(userSettings.taxRate || 16.0);
    }
  }, [userSettings]);

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const res = await fetch('/api/calculations');
        if (res.ok) {
          const data = await res.json();
          setSavedCalculations(data);
        }
      } catch (error) {
        console.error('Failed to fetch calculations:', error);
      }
    };
    fetchCalculations();
  }, []);

  // Handle chain change to update default point value and tier
  const handleChainChange = (newChain: Chain) => {
    setChain(newChain);
    setPointValue(DEFAULT_POINT_VALUES[newChain] * 10000);
    // Set a sensible default tier
    if (newChain === 'Hilton') setTier('Diamond');
    else if (newChain === 'Marriott') setTier('Platinum Elite');
    else if (newChain === 'Hyatt') setTier('Globalist');
    else setTier('Platinum Elite');
  };

  // Calculations
  const policy = CHAIN_POLICIES[chain];
  
  // 1. Calculate Cash
  const totalCash = roomRate * (1 + taxRate / 100);
  const roomRateUSD = roomRate / exchangeRate;
  
  // 2. Calculate Base Points
  const basePoints = Math.round(roomRateUSD * policy.basePtsPerUSD);
  
  // 3. Calculate Tier Bonus
  const bonusMultiplier = policy.bonuses[tier] || 0;
  const tierBonusPoints = Math.round(basePoints * bonusMultiplier);
  
  // 4. Calculate Extra Points
  const extraPoints = welcomePoints + quarterlyPromo + targetedPromo + otherPoints;
  
  // 5. Total Points
  const totalPoints = basePoints + tierBonusPoints + extraPoints;
  
  // 6. Value of Total Points
  const totalPointsValue = (totalPoints / 10000) * pointValue;
  
  // 7. Return Rate
  const returnRate = totalCash > 0 ? (totalPointsValue / totalCash) * 100 : 0;
  
  // 8. Reference Cost Price
  const referenceCost = totalCash - totalPointsValue;
  
  // 9. Break-even Point Price
  // If points required are lower than this, it's better to use points.
  const breakEvenPoints = pointValue > 0 ? (totalCash / pointValue) * 10000 : 0;

  const handleSave = async () => {
    const newCalc: SavedCalculation = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      name: `${chain} ${tier} - ¥${roomRate}`,
      inputs: {
        chain, tier, roomRate, exchangeRate, taxRate,
        welcomePoints, quarterlyPromo, targetedPromo, otherPoints, pointValue
      },
      results: { totalPoints, returnRate, netCost: referenceCost }
    };
    
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCalc)
      });
      if (res.ok) {
        const savedCalc = await res.json();
        setSavedCalculations(prev => [savedCalc, ...prev]);
      }
    } catch (error) {
      console.error('Failed to save calculation:', error);
    }
  };

  const handleLoad = (calc: SavedCalculation) => {
    setChain(calc.inputs.chain);
    setTier(calc.inputs.tier);
    setRoomRate(calc.inputs.roomRate);
    setExchangeRate(calc.inputs.exchangeRate);
    setTaxRate(calc.inputs.taxRate);
    setWelcomePoints(calc.inputs.welcomePoints);
    setQuarterlyPromo(calc.inputs.quarterlyPromo);
    setTargetedPromo(calc.inputs.targetedPromo);
    setOtherPoints(calc.inputs.otherPoints);
    setPointValue(calc.inputs.pointValue);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/calculations/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSavedCalculations(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete calculation:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calculator className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'zh' ? '酒店收益计算器' : 'Hotel Earnings Calculator'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {language === 'zh' 
              ? '计算入住酒店可获得的总积分、回血比例及参考成本' 
              : 'Calculate total points earned, return rate, and reference cost for your stay'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form and Saved Calculations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            
            {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">1</span>
              {language === 'zh' ? '基本信息' : 'Basic Info'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.chain}</label>
                <select 
                  value={chain} 
                  onChange={(e) => handleChainChange(e.target.value as Chain)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                >
                  {Object.keys(CHAIN_POLICIES).map(c => (
                    <option key={c} value={c}>{language === 'zh' ? CHAIN_NAMES_ZH[c as Chain] : c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.tier}</label>
                <select 
                  value={tier} 
                  onChange={(e) => setTier(e.target.value as UserTier)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                >
                  {CHAIN_TIERS[chain].map(t => (
                    <option key={t} value={t}>{language === 'zh' ? CHAIN_TIERS_ZH[chain][t] : t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Financials */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">2</span>
              {language === 'zh' ? '费用与汇率' : 'Costs & Rates'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'zh' ? '税前房费 (优惠后)' : 'Pre-tax Room Rate'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <input 
                    type="number" 
                    value={roomRate || ''} 
                    onChange={(e) => setRoomRate(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-9 p-2.5 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'zh' ? '税费比例 (%)' : 'Tax Rate (%)'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Percent className="w-4 h-4 text-gray-400" />
                  </div>
                  <input 
                    type="number" 
                    value={taxRate || ''} 
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-9 p-2.5 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'zh' ? 'USD兑换汇率' : 'USD Exchange Rate'}
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={exchangeRate || ''} 
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.value} ({language === 'zh' ? '元/万分' : 'per 10k'})
                </label>
                <input 
                  type="number" 
                  value={pointValue || ''} 
                  onChange={(e) => setPointValue(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Extra Points */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">3</span>
              {language === 'zh' ? '额外积分奖励' : 'Extra Points'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-pink-500" />
                  {language === 'zh' ? '欢迎积分' : 'Welcome Points'}
                </label>
                <input 
                  type="number" 
                  value={welcomePoints || ''} 
                  onChange={(e) => setWelcomePoints(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  {language === 'zh' ? '季度活动' : 'Quarterly Promo'}
                </label>
                <input 
                  type="number" 
                  value={quarterlyPromo || ''} 
                  onChange={(e) => setQuarterlyPromo(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-500" />
                  {language === 'zh' ? '定向积分' : 'Targeted Promo'}
                </label>
                <input 
                  type="number" 
                  value={targetedPromo || ''} 
                  onChange={(e) => setTargetedPromo(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-gray-500" />
                  {language === 'zh' ? '其他积分' : 'Other Points'}
                </label>
                <input 
                  type="number" 
                  value={otherPoints || ''} 
                  onChange={(e) => setOtherPoints(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              {t.savedCalculations}
            </h3>
            {savedCalculations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                {t.noSaved}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {savedCalculations.map(calc => (
                  <div key={calc.id} className="group relative bg-gray-50 border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm text-gray-900 truncate pr-6">{calc.name}</div>
                      <button
                        onClick={() => handleDelete(calc.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {new Date(calc.date).toLocaleDateString()} {new Date(calc.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-sm">
                        <span className="text-emerald-600 font-medium">¥{calc.results.netCost.toFixed(0)}</span>
                        <span className="text-gray-400 mx-1.5">|</span>
                        <span className="text-blue-600 font-medium">{calc.results.totalPoints.toLocaleString()} pts</span>
                      </div>
                      <button
                        onClick={() => handleLoad(calc)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                      >
                        {t.load}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white lg:sticky lg:top-24">
            <h2 className="text-lg font-medium text-blue-100 mb-2">
              {language === 'zh' ? '预计总收益' : 'Estimated Total Return'}
            </h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold">{totalPoints.toLocaleString()}</span>
              <span className="text-blue-200 text-sm">{language === 'zh' ? '积分' : 'pts'}</span>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-sm text-blue-100 mb-1">{language === 'zh' ? '积分构成' : 'Points Breakdown'}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">{language === 'zh' ? '基础积分' : 'Base Points'}</span>
                    <span className="font-medium">{basePoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">{language === 'zh' ? '会籍加赠' : 'Tier Bonus'}</span>
                    <span className="font-medium">+{tierBonusPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">{language === 'zh' ? '额外奖励' : 'Extra Promos'}</span>
                    <span className="font-medium">+{extraPoints.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs text-blue-200 mb-1">{language === 'zh' ? '积分价值' : 'Points Value'}</div>
                  <div className="text-lg font-semibold">¥{totalPointsValue.toFixed(1)}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs text-blue-200 mb-1">{language === 'zh' ? '回血比例' : 'Return Rate'}</div>
                  <div className="text-lg font-semibold">{returnRate.toFixed(1)}%</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-100">{language === 'zh' ? '税后总价' : 'Total Cash'}</span>
                  <span className="font-medium">¥{totalCash.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/20 pt-2">
                  <span className="text-sm text-blue-100 font-medium">{language === 'zh' ? '参考净成本' : 'Net Cost'}</span>
                  <span className="font-bold text-lg text-emerald-300">¥{referenceCost.toFixed(1)}</span>
                </div>
              </div>

              <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-4 backdrop-blur-sm mt-4">
                <div className="flex items-start gap-2">
                  <Coins className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-amber-100 font-medium mb-1">
                      {language === 'zh' ? '兑换建议' : 'Redemption Advice'}
                    </div>
                    <p className="text-xs text-amber-100/80 leading-relaxed">
                      {language === 'zh' 
                        ? `当该酒店积分房低于 ` 
                        : `Use points if the award night costs less than `}
                      <strong className="text-white text-sm">{Math.round(breakEvenPoints).toLocaleString()}</strong>
                      {language === 'zh' 
                        ? ` 积分时，使用积分兑换比现金预订更划算。` 
                        : ` points. Otherwise, pay cash.`}
                    </p>
                  </div>
                </div>
              </div>

              {(() => {
                const buyPointsCostRMBPerPoint = BUY_POINTS_COST_USD[chain] * exchangeRate;
                const breakEvenBuyPointsCost = breakEvenPoints * buyPointsCostRMBPerPoint;
                if (breakEvenBuyPointsCost < totalCash) {
                  const savings = totalCash - breakEvenBuyPointsCost;
                  return (
                    <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-4 backdrop-blur-sm mt-4">
                      <div className="flex items-start gap-2">
                        <span className="text-xl leading-none flex-shrink-0">💡</span>
                        <div>
                          <div className="text-sm text-emerald-100 font-medium mb-1">
                            {language === 'zh' ? '买分套利' : 'Buy-Points Arbitrage'}
                          </div>
                          <p className="text-xs text-emerald-100/80 leading-relaxed">
                            {language === 'zh' 
                              ? `若以促销价购买积分，兑换此房型可节省约 ` 
                              : `Buying points for this stay could save you around `}
                            <strong className="text-white text-sm">¥{savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                            {language === 'zh' 
                              ? ` (买分成本约 ¥${breakEvenBuyPointsCost.toLocaleString(undefined, { maximumFractionDigits: 0 })})` 
                              : ` (Cost to buy points: ¥${breakEvenBuyPointsCost.toLocaleString(undefined, { maximumFractionDigits: 0 })})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <button
                onClick={handleSave}
                className="w-full mt-6 bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {t.saveCalculation}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}