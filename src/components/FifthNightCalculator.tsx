import React, { useState, useMemo } from 'react';
import { HotelAvailability, Language, UserSettings, Chain } from '../types';
import { translations } from '../i18n/translations';
import { Calendar, Info, ArrowRight } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';

interface Props {
  availability: HotelAvailability;
  hotelChain: Chain;
  userSettings: UserSettings;
  language: Language;
}

export default function FifthNightCalculator({ availability, hotelChain, userSettings, language }: Props) {
  const t = translations[language];
  const [startDate, setStartDate] = useState<string>('');

  // Only Marriott, Hilton, and IHG have 5th night free (or 4th for IHG, but let's assume standard 5th night free for this calculator as requested)
  const isEligibleChain = ['Marriott', 'Hilton', 'IHG'].includes(hotelChain);

  const availableDates = useMemo(() => {
    return availability.days
      .filter(d => d.available)
      .map(d => d.date)
      .sort();
  }, [availability]);

  // Find all valid 5-night consecutive stays
  const validStartDates = useMemo(() => {
    const valid: string[] = [];
    const dateSet = new Set(availableDates);
    
    for (const date of availableDates) {
      let isConsecutive = true;
      const start = parseISO(date);
      for (let i = 1; i < 5; i++) {
        const nextDate = format(addDays(start, i), 'yyyy-MM-dd');
        if (!dateSet.has(nextDate)) {
          isConsecutive = false;
          break;
        }
      }
      if (isConsecutive) {
        valid.push(date);
      }
    }
    return valid;
  }, [availableDates]);

  // Set initial start date if available
  React.useEffect(() => {
    if (validStartDates.length > 0 && !startDate) {
      setStartDate(validStartDates[0]);
    }
  }, [validStartDates, startDate]);

  const calculation = useMemo(() => {
    if (!startDate) return null;
    
    const start = parseISO(startDate);
    const nights = [];
    let totalPointsWithoutDiscount = 0;
    let minPoints = Infinity;
    let minPointsIndex = -1;

    for (let i = 0; i < 5; i++) {
      const dateStr = format(addDays(start, i), 'yyyy-MM-dd');
      const dayData = availability.days.find(d => d.date === dateStr);
      if (dayData) {
        nights.push(dayData);
        totalPointsWithoutDiscount += dayData.points;
        if (dayData.points < minPoints) {
          minPoints = dayData.points;
          minPointsIndex = i;
        }
      }
    }

    if (nights.length !== 5) return null;

    const savedPoints = minPoints;
    const totalPointsWithDiscount = totalPointsWithoutDiscount - savedPoints;
    
    const pointValueRMB = userSettings.pointValues[hotelChain];
    const totalCostRMB = totalPointsWithDiscount * pointValueRMB;

    return {
      nights,
      totalPointsWithoutDiscount,
      totalPointsWithDiscount,
      savedPoints,
      minPointsIndex,
      totalCostRMB
    };
  }, [startDate, availability, hotelChain, userSettings]);

  if (!isEligibleChain) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {language === 'zh' ? '住5免1 积分计算器' : '5th Night Free Calculator'}
        </h2>
      </div>

      {validStartDates.length === 0 ? (
        <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
          {language === 'zh' 
            ? '当前没有连续5晚的积分房可供预订。' 
            : 'No 5 consecutive nights available for points booking.'}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              {language === 'zh' ? '选择入住日期:' : 'Select Check-in Date:'}
            </label>
            <select
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
            >
              {validStartDates.map(date => (
                <option key={date} value={date}>
                  {date} ({format(parseISO(date), 'EEE')}) - {format(addDays(parseISO(date), 5), 'yyyy-MM-dd')}
                </option>
              ))}
            </select>
          </div>

          {calculation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  {language === 'zh' ? '每日积分明细' : 'Daily Points Breakdown'}
                </h3>
                <div className="space-y-2">
                  {calculation.nights.map((night, index) => (
                    <div 
                      key={night.date} 
                      className={`flex justify-between items-center p-2 rounded-lg text-sm ${
                        index === calculation.minPointsIndex 
                          ? 'bg-green-100 text-green-800 font-medium border border-green-200' 
                          : 'text-gray-600'
                      }`}
                    >
                      <span>{night.date} {language === 'zh' ? `(第${index + 1}晚)` : `(Night ${index + 1})`}</span>
                      <div className="flex items-center gap-2">
                        {index === calculation.minPointsIndex && (
                          <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded uppercase font-bold">
                            {language === 'zh' ? '免费' : 'FREE'}
                          </span>
                        )}
                        <span className={index === calculation.minPointsIndex ? 'line-through opacity-50' : 'font-semibold'}>
                          {night.points.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{language === 'zh' ? '原总积分' : 'Original Total'}</span>
                  <span className="text-gray-900 font-medium">{calculation.totalPointsWithoutDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-green-600 text-sm font-medium">{language === 'zh' ? '节省积分 (最低一晚)' : 'Saved Points (Cheapest Night)'}</span>
                  <span className="text-green-600 font-bold">-{calculation.savedPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-900 font-bold">{language === 'zh' ? '实际所需总积分' : 'Actual Total Points'}</span>
                  <span className="text-2xl font-bold text-blue-600">{calculation.totalPointsWithDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Info className="w-4 h-4" />
                    <span>{language === 'zh' ? '预估总成本' : 'Estimated Total Cost'}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">¥{Math.round(calculation.totalCostRMB).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 text-right">
                  {language === 'zh' 
                    ? `*基于您的 ${userSettings.tiers[hotelChain]} 会员等级和 ${hotelChain} 积分估值: ¥${userSettings.pointValues[hotelChain]}/分` 
                    : `*Based on your ${userSettings.tiers[hotelChain]} tier and ${hotelChain} point valuation: ¥${userSettings.pointValues[hotelChain]}/pt`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
