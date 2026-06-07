/**
 * Moteur de recommandation padel — TrouveTaRaquette
 * Logique à règles, 100 % explicable. Sans dépendance.
 * Priorité : scores manuels > données mesurées (TWU) > dérivation par règles.
 */

export type Dimension = 'power' | 'control' | 'maneuverability' | 'comfort' | 'spin';
export const DIMENSIONS: Dimension[] = ['power', 'control', 'maneuverability', 'comfort', 'spin'];

export interface Racket {
  id: string;
  brand: string;
  model: string;
  year?: number;
  shape: 'round' | 'teardrop' | 'diamond' | 'hybrid';
  weight_g: number;
  balance: 'low' | 'medium' | 'high';
  core: 'soft' | 'medium' | 'hard';
  face: 'fiberglass' | 'hybrid' | 'carbon';
  surface: 'smooth' | 'rough';
  minLevelOrdinal: number;
  price: number;
  currency: string;
  productUrl?: string;
  affiliateLinks?: { retailer: string; url: string; price: number }[];
  verified?: boolean;
  scores?: Partial<Record<Dimension, number>>;
  measured?: {
    swingweight?: number;
    power_potential?: number;
    sweetspot_size?: number;
  };
}

export interface QuestionOption {
  id: string;
  label: string;
  effects: {
    targetDelta?: Partial<Record<Dimension, number>>;
    weightMul?: Partial<Record<Dimension, number>>;
    set?: Partial<Filters>;
  };
}

export interface Question {
  id: string;
  type: string;
  required: boolean;
  label: string;
  options: QuestionOption[];
}

export interface Questionnaire {
  sport: string;
  version: number;
  dimensions: Dimension[];
  questions: Question[];
}

interface Filters {
  userLevelOrdinal: number;
  maxPrice: number;
  requireComfortMin: number;
  preferWeightMax: number;
}

export interface UserProfile {
  target: Record<Dimension, number>;
  weights: Record<Dimension, number>;
  filters: Partial<Filters>;
}

export interface RecommendationResult {
  racket: Racket;
  score: number;
  scores: Record<Dimension, number>;
  reasons: string[];
  warnings: string[];
}

/** Saveurs de coup de cœur. Seul "value" est implémenté ; structure prête pour "upgrade", "accessory"… */
export type WildcardType = 'value';

export interface Wildcard extends RecommendationResult {
  wildcardType: WildcardType;
  label: string;
}

export interface RecommendOutput {
  topFits: RecommendationResult[];
  wildcard: Wildcard | null;
}

/* ------------------------------------------------------------------ */

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

const SPEC_RULES: Record<string, Record<string, Partial<Record<Dimension, number>>>> = {
  shape: {
    round:    { control: 18, maneuverability: 12, power: -15, spin: -5 },
    teardrop: { power: 5, control: 3 },
    diamond:  { power: 20, control: -12, maneuverability: -12, spin: 5 },
  },
  balance: {
    low:    { maneuverability: 12, control: 8, power: -10 },
    medium: {},
    high:   { power: 12, maneuverability: -10, control: -5 },
  },
  core: {
    soft:   { comfort: 18, control: 10, power: -8, spin: 3 },
    medium: { comfort: 3 },
    hard:   { power: 15, comfort: -15, control: -5 },
  },
  face: {
    fiberglass: { comfort: 12, control: 8, power: -8 },
    hybrid:     {},
    carbon:     { power: 12, control: 4, comfort: -10 },
  },
  surface: {
    smooth: { spin: -3 },
    rough:  { spin: 15 },
  },
};

export function deriveScores(racket: Racket): Record<Dimension, number> {
  if (racket.scores && DIMENSIONS.every(d => typeof racket.scores![d] === 'number')) {
    return racket.scores as Record<Dimension, number>;
  }

  const s: Record<Dimension, number> = { power: 50, control: 50, maneuverability: 50, comfort: 50, spin: 50 };

  for (const key of ['shape', 'balance', 'core', 'face', 'surface'] as const) {
    const table = SPEC_RULES[key];
    const val = racket[key];
    if (table && val && table[val]) {
      for (const [dim, delta] of Object.entries(table[val])) {
        s[dim as Dimension] += delta as number;
      }
    }
  }

  if (typeof racket.weight_g === 'number') {
    const adj = ((racket.weight_g - 365) / 25) * 10;
    s.power += adj;
    s.maneuverability -= adj;
  }

  if (racket.measured) {
    if (typeof racket.measured.power_potential === 'number') s.power = racket.measured.power_potential;
    if (typeof racket.measured.sweetspot_size === 'number') {
      s.comfort = clamp((s.comfort + racket.measured.sweetspot_size) / 2);
    }
  }

  if (racket.scores) {
    for (const d of DIMENSIONS) {
      if (typeof racket.scores[d] === 'number') s[d] = racket.scores[d]!;
    }
  }

  for (const d of DIMENSIONS) s[d] = clamp(Math.round(s[d]));
  return s;
}

