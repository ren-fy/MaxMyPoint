import React, { useState, useMemo, useEffect } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { Hotel, HotelWithMetrics, HotelMetrics, Language, SearchFilters, UserSettings, HotelAvailability, DayAvailability } from './types';
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
  const [filteredHotels, setFilteredHotels] = useState<HotelWithMetrics[]>([]);
  const [availability, setAvailability] = useState<Record<string, HotelAvailability>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Auth & Profile State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const defaultSettings: UserSettings = {
      tiers: {
        Hyatt: 'Member',
        Hilton: 'Member',
        Marriott: 'Member',
        IHG: 'Club'
      },
      pointValues: {
        Hyatt: 0.12,
        Marriott: 0.05,
        Hilton: 0.03,
        IHG: 0.035
      },
      exchangeRate: 6.8,
      taxRate: 16.0
    };

    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.taxRate === undefined) {
          parsed.taxRate = 16.0;
        }
        
        // Validate tiers against new real names
        const validTiers = {
          Marriott: ['Member', 'Silver Elite', 'Gold Elite', 'Platinum Elite', 'Titanium Elite', 'Ambassador Elite'],
          Hilton: ['Member', 'Silver', 'Gold', 'Diamond'],
          Hyatt: ['Member', 'Discoverist', 'Explorist', 'Globalist'],
          IHG: ['Club', 'Silver Elite', 'Gold Elite', 'Platinum Elite', 'Diamond Elite']
        };
        
        if (parsed.tiers) {
          Object.keys(validTiers).forEach((chain) => {
            if (!validTiers[chain as keyof typeof validTiers].includes(parsed.tiers[chain])) {
              parsed.tiers[chain] = defaultSettings.tiers[chain as keyof typeof defaultSettings.tiers];
            }
          });
        }

        return { ...defaultSettings, ...parsed, tiers: { ...defaultSettings.tiers, ...(parsed.tiers || {}) } };
      } catch (e) {
        console.error('Failed to parse user settings', e);
      }
    }
    return defaultSettings;
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

  // Fetch data from backend API whenever filters or settings change
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/hotels/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filters, userSettings })
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await res.json();
        setFilteredHotels(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce the fetch slightly to avoid too many requests while typing
    const timeoutId = setTimeout(() => {
      fetchHotels();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, userSettings]);

  // Fetch detailed availability when a hotel is selected
  useEffect(() => {
    if (selectedHotel && !availability[selectedHotel.id]) {
      fetch(`/api/availability/${selectedHotel.id}`)
        .then(res => res.json())
        .then(data => {
          setAvailability(prev => ({ ...prev, [selectedHotel.id]: data }));
        })
        .catch(err => console.error('Error fetching hotel details:', err));
    }
  }, [selectedHotel, availability]);

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
      exchangeRate: 6.8,
      taxRate: 16.0
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
        <CalculatorView language={language} userSettings={userSettings} />
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
                userSettings={userSettings}
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
