'use client'

import React from 'react';
import { ArrowLeft, Zap, Target, DollarSign, Clock, TrendingUp, Brain, Star } from 'lucide-react';
import { PlayerData } from '@/src/types/player';
import aiStringService from '../services/aiStringService';
import { useLanguage } from '../contexts/LanguageContext';
import TennisCourtAnimation from './TennisCourtAnimation';

interface StringingRecommendationsProps {
  playerData: PlayerData;
  onReset: () => void;
  forceUseRealAPI?: boolean;
}

interface AIStringRecommendation {
  id: string;
  name: string;
  brand: string;
  type: string;
  gauge: string;
  tension: string;
  description: string;
  pros: string[];
  cons: string[];
  duration: string;
  budget: string;
  confidence: number;
  reasoning: string;
  marketPrice: number;
  availability: 'high' | 'medium' | 'low';
  professionalRating: number;
  power?: number;
  control?: number;
  spin?: number;
  comfort?: number;
  durability?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HybridRec = any;

/* ------------------------------------------------------------------ */
/* Helpers visuels                                                     */
/* ------------------------------------------------------------------ */

const getColorForIndex = (index: number) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
  return colors[index] || 'bg-gray-500';
};

const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case 'high': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

const statColor = (v: number) =>
  v >= 8 ? 'text-green-600' : v >= 6 ? 'text-yellow-600' : 'text-red-600';

/** Score de pertinence 0-100 dérivé de la confiance IA. */
const toScore = (c: { confidence?: number }) => Math.round((c?.confidence ?? 0) * 100);

/* ------------------------------------------------------------------ */
/* Carte mono-cordage                                                  */
/* ------------------------------------------------------------------ */

