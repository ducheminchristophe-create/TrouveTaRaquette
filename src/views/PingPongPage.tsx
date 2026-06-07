'use client'

import React, { useState } from 'react';
import QuestionnaireFlow, { type Answers, type QuestionnaireData } from '../components/QuestionnaireFlow';
import RacketCard, { type RacketResult } from '../components/RacketCard';
import EmailCapture from '../components/EmailCapture';
// scoring.js importé tel quel (logique non modifiée), typé via scoring.d.ts
import { recommend, type Bat, type Questionnaire } from '../pingpong/scoring';
import rawBats from '../pingpong/bats.json';
import rawQuestionnaire from '../pingpong/questionnaire.json';

const bats = rawBats as Bat[];
const questionnaire = rawQuestionnaire as unknown as Questionnaire;

const STYLE_LABELS: Record<string, string> = {
  defensive: 'Défensif', allround: 'Polyvalent', offensive: 'Offensif',
};
const HANDLE_LABELS: Record<string, string> = {
  flared: 'Manche évasé', straight: 'Manche droit',
  anatomic: 'Manche anatomique', penhold: 'Porte-plume',
};
const DIM_LABELS: Record<string, string> = {
  speed: 'Vitesse', spin: 'Effet', control: 'Contrôle',
};

/** Corrige l'élision française dans les phrases du moteur ("de effet" → "d'effet") sans toucher à scoring.js */
function fixElision(s: string): string {
  return s.replace(/\bde (effet|a|e|i|o|u|é|è|ê|h)/gi, (_m, w) => `d'${w}`);
}

function buildSpecLine(b: Bat): string {
  return [
    STYLE_LABELS[b.style] ?? b.style,
    HANDLE_LABELS[b.handle] ?? b.handle,
    b.ittfApproved ? 'Homologuée ITTF' : null,
  ].filter(Boolean).join(' · ');
}

/* ------------------------------------------------------------------ */

/** Mappe un résultat moteur { bat, ... } vers le format RacketCard { racket, ... } + élision FR */
function toCard(r: { bat: unknown; score: number; scores: Record<string, number>; reasons: string[]; warnings: string[]; badge?: string }): RacketResult & { badge?: string } {
  return {
    racket: r.bat as RacketResult['racket'],
    score: r.score,
    scores: r.scores,
    reasons: r.reasons.map(fixElision),
    warnings: r.warnings.map(fixElision),
    badge: r.badge,
  };
}

interface MappedOutput {
  topFits: RacketResult[];
  wildcard: (RacketResult & { label: string }) | null;
}

const PingPongPage: React.FC = () => {
  const [results, setResults] = useState<MappedOutput | null>(null);

  function handleComplete(answers: Answers) {
    const out = recommend(bats, answers, questionnaire, { limit: 3 });
    setResults({
      topFits: out.topFits.map(toCard),
      wildcard: out.wildcard
        ? { ...toCard(out.wildcard), label: out.wildcard.label }
        : null,
    });
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
      questionnaire={questionnaire as unknown as QuestionnaireData}
      onComplete={handleComplete}
      sport="ping-pong"
    />
  );
};

/* ------------------------------------------------------------------ */
/* Résultats                                                            */
/* ------------------------------------------------------------------ */

const ResultsView: React.FC<{ results: MappedOutput; onRestart: () => void }> = ({
  results, onRestart,
}) => {
  const { topFits, wildcard } = results;

  if (topFits.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4" aria-hidden="true">😕</p>
        <h2 className="text-xl font-black text-black mb-2">Aucune raquette trouvée</h2>
        <p className="text-gray-500 text-sm mb-8">
          Aucune raquette ne correspond à tes critères (budget, prise ou niveau).
          Élargis tes critères — par exemple un budget plus large ou la prise classique.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="px-6 py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            ↺ Recommencer avec d&apos;autres critères
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
          Ton match <span className="text-orange-500">ping-pong</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {topFits.length === 1 ? 'La raquette' : `Les ${topFits.length} raquettes`} qui collent le mieux à ton profil
        </p>
      </div>

      <ol className="flex flex-col gap-4" aria-label="Raquettes recommandées">
        {topFits.map((r, i) => (
          <li key={(r.racket as unknown as Bat).id}>
            <RacketCard
              result={r}
              rank={i + 1}
              specLine={buildSpecLine(r.racket as unknown as Bat)}
              dimensionLabels={DIM_LABELS}
              ctaLabel="Voir / Acheter →"
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
            result={wildcard}
            rank={0}
            specLine={buildSpecLine(wildcard.racket as unknown as Bat)}
            dimensionLabels={DIM_LABELS}
            ctaLabel="Voir / Acheter →"
            badge={`💛 ${wildcard.label}`}
          />
        </div>
      )}

      <EmailCapture sport="ping-pong" />

      <button
        onClick={onRestart}
        className="mt-8 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-orange-400 hover:text-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        ↺ Recommencer
      </button>
    </div>
  );
};

export default PingPongPage;
