import React, { useState } from 'react';
import { Hotel, Language } from '../types';
import { X, Bell, Calendar } from 'lucide-react';
import { translations } from '../i18n/translations';

interface Props {
  hotel: Hotel;
  onClose: () => void;
  language: Language;
}

export default function AlertModal({ hotel, onClose, language }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{t.createAlert}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 sm:p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{t.alertSuccess}</h4>
              <p className="text-gray-500 text-sm sm:text-base">
                {t.alertSuccessDesc} {email}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">
                {t.alertModalDesc} <span className="font-bold text-gray-900">{hotel.name}</span>.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                    placeholder="you@example.com"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {t.dateRange}
                  </div>
                  <p className="text-xs text-gray-500">
                    {t.dateRangeDesc}
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors mt-6 text-sm sm:text-base"
                >
                  {t.createAlert}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
