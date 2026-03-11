import React, { useState } from 'react';
import { Search, Calendar, ArrowDownUp, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Chain, Language, SearchFilters, SortOption } from '../types';
import { cn } from '../utils/cn';
import { translations } from '../i18n/translations';

interface Props {
  onSearch: (filters: SearchFilters) => void;
  language: Language;
}

export default function HeroSearch({ onSearch, language }: Props) {
  const [query, setQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  
  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxCash, setMaxCash] = useState<string>('');
  const [maxPoints, setMaxPoints] = useState<string>('');
  const [maxNetCost, setMaxNetCost] = useState<string>('');
  const [minReturnRate, setMinReturnRate] = useState<string>('');
  const [minCpp, setMinCpp] = useState<string>('');
  
  const t = translations[language];

  const CHAINS: { id: Chain | null; label: string }[] = [
    { id: null, label: t.all },
    { id: 'Hyatt', label: 'Hyatt' },
    { id: 'Hilton', label: 'Hilton' },
    { id: 'Marriott', label: 'Marriott' },
    { id: 'IHG', label: 'IHG' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query,
      chain: selectedChain,
      startDate,
      endDate,
      sortBy,
      maxCash: maxCash ? Number(maxCash) : undefined,
      maxPoints: maxPoints ? Number(maxPoints) : undefined,
      maxNetCost: maxNetCost ? Number(maxNetCost) : undefined,
      minReturnRate: minReturnRate ? Number(minReturnRate) : undefined,
      minCpp: minCpp ? Number(minCpp) : undefined,
    });
  };

  return (
    <div className="bg-blue-600 py-12 md:py-16 px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
        {t.searchTitle}
      </h1>
      <p className="text-base md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto px-2">
        {t.searchDesc}
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-3 rounded-xl shadow-lg flex flex-col gap-3 text-left">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center px-4 py-3 md:py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500 outline-none text-sm md:text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center px-4 py-3 md:py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input 
              type="date" 
              className="w-full bg-transparent border-none focus:ring-0 text-gray-900 outline-none text-sm md:text-base"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title={t.startDate}
            />
          </div>
          <div className="flex-1 flex items-center px-4 py-3 md:py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input 
              type="date" 
              className="w-full bg-transparent border-none focus:ring-0 text-gray-900 outline-none text-sm md:text-base"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title={t.endDate}
            />
          </div>
          <div className="flex-1 flex items-center px-4 py-3 md:py-2 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <ArrowDownUp className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <select 
              className="w-full bg-transparent border-none focus:ring-0 text-gray-900 outline-none text-sm md:text-base cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="recommended">{t.sortRecommended}</option>
              <option value="points_asc">{t.sortPoints}</option>
              <option value="cash_asc">{t.sortCash}</option>
              <option value="net_cost_asc">{t.sortNetCost}</option>
              <option value="cpp_desc">{t.sortValue}</option>
              <option value="return_rate_desc">{t.sortReturnRate}</option>
              <option value="return_points_desc">{t.sortReturnPoints}</option>
              <option value="points_drop_desc">{t.sortPointsDrop}</option>
              <option value="cash_drop_desc">{t.sortCashDrop}</option>
            </select>
          </div>
          
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors whitespace-nowrap w-full md:w-auto"
          >
            {t.searchBtn}
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex justify-center mt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t.advancedFilters}</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t.filterMaxCash}</label>
              <input 
                type="number" 
                placeholder="e.g. 2000"
                className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                value={maxCash}
                onChange={(e) => setMaxCash(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t.filterMaxPoints}</label>
              <input 
                type="number" 
                placeholder="e.g. 50000"
                className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t.filterMaxNetCost}</label>
              <input 
                type="number" 
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                value={maxNetCost}
                onChange={(e) => setMaxNetCost(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t.filterMinReturnRate} (%)</label>
              <input 
                type="number" 
                placeholder="e.g. 10"
                className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                value={minReturnRate}
                onChange={(e) => setMinReturnRate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t.filterMinCpp}</label>
              <input 
                type="number" 
                placeholder="e.g. 500"
                className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                value={minCpp}
                onChange={(e) => setMinCpp(e.target.value)}
              />
            </div>
          </div>
        )}
      </form>
      
      <div className="mt-6 flex flex-wrap justify-center gap-2 px-2">
        {CHAINS.map(chain => (
          <button
            key={chain.label}
            onClick={() => setSelectedChain(chain.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              selectedChain === chain.id 
                ? "bg-white text-blue-900 shadow-md scale-105" 
                : "bg-blue-700/50 text-blue-100 hover:bg-blue-700"
            )}
          >
            {chain.label}
          </button>
        ))}
      </div>
    </div>
  );
}
