import React, { useState } from 'react';
import { recommend, type Racket, type RecommendationResult, DIMENSIONS } from '../padel/scoring';
import type { Questionnaire } from '../padel/scoring';
import rawRackets from '../padel/rackets.json';
import rawQuestionnaire from '../padel/questionnaire.json';

const rackets = rawRackets as Racket[];
const questionnaire = rawQuestionnaire as Questionnaire;

/* ------------------------------------------------------------------ */
/* Page principale                                                      */
/* ------------------------------------------------------------------ */

const PadelPage: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<RecommendationResult[] | null>(null);

  const questions = questionnaire.questions;
  const currentQ = questions[step];
  const progress = Math.round((step / questions.length) * 100);

  function advance(currentAnswers: Record<string, string>) {
    if (step === questions.length - 1) {
      setResults(recommend(rackets, currentAnswers, questionnaire, { limit: 5 }));
    } else {
      setStep(s => s + 1);
    }
  }

  function handleSelect(questionId: string, optionId: string) {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);
    advance(newAnswers);
  }

  function handleSkip() {
    advance(answers);
  }

  function handleRestart() {
    setAnswers({});
    setStep(0);
    setResults(null);
    window.scrollTo(0, 0);
  }

  if (results) {
    return <ResultsView results={results} onRestart={handleRestart} />;
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-black uppercase text-black tracking-tight mb-1">
        Trouve ta <span className="text-orange-500">raquette</span> padel
      </h2>
      <p className="text-gray-500 text-sm mb-10">
        {questions.length} questions · Recommandation personnalisée en 2 minutes
      </p>

      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Question {step + 1} / {questions.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Carte question */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <p className="text-lg font-bold text-black mb-5">{currentQ.label}</p>
        <div className="flex flex-col gap-3">
          {currentQ.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleSelect(currentQ.id, opt.id)}
              className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-700 font-medium transition-all cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {!currentQ.required && (
          <button
            onClick={handleSkip}
            className="mt-5 w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors cursor-pointer"
          >
            Passer cette question →
          </button>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Résultats                                                            */
/* ------------------------------------------------------------------ */

const ResultsView: React.FC<{ results: RecommendationResult[]; onRestart: () => void }> = ({
  results,
  onRestart,
}) => {
  if (results.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-black text-black mb-2">Aucune raquette trouvée</h2>
        <p className="text-gray-500 text-sm mb-8">
          Aucune raquette ne correspond à ton budget et ton niveau. Essaie en augmentant ton budget.
        </p>
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors"
        >
          ↺ Recommencer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase text-black tracking-tight">
          Tes raquettes <span className="text-orange-500">padel</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">Classées par correspondance à ton profil</p>
      </div>

      <div className="flex flex-col gap-4">
        {results.map((r, i) => (
          <RacketCard key={r.racket.id} result={r} rank={i + 1} />
        ))}
      </div>

      <button
        onClick={onRestart}
        className="mt-8 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-orange-400 hover:text-orange-600 transition-colors cursor-pointer"
      >
        ↺ Recommencer
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Carte raquette                                                       */
/* ------------------------------------------------------------------ */

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

const RacketCard: React.FC<{ result: RecommendationResult; rank: number }> = ({ result, rank }) => {
  const { racket, score, scores, reasons, warnings } = result;
  const url = racket.affiliateLinks?.[0]?.url ?? racket.productUrl;

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 ${rank === 1 ? 'border-orange-400 shadow-md' : 'border-gray-100 shadow-sm'}`}>
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {rank === 1 && (
            <span className="inline-block text-xs font-bold bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full mb-2">
              ⭐ Meilleur choix
            </span>
          )}
          <h3 className="text-lg font-black text-black leading-tight">
            {racket.brand} {racket.model}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {SHAPE_LABELS[racket.shape] ?? racket.shape}
            {racket.core ? ` · ${CORE_LABELS[racket.core] ?? racket.core}` : ''}
            {racket.weight_g ? ` · ${racket.weight_g} g` : ''}
          </p>
        </div>
        <div className="text-right shrink-0">
          <ScoreRing score={score} />
          <p className="text-xl font-black text-black mt-1">{racket.price} €</p>
        </div>
      </div>

      {/* Barres de scores */}
      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5">
        {DIMENSIONS.map(dim => (
          <ScoreBar key={dim} label={DIM_LABELS[dim]} value={scores[dim]} />
        ))}
      </div>

      {/* Raisons */}
      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1">
          {reasons.map((r, i) => (
            <li key={i} className="text-sm text-green-700 flex gap-1.5 items-start">
              <span className="mt-0.5">✓</span><span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Avertissements */}
      {warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="text-sm text-amber-600 flex gap-1.5 items-start">
              <span className="mt-0.5">⚠</span><span>{w}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-sm transition-colors"
        >
          Voir la raquette →
        </a>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Micro-composants                                                     */
/* ------------------------------------------------------------------ */

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-xs text-gray-500 mb-1">
      <span>{label}</span>
      <span className="font-bold text-gray-700">{value}</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${value}%` }} />
    </div>
  </div>
);

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-orange-500' : 'text-gray-400';
  return (
    <div className={`flex flex-col items-center ${color}`}>
      <span className="text-3xl font-black leading-none">{score}</span>
      <span className="text-xs font-bold opacity-70">/ 100</span>
    </div>
  );
};

export default PadelPage;
