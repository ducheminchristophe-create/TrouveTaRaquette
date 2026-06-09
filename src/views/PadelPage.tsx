'use client'

import React, { useState } from 'react';
import QuestionnaireFlow, { type Answers } from '../components/QuestionnaireFlow';
import RacketCard, { type RacketResult } from '../components/RacketCard';
import EmailCapture from '../components/EmailCapture';
import { recommend, type Racket, type RecommendOutput } from '../padel/scoring';
import type { Questionnaire } from '../padel/scoring';
import rawRackets from '../padel/rackets.json';
import rawQuestionnaire from '../padel/questionnaire.json';

const rackets = rawRackets as Racket[];
const questionnaire = rawQuestionnaire as Questionnaire;

const SHAPE_LABELS: Record<string, string> = {
  round: 'Ronde', teardrop: 'Hybride', diamond: 'Diamant', hybrid: 'Hybride',
};
const CORE_LABELS: Record<string, string> = {
  soft: 'Mousse soft', medium: 'Mousse medium', hard: 'Mousse dure',
};
const DIM_LABELS: Record<string, string> = {
  power: 'Puissance', control: 'Contrôle',
  maneuverability: 'Maniabilité', comfort: 'Confort', spin: 'Effet',
};

function buildSpecLine(r: Racket): string {
  return [
    SHAPE_LABELS[r.shape] ?? r.shape,
    r.core ? (CORE_LABELS[r.core] ?? r.core) : null,
    r.weight_g ? `${r.weight_g} g` : null,
  ].filter(Boolean).join(' · ');
}

/* ------------------------------------------------------------------ */

const PadelPage: React.FC = () => {
  const [results, setResults] = useState<RecommendOutput | null>(null);

  function handleComplete(answers: Answers) {
    setResults(recommend(rackets, answers, questionnaire, { limit: 3 }));
    window.scrollTo(0, 0);
  }

  function handleRestart() {
    setResults(null);
    window.scrollTo(0, 0);
  }

  if (results) {
    return <ResultsView results={results} onRestart={handleRestart} />;
  }

  return (
    <QuestionnaireFlow
      questionnaire={questionnaire}
      onComplete={handleComplete}
      sport="padel"
    />
  );
};

/* ------------------------------------------------------------------ */
/* Résultats                                                            */
/* ------------------------------------------------------------------ */

const ResultsView: React.FC<{ results: RecommendOutput; onRestart: () => void }> = ({
  results, onRestart,
}) => {
  const { topFits, wildcard } = results;

  if (topFits.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4" aria-hidden="true">😕</p>
        <h2 className="text-xl font-black text-black mb-2">Aucune raquette trouvée</h2>
        <p className="text-gray-500 text-sm mb-8">
          Aucune raquette ne correspond à tes critères.
          Essaie d&apos;assouplir ton budget ou de choisir &quot;Pas de limite&quot;.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="px-6 py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            ↺ Recommencer avec un autre budget
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Bloc principal : ton match */}
      <div className="mb-6">
        <h2 className="text-3xl font-black uppercase text-black tracking-tight">
          Ton match <span className="text-orange-500">padel</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {topFits.length === 1 ? 'La raquette' : `Les ${topFits.length} raquettes`} qui collent le mieux à ton profil
        </p>
      </div>

      <ol className="flex flex-col gap-4" aria-label="Raquettes recommandées">
        {topFits.map((r, i) => (
          <li key={(r.racket as unknown as Racket).id}>
            <RacketCard
              result={r as unknown as RacketResult}
              rank={i + 1}
              specLine={buildSpecLine(r.racket as unknown as Racket)}
              dimensionLabels={DIM_LABELS}
              sport="padel"
            />
          </li>
        ))}
      </ol>

      {/* Bloc coup de cœur (masqué si null) */}
      {wildcard && (
        <div className="mt-10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">
            Pourrait aussi t&apos;intéresser
          </h3>
          <RacketCard
            result={wildcard as unknown as RacketResult}
            rank={0}
            specLine={buildSpecLine(wildcard.racket as unknown as Racket)}
            dimensionLabels={DIM_LABELS}
              sport="padel"
            badge={`💛 ${wildcard.label}`}
          />
        </div>
      )}

      <EmailCapture sport="padel" rackets={topFits.map(r => `${(r.racket as unknown as Racket).brand} ${(r.racket as unknown as Racket).model}`)} />

      <button
        onClick={onRestart}
        className="mt-8 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-orange-400 hover:text-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        ↺ Recommencer
      </button>
    </div>
  );
};

export default PadelPage;
