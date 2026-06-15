'use client'

import React, { useState } from 'react'
import QuestionnaireFlow, { type Answers } from '../components/QuestionnaireFlow'
import { recommend, type Racket, type RecommendOutput, type RacketResult } from '../tennis/racket-scoring'
import type { Questionnaire } from '../tennis/racket-scoring'
import rawRackets from '../tennis/rackets.json'
import rawQuestionnaire from '../tennis/racket-questionnaire.json'
import { track } from '@/src/lib/analytics'
import { ScoreBar, ScoreRing } from '../components/RacketCard'
import EmailCapture from '../components/EmailCapture'

const rackets = rawRackets as Racket[]
const questionnaire = rawQuestionnaire as unknown as Questionnaire

const DIM_LABELS: Record<string, string> = {
  power: 'Puissance',
  control: 'Contrôle',
  spin: 'Spin',
  comfort: 'Confort',
  maneuverability: 'Maniabilité',
  stability: 'Stabilité',
  forgiveness: 'Tolérance',
  precision: 'Précision',
}

function buildSpecLine(r: Racket): string {
  return [
    `${r.weight_g} g`,
    `${r.head_size} in²`,
    r.string_pattern,
    r.category,
  ].filter(Boolean).join(' · ')
}

function buildScores(r: Racket): Record<string, number> {
  return {
    power: r.power,
    control: r.control,
    spin: r.spin,
    comfort: r.comfort,
    maneuverability: r.maneuverability,
    stability: r.stability,
    forgiveness: r.forgiveness,
    precision: r.precision,
  }
}

/* ------------------------------------------------------------------ */
/* Carte raquette tennis                                                */
/* ------------------------------------------------------------------ */

const TennisRacketCard: React.FC<{ result: RacketResult; rank: number }> = ({ result, rank }) => {
  const { racket, score, reasons, warnings, matchBadge } = result

  const isTop = rank === 1
  const badgeText = matchBadge ?? (isTop ? '⭐ Meilleur match' : undefined)

  return (
    <article
      className={`bg-white rounded-2xl border-2 p-5 ${
        isTop ? 'border-green-400 shadow-md' : 'border-gray-100 shadow-sm'
      }`}
      aria-label={`${racket.brand} ${racket.model}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {badgeText && (
            <span className="inline-block text-xs font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full mb-2">
              {badgeText}
            </span>
          )}
          <h3 className="text-lg font-black text-black leading-tight">
            {racket.brand} {racket.model}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{buildSpecLine(racket)}</p>
        </div>
        <div className="text-right shrink-0">
          <ScoreRing score={score} />
          <p className="text-xl font-black text-black mt-1">~{racket.price_eur} €</p>
          <p className="text-[10px] text-gray-400 leading-none">prix indicatif</p>
        </div>
      </div>

      {/* Scores bars */}
      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5">
        {Object.entries(buildScores(racket)).map(([dim, val]) => (
          <ScoreBar key={dim} label={DIM_LABELS[dim] ?? dim} value={val} />
        ))}
      </div>

      {/* Raisons */}
      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1">
          {reasons.map((r, i) => (
            <li key={i} className="text-sm text-green-700 flex gap-1.5 items-start">
              <span className="mt-0.5">✓</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Avertissements */}
      {warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="text-sm text-amber-600 flex gap-1.5 items-start">
              <span className="mt-0.5">⚠</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Specs techniques */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs text-gray-500 text-center">
        <div>
          <div className="font-bold text-gray-700">{racket.weight_g} g</div>
          <div>Poids</div>
        </div>
        <div>
          <div className="font-bold text-gray-700">{racket.head_size} in²</div>
          <div>Tamis</div>
        </div>
        <div>
          <div className="font-bold text-gray-700">{racket.string_pattern}</div>
          <div>Cordage</div>
        </div>
        <div>
          <div className="font-bold text-gray-700">{racket.ra}</div>
          <div>Rigidité (RA)</div>
        </div>
        <div>
          <div className="font-bold text-gray-700">{racket.balance_cm} cm</div>
          <div>Balance</div>
        </div>
        <div>
          <div className="font-bold text-gray-700">{racket.swingweight}</div>
          <div>Swingweight</div>
        </div>
      </div>

      {/* Best for */}
      {racket.best_for && (
        <p className="mt-3 text-xs text-gray-500 italic">
          💡 Idéal pour : {racket.best_for}
        </p>
      )}

      {/* Search link */}
      <a
        href={`https://www.google.com/search?q=${encodeURIComponent(`acheter ${racket.brand} ${racket.model}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('racket_search_click', { brand: racket.brand, model: racket.model })}
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors"
      >
        Trouver cette raquette →
      </a>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Vue résultats                                                        */
/* ------------------------------------------------------------------ */

const ResultsView: React.FC<{ results: RecommendOutput; onRestart: () => void }> = ({
  results, onRestart,
}) => {
  const { topFits, wildcard } = results

  if (topFits.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-black text-black mb-2">Aucune raquette trouvée</h2>
        <p className="text-gray-500 text-sm mb-8">
          Aucune raquette ne correspond à tes critères. Essaie d&apos;assouplir ton budget.
        </p>
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
        >
          Recommencer
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-black">
          🎾 Tes raquettes idéales
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Basé sur tes réponses parmi {rackets.length} modèles analysés
        </p>
      </div>

      {/* Top fits */}
      <div className="space-y-4">
        {topFits.map((result, i) => (
          <TennisRacketCard key={result.racket.id} result={result} rank={i + 1} />
        ))}
      </div>

      {/* Wildcard */}
      {wildcard && (
        <div className="mt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Alternative à découvrir
          </p>
          <TennisRacketCard result={wildcard} rank={99} />
        </div>
      )}

      {/* Email capture */}
      <EmailCapture />

      {/* Restart */}
      <div className="text-center pt-4">
        <button
          onClick={onRestart}
          className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
        >
          Recommencer le questionnaire
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page principale                                                      */
/* ------------------------------------------------------------------ */

const TennisRacketPage: React.FC = () => {
  const [results, setResults] = useState<RecommendOutput | null>(null)

  function handleComplete(answers: Answers) {
    track('quiz_complete', { sport: 'tennis-racket' })
    const output = recommend(rackets, answers, questionnaire, { limit: 3 })
    setResults(output)
    window.scrollTo(0, 0)
  }

  function handleRestart() {
    setResults(null)
    window.scrollTo(0, 0)
  }

  if (results) {
    return <ResultsView results={results} onRestart={handleRestart} />
  }

  return (
    <QuestionnaireFlow
      questionnaire={questionnaire}
      onComplete={handleComplete}
      sport="tennis-racket"
      accentColor="bg-green-600"
    />
  )
}

export default TennisRacketPage
