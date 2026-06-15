/**
 * Moteur de recommandation raquettes tennis — TrouveTaRaquette
 * Scoring pondéré sur 8 dimensions (0-100) + filtres techniques
 * Base de données : 222 modèles réels avec specs expertes
 */

export type Dimension =
  | 'power' | 'control' | 'spin' | 'comfort'
  | 'maneuverability' | 'stability' | 'forgiveness' | 'precision'

export const DIMENSIONS: Dimension[] = [
  'power', 'control', 'spin', 'comfort',
  'maneuverability', 'stability', 'forgiveness', 'precision',
]

export interface Racket {
  id: string
  brand: string
  line: string
  model: string
  year: string
  category: string
  player_level: string
  player_level_ordinal: number
  player_type: string
  weight_g: number
  weight_cat: 'ultralight' | 'light' | 'medium' | 'heavy'
  head_size: number
  head_cat: 'small' | 'mid' | 'midplus' | 'oversize'
  balance_cm: number
  swingweight: number
  string_pattern: string
  string_pattern_open: boolean
  ra: number
  beam_mm: string
  length_in: number
  power: number
  control: number
  spin: number
  comfort: number
  maneuverability: number
  stability: number
  forgiveness: number
  precision: number
  arm_friendly: boolean
  arm_warning: boolean
  beginner_friendly: boolean
  style_baseline: boolean
  style_allcourt: boolean
  style_net: boolean
  best_for: string
  avoid_if: string
  price_eur: number
  data_confidence: string
  source_url: string
}

export interface QuestionOption {
  id: string
  label: string
  effects: {
    targetDelta?: Partial<Record<Dimension, number>>
    weightMul?: Partial<Record<Dimension, number>>
    set?: Partial<Filters>
  }
}

export interface Question {
  id: string
  section: string
  required: boolean
  label: string
  type?: string
  options: QuestionOption[]
}

export interface Questionnaire {
  sport: string
  version: number
  questions: Question[]
}

interface Filters {
  levelOrdinal: number
  maxPrice: number
  requireArmFriendly: boolean
  requireRaMax: number
  preferOpenPattern: boolean
  preferLight: boolean
  preferHeavy: boolean
  targetHeadCat: string
  targetWeightCat: string
  currentRacket: string
  // Direct target overrides from questionnaire
  targetForgiveness: number
  targetManeuverability: number
  targetControl: number
  targetPrecision: number
  targetStability: number
}

export interface UserProfile {
  target: Record<Dimension, number>
  weights: Record<Dimension, number>
  filters: Partial<Filters>
}

export interface RacketResult {
  racket: Racket
  score: number
  reasons: string[]
  warnings: string[]
  matchBadge?: string
}

export interface RecommendOutput {
  topFits: RacketResult[]
  wildcard: RacketResult | null
  profile: UserProfile
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))

const DIM_FR: Record<Dimension, string> = {
  power: 'puissance',
  control: 'contrôle',
  spin: 'spin',
  comfort: 'confort',
  maneuverability: 'maniabilité',
  stability: 'stabilité',
  forgiveness: 'tolérance',
  precision: 'précision',
}

const WEIGHT_CATS = ['ultralight', 'light', 'medium', 'heavy']

export function buildProfile(
  answers: Record<string, string | string[]>,
  questionnaire: Questionnaire
): UserProfile {
  // Base targets (0-100 scale)
  const target: Record<Dimension, number> = {
    power: 70,
    control: 70,
    spin: 70,
    comfort: 70,
    maneuverability: 70,
    stability: 70,
    forgiveness: 70,
    precision: 70,
  }
  const weights: Record<Dimension, number> = {
    power: 1, control: 1, spin: 1, comfort: 1,
    maneuverability: 1, stability: 1, forgiveness: 1, precision: 1,
  }
  const filters: Partial<Filters> = {}

  for (const q of questionnaire.questions) {
    const chosen = answers[q.id]
    if (!chosen) continue

    // Questions texte libre (ex: raquette actuelle) — pas d'effets à appliquer
    if (q.type === 'text' && typeof chosen === 'string' && !q.options.find(o => o.id === chosen)) {
      if (q.id === 'current_racket') filters.currentRacket = chosen as string
      continue
    }

    // Handle multi-answers (pain question)
    const chosenArr = Array.isArray(chosen) ? chosen : [chosen]

    for (const chosenId of chosenArr) {
      const opt = q.options.find(o => o.id === chosenId)
      if (!opt?.effects) continue
      const e = opt.effects

      if (e.targetDelta) {
        for (const [d, v] of Object.entries(e.targetDelta)) {
          target[d as Dimension] = clamp(target[d as Dimension] + v, 0, 100)
        }
      }
      if (e.weightMul) {
        for (const [d, v] of Object.entries(e.weightMul)) {
          weights[d as Dimension] *= v
        }
      }
      if (e.set) Object.assign(filters, e.set)
    }
  }

  // Apply direct target overrides from filters
  if (filters.targetForgiveness != null) target.forgiveness = clamp(filters.targetForgiveness, 0, 100)
  if (filters.targetManeuverability != null) target.maneuverability = clamp(filters.targetManeuverability, 0, 100)
  if (filters.targetControl != null) target.control = clamp(filters.targetControl, 0, 100)
  if (filters.targetPrecision != null) target.precision = clamp(filters.targetPrecision, 0, 100)
  if (filters.targetStability != null) target.stability = clamp(filters.targetStability, 0, 100)

  return { target, weights, filters }
}

