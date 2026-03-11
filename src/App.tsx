import React, { useState, useMemo, useEffect } from 'react';
import { Hotel, HotelWithMetrics, HotelMetrics, Language, SearchFilters, UserSettings, HotelAvailability } from './types';
import { calculateMetrics } from './utils/calculator';
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import HotelTable from './components/HotelTable';
import HotelDetail from './components/HotelDetail';
import ProfileModal from './components/ProfileModal';
import CalculatorView from './components/CalculatorView';
import AlertsView from './components/AlertsView';
import PricingView from './components/PricingView';
import { Flame, Loader2 } from 'lucide-react';
import { translations } from './i18n/translations';

export default function App() {
  const [currentView, setCurrentView] = useState<'hotels' | 'calculator' | 'alerts' | 'pricing'>('hotels');
  const [selectedHotel, setSelectedHotel] = useState<HotelWithMetrics | null>(null);
  const [language, setLanguage] = useState<Language>('zh');
  
  // Data State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [availability, setAvailability] = useState<Record<string, HotelAvailability>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Auth & Profile State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user settings', e);
      }
    }
    return {
      tiers: {
        Hyatt: 'Member',
        Hilton: 'Member',
        Marriott: 'Member',
        IHG: 'Member'
      },
      pointValues: {
        Hyatt: 0.12,
        Marriott: 0.05,
        Hilton: 0.03,
        IHG: 0.035
      },
      exchangeRate: 7.2
    };
  });

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
  }, [userSettings]);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    chain: null,
    startDate: '',
    endDate: '',
    sortBy: 'recommended'
  });
  
  const t = translations[language];

  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [hotelsRes, availabilityRes] = await Promise.all([
          fetch('/api/hotels'),
          fetch('/api/availability')
        ]);
        
        if (!hotelsRes.ok || !availabilityRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const hotelsData = await hotelsRes.json();
        const availabilityData = await availabilityRes.json();
        
        setHotels(hotelsData);
        setAvailability(availabilityData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredHotels = useMemo(() => {
    let result: HotelWithMetrics[] = [];

    for (const hotel of hotels) {
      // 1. Text Search
      const matchesSearch = 
        hotel.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        hotel.city.toLowerCase().includes(filters.query.toLowerCase()) ||
        hotel.country.toLowerCase().includes(filters.query.toLowerCase());
      
      // 2. Chain Filter
      const matchesChain = filters.chain ? hotel.chain === filters.chain : true;
      
      if (!matchesSearch || !matchesChain) continue;

      // 3. Date Filter & Metrics Calculation
      const hotelAvailability = availability[hotel.id]?.days || [];
      let validDays = hotelAvailability.filter(d => d.available);

      if (filters.startDate) {
        validDays = validDays.filter(d => d.date >= filters.startDate);
      }
      if (filters.endDate) {
        validDays = validDays.filter(d => d.date <= filters.endDate);
      }

      // If dates are specified but no availability, skip this hotel
      if ((filters.startDate || filters.endDate) && validDays.length === 0) {
        continue;
      }

      const metrics: HotelMetrics = {
        minPoints: Infinity,
        minCash: Infinity,
        minNetCost: Infinity,
        maxReturnPoints: 0,
        maxReturnRate: 0,
        maxCpp: 0,
        fifthNightFree: null,
        hasAvailability: validDays.length > 0,
        maxPointsDrop: 0,
        maxCashDrop: 0,
        maxPointsDropDate: undefined,
        maxCashDropDate: undefined
      };

      if (validDays.length > 0) {
        validDays.forEach(d => {
          const dayMetrics = calculateMetrics(hotel.chain, d.cash, d.points, userSettings);
          metrics.minPoints = Math.min(metrics.minPoints, d.points);
          metrics.minCash = Math.min(metrics.minCash, d.cash);
          metrics.minNetCost = Math.min(metrics.minNetCost, dayMetrics.netCost);
          metrics.maxReturnPoints = Math.max(metrics.maxReturnPoints, dayMetrics.returnPoints);
          metrics.maxReturnRate = Math.max(metrics.maxReturnRate, dayMetrics.returnRate);
          metrics.maxCpp = Math.max(metrics.maxCpp, dayMetrics.cpp);

          if (d.pointsDrop && d.pointsDrop > (metrics.maxPointsDrop || 0)) {
            metrics.maxPointsDrop = d.pointsDrop;
            metrics.maxPointsDropDate = d.date;
          }
          if (d.cashDrop && d.cashDrop > (metrics.maxCashDrop || 0)) {
            metrics.maxCashDrop = d.cashDrop;
            metrics.maxCashDropDate = d.date;
          }
        });
        
        if (hotel.chain === 'Marriott' || hotel.chain === 'Hilton') {
          metrics.fifthNightFree = metrics.minPoints * 4;
        }
      }

      // 4. Apply advanced filters
      if (filters.maxCash && metrics.minCash > filters.maxCash) continue;
      if (filters.maxPoints && metrics.minPoints > filters.maxPoints) continue;
      if (filters.maxNetCost && metrics.minNetCost > filters.maxNetCost) continue;
      if (filters.minReturnRate && metrics.maxReturnRate < filters.minReturnRate) continue;
      if (filters.minCpp && metrics.maxCpp < filters.minCpp) continue;

      result.push({
        ...hotel,
        metrics
      });
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'points_asc':
          return a.metrics.minPoints - b.metrics.minPoints;
        case 'cash_asc':
          return a.metrics.minCash - b.metrics.minCash;
        case 'net_cost_asc':
          return a.metrics.minNetCost - b.metrics.minNetCost;
        case 'cpp_desc':
          return b.metrics.maxCpp - a.metrics.maxCpp;
        case 'return_rate_desc':
          return b.metrics.maxReturnRate - a.metrics.maxReturnRate;
        case 'return_points_desc':
          return b.metrics.maxReturnPoints - a.metrics.maxReturnPoints;
        case 'points_drop_desc':
          return (b.metrics.maxPointsDrop || 0) - (a.metrics.maxPointsDrop || 0);
        case 'cash_drop_desc':
          return (b.metrics.maxCashDrop || 0) - (a.metrics.maxCashDrop || 0);
        case 'recommended':
        default:
          // Default sort by availability score (descending)
          return b.availabilityScore - a.availabilityScore;
      }
    });

    return result;
  }, [filters, userSettings, hotels, availability]);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setSelectedHotel(null); // Return to list view
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    // Optional: could show a toast here
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfileModal(false);
    // Reset settings on logout
    setUserSettings({
      tiers: {
        Hyatt: 'Member',
        Hilton: 'Member',
        Marriott: 'Member',
        IHG: 'Member'
      },
      pointValues: {
        Hyatt: 0.12,
        Marriott: 0.05,
        Hilton: 0.03,
        IHG: 0.035
      },
      exchangeRate: 7.2
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header 
        onHome={(view) => {
          setCurrentView(view);
          setSelectedHotel(null);
          setFilters({
            query: '',
            chain: null,
            startDate: '',
            endDate: '',
            sortBy: 'recommended'
          });
        }} 
        language={language}
        setLanguage={setLanguage}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {currentView === 'calculator' ? (
        <CalculatorView language={language} />
      ) : currentView === 'alerts' ? (
        <AlertsView language={language} />
      ) : currentView === 'pricing' ? (
        <PricingView language={language} />
      ) : selectedHotel ? (
        <main className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
          <HotelDetail 
            hotel={selectedHotel} 
            availability={availability[selectedHotel.id] || { hotelId: selectedHotel.id, days: [] }}
            onBack={() => setSelectedHotel(null)} 
            language={language}
            userSettings={userSettings}
          />
        </main>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading hotels...</p>
        </div>
      ) : (
        <>
          <HeroSearch onSearch={handleSearch} language={language} />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-orange-100 rounded-md">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {filters.query || filters.chain || filters.startDate || filters.endDate 
                  ? t.searchResults 
                  : t.trendingHotels}
              </h2>
            </div>
            
            {filteredHotels.length > 0 ? (
              <HotelTable 
                hotels={filteredHotels} 
                onSelect={setSelectedHotel} 
                language={language}
              />
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200 px-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noHotels}</h3>
                <p className="text-gray-500">{t.adjustSearch}</p>
              </div>
            )}
          </main>
        </>
      )}

      {showProfileModal && (
        <ProfileModal 
          userSettings={userSettings}
          onSave={setUserSettings}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
          language={language}
        />
      )}
    </div>
  );
}
