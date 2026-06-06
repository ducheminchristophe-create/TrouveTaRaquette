/**
 * Moteur de recommandation cordage tennis — TrouveTaRaquette
 * Même architecture que padel/badminton : règles explicables, 5 dimensions.
 * Dimensions : power, control, spin, comfort, durability
 */

export type Dimension = 'power' | 'control' | 'spin' | 'comfort' | 'durability'
export const DIMENSIONS: Dimension[] = ['power', 'control', 'spin', 'comfort', 'durability']

export interface StringEntry {
  id: string
  brand: string
  name: string
  type: string
  power: number
  control: number
  spin: number
  comfort: number
  durability: number
  tension_min: number
  tension_max: number
  price: number
  player_profile: string
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
  required: boolean
  label: string
  options: QuestionOption[]
}

export interface Questionnaire {
  sport: string
  questions: Question[]
}

interface Filters {
  levelOrdinal: number
  maxPrice: number
  maxTension: number
  minTension: number
  requireComfortMin: number
  polyesterForbidden: boolean
}

export interface UserProfile {
  target: Record<Dimension, number>
  weights: Record<Dimension, number>
  filters: Partial<Filters>
}

export interface RecommendationResult {
  string: StringEntry
  score: number
  reasons: string[]
  warnings: string[]
  suggestedTension: string
}

const clamp = (v: number, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, v))

const DIM_FR: Record<Dimension, string> = {
  power: 'puissance', control: 'contrôle',
  spin: 'spin', comfort: 'confort', durability: 'durabilité',
}

export function buildProfile(
  answers: Record<string, string>,
  questionnaire: Questionnaire
): UserProfile {
  const target: Record<Dimension, number> = { power: 5, control: 5, spin: 5, comfort: 5, durability: 5 }
  const weights: Record<Dimension, number> = { power: 1, control: 1, spin: 1, comfort: 1, durability: 1 }
  const filters: Partial<Filters> = {}

  for (const q of questionnaire.questions) {
    const chosen = answers[q.id]
    if (!chosen) continue
    const opt = q.options.find(o => o.id === chosen)
    if (!opt?.effects) continue
    const e = opt.effects
    if (e.targetDelta) {
      for (const [d, v] of Object.entries(e.targetDelta)) {
        target[d as Dimension] = clamp(target[d as Dimension] + v, 0, 10)
      }
    }
    if (e.weightMul) {
      for (const [d, v] of Object.entries(e.weightMul)) {
        weights[d as Dimension] *= v
      }
    }
    if (e.set) Object.assign(filters, e.set)
  }

  return { target, weights, filters }
}

function matchScore(
  target: Record<Dimension, number>,
  weights: Record<Dimension, number>,
  entry: StringEntry
): number {
  let wSq = 0, wSum = 0
  for (const d of DIMENSIONS) {
    const w = weights[d]
    wSq += w * Math.pow(target[d] - entry[d], 2)
    wSum += w
  }
  return clamp(Math.round(100 - Math.sqrt(wSq / wSum) * 10), 0, 100)
}

function explain(
  target: Record<Dimension, number>,
  weights: Record<Dimension, number>,
  entry: StringEntry
): { reasons: string[]; warnings: string[] } {
  const reasons: string[] = []
  const warnings: string[] = []
  const ranked = [...DIMENSIONS].sort((a, b) => weights[b] - weights[a])

  for (const d of ranked) {
    const score = entry[d]
    const diff = target[d] - score
    if (weights[d] >= 1.3 && diff <= 1 && score >= 7) {
      reasons.push(`bon niveau de ${DIM_FR[d]} (${score}/10), qui correspond à ta priorité`)
    }
    if (weights[d] >= 1.3 && diff > 2.5) {
      warnings.push(`${DIM_FR[d]} en dessous de ce que tu cherches (${score}/10)`)
    }
  }

  return { reasons: reasons.slice(0, 3), warnings: warnings.slice(0, 2) }
}

function suggestTension(entry: StringEntry, filters: Partial<Filters>): string {
  const base = Math.round((entry.tension_min + entry.tension_max) / 2)
  const min = filters.minTension ? Math.max(base - 1, filters.minTension) : base - 1
  const max = filters.maxTension ? Math.min(base + 1, filters.maxTension) : base + 1
  return `${Math.min(min, max)}–${Math.max(min, max)} kg`
}

export function recommend(
  strings: StringEntry[],
  answers: Record<string, string>,
  questionnaire: Questionnaire,
  options: { limit?: number } = {}
): RecommendationResult[] {
  const { limit = 5 } = options
  const { target, weights, filters } = buildProfile(answers, questionnaire)

  const results: RecommendationResult[] = []

  for (const entry of strings) {
    if (filters.maxPrice != null && entry.price > filters.maxPrice) continue
    if (filters.requireComfortMin != null && entry.comfort < filters.requireComfortMin) continue
    if (filters.polyesterForbidden && entry.type.toLowerCase().includes('poly')) continue

    const score = matchScore(target, weights, entry)
    const { reasons, warnings } = explain(target, weights, entry)

    results.push({
      string: entry,
      score,
      reasons,
      warnings,
      suggestedTension: suggestTension(entry, filters),
    })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}
