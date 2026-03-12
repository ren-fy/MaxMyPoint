import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DayAvailability, Language } from '../types';
import { translations } from '../i18n/translations';
import { format, parseISO } from 'date-fns';

interface Props {
  data: DayAvailability[];
  language: Language;
}

export default function PriceTrendChart({ data, language }: Props) {
  const t = translations[language];

  // Get the next 30 days of data
  const chartData = data.slice(0, 30).map(day => ({
    date: format(parseISO(day.date), 'MM-dd'),
    points: day.points,
    cash: day.cash
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
          📈
        </span>
        {t.priceTrends} (30 Days)
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              dy={10}
            />
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#2563EB' }}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#111827' }}
              tickFormatter={(value) => `¥${value}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="points" 
              name={t.points} 
              stroke="#2563EB" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }} 
              activeDot={{ r: 5 }} 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="cash" 
              name={t.cash} 
              stroke="#111827" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#111827', strokeWidth: 0 }} 
              activeDot={{ r: 5 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
