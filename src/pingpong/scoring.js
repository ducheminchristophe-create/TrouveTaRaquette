/**
 * Moteur de recommandation ping-pong (PHASE 1 : raquettes pré-assemblées) - Hike Up
 * --------------------------------------------------------------------------------
 * Même architecture que le module padel : logique à règles, 100% explicable.
 * Ici on note une raquette COMPLÈTE prête à jouer sur 3 axes : vitesse, effet, contrôle.
 * (La Phase 2 — configurateur bois + 2 revêtements — viendra dans un module séparé.)
 *
 * Pipeline :
 *   1. deriveScores(bat)       -> 3 scores 0-100 (depuis scores manuels, ou estimés du style/niveau)
 *   2. buildProfile(answers)   -> profil cible + poids + filtres de l'utilisateur
 *   3. recommend(bats, ...)    -> filtre dur, classe par distance pondérée, renvoie raisons/avertissements
 */

const DIMENSIONS = ["speed", "spin", "control"];
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/* ------------------------------------------------------------------ *
 * 1. Scores d'une raquette                                           *
 * ------------------------------------------------------------------ */

// Estimation de secours si une raquette n'a pas de scores explicites.
const STYLE_BASE = {
  defensive: { speed: 35, spin: 50, control: 85 },
  allround:  { speed: 55, spin: 60, control: 72 },
  offensive: { speed: 82, spin: 78, control: 58 },
};

/**
 * Renvoie {speed, spin, control} (0-100).
 * Priorité : scores manuels complets > estimation (style + niveau).
 * Les fabricants publient vitesse/effet/contrôle mais sur des échelles NON comparables
 * entre marques : on stocke donc des scores déjà NORMALISÉS 0-100 dans la donnée.
 */
function deriveScores(bat) {
  if (bat.scores && DIMENSIONS.every((d) => typeof bat.scores[d] === "number")) {
    return { ...bat.scores };
  }
  const base = STYLE_BASE[bat.style] || STYLE_BASE.allround;
  const s = { ...base };
  // Le niveau pousse légèrement vitesse + effet vers le haut
  const lvl = typeof bat.minLevelOrdinal === "number" ? bat.minLevelOrdinal : 1;
  s.speed += (lvl - 1) * 4;
  s.spin += (lvl - 1) * 3;
  if (bat.scores) for (const d of DIMENSIONS) if (typeof bat.scores[d] === "number") s[d] = bat.scores[d];
  for (const d of DIMENSIONS) s[d] = clamp(Math.round(s[d]));
  return s;
}

/* ------------------------------------------------------------------ *
 * 2. Profil utilisateur                                              *
 * ------------------------------------------------------------------ */

function buildProfile(answers, questionnaire) {
  const target = { speed: 50, spin: 50, control: 50 };
  const weights = { speed: 1, spin: 1, control: 1 };
  const filters = {}; // userLevelOrdinal, maxPrice, requireIttf, requireHandle

  for (const q of questionnaire.questions) {
    const chosen = answers[q.id];
    if (!chosen) continue;
    const opt = q.options.find((o) => o.id === chosen);
    if (!opt || !opt.effects) continue;
    const e = opt.effects;
    if (e.targetDelta) for (const [d, v] of Object.entries(e.targetDelta)) target[d] += v;
    if (e.weightMul) for (const [d, v] of Object.entries(e.weightMul)) weights[d] *= v;
    if (e.set) Object.assign(filters, e.set);
  }
  for (const d of DIMENSIONS) target[d] = clamp(target[d]);
  return { target, weights, filters };
}

/* ------------------------------------------------------------------ *
 * 3. Scoring + recommandation                                        *
 * ------------------------------------------------------------------ */

function matchScore(target, weights, scores) {
  let wSq = 0, wSum = 0;
  for (const d of DIMENSIONS) {
    const w = weights[d];
    wSq += w * Math.pow(target[d] - scores[d], 2);
    wSum += w;
  }
  return clamp(Math.round(100 - Math.sqrt(wSq / wSum)));
}

function explain(target, weights, scores) {
  const reasons = [], warnings = [];
  const labels = { speed: "vitesse", spin: "effet", control: "contrôle" };
  const ranked = DIMENSIONS.slice().sort((a, b) => weights[b] - weights[a]);
  for (const d of ranked) {
    const diff = Math.abs(target[d] - scores[d]);
    if (weights[d] >= 1.2 && diff <= 15 && scores[d] >= 55)
      reasons.push(`bon niveau de ${labels[d]} (${scores[d]}/100), en phase avec ta priorité`);
    if (weights[d] >= 1.2 && target[d] - scores[d] > 28)
      warnings.push(`${labels[d]} un peu juste par rapport à ce que tu cherches (${scores[d]}/100)`);
  }
  return { reasons: reasons.slice(0, 2), warnings: warnings.slice(0, 2) };
}

/**
 * bats : tableau conforme à bat-schema.json
 * answers : { [questionId]: optionId }
 * questionnaire : questionnaire.json
 * options : { limit = 5 }
 */
function recommend(bats, answers, questionnaire, options = {}) {
  const { limit = 5 } = options;
  const { target, weights, filters } = buildProfile(answers, questionnaire);

  const results = [];
  for (const bat of bats) {
    if (filters.maxPrice != null && bat.price > filters.maxPrice) continue;
    if (filters.userLevelOrdinal != null && bat.minLevelOrdinal > filters.userLevelOrdinal) continue;
    if (filters.requireIttf && !bat.ittfApproved) continue;
    if (filters.requireHandle && bat.handle !== filters.requireHandle) continue;

    const scores = deriveScores(bat);
    const score = matchScore(target, weights, scores);
    const { reasons, warnings } = explain(target, weights, scores);
    results.push({ bat, score, scores, reasons, warnings });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

if (typeof window !== "undefined") {
  window.PingPongEngine = { DIMENSIONS, deriveScores, buildProfile, matchScore, recommend };
}
export { DIMENSIONS, deriveScores, buildProfile, matchScore, recommend };
