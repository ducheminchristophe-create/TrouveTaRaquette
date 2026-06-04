import React, { useState, useEffect } from 'react';
import PlayerProfile from './components/PlayerProfile';
import StringingRecommendations from './components/StringingRecommendations';
import Header from './components/Header';
import Footer from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './contexts/LanguageContext';

export interface PlayerData {
  racket: {
    brand: string;
    model: string;
    details: string;
  };
  currentStrings: {
    type: string; // 'mono' ou 'hybrid'
    mono: string;
    monoTension: string;
    hybridMain: string;
    hybridCross: string;
    hybridMainTension: string;
    hybridCrossTension: string;
  };
  playerProfile: {
    level: number; // 0-8
    playStyle: string; // 'baseline' | 'serve-volley' | 'all-court' | 'offensive' | 'defensive' | 'counter-attacker'
    grip: string; // 'eastern' | 'semi-western' | 'western' | 'continental'
    courtHabits: string[]; // ['clay', 'hard', 'grass', 'indoor']
  };
  preferences: {
    alternativeTypes: string[]; // ['mono', 'hybrid']
    monoCount: number;
    hybridCount: number;
    preferredBrands: string[];
    performancePriorities: string[]; // ['power', 'control', 'spin', 'comfort', 'durability']
    priceRange: [number, number]; // [min, max] in €
  };
}

function App() {
  useTheme();
  const { t } = useLanguage();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="min-h-screen bg-white">
      <Header />

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

      <Footer />
    </div>
  );
}

export default App;