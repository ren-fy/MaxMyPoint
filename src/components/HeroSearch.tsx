import React, { useState } from 'react';
import { Search, Calendar, ArrowDownUp } from 'lucide-react';
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
      sortBy
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
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-3 rounded-xl shadow-lg flex flex-col gap-3">
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
            </select>
          </div>
          
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors whitespace-nowrap w-full md:w-auto"
          >
            {t.searchBtn}
          </button>
        </div>
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
