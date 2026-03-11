import React, { useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { HotelAvailability, DayAvailability, Language, Chain, UserTiers } from '../types';
import { calculateMetrics } from '../utils/calculator';
import { cn } from '../utils/cn';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { translations } from '../i18n/translations';

interface Props {
  availability: HotelAvailability;
  hotelChain: Chain;
  userTiers: UserTiers;
  onCreateAlert: () => void;
  language: Language;
}

export default function CalendarView({ availability, hotelChain, userTiers, onCreateAlert, language }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayMode, setDisplayMode] = useState<'none' | 'points' | 'cash' | 'netCost' | 'returnPoints' | 'returnRate' | 'cpp'>('points');
  const t = translations[language];
  
  const availabilityMap = new Map<string, DayAvailability>();
  availability.days.forEach(day => {
    availabilityMap.set(day.date, day);
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));

  const monthsToRender = [
    currentDate,
    addMonths(currentDate, 1),
    addMonths(currentDate, 2),
  ];

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
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 text-center">
          {format(monthDate, 'MMMM yyyy')}
        </h3>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
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
              ? calculateMetrics(hotelChain, dayData.cash, dayData.points, userTiers) 
              : null;
            
            return (
              <div 
                key={dateStr}
                className="group relative aspect-square"
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
                    <span className="text-[8px] sm:text-[9px] font-bold leading-none mt-0.5 sm:mt-1 text-green-700">
                      {formatNumber(dayData.points)}
                    </span>
                  )}
                  {isAvailable && displayMode === 'cash' && dayData && (
                    <span className="text-[8px] sm:text-[9px] font-bold leading-none mt-0.5 sm:mt-1 text-green-700">
                      ¥{formatNumber(dayData.cash)}
                    </span>
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
                
                {/* Tooltip */}
                {dayData && metrics && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
                    <div className="font-bold mb-2 text-sm border-b border-gray-700 pb-1">{format(day, 'MMM d, yyyy')}</div>
                    {isAvailable ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t.points}:</span>
                          <span className="font-semibold text-green-400">{dayData.points.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t.cash}:</span>
                          <span className="font-semibold">¥{dayData.cash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t.returnPoints}:</span>
                          <span className="font-semibold text-amber-400">{metrics.returnPoints.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t.returnRate}:</span>
                          <span className="font-semibold text-amber-400">{metrics.returnRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{t.netCost}:</span>
                          <span className="font-semibold text-rose-400">¥{metrics.netCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-700 pt-1.5 mt-1.5">
                          <span className="text-gray-400">{t.value}:</span>
                          <span className="font-semibold text-blue-400">¥{metrics.cpp}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 py-2">{t.notAvailable}</div>
                    )}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                )}
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
          <span className="font-medium text-gray-900 text-sm sm:text-base">
            {format(monthsToRender[0], 'MMM yyyy')} - {format(monthsToRender[2], 'MMM yyyy')}
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
            onClick={onCreateAlert}
            className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">{t.createAlert}</span>
            <span className="sm:hidden">Alert</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
