'use client'

/**
 * StepPreferences — Étape 3 : types d'alternatives, quantités, budget, priorités, marques.
 * UI alignée sur le quiz Padel/Badminton.
 */
import React from 'react';
import { PlayerData } from '@/src/types/player';
import PriceRangeSlider from '../PriceRangeSlider';

interface Props {
  formData: PlayerData;
  setFormData: React.Dispatch<React.SetStateAction<PlayerData>>;
  stringBrands: string[];
  toggleAlternativeType: (type: string) => void;
  togglePerformancePriority: (priority: string) => void;
  toggleBrand: (brand: string) => void;
  handleChange: (field: string, value: string | number | string[]) => void;
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

const PRIORITIES = [
  { value: 'power',      label: 'Puissance' },
  { value: 'control',    label: 'Contrôle' },
  { value: 'spin',       label: 'Spin' },
  { value: 'comfort',    label: 'Confort' },
  { value: 'durability', label: 'Durabilité' },
];

const StepPreferences: React.FC<Props> = ({
  formData, setFormData, stringBrands,
  toggleAlternativeType, togglePerformancePriority, toggleBrand, handleChange,
}) => {
  const { alternativeTypes, monoCount, hybridCount, priceRange, performancePriorities, preferredBrands } =
    formData.preferences;

  return (
    <fieldset className="space-y-6 border-none p-0 m-0">
      <legend className="mb-2 p-0">
        <h3 className="text-xl font-black text-gray-900">Tes préférences</h3>
        <p className="text-gray-500 text-sm mt-0.5">Personnalise tes recommandations</p>
      </legend>

      {/* Types d'alternatives */}
      <div>
        <p className={LABEL}>
          Type d&apos;alternatives souhaité <span className="text-orange-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Types d'alternatives">
          {[
            { val: 'mono',   label: 'Mono-cordages' },
            { val: 'hybrid', label: 'Hybrides' },
          ].map(({ val, label }) => (
            <button key={val} type="button"
              aria-pressed={alternativeTypes.includes(val)}
              className={pill(alternativeTypes.includes(val))}
              onClick={() => toggleAlternativeType(val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Nombre d'alternatives mono */}
      {alternativeTypes.includes('mono') && (
        <div>
          <p className={LABEL}>Nombre d&apos;alternatives mono-cordages</p>
          <div className="grid grid-cols-3 gap-3" role="group" aria-label="Nombre de mono-cordages">
            {[1, 2, 3].map(num => (
              <button key={num} type="button"
                aria-pressed={monoCount === num}
                className={pill(monoCount === num, 'text-lg font-bold')}
                onClick={() => handleChange('preferences.monoCount', num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nombre d'alternatives hybrides */}
      {alternativeTypes.includes('hybrid') && (
        <div>
          <p className={LABEL}>Nombre d&apos;alternatives hybrides</p>
          <div className="grid grid-cols-3 gap-3" role="group" aria-label="Nombre d'hybrides">
            {[1, 2, 3].map(num => (
              <button key={num} type="button"
                aria-pressed={hybridCount === num}
                className={pill(hybridCount === num, 'text-lg font-bold')}
                onClick={() => handleChange('preferences.hybridCount', num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fourchette de prix */}
      <div>
        <p className={LABEL}>Budget par cordage</p>
        <PriceRangeSlider
          min={5} max={50} step={1}
          value={priceRange}
          onChange={range => setFormData(prev => ({
            ...prev, preferences: { ...prev.preferences, priceRange: range },
          }))}
          currency="€"
        />
      </div>

      {/* Priorités de performance */}
      <div>
        <p className={LABEL}>
          Priorités de performance{' '}
          <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="group" aria-label="Priorités de performance">
          {PRIORITIES.map(({ value, label }) => (
            <button key={value} type="button"
              aria-pressed={performancePriorities.includes(value)}
              className={pill(performancePriorities.includes(value))}
              onClick={() => togglePerformancePriority(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Marques préférées */}
      <div>
        <p className={LABEL}>
          Marques préférées{' '}
          <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" role="group" aria-label="Marques de cordage">
          {stringBrands.sort().map(brand => (
            <button key={brand} type="button"
              aria-pressed={preferredBrands.includes(brand)}
              className={pill(preferredBrands.includes(brand), 'px-3 py-2 text-xs')}
              onClick={() => toggleBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </fieldset>
  );
};

export default StepPreferences;
