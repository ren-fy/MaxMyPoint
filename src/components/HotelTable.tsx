import React from 'react';
import { HotelWithMetrics, Language } from '../types';
import { cn } from '../utils/cn';
import { MapPin, ChevronRight } from 'lucide-react';
import { translations } from '../i18n/translations';

interface Props {
  hotels: HotelWithMetrics[];
  onSelect: (hotel: HotelWithMetrics) => void;
  language: Language;
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

export default function HotelTable({ hotels, onSelect, language }: Props) {
  const t = translations[language];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
              <th className="p-3 pl-4 w-[28%]">{t.hotel}</th>
              <th className="p-3">{t.minCash}</th>
              <th className="p-3">{t.minPoints}</th>
              <th className="p-3">{t.minCost}</th>
              <th className="p-3">{t.maxReturn}</th>
              <th className="p-3">{t.maxValue}</th>
              <th className="p-3">{t.fifthNightFree}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {hotels.map((hotel) => (
              <tr 
                key={hotel.id} 
                onClick={() => onSelect(hotel)}
                className="hover:bg-gray-50 transition-colors cursor-pointer group text-sm"
              >
                <td className="p-3 pl-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name} 
                      className="w-10 h-10 rounded-md object-cover border border-gray-200 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {hotel.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap leading-none", getChainColor(hotel.chain))}>
                          {hotel.chain}
                        </span>
                        <div className="flex items-center text-[11px] text-gray-500 truncate">
                          <MapPin className="w-3 h-3 mr-0.5 flex-shrink-0" />
                          <span className="truncate">{hotel.city}, {hotel.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-medium text-gray-900">
                  {hotel.metrics.minCash !== Infinity ? `¥${hotel.metrics.minCash.toLocaleString()}` : t.na}
                </td>
                <td className="p-3 font-bold text-blue-600">
                  {hotel.metrics.minPoints !== Infinity ? formatNumber(hotel.metrics.minPoints) : t.na}
                </td>
                <td className="p-3 font-medium text-gray-900">
                  {hotel.metrics.minNetCost !== Infinity ? `¥${hotel.metrics.minNetCost.toLocaleString()}` : t.na}
                </td>
                <td className="p-3 font-medium text-amber-600">
                  {hotel.metrics.maxReturnPoints > 0 ? formatNumber(hotel.metrics.maxReturnPoints) : t.na}
                </td>
                <td className="p-3 font-medium text-emerald-600">
                  {hotel.metrics.maxCpp > 0 ? `¥${hotel.metrics.maxCpp.toFixed(0)}` : t.na}
                </td>
                <td className="p-3 font-medium text-gray-900">
                  {hotel.metrics.fifthNightFree ? formatNumber(hotel.metrics.fifthNightFree) : t.na}
                </td>
                <td className="p-3 pr-4 text-right">
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View (No horizontal scroll) */}
      <div className="lg:hidden divide-y divide-gray-100">
        {hotels.map((hotel) => (
          <div 
            key={hotel.id}
            onClick={() => onSelect(hotel)}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
          >
            <div className="flex gap-3 mb-3">
              <img 
                src={hotel.image} 
                alt={hotel.name} 
                className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                  {hotel.name}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap leading-none", getChainColor(hotel.chain))}>
                    {hotel.chain}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-0.5 flex-shrink-0" />
                    <span className="truncate">{hotel.city}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">{t.minCash}</span>
                <span className="text-xs font-medium text-gray-900">
                  {hotel.metrics.minCash !== Infinity ? `¥${hotel.metrics.minCash.toLocaleString()}` : t.na}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">{t.minPoints}</span>
                <span className="text-xs font-bold text-blue-600">
                  {hotel.metrics.minPoints !== Infinity ? formatNumber(hotel.metrics.minPoints) : t.na}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">{t.minCost}</span>
                <span className="text-xs font-medium text-gray-900">
                  {hotel.metrics.minNetCost !== Infinity ? `¥${hotel.metrics.minNetCost.toLocaleString()}` : t.na}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">{t.maxReturn}</span>
                <span className="text-xs font-medium text-amber-600">
                  {hotel.metrics.maxReturnPoints > 0 ? formatNumber(hotel.metrics.maxReturnPoints) : t.na}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">{t.maxValue}</span>
                <span className="text-xs font-medium text-emerald-600">
                  {hotel.metrics.maxCpp > 0 ? `¥${hotel.metrics.maxCpp.toFixed(0)}` : t.na}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">{t.fifthNightFree}</span>
                <span className="text-xs font-medium text-gray-900">
                  {hotel.metrics.fifthNightFree ? formatNumber(hotel.metrics.fifthNightFree) : t.na}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
