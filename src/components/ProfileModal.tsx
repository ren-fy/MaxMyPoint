import React, { useState } from 'react';
import { X, Crown, LogOut, Save } from 'lucide-react';
import { Language, UserTiers, Chain, UserTier } from '../types';
import { translations } from '../i18n/translations';

interface Props {
  userTiers: UserTiers;
  onSave: (tiers: UserTiers) => void;
  onClose: () => void;
  onLogout: () => void;
  language: Language;
}

export default function ProfileModal({ userTiers, onSave, onClose, onLogout, language }: Props) {
  const t = translations[language];
  const [localTiers, setLocalTiers] = useState<UserTiers>({ ...userTiers });

  const chains: Chain[] = ['Hyatt', 'Hilton', 'Marriott', 'IHG'];

  const handleSave = () => {
    onSave(localTiers);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Crown className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t.myTiers}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">
            {t.setTiersDesc}
          </p>

          <div className="space-y-4">
            {chains.map((chain) => (
              <div key={chain} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="font-bold text-gray-900">{chain}</span>
                <select
                  value={localTiers[chain]}
                  onChange={(e) => setLocalTiers({ ...localTiers, [chain]: e.target.value as UserTier })}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer"
                >
                  <option value="Member">{t.tierMember}</option>
                  <option value="Silver">{t.tierSilver}</option>
                  <option value="Gold">{t.tierGold}</option>
                  <option value="Platinum">{t.tierPlatinum}</option>
                  <option value="Diamond">{t.tierDiamond}</option>
                </select>
              </div>
            ))}
          </div>

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
