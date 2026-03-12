import React, { useState } from 'react';
import { X, Crown, LogOut, Save, RefreshCw, Settings } from 'lucide-react';
import { Language, UserSettings, Chain, UserTier, CHAIN_TIERS, CHAIN_NAMES_ZH, CHAIN_TIERS_ZH } from '../types';
import { translations } from '../i18n/translations';

interface Props {
  userSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
  onLogout: () => void;
  language: Language;
}

export default function ProfileModal({ userSettings, onSave, onClose, onLogout, language }: Props) {
  const t = translations[language];
  const [localSettings, setLocalSettings] = useState<UserSettings>({ 
    tiers: { ...userSettings.tiers },
    pointValues: { ...userSettings.pointValues },
    exchangeRate: userSettings.exchangeRate,
    taxRate: userSettings.taxRate || 16.0
  });
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [activeTab, setActiveTab] = useState<'tiers' | 'valuations'>('tiers');

  const chains: Chain[] = ['Hyatt', 'Hilton', 'Marriott', 'IHG'];

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const fetchExchangeRate = async () => {
    try {
      setIsFetchingRate(true);
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data && data.rates && data.rates.CNY) {
        setLocalSettings(prev => ({ ...prev, exchangeRate: Number(data.rates.CNY.toFixed(2)) }));
      }
    } catch (e) {
      console.error('Failed to fetch exchange rate', e);
    } finally {
      setIsFetchingRate(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{language === 'zh' ? '个人设置' : 'Settings'}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'tiers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('tiers')}
          >
            {t.myTiers}
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'valuations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('valuations')}
          >
            {language === 'zh' ? '积分估值 & 汇率' : 'Valuations & Rates'}
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'tiers' ? (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {t.setTiersDesc}
              </p>

              <div className="space-y-4">
                {chains.map((chain) => (
                  <div key={chain} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="font-bold text-gray-900">{language === 'zh' ? CHAIN_NAMES_ZH[chain] : chain}</span>
                    <select
                      value={localSettings.tiers[chain]}
                      onChange={(e) => setLocalSettings({ 
                        ...localSettings, 
                        tiers: { ...localSettings.tiers, [chain]: e.target.value as UserTier }
                      })}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer"
                    >
                      {CHAIN_TIERS[chain].map(tier => (
                        <option key={tier} value={tier}>
                          {language === 'zh' ? CHAIN_TIERS_ZH[chain][tier] : tier}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-900">
                    {language === 'zh' ? '默认税率/服务费 (Tax & Fees %)' : 'Default Tax & Fees (%)'}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={localSettings.taxRate}
                    onChange={(e) => setLocalSettings({ ...localSettings, taxRate: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 pr-8 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'zh' ? '国内通常为 16.0%，用于在计算回血时扣除税费部分。' : 'Usually 16.0% in China. Used to deduct taxes before calculating points.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-900">
                    {language === 'zh' ? '美元兑人民币汇率 (USD to RMB)' : 'Exchange Rate (USD to RMB)'}
                  </label>
                  <button 
                    onClick={fetchExchangeRate}
                    disabled={isFetchingRate}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingRate ? 'animate-spin' : ''}`} />
                    {language === 'zh' ? '获取今日汇率' : 'Fetch Latest'}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={localSettings.exchangeRate}
                  onChange={(e) => setLocalSettings({ ...localSettings, exchangeRate: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-4">
                  {language === 'zh' ? '单点积分估值 (RMB/分)' : 'Point Valuation (RMB/pt)'}
                </label>
                <div className="space-y-3">
                  {chains.map((chain) => (
                    <div key={chain} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 w-24">{language === 'zh' ? CHAIN_NAMES_ZH[chain] : chain}</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">¥</span>
                        <input
                          type="number"
                          step="0.001"
                          value={localSettings.pointValues[chain]}
                          onChange={(e) => setLocalSettings({
                            ...localSettings,
                            pointValues: { ...localSettings.pointValues, [chain]: Number(e.target.value) }
                          })}
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 pl-7 p-2 outline-none"
                        />
                      </div>
                      <span className="text-xs text-gray-400 ml-3 w-20 text-right">
                        {language === 'zh' ? `~${Math.round(localSettings.pointValues[chain] * 10000)}/万分` : `~${Math.round(localSettings.pointValues[chain] * 10000)}/10k`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
