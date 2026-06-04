/**
 * RacketCard — carte résultat partagée entre Padel et Badminton.
 * Affiche nom, prix, score, barres de dimensions, raisons et CTA.
 */
import React from 'react';

export interface RacketResult {
  racket: {
    id: string;
    brand: string;
    model: string;
    price: number;
    productUrl?: string | null;
    affiliateLinks?: { url: string }[];
    [key: string]: unknown;
  };
  score: number;
  scores: Record<string, number>;
  reasons: string[];
  warnings: string[];
}

interface Props {
  result: RacketResult;
  rank: number;
  /** Labels pour les specs (ligne sous le nom). ex: "Ronde · Mousse soft · 365 g" */
  specLine: string;
  /** Labels humains pour chaque dimension. ex: { power: "Puissance", control: "Contrôle" } */
  dimensionLabels: Record<string, string>;
}

const RacketCard: React.FC<Props> = ({ result, rank, specLine, dimensionLabels }) => {
  const { racket, score, scores, reasons, warnings } = result;
  const url = racket.affiliateLinks?.[0]?.url ?? racket.productUrl ?? null;

  return (
    <article
      className={`bg-white rounded-2xl border-2 p-5 ${
        rank === 1 ? 'border-orange-400 shadow-md' : 'border-gray-100 shadow-sm'
      }`}
      aria-label={`${rank === 1 ? 'Meilleur choix : ' : ''}${racket.brand} ${racket.model}`}
    >
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
          <p className="text-sm text-gray-500 mt-0.5">{specLine}</p>
        </div>
        <div className="text-right shrink-0">
          <ScoreRing score={score} />
          <p className="text-xl font-black text-black mt-1">{racket.price} €</p>
        </div>
      </div>

      {/* Barres de dimensions */}
      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5" aria-label="Scores par dimension">
        {Object.entries(scores).map(([dim, val]) => (
          <ScoreBar key={dim} label={dimensionLabels[dim] ?? dim} value={val} />
        ))}
      </div>

      {/* Raisons ✓ */}
      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1" aria-label="Points forts">
          {reasons.map((r, i) => (
            <li key={i} className="text-sm text-green-700 flex gap-1.5 items-start">
              <span aria-hidden="true" className="mt-0.5">✓</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Avertissements ⚠ */}
      {warnings.length > 0 && (
        <ul className="mt-2 space-y-1" aria-label="Points d'attention">
          {warnings.map((w, i) => (
            <li key={i} className="text-sm text-amber-600 flex gap-1.5 items-start">
              <span aria-hidden="true" className="mt-0.5">⚠</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      {url && (
        <a
          href={url as string}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-label={`Voir ${racket.brand} ${racket.model} sur le site du vendeur (nouvel onglet)`}
        >
          Voir la raquette →
        </a>
      )}
    </article>
  );
};

/* ------------------------------------------------------------------ */
/* Micro-composants                                                     */
/* ------------------------------------------------------------------ */

export const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-xs text-gray-500 mb-1">
      <span>{label}</span>
      <span className="font-bold text-gray-700">{value}</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-1.5" role="presentation">
      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const color =
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-orange-500' : 'text-gray-400';
  return (
    <div className={`flex flex-col items-center ${color}`} aria-label={`Score de correspondance : ${score} sur 100`}>
      <span className="text-3xl font-black leading-none" aria-hidden="true">{score}</span>
      <span className="text-xs font-bold opacity-70" aria-hidden="true">/ 100</span>
    </div>
  );
};

export default RacketCard;
