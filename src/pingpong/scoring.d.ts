/**
 * Déclarations de types pour scoring.js (ping-pong, Phase 1).
 * Le fichier scoring.js est importé tel quel — ce .d.ts ne fait que le typer.
 */

export type Dimension = 'speed' | 'spin' | 'control'
export const DIMENSIONS: Dimension[]

export interface Bat {
  id: string
  brand: string
  model: string
  style: 'defensive' | 'allround' | 'offensive'
  scores?: Partial<Record<Dimension, number>>
  stars?: number
  handle: 'flared' | 'straight' | 'anatomic' | 'penhold'
  minLevelOrdinal: number
  ittfApproved?: boolean
  rubberType?: string
  price: number
  currency?: string
  priceIndicative?: boolean
  priceSource?: string
  productUrl?: string
  imageUrl?: string
  affiliateLinks?: { retailer: string; url: string; price?: number }[]
  verified?: boolean
  sources?: string[]
}

export interface QuestionOption {
  id: string
  label: string
  effects: {
    targetDelta?: Partial<Record<Dimension, number>>
    weightMul?: Partial<Record<Dimension, number>>
    set?: Record<string, unknown>
  }
}

export interface Question {
  id: string
  type: string
  required: boolean
  label: string
  options: QuestionOption[]
}

export interface Questionnaire {
  sport: string
  phase?: number
  scope?: string
  version: number
  dimensions: Dimension[]
  questions: Question[]
}

export interface UserProfile {
  target: Record<Dimension, number>
  weights: Record<Dimension, number>
  filters: Record<string, unknown>
}

export interface RecommendationResult {
  bat: Bat
  score: number
  scores: Record<Dimension, number>
  reasons: string[]
  warnings: string[]
}

export function deriveScores(bat: Bat): Record<Dimension, number>
export function buildProfile(
  answers: Record<string, string>,
  questionnaire: Questionnaire
): UserProfile
export function matchScore(
  target: Record<Dimension, number>,
  weights: Record<Dimension, number>,
  scores: Record<Dimension, number>
): number
export function recommend(
  bats: Bat[],
  answers: Record<string, string>,
  questionnaire: Questionnaire,
  options?: { limit?: number }
): RecommendationResult[]
