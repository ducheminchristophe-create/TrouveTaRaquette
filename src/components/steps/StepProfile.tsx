/**
 * StepProfile — Étape 2 : niveau, style de jeu, prise, surfaces.
 */
import React from 'react';
import { PlayerData } from '../../App';
import NiveauDeJeu from '../NiveauDeJeu';

interface Props {
  formData: PlayerData;
  setFormData: React.Dispatch<React.SetStateAction<PlayerData>>;
  togglePlayStyle: (style: string) => void;
  toggleGrip: (grip: string) => void;
  toggleCourtHabit: (surface: string) => void;
}

const FOCUS = 'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1';

const BTN_BASE = `p-4 font-bold text-sm tracking-wide transition-all ${FOCUS}`;
const btnClass = (active: boolean) =>
  `${BTN_BASE} ${active ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
const btnOrange = (active: boolean) =>
  `${BTN_BASE} ${active ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

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
  const { level, playStyle, grip, courtHabits } = formData.playerProfile;

  return (
    <fieldset className="space-y-8 border-none p-0 m-0">
      <legend className="border-l-4 border-orange-600 pl-4 mb-2">
        <h3 className="text-2xl font-black uppercase mb-1">Votre Profil de Joueur</h3>
        <p className="text-gray-600 text-sm">
          Renseignez votre niveau de jeu, votre style, votre prise et vos habitudes sur le court
        </p>
      </legend>

      {/* Niveau de jeu */}
      <div>
        <p className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
          Niveau de jeu
        </p>
        <NiveauDeJeu
          value={level}
          onChange={v => setFormData(prev => ({ ...prev, playerProfile: { ...prev.playerProfile, level: v } }))}
        />
      </div>

      {/* Style de jeu */}
      <div>
        <p className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
          Style de jeu{' '}
          <span className="text-gray-400 font-normal normal-case text-xs">(optionnel)</span>
        </p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Style de jeu">
          {PLAY_STYLES.map(({ value, label }) => (
            <button key={value} type="button"
              aria-pressed={playStyle === value}
              className={`${btnClass(playStyle === value)} text-left`}
              onClick={() => togglePlayStyle(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prise */}
      <div>
        <p className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
          Prise de raquette{' '}
          <span className="text-gray-400 font-normal normal-case text-xs">(optionnel)</span>
        </p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Prise de raquette">
          {GRIPS.map(({ value, label }) => (
            <button key={value} type="button"
              aria-pressed={grip === value}
              className={btnClass(grip === value)}
              onClick={() => toggleGrip(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Surfaces */}
      <div>
        <p className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
          Surfaces pratiquées{' '}
          <span className="text-gray-400 font-normal normal-case text-xs">(optionnel)</span>
        </p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Surfaces pratiquées">
          {SURFACES.map(({ value, label }) => (
            <button key={value} type="button"
              aria-pressed={courtHabits.includes(value)}
              className={btnOrange(courtHabits.includes(value))}
              onClick={() => toggleCourtHabit(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </fieldset>
  );
};

export default StepProfile;
