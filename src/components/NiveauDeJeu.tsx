import React, { useCallback } from 'react';

interface Level {
  label: string;
  aft: string;
  description: string;
}

const LEVELS: Level[] = [
  { label: 'Débutant', aft: 'NC à C30.6', description: 'Découvre les règles et les coups fondamentaux.' },
  { label: 'Débutant avancé', aft: 'C30.6 à C30.5', description: 'Peut tenir quelques échanges et servir correctement.' },
  { label: 'Intermédiaire', aft: 'C30.5 à C30.3', description: 'Devient régulier et comprend la tactique de base.' },
  { label: 'Intermédiaire avancé', aft: 'C30.3 à C30.1', description: 'Bonne technique, construit les points.' },
  { label: 'Avancé', aft: 'C30 à C15.4', description: 'Joueur de compétition régulier.' },
  { label: 'Très avancé', aft: 'C15.4 à C15', description: 'Excellent niveau régional.' },
  { label: 'Expert', aft: 'B+4/6 à B0', description: 'Parmi les meilleurs amateurs du pays.' },
  { label: 'Élite', aft: 'B-2/6 à B-15.4', description: 'Niveau semi-professionnel ou professionnel national.' },
  { label: 'Professionnel mondial', aft: 'A', description: 'Circuit ATP ou WTA.' },
];

interface NiveauDeJeuProps {
  value: number;
  onChange: (value: number) => void;
}

const NiveauDeJeu: React.FC<NiveauDeJeuProps> = ({ value, onChange }) => {
  const level = LEVELS[value];
  const percent = (value / (LEVELS.length - 1)) * 100;

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowLeft' && value > 0) onChange(value - 1);
      if (e.key === 'ArrowRight' && value < LEVELS.length - 1) onChange(value + 1);
    },
    [value, onChange]
  );

  return (
    <div className="w-full max-w-sm">
      <div className="mb-3">
        <span className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">
          {level.label}
        </span>
        <span
          className="ml-2 inline-block px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 align-middle"
          style={{ verticalAlign: 'middle' }}
        >
          {level.aft}
        </span>
      </div>

      <div className="relative mb-1">
        <div className="relative h-1.5 bg-gray-200 rounded-full">
          <div
            className="absolute h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={LEVELS.length - 1}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onKeyDown={handleKey}
          aria-label="Niveau de jeu"
          aria-valuetext={level.label}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
          style={{ height: '100%' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-orange-600 rounded-full shadow transition-all duration-200 pointer-events-none"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between mb-3 px-px">
        {LEVELS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            aria-label={LEVELS[i].label}
            className={`text-xs font-medium transition-colors ${
              i === value ? 'text-orange-600' : 'text-gray-300 hover:text-gray-500'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 leading-snug">{level.description}</p>
    </div>
  );
};

export default NiveauDeJeu;
