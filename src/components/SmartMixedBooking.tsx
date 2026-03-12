import React, { useState } from 'react';
import { DayAvailability, Language, UserSettings, Chain } from '../types';
import { translations } from '../i18n/translations';
import { calculateMetrics, BUY_POINTS_COST_USD } from '../utils/calculator';
import { Lightbulb, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { cn } from '../utils/cn';

interface Props {
  availability: DayAvailability[];
  language: Language;
  userSettings: UserSettings;
  chain: Chain;
}

export default function SmartMixedBooking({ availability, language, userSettings, chain }: Props) {
  const t = translations[language];
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleCalculate = () => {
    if (!startDate || !endDate) return null;
    
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const nights = differenceInDays(end, start);
    
    if (nights <= 0 || nights > 30) return null;

    const selectedDays = [];
    for (let i = 0; i < nights; i++) {
      const dateStr = format(addDays(start, i), 'yyyy-MM-dd');
      const dayData = availability.find(d => d.date === dateStr);
      if (dayData) {
        selectedDays.push(dayData);
      }
    }

    if (selectedDays.length !== nights) return null;

    let totalPoints = 0;
    let totalCash = 0;
    let optimalMix = [];

    // Buy points cost
    const buyPointsCostRMBPerPoint = BUY_POINTS_COST_USD[chain] * userSettings.exchangeRate;

    for (const day of selectedDays) {
      const metrics = calculateMetrics(chain, day.cash, day.points, userSettings);
      
      // Cost of using points (either user's valuation or buying points)
      const pointsCostRMB = day.points * Math.min(userSettings.pointValues[chain], buyPointsCostRMBPerPoint);
      
      // Cost of using cash (net cost after points earned back)
      const cashCostRMB = metrics.netCost;

      if (pointsCostRMB < cashCostRMB) {
        optimalMix.push({ date: day.date, usePoints: true, cost: pointsCostRMB, originalPoints: day.points, originalCash: day.cash });
        totalPoints += day.points;
      } else {
        optimalMix.push({ date: day.date, usePoints: false, cost: cashCostRMB, originalPoints: day.points, originalCash: day.cash });
        totalCash += day.cash;
      }
    }

    return { optimalMix, totalPoints, totalCash };
  };

  const result = handleCalculate();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </span>
        {t.smartMixedBooking}
      </h3>
      <p className="text-sm text-gray-500 mb-6">{t.mixedBookingTip}</p>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.startDate}</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.endDate}</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 outline-none"
          />
        </div>
      </div>

      {result && (
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <h4 className="font-bold text-purple-900 mb-3">{t.optimalMix}</h4>
          <div className="space-y-2 mb-4">
            {result.optimalMix.map((day, idx) => (
              <div key={day.date} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-purple-50">
                <span className="text-gray-600 font-medium">{day.date}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 line-through text-xs">
                    {day.usePoints ? `¥${day.originalCash}` : `${day.originalPoints} pts`}
                  </span>
                  <span className={cn("font-bold px-2 py-1 rounded text-xs", day.usePoints ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700")}>
                    {day.usePoints ? t.usePoints : t.useCash}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-purple-200 font-bold text-purple-900">
            <span>Total:</span>
            <span>{result.totalPoints > 0 ? `${result.totalPoints} pts` : ''} {result.totalPoints > 0 && result.totalCash > 0 ? '+' : ''} {result.totalCash > 0 ? `¥${result.totalCash.toLocaleString()}` : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}