function matchScore(
  target: Record<Dimension, number>,
  weights: Record<Dimension, number>,
  racket: Racket
): number {
  let weightedSqSum = 0
  let weightSum = 0

  for (const d of DIMENSIONS) {
    const w = weights[d]
    const diff = target[d] - racket[d]
    weightedSqSum += w * diff * diff
    weightSum += w
  }

  // Score 0-100 using weighted RMSE
  const rmse = Math.sqrt(weightedSqSum / weightSum)
  return clamp(Math.round(100 - rmse * 0.8), 0, 100)
}

function weightCatDistance(cat: string, target: string): number {
  const iA = WEIGHT_CATS.indexOf(cat)
  const iB = WEIGHT_CATS.indexOf(target)
  if (iA === -1 || iB === -1) return 0
  return Math.abs(iA - iB)
}

function applyFilters(racket: Racket, filters: Partial<Filters>): { pass: boolean; penalty: number } {
  let penalty = 0

  // Budget hard filter
  if (filters.maxPrice != null && racket.price_eur > filters.maxPrice) {
    return { pass: false, penalty: 0 }
  }

  // Level soft filter — penalize big mismatch
  if (filters.levelOrdinal != null) {
    const diff = Math.abs(racket.player_level_ordinal - filters.levelOrdinal)
    if (diff >= 2) penalty += 15
    else if (diff === 1) penalty += 5
  }

  // Arm friendly
  if (filters.requireArmFriendly) {
    if (!racket.arm_friendly) penalty += 20
    if (racket.ra > (filters.requireRaMax ?? 70)) penalty += 10
  }

  // String pattern preference
  if (filters.preferOpenPattern && !racket.string_pattern_open) {
    penalty += 8
  }

  // Head size preference
  if (filters.targetHeadCat && racket.head_cat !== filters.targetHeadCat) {
    penalty += 10
  }

  // Weight preference
  if (filters.targetWeightCat) {
    const dist = weightCatDistance(racket.weight_cat, filters.targetWeightCat)
    penalty += dist * 8
  } else {
    if (filters.preferLight && racket.weight_cat === 'heavy') penalty += 10
    if (filters.preferHeavy && racket.weight_cat === 'ultralight') penalty += 10
  }

  return { pass: true, penalty }
}

function explain(
  target: Record<Dimension, number>,
  weights: Record<Dimension, number>,
  racket: Racket,
  filters: Partial<Filters>
): { reasons: string[]; warnings: string[] } {
  const reasons: string[] = []
  const warnings: string[] = []

  const ranked = [...DIMENSIONS].sort((a, b) => weights[b] - weights[a])

  for (const d of ranked.slice(0, 4)) {
    const val = racket[d]
    const diff = target[d] - val
    if (weights[d] >= 1.3 && diff <= 5 && val >= 72) {
      reasons.push(`Excellente ${DIM_FR[d]} (${val}/100) — correspond à ta priorité`)
    } else if (weights[d] >= 1.5 && diff > 15) {
      warnings.push(`${DIM_FR[d]} en dessous de ce que tu cherches (${val}/100)`)
    }
  }

  // Arm warning
  if (racket.arm_warning && !racket.arm_friendly) {
    warnings.push('À surveiller si tu as des douleurs au bras')
  }

  // Weight note
  if (racket.weight_g >= 310) {
    warnings.push(`Raquette lourde (${racket.weight_g} g) — swing physique requis`)
  } else if (racket.weight_g <= 270) {
    reasons.push(`Très légère (${racket.weight_g} g) — idéale pour la maniabilité et l'endurance`)
  }

  // Pattern
  if (filters.preferOpenPattern && racket.string_pattern_open) {
    reasons.push(`Cadre ouvert ${racket.string_pattern} — favorise le spin`)
  }

  return {
    reasons: reasons.slice(0, 3),
    warnings: warnings.slice(0, 2),
  }
}

function assignBadge(index: number, racket: Racket): string | undefined {
  if (index === 0) return '🥇 Meilleur match'
  if (index === 1) return '🥈 Très bon match'
  if (index === 2) return '🥉 Bon match'
  return undefined
}

export function recommend(
  rackets: Racket[],
  answers: Record<string, string | string[]>,
  questionnaire: Questionnaire,
  options: { limit?: number } = {}
): RecommendOutput {
  const { limit = 3 } = options
  const { target, weights, filters } = buildProfile(answers, questionnaire)

  const scored: Array<{ racket: Racket; rawScore: number; penalty: number }> = []

  for (const racket of rackets) {
    const { pass, penalty } = applyFilters(racket, filters)
    if (!pass) continue

    const rawScore = matchScore(target, weights, racket)
    scored.push({ racket, rawScore, penalty })
  }

  // Final score = rawScore - penalty
  const results: RacketResult[] = scored
    .map(({ racket, rawScore, penalty }) => {
      const score = clamp(rawScore - penalty, 0, 100)
      const { reasons, warnings } = explain(target, weights, racket, filters)
      return { racket, score, reasons, warnings }
    })
    .sort((a, b) => b.score - a.score)

  const topFits = results.slice(0, limit).map((r, i) => ({
    ...r,
    matchBadge: assignBadge(i, r.racket),
  }))

  // Wildcard: best result from a different brand/category than top 1
  const topBrand = topFits[0]?.racket.brand
  const topCategory = topFits[0]?.racket.category
  const topIds = new Set(topFits.map(r => r.racket.id))

  const wildcard = results.find(
    r => !topIds.has(r.racket.id) &&
      (r.racket.brand !== topBrand || r.racket.category !== topCategory) &&
      r.score >= 50
  ) ?? null

  return { topFits, wildcard: wildcard ? { ...wildcard, matchBadge: '💡 Coup de cœur' } : null, profile: { target, weights, filters } }
}
