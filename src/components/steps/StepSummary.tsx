'use client'

/**
 * StepSummary — Étape 4 : animation de chargement + analyse IA du setup actuel.
 */
import React from 'react';
import { Target } from 'lucide-react';
import TennisCourtAnimation from '../TennisCourtAnimation';
import { SetupAnalysis } from '../../hooks/usePlayerProfile';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  loadingAnalysis: boolean;
  setupAnalysis: SetupAnalysis | null;
}

const STAT_COLOR = (v: number) =>
  v >= 8 ? 'text-green-600' : v >= 6 ? 'text-yellow-600' : 'text-red-600';

const StepSummary: React.FC<Props> = ({ loadingAnalysis, setupAnalysis }) => {
  const { t } = useLanguage();

  if (loadingAnalysis) {
    return (
      <div className="space-y-4" aria-live="polite" aria-busy="true">
        <TennisCourtAnimation />
        <p className="text-center text-gray-500 text-sm">Analyse de ton setup en cours…</p>
      </div>
    );
  }

  if (!setupAnalysis) {
    return (
      <div className="py-8 text-center text-gray-400 text-sm" aria-live="polite">
        <p>Aucune donnée de setup à analyser.</p>
        <p className="mt-1">Tu peux quand même obtenir tes recommandations.</p>
      </div>
    );
  }

  const STATS = [
    { key: 'power',      label: t('profile.power'),      value: setupAnalysis.power },
    { key: 'control',    label: t('profile.control'),    value: setupAnalysis.control },
    { key: 'spin',       label: t('profile.spin'),       value: setupAnalysis.spin },
    { key: 'comfort',    label: t('profile.comfort'),    value: setupAnalysis.comfort },
    { key: 'durability', label: t('profile.durability'), value: setupAnalysis.durability },
  ];

  return (
    <div
      className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 border-l-4 border-orange-600"
      aria-label="Analyse de ton setup actuel"
    >
      <div className="flex items-center space-x-3 mb-4">
        <Target className="h-6 w-6 text-orange-600" aria-hidden="true" />
        <h3 className="text-xl font-black uppercase">{t('profile.currentSetupAnalysis')}</h3>
      </div>

      <p className="text-gray-800 mb-5 font-medium italic">{setupAnalysis.analysis}</p>

      <dl className="grid grid-cols-5 gap-2 text-center text-sm">
        {STATS.map(({ key, label, value }) => (
          <div key={key} className="bg-white p-3">
            <dt className="font-bold text-xs text-gray-600 uppercase">{label}</dt>
            <dd className={`text-2xl font-black ${STAT_COLOR(value)}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default StepSummary;