const MonoCard: React.FC<{ setup: AIStringRecommendation; index: number; badge?: string }> = ({ setup, index, badge }) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
    <div className="flex flex-col lg:flex-row">
      <div className={`${badge ? 'bg-orange-500' : getColorForIndex(index)} p-6 text-white lg:w-1/4`}>
        {badge && (
          <span className="inline-block bg-white/25 rounded-full px-2.5 py-0.5 text-xs font-bold mb-3">{badge}</span>
        )}
        <div className="flex items-center space-x-2 mb-3">
          <Target className="h-6 w-6" />
          <h3 className="text-lg font-bold">{badge ? 'Coup de cœur' : `Cordage #${index + 1}`}</h3>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs font-bold inline-block mb-3">
          {Math.round(setup.confidence * 100)}% de correspondance
        </div>
        <h4 className="text-xl font-bold mb-1">{setup.name}</h4>
        <p className="text-sm opacity-75 mb-2">{setup.brand}</p>
        <p className="text-xs opacity-90">{setup.description}</p>
      </div>

      <div className="p-6 lg:w-3/4 flex flex-col justify-between">
        {setup.power && setup.control && setup.spin && setup.comfort && setup.durability && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <h5 className="font-semibold text-gray-800 mb-2 text-xs">Caractéristiques</h5>
            <div className="flex justify-between gap-3 text-center text-xs">
              {([['Puissance', setup.power], ['Contrôle', setup.control], ['Spin', setup.spin], ['Confort', setup.comfort], ['Durabilité', setup.durability]] as [string, number][]).map(([lbl, v]) => (
                <div key={lbl} className="flex-1">
                  <div className="font-semibold text-gray-600 mb-1">{lbl}</div>
                  <div className={`text-base font-bold ${statColor(v)}`}>{v}/10</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center space-x-2 bg-gray-50 rounded px-3 py-1 text-xs">
            <span className="font-semibold text-gray-600">Type:</span><span className="text-gray-800">{setup.type}</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 rounded px-3 py-1 text-xs">
            <span className="font-semibold text-gray-600">Jauge:</span><span className="text-gray-800">{setup.gauge}</span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 rounded px-3 py-1 text-xs">
            <span className="font-semibold text-blue-600">Tension:</span><span className="text-blue-800 font-bold">{setup.tension}</span>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 rounded px-3 py-1 text-xs">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span className="font-semibold text-gray-600">Prix:</span><span className="text-gray-800">{setup.marketPrice}€</span>
          </div>
          <div className="flex items-center space-x-2 bg-yellow-50 rounded px-3 py-1 text-xs">
            <Star className="h-3 w-3 text-yellow-500" /><span className="font-bold">{setup.professionalRating}/5</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-50 rounded px-3 py-1 text-xs">
            <TrendingUp className="h-3 w-3 text-blue-500" />
            <span className={`font-bold ${getAvailabilityColor(setup.availability)}`}>
              {setup.availability === 'high' ? 'Élevée' : setup.availability === 'medium' ? 'Moyenne' : 'Faible'}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 mb-1">
            <Brain className="h-3 w-3 text-blue-600" /><span className="text-xs font-semibold text-blue-800">Analyse IA</span>
          </div>
          <p className="text-xs text-blue-700">{setup.reasoning}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          <div>
            <h5 className="font-semibold text-green-600 mb-1 text-xs">✅ Avantages</h5>
            <ul className="text-xs space-y-0.5">{setup.pros.map((p, i) => <li key={i} className="text-gray-700">• {p}</li>)}</ul>
          </div>
          <div>
            <h5 className="font-semibold text-orange-600 mb-1 text-xs">⚠️ Limites</h5>
            <ul className="text-xs space-y-0.5">{setup.cons.map((c, i) => <li key={i} className="text-gray-700">• {c}</li>)}</ul>
          </div>
        </div>

        <div className="flex gap-3 text-xs">
          <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2 flex-1">
            <Clock className="h-3 w-3 text-gray-500" /><span className="text-gray-700"><strong>Durée:</strong> {setup.duration}</span>
          </div>
          <div className="bg-green-50 rounded-lg p-2 flex items-center space-x-2 flex-1">
            <DollarSign className="h-3 w-3 text-green-600" /><span className="text-gray-700"><strong>Budget:</strong> {setup.budget}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Carte hybride                                                       */
/* ------------------------------------------------------------------ */

const HybridCard: React.FC<{ hybrid: HybridRec; index: number; badge?: string }> = ({ hybrid, index, badge }) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative">
      {badge && (
        <span className="inline-block bg-white/25 rounded-full px-2.5 py-0.5 text-xs font-bold mb-3">{badge}</span>
      )}
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex space-x-1"><Target className="h-5 w-5" /><Zap className="h-5 w-5" /></div>
        <h3 className="text-xl font-bold">{badge ? 'Coup de cœur' : `Hybride #${index + 1}`}</h3>
      </div>
      <div className="absolute top-4 right-4">
        <div className="bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs font-bold">
          {Math.round(hybrid.confidence * 100)}% de correspondance
        </div>
      </div>
      <h4 className="text-2xl font-bold mb-2">{hybrid.name}</h4>
      <p className="text-sm opacity-90">{hybrid.description}</p>
    </div>

    <div className="p-6 space-y-4">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
        <h5 className="font-bold text-gray-800 mb-3">Configuration Hybride</h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span className="font-semibold">Principal :</span><span className="text-gray-700">{hybrid.mainString}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="font-semibold">Croisé :</span><span className="text-gray-700">{hybrid.crossString}</span>
          </div>
        </div>
      </div>

      {hybrid.power && hybrid.control && hybrid.spin && hybrid.comfort && hybrid.durability && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h5 className="font-semibold text-gray-800 mb-2 text-xs">Caractéristiques</h5>
          <div className="flex justify-between gap-3 text-center text-xs">
            {([['Puissance', hybrid.power], ['Contrôle', hybrid.control], ['Spin', hybrid.spin], ['Confort', hybrid.comfort], ['Durabilité', hybrid.durability]] as [string, number][]).map(([lbl, v]) => (
              <div key={lbl} className="flex-1">
                <div className="font-semibold text-gray-600 mb-1">{lbl}</div>
                <div className={`text-base font-bold ${statColor(v)}`}>{v}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-orange-50 rounded-lg p-3">
          <span className="font-semibold text-orange-700">Tension principale :</span>
          <p className="text-orange-800 font-bold text-lg">{hybrid.mainTension}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <span className="font-semibold text-red-700">Tension croisée :</span>
          <p className="text-red-800 font-bold text-lg">{hybrid.crossTension}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-500" /><span className="text-gray-600">Prix :</span><span className="font-bold">{hybrid.marketPrice}€</span>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-500" /><span className="text-gray-600">Note :</span><span className="font-bold">{hybrid.professionalRating}/5</span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="h-4 w-4 text-blue-600" /><span className="text-sm font-semibold text-blue-800">Analyse IA</span>
        </div>
        <p className="text-xs text-blue-700">{hybrid.reasoning}</p>
      </div>

      <div className="bg-green-50 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-gray-600">Budget total :</span><p className="text-gray-800">{hybrid.budget}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h5 className="font-semibold text-green-600 mb-2">✅ Avantages</h5>
          <ul className="text-sm space-y-1">{hybrid.pros.map((p: string, i: number) => <li key={i} className="text-gray-700">• {p}</li>)}</ul>
        </div>
        <div>
          <h5 className="font-semibold text-orange-600 mb-2">⚠️ Considérations</h5>
          <ul className="text-sm space-y-1">{hybrid.cons.map((c: string, i: number) => <li key={i} className="text-gray-700">• {c}</li>)}</ul>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-2">
        <Clock className="h-4 w-4 text-gray-500" /><span className="text-sm text-gray-700"><strong>Durée :</strong> {hybrid.duration}</span>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

const StringingRecommendations: React.FC<StringingRecommendationsProps> = ({ playerData, onReset, forceUseRealAPI = false }) => {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = React.useState<AIStringRecommendation[]>([]);
  const [hybridRecommendations, setHybridRecommendations] = React.useState<HybridRec[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [setupAnalysis, setSetupAnalysis] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      const response = await aiStringService.getStringRecommendations({ playerData, forceUseRealAPI });
      setRecommendations(response.recommendations);
      setHybridRecommendations(response.hybridRecommendations || []);
      if (response.errorMessage) setError(response.errorMessage);
      setIsLoading(false);
    };
    fetchRecommendations();
  }, [playerData, forceUseRealAPI]);

  React.useEffect(() => {
    const analyzeCurrentSetup = async () => {
      try {
        const analysis = await aiStringService.analyzeSetup({
          racket: playerData.racket,
          currentStrings: playerData.currentStrings,
        });
        setSetupAnalysis(analysis);
      } catch {
        /* silencieux */
      }
    };
    analyzeCurrentSetup();
  }, [playerData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto">
          <TennisCourtAnimation />
          <div className="mt-8 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 max-w-md mx-auto border-l-4 border-orange-600">
            <p className="text-sm text-gray-700 font-medium">{t('recommendations.analyzingNote')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 rounded-lg p-8 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">⚠️ {t('recommendations.apiProblem')}</h2>
            <p className="text-yellow-700 mb-4">{error}</p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">💡 {t('recommendations.demoMode')}</p>
            </div>
            <button onClick={onReset} className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors mr-4">
              {t('recommendations.newProfile')}
            </button>
            <button onClick={() => setError(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {t('recommendations.continueDemoMode')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --- Sélection : 3 « Ton match » + 1 coup de cœur ---------------- */
  const monoPresent = recommendations.length > 0;
  const topMono = recommendations.slice(0, 3);
  // Coup de cœur = meilleur rapport qualité-prix parmi les hybrides (score/√prix), score >= 55.
  // (Seulement quand on a déjà des mono en « match » ; sinon les hybrides forment le match.)
  let coupHybrid: HybridRec | null = null;
  if (monoPresent) {
    let bestValue = -Infinity;
    for (const h of hybridRecommendations) {
      const s = toScore(h);
      if (s < 55) continue;
      const value = s / Math.sqrt(Math.max(h.marketPrice || 1, 1));
      if (value > bestValue) { bestValue = value; coupHybrid = h; }
    }
  }
  const matchHybrids = monoPresent ? [] : hybridRecommendations.slice(0, 3);
  const matchCount = topMono.length + matchHybrids.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <button onClick={onReset} className="mb-6 flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /><span>Nouveau profil</span>
        </button>
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-2 inline-block">
            <p className="text-gray-700"><strong>{playerData.racket.brand} {playerData.racket.model}</strong></p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Analysé par intelligence artificielle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mon setup actuel */}
      {setupAnalysis && (
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-xl p-8 border-2 border-blue-200">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Mon setup actuel</h2>
          </div>
          <div className="bg-white rounded-xl p-6">
            <p className="text-gray-700 mb-4 italic">{setupAnalysis.analysis}</p>
            <div className="grid grid-cols-5 gap-2 text-center text-sm">
              {([['Puissance', setupAnalysis.power], ['Contrôle', setupAnalysis.control], ['Spin', setupAnalysis.spin], ['Confort', setupAnalysis.comfort], ['Durabilité', setupAnalysis.durability]] as [string, number][]).map(([lbl, v]) => (
                <div key={lbl} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-bold text-xs text-gray-500">{lbl}</div>
                  <div className={`text-2xl font-black ${statColor(v)}`}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bloc principal : Ton match */}
      <div>
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-black uppercase text-black tracking-tight">
            🎯 Ton match
          </h2>
          <p className="text-gray-600 mt-1">
            {matchCount > 1 ? `Les ${matchCount} cordages` : 'Le cordage'} qui collent le mieux à ton profil
          </p>
        </div>

        <div className="space-y-6">
          {topMono.map((setup, index) => (
            <MonoCard key={setup.id} setup={setup} index={index} />
          ))}
          {matchHybrids.map((hybrid, index) => (
            <HybridCard key={hybrid.id} hybrid={hybrid} index={index} />
          ))}
        </div>
      </div>

      {/* Bloc coup de cœur (masqué si aucun) */}
      {coupHybrid && (
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3 text-center">
            Pourrait aussi t&apos;intéresser
          </h3>
          <HybridCard hybrid={coupHybrid} index={0} badge="💛 Le meilleur rapport qualité-prix" />
        </div>
      )}
    </div>
  );
};

export default StringingRecommendations;
