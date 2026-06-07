'use client'

/**
 * StepProfile — Étape 2 : niveau, style de jeu, prise, surfaces, blessures.
 * UI alignée sur le quiz Padel/Badminton.
 */
import React from 'react';
import { PlayerData } from '@/src/types/player';
import NiveauDeJeu from '../NiveauDeJeu';

interface Props {
  formData: PlayerData;
  setFormData: React.Dispatch<React.SetStateAction<PlayerData>>;
  togglePlayStyle: (style: string) => void;
  toggleGrip: (grip: string) => void;
  toggleCourtHabit: (surface: string) => void;
}

const FOCUS = 'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1';

/** Bouton-pill doux (style quiz) */
const pill = (active: boolean, extra = '') =>
  `px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${FOCUS} ${extra} ${
    active
      ? 'border-orange-400 bg-orange-50 text-orange-700'
      : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
  }`;

const LABEL = 'block text-sm font-bold text-gray-800 mb-3';

const PLAY_STYLES = [
  { value: 'baseline',       label: 'Joueur de fond de court' },
  { value: 'serve-volley',   label: 'Montée au filet' },
  { value: 'all-court',      label: 'Complet (all-court)' },
  { value: 'offensive',      label: 'Offensif' },
  { value: 'defensive',      label: 'Défensif' },
  { value: 'counter-attacker', label: 'Contre-attaquant' },
];

const GRIPS = [
  { value: 'eastern',      label: 'Eastern' },
  { value: 'semi-western', label: 'Semi-western' },
  { value: 'western',      label: 'Western' },
  { value: 'continental',  label: 'Continentale' },
];

const SURFACES = [
  { value: 'clay',   label: 'Terre battue' },
  { value: 'hard',   label: 'Dur' },
  { value: 'grass',  label: 'Gazon' },
  { value: 'indoor', label: 'Indoor (moquette / parquet)' },
];

const StepProfile: React.FC<Props> = ({
  formData, setFormData, togglePlayStyle, toggleGrip, toggleCourtHabit,
}) => {
  const { level, playStyle, grip, courtHabits, injuries } = formData.playerProfile;
  const injuriesText = injuries ?? '';

  return (
    <fieldset className="space-y-7 border-none p-0 m-0">
      <legend className="mb-2 p-0">
        <h3 className="text-xl font-black text-gray-900">Ton profil de joueur</h3>
        <p className="text-gray-500 text-sm mt-0.5">
          Niveau, style, prise et habitudes sur le court
        </p>
      </legend>

      {/* Niveau de jeu */}
      <div>
        <p className={LABEL}>Niveau de jeu</p>
        <NiveauDeJeu
          value={level}
          onChange={v => setFormData(prev => ({ ...prev, playerProfile: { ...prev.playerProfile, level: v } }))}
        />
      </div>

      {/* Style de jeu */}
      <div>
        <p className={LABEL}>
          Style de jeu{' '}
          <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
        </p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Style de jeu">
          {PLAY_STYLES.map(({ value, label }) => (
            <button key={value} type="button"
              aria-pressed={playStyle === value}
              className={pill(playStyle === value, 'text-left')}
              onClick={() => togglePlayStyle(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prise */}
      <div>
        <p className={LABEL}>
          Prise de raquette{' '}
          <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
        </p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Prise de raquette">
          {GRIPS.map(({ value, label }) => (
            <button key={value} type="button"
              aria-pressed={grip === value}
              className={pill(grip === value)}
              onClick={() => toggleGrip(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Surfaces */}
      <div>
        <p className={LABEL}>
          Surfaces pratiquées{' '}
          <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
        </p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Surfaces pratiquées">
          {SURFACES.map(({ value, label }) => (
            <button key={value} type="button"
              aria-pressed={courtHabits.includes(value)}
              className={pill(courtHabits.includes(value))}
              onClick={() => toggleCourtHabit(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Blessures / douleurs */}
      <div>
        <p className={LABEL}>
          Blessures ou douleurs{' '}
          <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
        </p>
        <div className="relative">
          <textarea
            value={injuriesText}
            onChange={e => {
              const words = e.target.value.trim() === '' ? [] : e.target.value.trim().split(/\s+/);
              if (words.length <= 15) {
                setFormData(prev => ({
                  ...prev,
                  playerProfile: { ...prev.playerProfile, injuries: e.target.value },
                }));
              }
            }}
            placeholder="ex : tennis elbow droit, douleur épaule..."
            rows={3}
            className={`w-full rounded-xl border-2 border-gray-200 p-3 text-sm resize-none transition-colors ${FOCUS} hover:border-orange-400 focus:border-orange-500 placeholder-gray-400`}
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-400 select-none">
            {injuriesText.trim() === '' ? 0 : injuriesText.trim().split(/\s+/).length}/15 mots
          </span>
        </div>
      </div>
    </fieldset>
  );
};

export default StepProfile;
