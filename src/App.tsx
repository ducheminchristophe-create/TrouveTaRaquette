import React, { useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, useMatch } from 'react-router-dom';
import PlayerProfile from './components/PlayerProfile';
import StringingRecommendations from './components/StringingRecommendations';
import PadelPage from './pages/PadelPage';
import BadmintonPage from './pages/BadmintonPage';
import HomePage from './pages/HomePage';
import Footer from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import { useState } from 'react';

export interface PlayerData {
  racket: {
    brand: string;
    model: string;
    details: string;
  };
  currentStrings: {
    type: string;
    mono: string;
    monoTension: string;
    hybridMain: string;
    hybridCross: string;
    hybridMainTension: string;
    hybridCrossTension: string;
  };
  playerProfile: {
    level: number;
    playStyle: string;
    grip: string;
    courtHabits: string[];
  };
  preferences: {
    alternativeTypes: string[];
    monoCount: number;
    hybridCount: number;
    preferredBrands: string[];
    performancePriorities: string[];
    priceRange: [number, number];
  };
}

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */

/** Lien de navigation accessible : applique aria-current="page" sur le <a> lui-même */
const NavTab: React.FC<{ to: string; end?: boolean; children: React.ReactNode }> = ({ to, end, children }) => {
  const base = 'px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-colors';
  const activeClass = `${base} bg-orange-500 text-white`;
  const inactiveClass = `${base} text-gray-400 hover:text-white`;
  const isActive = !!useMatch(end ? { path: to, end: true } : { path: to });
  return (
    <NavLink
      to={to}
      end={end}
      className={isActive ? activeClass : inactiveClass}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </NavLink>
  );
};

const Nav: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <header className="bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent" />
      <div className="container mx-auto px-6 py-5 relative z-10">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-3 shrink-0">
            <img src="/TennisTuner.jpeg" alt="TrouveTaRaquette" className="h-14 w-14 object-contain rounded-lg" />
            <div className="hidden sm:block">
              <p className="text-xl font-black tracking-tight">
                TrouveTa<span className="text-orange-500">Raquette</span>
              </p>
              <p className="text-gray-400 text-xs font-medium tracking-wide uppercase mt-0.5">
                {t('header.subtitle')}
              </p>
            </div>
          </NavLink>

          {/* Onglets — scrollable sur mobile */}
          <div className="flex items-center gap-2 min-w-0">
            <nav
              aria-label="Modules"
              className="flex gap-1 bg-gray-900 rounded-full p-1 overflow-x-auto scrollbar-none"
            >
              <NavTab to="/tennis">🎾 <span className="hidden sm:inline">Cordage </span>Tennis</NavTab>
              <NavTab to="/padel">🟢 Padel</NavTab>
              <NavTab to="/badminton">🏸 <span className="hidden sm:inline">Badminton</span><span className="sm:hidden">Badm.</span></NavTab>
            </nav>
            {/* Sélecteur de langue : visible uniquement sur la page Tennis (seule page i18n complète) */}
            {location.pathname === '/tennis' && (
              <div className="ml-1 hidden md:block shrink-0">
                <LanguageSelector />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600" />
    </header>
  );
};

/* ------------------------------------------------------------------ */
/* Page Tennis (ancienne App)                                          */
/* ------------------------------------------------------------------ */

const TennisPage: React.FC = () => {
  useTheme();
  const { t } = useLanguage();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleProfileSubmit = (data: PlayerData) => {
    setPlayerData(data);
    setShowRecommendations(true);
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setPlayerData(null);
    setShowRecommendations(false);
    window.scrollTo(0, 0);
  };

  return (
    <main className="container mx-auto px-6 py-12 max-w-6xl">
      {!showRecommendations ? (
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black uppercase text-black mb-6 tracking-tight">
              {t('app.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              {t('app.subtitle')}
            </p>
          </div>
          <PlayerProfile onSubmit={handleProfileSubmit} />
        </div>
      ) : (
        <StringingRecommendations
          playerData={playerData!}
          onReset={handleReset}
          forceUseRealAPI={true}
        />
      )}
    </main>
  );
};

/* ------------------------------------------------------------------ */
/* App principale avec routing                                          */
/* ------------------------------------------------------------------ */

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTop />
      <Nav />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tennis" element={<TennisPage />} />
          <Route path="/padel" element={<PadelPage />} />
          <Route path="/badminton" element={<BadmintonPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
