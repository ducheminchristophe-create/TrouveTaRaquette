/**
 * Moteur de recommandation badminton — TrouveTaRaquette
 * Logique à règles, 100 % explicable. Même architecture que le module padel.
 * 5 dimensions : power, control, speed, repulsion, comfort
 */

export type Dimension = 'power' | 'control' | 'speed' | 'repulsion' | 'comfort';
export const DIMENSIONS: Dimension[] = ['power', 'control', 'speed', 'repulsion', 'comfort'];

export interface Racket {
  id: string;
  brand: string;
  model: string;
  balance: 'head_heavy' | 'even' | 'head_light';
  shaft: 'flexible' | 'medium' | 'stiff' | 'extra_stiff';
  weight_g: number;
  frame: 'aluminum' | 'graphite' | 'carbon';
  isometric: boolean;
  minLevelOrdinal: number;
  price: number;
  currency: string;
  productUrl?: string | null;
  priceSource?: string;
  scores?: Partial<Record<Dimension, number>>;
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

/* ------------------------------------------------------------------ */

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

const SPEC_RULES: Record<string, Record<string, Partial<Record<Dimension, number>>>> = {
  balance: {
    head_heavy: { power: 20, repulsion: 10, speed: -12, control: -5 },
    even:       { control: 8, comfort: 5 },
    head_light: { speed: 20, control: 5, power: -15, repulsion: -8 },
  },
  shaft: {
    flexible:    { comfort: 18, control: 8, power: -10, repulsion: -10 },
    medium:      { comfort: 5, control: 5 },
    stiff:       { power: 12, repulsion: 18, comfort: -10, control: -5 },
    extra_stiff: { power: 18, repulsion: 22, comfort: -18, control: -8 },
  },
  frame: {
    aluminum: { comfort: 10, control: 5, power: -10, repulsion: -10 },
    graphite:  { power: 8, repulsion: 10, control: 3 },
    carbon:    { power: 12, repulsion: 15, comfort: -8 },
  },
};

export function deriveScores(racket: Racket): Record<Dimension, number> {
  if (racket.scores && DIMENSIONS.every(d => typeof racket.scores![d] === 'number')) {
    return racket.scores as Record<Dimension, number>;
  }

  const s: Record<Dimension, number> = {
    power: 50, control: 50, speed: 50, repulsion: 50, comfort: 50,
  };

  for (const key of ['balance', 'shaft', 'frame'] as const) {
    const table = SPEC_RULES[key];
    const val = racket[key];
    if (table && val && table[val]) {
      for (const [dim, delta] of Object.entries(table[val])) {
        s[dim as Dimension] += delta as number;
      }
    }
  }

  // Cadre isométrique → sweet spot plus large = plus tolérant
  if (racket.isometric) {
    s.comfort += 10;
    s.control += 8;
  }

  // Poids : centre à 83 g, ±5 g ≈ ±6 pts speed / ±5 pts power
  if (typeof racket.weight_g === 'number') {
    const adj = ((racket.weight_g - 83) / 5) * 5;
    s.power += adj;
    s.speed -= adj;
    s.comfort -= adj * 0.4;
  }

  // Surcharge partielle éventuelle
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
  const target: Record<Dimension, number> = {
    power: 50, control: 50, speed: 50, repulsion: 50, comfort: 50,
  };
  const weights: Record<Dimension, number> = {
    power: 1, control: 1, speed: 1, repulsion: 1, comfort: 1,
  };
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
  speed: 'vitesse', repulsion: 'répulsion', comfort: 'confort',
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

export function recommend(
  rackets: Racket[],
  answers: Record<string, string>,
  questionnaire: Questionnaire,
  options: { limit?: number; softWeightPenalty?: number } = {}
): RecommendationResult[] {
  const { limit = 5, softWeightPenalty = 0.3 } = options;
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

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