export function buildProfile(
  answers: Record<string, string>,
  questionnaire: Questionnaire
): UserProfile {
  const target: Record<Dimension, number> = { power: 50, control: 50, maneuverability: 50, comfort: 50, spin: 50 };
  const weights: Record<Dimension, number> = { power: 1, control: 1, maneuverability: 1, comfort: 1, spin: 1 };
  const filters: Partial<Filters> = {};

  for (const q of questionnaire.questions) {
    const chosen = answers[q.id];
    if (!chosen) continue;
    const opt = q.options.find(o => o.id === chosen);
    if (!opt?.effects) continue;
    const e = opt.effects;
    if (e.targetDelta) {
      for (const [d, v] of Object.entries(e.targetDelta)) target[d as Dimension] += v;
    }
    if (e.weightMul) {
      for (const [d, v] of Object.entries(e.weightMul)) weights[d as Dimension] *= v;
    }
    if (e.set) Object.assign(filters, e.set);
  }

  for (const d of DIMENSIONS) target[d] = clamp(target[d]);
  return { target, weights, filters };
}

function matchScore(
  target: Record<Dimension, number>,
  weights: Record<Dimension, number>,
  scores: Record<Dimension, number>
): number {
  let wSq = 0, wSum = 0;
  for (const d of DIMENSIONS) {
    const w = weights[d];
    wSq += w * Math.pow(target[d] - scores[d], 2);
    wSum += w;
  }
  return clamp(Math.round(100 - Math.sqrt(wSq / wSum)));
}

const DIM_FR: Record<Dimension, string> = {
  power: 'puissance', control: 'contrôle',
  maneuverability: 'maniabilité', comfort: 'confort', spin: 'effet',
};

function explain(
  target: Record<Dimension, number>,
  weights: Record<Dimension, number>,
  scores: Record<Dimension, number>
): { reasons: string[]; warnings: string[] } {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const ranked = [...DIMENSIONS].sort((a, b) => weights[b] - weights[a]);

  for (const d of ranked) {
    const diff = Math.abs(target[d] - scores[d]);
    if (weights[d] >= 1.2 && diff <= 15 && scores[d] >= 55) {
      reasons.push(`bon niveau de ${DIM_FR[d]} (${scores[d]}/100), qui correspond à ta priorité`);
    }
    if (weights[d] >= 1.2 && target[d] - scores[d] > 28) {
      warnings.push(`${DIM_FR[d]} un peu en dessous de ce que tu cherches (${scores[d]}/100)`);
    }
  }
  return { reasons: reasons.slice(0, 3), warnings: warnings.slice(0, 2) };
}

/**
 * Choisit le coup de cœur parmi les candidats qui passent les filtres durs
 * mais ne sont pas déjà dans topFits.
 * - "value" : meilleur rapport qualité-prix = score / √prix (le sqrt évite que la moins chère gagne toujours).
 *   On exige score >= 55 (un coup de cœur reste un bon choix, pas un lot de consolation).
 * Renvoie null si aucun candidat ne qualifie.
 */
export function pickWildcard(
  candidates: RecommendationResult[],
  topFits: RecommendationResult[],
  type: WildcardType = 'value'
): Wildcard | null {
  const topIds = new Set(topFits.map(r => r.racket.id));
  const pool = candidates.filter(r => !topIds.has(r.racket.id) && r.score >= 55);
  if (pool.length === 0) return null;

  switch (type) {
    case 'value':
    default: {
      let best: RecommendationResult | null = null;
      let bestValue = -Infinity;
      for (const r of pool) {
        const value = r.score / Math.sqrt(Math.max(r.racket.price, 1));
        if (value > bestValue || (value === bestValue && best !== null && r.score > best.score)) {
          bestValue = value;
          best = r;
        }
      }
      if (!best) return null;
      return {
        ...best,
        wildcardType: 'value',
        label: 'Le meilleur rapport qualité-prix de la sélection',
      };
    }
  }
}

export function recommend(
  rackets: Racket[],
  answers: Record<string, string>,
  questionnaire: Questionnaire,
  options: { limit?: number; softWeightPenalty?: number; wildcard?: WildcardType } = {}
): RecommendOutput {
  const { limit = 3, softWeightPenalty = 0.15, wildcard = 'value' } = options;
  const { target, weights, filters } = buildProfile(answers, questionnaire);

  const results: RecommendationResult[] = [];

  for (const racket of rackets) {
    if (filters.maxPrice != null && racket.price > filters.maxPrice) continue;
    if (filters.userLevelOrdinal != null && racket.minLevelOrdinal > filters.userLevelOrdinal) continue;

    const scores = deriveScores(racket);
    if (filters.requireComfortMin != null && scores.comfort < filters.requireComfortMin) continue;

    let score = matchScore(target, weights, scores);

    if (filters.preferWeightMax != null && racket.weight_g > filters.preferWeightMax) {
      const excess = racket.weight_g - filters.preferWeightMax;
      score = clamp(Math.round(score - excess * softWeightPenalty));
    }

    const { reasons, warnings } = explain(target, weights, scores);
    results.push({ racket, score, scores, reasons, warnings });
  }

  const sorted = results.sort((a, b) => b.score - a.score);
  const topFits = sorted.slice(0, limit);
  return { topFits, wildcard: pickWildcard(sorted, topFits, wildcard) };
}
