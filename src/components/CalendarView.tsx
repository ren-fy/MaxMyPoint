import React, { useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { HotelAvailability, DayAvailability, Language, Chain, UserSettings } from '../types';
import { calculateMetrics } from '../utils/calculator';
import { cn } from '../utils/cn';
import { ChevronLeft, ChevronRight, Bell, X } from 'lucide-react';
import { translations } from '../i18n/translations';

interface Props {
  availability: HotelAvailability;
  hotelChain: Chain;
  userSettings: UserSettings;
  onCreateAlert: (date?: string) => void;
  language: Language;
}

export default function CalendarView({ availability, hotelChain, userSettings, onCreateAlert, language }: Props) {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const [displayMode, setDisplayMode] = useState<'none' | 'points' | 'cash' | 'netCost' | 'returnPoints' | 'returnRate' | 'cpp'>('points');
  const [selectedDateDetails, setSelectedDateDetails] = useState<string | null>(null);
  const t = translations[language];
  
  const availabilityMap = new Map<string, DayAvailability>();
  availability.days.forEach(day => {
    availabilityMap.set(day.date, day);
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));

  const monthsToRender = [
    currentDate
  ];

  const locale = language === 'zh' ? zhCN : enUS;
  const weekDays = language === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  const renderMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    
    const startDayOfWeek = start.getDay();
    const paddingDays = Array(startDayOfWeek).fill(null);

    return (
      <div key={monthDate.toISOString()} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayData = availabilityMap.get(dateStr);
            const isAvailable = dayData?.available;
            
            const metrics = isAvailable && dayData 
              ? calculateMetrics(hotelChain, dayData.cash, dayData.points, userSettings) 
              : null;
            
            return (
              <div 
                key={dateStr}
                className="group relative aspect-square"
                onClick={() => setSelectedDateDetails(dateStr)}
              >
                <div className={cn(
                  "w-full h-full flex flex-col items-center justify-center rounded-md cursor-pointer transition-all p-0.5",
                  isAvailable 
                    ? "bg-green-100 text-green-800 hover:bg-green-200 border border-green-200" 
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100",
                  isToday(day) && "ring-2 ring-blue-50 ring-offset-1"
                )}>
                  <span className="text-xs sm:text-sm font-medium leading-none">{format(day, 'd')}</span>
                  {isAvailable && displayMode === 'points' && dayData && (
                    <div className="flex flex-col items-center mt-0.5 sm:mt-1">
                      <span className="text-[8px] sm:text-[9px] font-bold leading-none text-green-700">
                        {formatNumber(dayData.points)}
                      </span>
                      {dayData.pointsDrop && (
                        <span className="text-[7px] sm:text-[8px] font-bold leading-none mt-0.5 sm:mt-1 text-green-600">
                          ↓{formatNumber(dayData.pointsDrop)}
                        </span>
                      )}
                    </div>
                  )}
                  {isAvailable && displayMode === 'cash' && dayData && (
                    <div className="flex flex-col items-center mt-0.5 sm:mt-1">
                      <span className="text-[8px] sm:text-[9px] font-bold leading-none text-green-700">
                        ¥{formatNumber(dayData.cash)}
                      </span>
                      {dayData.cashDrop && (
                        <span className="text-[7px] sm:text-[8px] font-bold leading-none mt-0.5 sm:mt-1 text-green-600">
                          ↓¥{formatNumber(dayData.cashDrop)}
                        </span>
                      )}
                    </div>
                  )}
                  {isAvailable && displayMode === 'netCost' && metrics && (
                    <span className="text-[8px] sm:text-[9px] font-bold leading-none mt-0.5 sm:mt-1 text-rose-600">
                      ¥{formatNumber(metrics.netCost)}
                    </span>
                  )}
                  {isAvailable && displayMode === 'returnPoints' && metrics && (
                    <span className="text-[8px] sm:text-[9px] font-bold leading-none mt-0.5 sm:mt-1 text-amber-600">
                      +{formatNumber(metrics.returnPoints)}
                    </span>
                  )}
                  {isAvailable && displayMode === 'returnRate' && metrics && (
                    <span className="text-[8px] sm:text-[9px] font-bold leading-none mt-0.5 sm:mt-1 text-amber-600">
                      {metrics.returnRate}%
                    </span>
                  )}
                  {isAvailable && displayMode === 'cpp' && metrics && (
                    <span className="text-[8px] sm:text-[9px] font-bold leading-none mt-0.5 sm:mt-1 text-blue-600">
                      ¥{metrics.cpp}
                    </span>
                  )}
                </div>
                
                {/* Tooltip removed for mobile-friendly modal */}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-medium text-gray-900 text-sm sm:text-base capitalize">
            {format(monthsToRender[0], language === 'zh' ? 'yyyy年 M月' : 'MMMM yyyy', { locale })}
          </span>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">{t.display}:</span>
            <select
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer"
            >
              <option value="none">{t.none}</option>
              <option value="points">{t.points}</option>
              <option value="cash">{t.cash}</option>
              <option value="netCost">{t.netCost}</option>
              <option value="returnPoints">{t.returnPoints}</option>
              <option value="returnRate">{t.returnRate}</option>
              <option value="cpp">{t.value}</option>
            </select>
          </div>

          <button 
            onClick={() => onCreateAlert()}
            className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">{t.createAlert}</span>
            <span className="sm:hidden">Alert</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {monthsToRender.map(renderMonth)}
      </div>
      
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center text-xs sm:text-sm text-gray-500 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
          <span>{t.available}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-50 border border-gray-100" />
          <span>{t.notAvailable}</span>
        </div>
      </div>

      {/* Date Details Modal */}
      {selectedDateDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                {format(new Date(selectedDateDetails), language === 'zh' ? 'yyyy年M月d日' : 'MMM d, yyyy', { locale })}
              </h3>
              <button 
                onClick={() => setSelectedDateDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5">
              {(() => {
                const dayData = availabilityMap.get(selectedDateDetails);
                const isAvailable = dayData?.available;
                const metrics = isAvailable && dayData 
                  ? calculateMetrics(hotelChain, dayData.cash, dayData.points, userSettings) 
                  : null;

                if (!dayData || !isAvailable || !metrics) {
                  return (
                    <div className="text-center py-6">
                      <div className="text-gray-500 mb-6">{t.notAvailable}</div>
                      <button
                        onClick={() => {
                          onCreateAlert(selectedDateDetails);
                          setSelectedDateDetails(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                      >
                        <Bell className="w-5 h-5" />
                        {t.createAlert}
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600 font-medium">{t.points}</span>
                      <span className="font-bold text-green-600 text-lg">{dayData.points.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600 font-medium">{t.cash}</span>
                      <span className="font-bold text-gray-900 text-lg">¥{dayData.cash.toLocaleString()}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="text-xs text-amber-800 mb-1">{t.returnPoints}</div>
                        <div className="font-bold text-amber-600">+{metrics.returnPoints.toLocaleString()}</div>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="text-xs text-amber-800 mb-1">{t.returnRate}</div>
                        <div className="font-bold text-amber-600">{metrics.returnRate}%</div>
                      </div>
                      <div className="bg-rose-50 p-3 rounded-lg">
                        <div className="text-xs text-rose-800 mb-1">{t.netCost}</div>
                        <div className="font-bold text-rose-600">¥{metrics.netCost.toLocaleString()}</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-800 mb-1">{t.value}</div>
                        <div className="font-bold text-blue-600">¥{metrics.cpp}</div>
                      </div>
                    </div>

                    {(dayData.pointsDrop || dayData.cashDrop) && (
                      <div className="mt-4 p-3 border border-green-100 bg-green-50 rounded-lg space-y-2">
                        <div className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">Price Drop Detected</div>
                        {dayData.pointsDrop && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">{t.pointsDrop}:</span>
                            <span className="font-bold text-green-700">↓ {dayData.pointsDrop.toLocaleString()}</span>
                          </div>
                        )}
                        {dayData.cashDrop && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">{t.cashDrop}:</span>
                            <span className="font-bold text-green-700">↓ ¥{dayData.cashDrop.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        onCreateAlert(selectedDateDetails);
                        setSelectedDateDetails(null);
                      }}
                      className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      {t.createAlert}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
