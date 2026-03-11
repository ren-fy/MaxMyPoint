import React, { useState } from 'react';
import { Menu, User, Globe, Crown, X } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface Props {
  onHome: (view: 'hotels' | 'calculator' | 'alerts' | 'pricing') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onOpenProfile: () => void;
}

export default function Header({ onHome, language, setLanguage, isLoggedIn, onLogin, onOpenProfile }: Props) {
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: 'hotels' | 'calculator' | 'alerts' | 'pricing') => {
    onHome(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavClick('hotels')}
          >
            <div className="bg-blue-600 p-1.5 rounded text-white font-bold text-lg leading-none">
              MMP
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">MaxMyPoint</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => handleNavClick('hotels')} className="text-sm font-medium text-gray-900 hover:text-blue-600">{t.hotels}</button>
            <button onClick={() => handleNavClick('calculator')} className="text-sm font-medium text-gray-500 hover:text-blue-600">{t.calculator}</button>
            <button onClick={() => handleNavClick('alerts')} className="text-sm font-medium text-gray-500 hover:text-blue-600">{t.alerts}</button>
            <button onClick={() => handleNavClick('pricing')} className="text-sm font-medium text-gray-500 hover:text-blue-600">{t.pricing}</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'zh' ? 'EN' : '中文'}</span>
          </button>
          
          {isLoggedIn ? (
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">{t.profile}</span>
            </button>
          ) : (
            <>
              <button 
                onClick={onLogin}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <User className="w-4 h-4" />
                {t.login}
              </button>
              <button 
                onClick={onLogin}
                className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {t.signup}
              </button>
              {/* Mobile login icon */}
              <button 
                onClick={onLogin}
                className="md:hidden flex items-center justify-center text-gray-700 hover:text-blue-600 p-2"
              >
                <User className="w-5 h-5" />
              </button>
            </>
          )}

          <button 
            className="md:hidden text-gray-500 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 shadow-lg absolute w-full">
          <nav className="flex flex-col gap-4 py-2">
            <button 
              onClick={() => handleNavClick('hotels')} 
              className="text-left text-base font-medium text-gray-900 hover:text-blue-600"
            >
              {t.hotels}
            </button>
            <button 
              onClick={() => handleNavClick('calculator')} 
              className="text-left text-base font-medium text-gray-900 hover:text-blue-600"
            >
              {t.calculator}
            </button>
            <button 
              onClick={() => handleNavClick('alerts')} 
              className="text-left text-base font-medium text-gray-900 hover:text-blue-600"
            >
              {t.alerts}
            </button>
            <button 
              onClick={() => handleNavClick('pricing')} 
              className="text-left text-base font-medium text-gray-900 hover:text-blue-600"
            >
              {t.pricing}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
