import React from 'react';
import { ArrowLeft, Zap, Shield, Target, Calendar, DollarSign, Clock, TrendingUp, Brain, Star, TrendingDown, Loader } from 'lucide-react';
import { PlayerData } from '../App';
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
}

const StringingRecommendations: React.FC<StringingRecommendationsProps> = ({ playerData, onReset, forceUseRealAPI = false }) => {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = React.useState<AIStringRecommendation[]>([]);
  const [hybridRecommendations, setHybridRecommendations] = React.useState<any[]>([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = React.useState<any>(null);
  const [expertInsights, setExpertInsights] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isUsingRealAPI, setIsUsingRealAPI] = React.useState(false);
  const [setupAnalysis, setSetupAnalysis] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);

      const response = await aiStringService.getStringRecommendations({ playerData, forceUseRealAPI });

      setRecommendations(response.recommendations);
      setHybridRecommendations(response.hybridRecommendations || []);
      setMaintenanceSchedule(response.maintenanceSchedule);
      setExpertInsights(response.expertInsights);
      setIsUsingRealAPI(response.isUsingRealAPI);

      // Afficher l'erreur API si présente
      if (response.errorMessage) {
        setError(response.errorMessage);
      }

      setIsLoading(false);
    };

    fetchRecommendations();
  }, [playerData]);

  React.useEffect(() => {
    // Analyser le setup actuel du joueur
    const analyzeCurrentSetup = async () => {
      try {
        const analysis = await aiStringService.analyzeSetup({
          racket: playerData.racket,
          currentStrings: playerData.currentStrings
        });
        setSetupAnalysis(analysis);
      } catch (error) {
        console.error('Erreur analyse setup:', error);
      }
    };
    analyzeCurrentSetup();
  }, [playerData]);

  const getIconForPriority = (priority: string) => {
    switch (priority) {
      case 'Confort': return <Shield className="h-6 w-6" />;
      case 'Puissance': return <Zap className="h-6 w-6" />;
      case 'Contrôle': return <Target className="h-6 w-6" />;
      default: return <TrendingUp className="h-6 w-6" />;
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto">
          <TennisCourtAnimation />
          <div className="mt-8 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6 max-w-md mx-auto border-l-4 border-orange-600">
            <p className="text-sm text-gray-700 font-medium">
              {t('recommendations.analyzingNote')}
            </p>
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
              <p className="text-sm text-blue-700">
                💡 {t('recommendations.demoMode')}
              </p>
            </div>
            <button
              onClick={onReset}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors mr-4"
            >
              {t('recommendations.newProfile')}
            </button>
            <button
              onClick={() => setError(null)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('recommendations.continueDemoMode')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={onReset}
          className="mb-6 flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Nouveau profil</span>
        </button>

        <div className="text-center">
          {/* Indicateur de statut API */}
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
            isUsingRealAPI
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isUsingRealAPI ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>
              {isUsingRealAPI ? '✅ API IA Connectée' : '⚠️ Mode Démo - API Non Connectée'}
            </span>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700">
              <strong>{playerData.racket.brand} {playerData.racket.model}</strong>
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Analysé par Intelligence Artificielle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mon Setup Section */}
      {setupAnalysis && (
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-xl p-8 border-2 border-blue-200">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-800">Mon Setup Actuel</h2>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6">
            <p className="text-gray-700 mb-4 italic text-lg">{setupAnalysis.analysis}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Raquette:</span>
                <p className="text-gray-800 font-medium">{playerData.racket.brand} {playerData.racket.model}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Cordage:</span>
                <p className="text-gray-800 font-medium">
                  {playerData.currentStrings.type === 'mono'
                    ? `${playerData.currentStrings.mono} (${playerData.currentStrings.monoTension}kg)`
                    : `Hybride - ${playerData.currentStrings.hybridMain} / ${playerData.currentStrings.hybridCross}`
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Critère</th>
                  <th className="px-4 py-3 text-center font-semibold">Note</th>
                  <th className="px-4 py-3 text-left font-semibold">Points forts</th>
                  <th className="px-4 py-3 text-left font-semibold">Points faibles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Puissance</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full font-bold ${
                      setupAnalysis.power >= 8 ? 'bg-green-100 text-green-800' :
                      setupAnalysis.power >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {setupAnalysis.power}/10
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700" rowSpan={5}>
                    <ul className="list-disc list-inside space-y-1">
                      {setupAnalysis.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="text-sm">{strength}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-gray-700" rowSpan={5}>
                    <ul className="list-disc list-inside space-y-1">
                      {setupAnalysis.weaknesses.map((weakness: string, idx: number) => (
                        <li key={idx} className="text-sm">{weakness}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Contrôle</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full font-bold ${
                      setupAnalysis.control >= 8 ? 'bg-green-100 text-green-800' :
                      setupAnalysis.control >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {setupAnalysis.control}/10
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Spin</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full font-bold ${
                      setupAnalysis.spin >= 8 ? 'bg-green-100 text-green-800' :
                      setupAnalysis.spin >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {setupAnalysis.spin}/10
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Confort</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full font-bold ${
                      setupAnalysis.comfort >= 8 ? 'bg-green-100 text-green-800' :
                      setupAnalysis.comfort >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {setupAnalysis.comfort}/10
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">Durabilité</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full font-bold ${
                      setupAnalysis.durability >= 8 ? 'bg-green-100 text-green-800' :
                      setupAnalysis.durability >= 6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {setupAnalysis.durability}/10
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alternatives recommandées */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          🎯 Meilleures Alternatives pour Améliorer Votre Setup
        </h2>
        <p className="text-center text-gray-600 mb-2 text-lg">
          L'IA a analysé votre setup actuel et vous propose ces alternatives optimisées
        </p>
      </div>

      {/* Toutes les alternatives (mono + hybrides) */}
      <div className="space-y-6">
        {recommendations.map((setup, index) => (
          <div key={setup.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
            <div className="flex flex-col lg:flex-row">
              {/* En-tête avec nom du cordage */}
              <div className={`${getColorForIndex(index)} p-6 text-white lg:w-1/4`}>
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="h-6 w-6" />
                  <h3 className="text-lg font-bold">Alternative #{index + 1}</h3>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs font-bold inline-block mb-3">
                  {Math.round(setup.confidence * 100)}% confiance
                </div>
                <h4 className="text-xl font-bold mb-1">{setup.name}</h4>
                <p className="text-sm opacity-75 mb-2">{setup.brand}</p>
                <p className="text-xs opacity-90">{setup.description}</p>
              </div>

              {/* Contenu principal horizontal */}
              <div className="p-6 lg:w-3/4 flex flex-col justify-between">
                {/* Tableau d'analyse des caractéristiques */}
                {setup.power && setup.control && setup.spin && setup.comfort && setup.durability && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h5 className="font-semibold text-gray-800 mb-2 text-xs">Caractéristiques</h5>
                    <div className="flex justify-between gap-3 text-center text-xs">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-600 mb-1">Puissance</div>
                        <div className={`text-base font-bold ${
                          setup.power >= 8 ? 'text-green-600' :
                          setup.power >= 6 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {setup.power}/10
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-600 mb-1">Contrôle</div>
                        <div className={`text-base font-bold ${
                          setup.control >= 8 ? 'text-green-600' :
                          setup.control >= 6 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {setup.control}/10
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-600 mb-1">Spin</div>
                        <div className={`text-base font-bold ${
                          setup.spin >= 8 ? 'text-green-600' :
                          setup.spin >= 6 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {setup.spin}/10
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-600 mb-1">Confort</div>
                        <div className={`text-base font-bold ${
                          setup.comfort >= 8 ? 'text-green-600' :
                          setup.comfort >= 6 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {setup.comfort}/10
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-600 mb-1">Durabilité</div>
                        <div className={`text-base font-bold ${
                          setup.durability >= 8 ? 'text-green-600' :
                          setup.durability >= 6 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {setup.durability}/10
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Specs et métriques */}
                <div className="flex flex-wrap gap-3 mb-3">
                  <div className="flex items-center space-x-2 bg-gray-50 rounded px-3 py-1 text-xs">
                    <span className="font-semibold text-gray-600">Type:</span>
                    <span className="text-gray-800">{setup.type}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 rounded px-3 py-1 text-xs">
                    <span className="font-semibold text-gray-600">Jauge:</span>
                    <span className="text-gray-800">{setup.gauge}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50 rounded px-3 py-1 text-xs">
                    <span className="font-semibold text-blue-600">Tension:</span>
                    <span className="text-blue-800 font-bold">{setup.tension}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50 rounded px-3 py-1 text-xs">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="font-semibold text-gray-600">Prix:</span>
                    <span className="text-gray-800">{setup.marketPrice}€</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-yellow-50 rounded px-3 py-1 text-xs">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="font-bold">{setup.professionalRating}/5</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 rounded px-3 py-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    <span className={`font-bold ${getAvailabilityColor(setup.availability)}`}>
                      {setup.availability === 'high' ? 'Élevée' : setup.availability === 'medium' ? 'Moyenne' : 'Faible'}
                    </span>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Brain className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-800">Analyse IA</span>
                  </div>
                  <p className="text-xs text-blue-700">{setup.reasoning}</p>
                </div>

                {/* Pros & Cons horizontaux */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                  <div>
                    <h5 className="font-semibold text-green-600 mb-1 text-xs">✅ Avantages</h5>
                    <ul className="text-xs space-y-0.5">
                      {setup.pros.map((pro, i) => (
                        <li key={i} className="text-gray-700">• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-orange-600 mb-1 text-xs">⚠️ Limites</h5>
                    <ul className="text-xs space-y-0.5">
                      {setup.cons.map((con, i) => (
                        <li key={i} className="text-gray-700">• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Duration et Budget */}
                <div className="flex gap-3 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2 flex-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-700"><strong>Durée:</strong> {setup.duration}</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 flex items-center space-x-2 flex-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span className="text-gray-700"><strong>Budget:</strong> {setup.budget}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {hybridRecommendations.map((hybrid, index) => (
          <div key={hybrid.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all hover:scale-105">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex space-x-1">
                  <Target className="h-5 w-5" />
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Alternative #{recommendations.length + index + 1}</h3>
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs font-bold">
                  {Math.round(hybrid.confidence * 100)}% confiance
                </div>
              </div>
              <h4 className="text-2xl font-bold mb-2">{hybrid.name}</h4>
              <p className="text-sm opacity-90">{hybrid.description}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Hybrid Configuration */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                <h5 className="font-bold text-gray-800 mb-3">Configuration Hybride</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="font-semibold">Principal :</span>
                    <span className="text-gray-700">{hybrid.mainString}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="font-semibold">Croisé :</span>
                    <span className="text-gray-700">{hybrid.crossString}</span>
                  </div>
                </div>
              </div>

              {/* Tableau d'analyse des caractéristiques */}
              {hybrid.power && hybrid.control && hybrid.spin && hybrid.comfort && hybrid.durability && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-semibold text-gray-800 mb-2 text-xs">Caractéristiques</h5>
                  <div className="flex justify-between gap-3 text-center text-xs">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-600 mb-1">Puissance</div>
                      <div className={`text-base font-bold ${
                        hybrid.power >= 8 ? 'text-green-600' :
                        hybrid.power >= 6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {hybrid.power}/10
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-600 mb-1">Contrôle</div>
                      <div className={`text-base font-bold ${
                        hybrid.control >= 8 ? 'text-green-600' :
                        hybrid.control >= 6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {hybrid.control}/10
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-600 mb-1">Spin</div>
                      <div className={`text-base font-bold ${
                        hybrid.spin >= 8 ? 'text-green-600' :
                        hybrid.spin >= 6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {hybrid.spin}/10
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-600 mb-1">Confort</div>
                      <div className={`text-base font-bold ${
                        hybrid.comfort >= 8 ? 'text-green-600' :
                        hybrid.comfort >= 6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {hybrid.comfort}/10
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-600 mb-1">Durabilité</div>
                      <div className={`text-base font-bold ${
                        hybrid.durability >= 8 ? 'text-green-600' :
                        hybrid.durability >= 6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {hybrid.durability}/10
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tensions */}
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

              {/* Price and Rating */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Prix :</span>
                  <span className="font-bold">{hybrid.marketPrice}€</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-600">Note :</span>
                  <span className="font-bold">{hybrid.professionalRating}/5</span>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Analyse IA</span>
                </div>
                <p className="text-xs text-blue-700">{hybrid.reasoning}</p>
              </div>

              {/* Budget */}
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-gray-600">Budget total :</span>
                  <p className="text-gray-800">{hybrid.budget}</p>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="space-y-3">
                <div>
                  <h5 className="font-semibold text-green-600 mb-2">✅ Avantages</h5>
                  <ul className="text-sm space-y-1">
                    {hybrid.pros.map((pro: string, i: number) => (
                      <li key={i} className="text-gray-700">• {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-orange-600 mb-2">⚠️ Considérations</h5>
                  <ul className="text-sm space-y-1">
                    {hybrid.cons.map((con: string, i: number) => (
                      <li key={i} className="text-gray-700">• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  <strong>Durée :</strong> {hybrid.duration}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default StringingRecommendations;