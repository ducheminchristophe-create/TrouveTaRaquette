/**
 * StepPreferences — Étape 3 : types d'alternatives, quantités, budget, priorités, marques.
 */
import React from 'react';
import { PlayerData } from '../../App';
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
const BTN_BASE = `font-bold text-sm tracking-wide transition-all ${FOCUS}`;
const btnBlack  = (active: boolean) => `${BTN_BASE} p-4 ${active ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
const btnOrange = (active: boolean) => `${BTN_BASE} p-4 ${active ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

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
      <legend className="border-l-4 border-orange-600 pl-4 mb-2">
        <h3 className="text-2xl font-black uppercase mb-1">Vos Préférences d'Alternatives</h3>
        <p className="text-gray-600 text-sm">Personnalisez les recommandations selon vos besoins</p>
      </legend>

      {/* Types d'alternatives */}
      <div>
        <p className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
          Type d'alternatives souhaités <span className="text-red-600">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Types d'alternatives">
          {[
            { val: 'mono',   label: 'Mono-cordages' },
            { val: 'hybrid', label: 'Hybrides' },
          ].map(({ val, label }) => (
            <button key={val} type="button"
              aria-pressed={alternativeTypes.includes(val)}
              className={`${btnOrange(alternativeTypes.includes(val))} p-5 uppercase`}
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
          <p className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Nombre d'alternatives mono-cordages (max 3)
          </p>
          <div className="grid grid-cols-3 gap-3" role="group" aria-label="Nombre de mono-cordages">
            {[1, 2, 3].map(num => (
              <button key={num} type="button"
                aria-pressed={monoCount === num}
                className={`${btnBlack(monoCount === num)} text-2xl`}
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
          <p className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Nombre d'alternatives hybrides (max 3)
          </p>
          <div className="grid grid-cols-3 gap-3" role="group" aria-label="Nombre d'hybrides">
            {[1, 2, 3].map(num => (
              <button key={num} type="button"
                aria-pressed={hybridCount === num}
                className={`${btnBlack(hybridCount === num)} text-2xl`}
                onClick={() => handleChange('preferences.hybridCount', num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fourchette de prix */}
      <PriceRangeSlider
        min={5} max={50} step={1}
        value={priceRange}
        onChange={range => setFormData(prev => ({
          ...prev, preferences: { ...prev.preferences, priceRange: range },
        }))}
        currency="€"
      />

      {/* Priorités de performance */}
      <div>
        <p className="block text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">
          Priorités de performance{' '}
          <span className="text-gray-400 font-normal normal-case text-xs">(optionnel)</span>
        </p>
        <p className="text-sm text-gray-600 mb-3">
          Sélectionnez les qualités que vous souhaitez prioriser dans votre cordage
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="group" aria-label="Priorités de performance">
          {PRIORITIES.map(({ value, label }) => (
            <button key={value} type="button"
              aria-pressed={performancePriorities.includes(value)}
              className={btnOrange(performancePriorities.includes(value))}
              onClick={() => togglePerformancePriority(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Marques préférées */}
      <div>
        <p className="block text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">
          Marques préférées <span className="text-gray-400 font-normal normal-case text-xs">(optionnel)</span>
        </p>
        <p className="text-sm text-gray-600 mb-3">
          Sélectionnez les marques que vous souhaitez privilégier
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" role="group" aria-label="Marques de cordage">
          {stringBrands.sort().map(brand => (
            <button key={brand} type="button"
              aria-pressed={preferredBrands.includes(brand)}
              className={`p-3 text-sm font-medium transition-all ${FOCUS} ${
                preferredBrands.includes(brand)
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
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
