'use client'

import React, { useState } from 'react'
import QuestionnaireFlow, { type Answers } from '../components/QuestionnaireFlow'
import EmailCapture from '../components/EmailCapture'
import { recommend, type StringEntry, type RecommendationResult, DIMENSIONS } from '../tennis/scoring'
import type { Questionnaire } from '../tennis/scoring'
import { buildAffiliateUrl, AFFILIATE_REL } from '../lib/affiliate'
import rawStrings from '../data/MonoCordage.json'
import rawQuestionnaire from '../tennis/questionnaire.json'

const strings = rawStrings as StringEntry[]
const questionnaire = rawQuestionnaire as Questionnaire

const DIM_LABELS: Record<string, string> = {
  power: 'Puissance', control: 'Contrôle',
  spin: 'Spin', comfort: 'Confort', durability: 'Durabilité',
}

const TYPE_COLORS: Record<string, string> = {
  Polyester: 'bg-blue-100 text-blue-700',
  Multifilament: 'bg-emerald-100 text-emerald-700',
  'Boyau naturel': 'bg-amber-100 text-amber-700',
  Synthétique: 'bg-gray-100 text-gray-600',
}

export default function TennisPage() {
  const [results, setResults] = useState<RecommendationResult[] | null>(null)

  function handleComplete(answers: Answers) {
    const top = recommend(strings, answers, questionnaire, { limit: 5 })
    setResults(top)
    window.scrollTo(0, 0)
  }

  function handleRestart() {
    setResults(null)
    window.scrollTo(0, 0)
  }

  if (results) return <ResultsView results={results} onRestart={handleRestart} />

  return (
    <QuestionnaireFlow
      questionnaire={questionnaire}
      onComplete={handleComplete}
      sport="cordage tennis"
    />
  )
}

function ResultsView({ results, onRestart }: { results: RecommendationResult[]; onRestart: () => void }) {
  if (results.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-5xl mb-4" aria-hidden="true">&#128533;</p>
        <h2 className="text-xl font-black text-black mb-2">Aucun cordage trouvé</h2>
        <p className="text-gray-500 text-sm mb-8">
          Aucun cordage ne correspond à tes critères. Essaie d&apos;augmenter ton budget.
        </p>
        <button onClick={onRestart} className="px-6 py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors">
          Recommencer
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase text-black tracking-tight">
          Tes cordages <span className="text-orange-500">tennis</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">Classés par correspondance à ton profil</p>
      </div>

      <ol className="flex flex-col gap-4" aria-label="Cordages recommandés">
        {results.map((r, i) => (
          <li key={r.string.id}>
            <StringCard result={r} rank={i + 1} />
          </li>
        ))}
      </ol>

      <EmailCapture sport="cordage tennis" />

      <button
        onClick={onRestart}
        className="mt-6 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-orange-400 hover:text-orange-600 transition-colors"
      >
        Recommencer
      </button>
    </div>
  )
}

function StringCard({ result, rank }: { result: RecommendationResult; rank: number }) {
  const { string: s, score, reasons, warnings, suggestedTension } = result
  const url = buildAffiliateUrl(null)

  return (
    <article
      className={`bg-white rounded-2xl border-2 p-5 ${rank === 1 ? 'border-orange-400 shadow-md' : 'border-gray-100 shadow-sm'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {rank === 1 && (
            <span className="inline-block text-xs font-bold bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full mb-2">
              Meilleur choix
            </span>
          )}
          <h3 className="text-lg font-black text-black leading-tight">{s.brand} {s.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[s.type] ?? 'bg-gray-100 text-gray-600'}`}>
              {s.type}
            </span>
            <span className="text-xs text-gray-500">Tension conseillée : {suggestedTension}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 italic">{s.player_profile}</p>
        </div>
        <div className="text-right shrink-0">
          <ScoreRing score={score} />
          <p className="text-xl font-black text-black mt-1">~{s.price} €</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5">
        {DIMENSIONS.map(dim => (
          <ScoreBar key={dim} label={DIM_LABELS[dim]} value={s[dim]} max={10} />
        ))}
      </div>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1">
          {reasons.map((r, i) => (
            <li key={i} className="text-sm text-green-700 flex gap-1.5 items-start">
              <span aria-hidden="true" className="mt-0.5">&#10003;</span><span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      {warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="text-sm text-amber-600 flex gap-1.5 items-start">
              <span aria-hidden="true" className="mt-0.5">&#9888;</span><span>{w}</span>
            </li>
          ))}
        </ul>
      )}

      {url && (
        <a href={url} target="_blank" rel={AFFILIATE_REL}
          className="mt-4 flex items-center justify-center w-full py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-sm transition-colors">
          Voir le cordage
        </a>
      )}
    </article>
  )
}

function ScoreBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-bold text-gray-700">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${Math.round((value / max) * 100)}%` }} />
      </div>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-orange-500' : 'text-gray-400'
  return (
    <div className={`flex flex-col items-center ${color}`}>
      <span className="text-3xl font-black leading-none">{score}</span>
      <span className="text-xs font-bold opacity-70">/ 100</span>
    </div>
  )
}
