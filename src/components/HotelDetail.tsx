import React, { useState } from 'react';
import { HotelWithMetrics, HotelAvailability, Language, UserSettings } from '../types';
import { ArrowLeft, MapPin, ExternalLink, Bell, Info } from 'lucide-react';
import CalendarView from './CalendarView';
import AlertModal from './AlertModal';
import { cn } from '../utils/cn';
import { translations } from '../i18n/translations';

interface Props {
  hotel: HotelWithMetrics;
  availability: HotelAvailability;
  onBack: () => void;
  language: Language;
  userSettings: UserSettings;
}

const getChainColor = (chain: string) => {
  switch (chain) {
    case 'Hyatt': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Hilton': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Marriott': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'IHG': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatNumber = (num: number) => {
  if (num === Infinity || num === -Infinity) return '-';
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

export default function HotelDetail({ hotel, availability, onBack, language, userSettings }: Props) {
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertInitialDate, setAlertInitialDate] = useState<string | undefined>();
  const t = translations[language];

  const handleOpenAlert = (date?: string) => {
    setAlertInitialDate(date);
    setShowAlertModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium text-sm sm:text-base"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backToSearch}
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 h-48 sm:h-64 md:h-auto relative">
            <img 
              src={hotel.image} 
              alt={hotel.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-full md:w-2/3 p-5 sm:p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={cn("px-3 py-1 rounded-md text-xs font-bold border", getChainColor(hotel.chain))}>
                  {hotel.chain}
                </span>
                {hotel.category && (
                  <span className="text-sm text-gray-500 font-medium">{hotel.category}</span>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
              
              <div className="flex items-center text-gray-500 mb-6 text-sm sm:text-base">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{hotel.city}, {hotel.country}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-6 border-t border-gray-100">
              <div className="flex-1 min-w-[100px]">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">{t.minPoints}</div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {hotel.metrics.minPoints !== Infinity ? formatNumber(hotel.metrics.minPoints) : t.na}
                </div>
              </div>
              
              <div className="h-10 w-px bg-gray-200 hidden sm:block" />
              
              <div className="flex-1 min-w-[100px]">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">{t.minCash}</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {hotel.metrics.minCash !== Infinity ? `¥${hotel.metrics.minCash.toLocaleString()}` : t.na}
                </div>
              </div>

              <div className="h-10 w-px bg-gray-200 hidden sm:block" />

              <div className="flex-1 min-w-[100px]">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">{t.maxReturn}</div>
                <div className="text-xl sm:text-2xl font-bold text-amber-600">
                  {hotel.metrics.maxReturnPoints > 0 ? formatNumber(hotel.metrics.maxReturnPoints) : t.na}
                </div>
              </div>

              <div className="h-10 w-px bg-gray-200 hidden sm:block" />

              <div className="flex-1 min-w-[100px]">
                <div className="text-xs sm:text-sm text-gray-500 mb-1">{t.minCost}</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {hotel.metrics.minNetCost !== Infinity ? `¥${hotel.metrics.minNetCost.toLocaleString()}` : t.na}
                </div>
              </div>

              {hotel.metrics.fifthNightFree && (
                <>
                  <div className="h-10 w-px bg-gray-200 hidden md:block" />
                  <div className="flex-1 min-w-[120px] w-full md:w-auto mt-4 md:mt-0 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-700 mb-1 font-medium">
                      <Info className="w-3.5 h-3.5" />
                      {t.fifthNightFree}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-blue-900">
                      {formatNumber(hotel.metrics.fifthNightFree)}
                    </div>
                  </div>
                </>
              )}
              
              <div className="w-full sm:w-auto flex justify-end gap-3 mt-4 sm:mt-0">
                <button 
                  onClick={() => handleOpenAlert()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {t.alert}
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  {t.book}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t.calendarTitle}</h2>
        <p className="text-sm sm:text-base text-gray-500">{t.calendarDesc}</p>
        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800 flex items-start gap-3">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Note on Scraping:</strong> Real-time web scraping requires a dedicated backend server (e.g., Node.js/Python) and cannot be executed directly within this static browser preview due to CORS and sandbox limitations. The data shown below is simulated to demonstrate the UI capabilities. The frontend architecture is fully prepared to connect to a real backend API.
          </p>
        </div>
      </div>

      <CalendarView 
        availability={availability}
        hotelChain={hotel.chain}
        userSettings={userSettings}
        onCreateAlert={handleOpenAlert} 
        language={language}
      />

      {showAlertModal && (
        <AlertModal 
          hotel={hotel} 
          initialDate={alertInitialDate}
          onClose={() => setShowAlertModal(false)} 
          language={language}
        />
      )}
    </div>
  );
}
