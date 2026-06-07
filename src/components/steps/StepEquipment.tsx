'use client'

/**
 * StepEquipment — Étape 1 : raquette + cordage actuel.
 * UI alignée sur le quiz Padel/Badminton.
 */
import React from 'react';
import { PlayerData } from '@/src/types/player';
import { RACKET_MODELS } from '../../hooks/usePlayerProfile';
import ComboBox from '../ComboBox';
import TensionWheel from '../TensionWheel';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  formData: PlayerData;
  stringBrands: string[];
  stringModels: string[];
  selectedStringBrand: string;
  setSelectedStringBrand: (v: string) => void;
  selectedMainBrand: string;
  setSelectedMainBrand: (v: string) => void;
  selectedCrossBrand: string;
  setSelectedCrossBrand: (v: string) => void;
  mainStringModels: string[];
  crossStringModels: string[];
  handleChange: (field: string, value: string | number | string[]) => void;
}

const FOCUS = 'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1';
const INPUT = `w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 ${FOCUS} transition-colors text-sm`;
const LABEL = 'block text-sm font-bold text-gray-800 mb-2';

/** Boutons-pills doux (style quiz) */
const pill = (active: boolean) =>
  `px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${FOCUS} ${
    active
      ? 'border-orange-400 bg-orange-50 text-orange-700'
      : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
  }`;

const StepEquipment: React.FC<Props> = ({
  formData,
  stringBrands, stringModels,
  selectedStringBrand, setSelectedStringBrand,
  selectedMainBrand, setSelectedMainBrand,
  selectedCrossBrand, setSelectedCrossBrand,
  mainStringModels, crossStringModels,
  handleChange,
}) => {
  const { t } = useLanguage();
  const { brand, model, details } = formData.racket;
  const strings = formData.currentStrings;
  const hasBrandList = brand && brand !== 'Autre' && RACKET_MODELS[brand];

  return (
    <fieldset className="space-y-6 border-none p-0 m-0">
      <legend className="mb-2 p-0">
        <h3 className="text-xl font-black text-gray-900">{t('profile.yourEquipment')}</h3>
        <p className="text-gray-500 text-sm mt-0.5">{t('profile.equipmentDesc')}</p>
      </legend>

      {/* Marque */}
      <div>
        <label htmlFor="racket-brand" className={LABEL}>{t('profile.racketBrand')}</label>
        <select
          id="racket-brand"
          className={`${INPUT} bg-white`}
          value={brand}
          onChange={e => handleChange('racket.brand', e.target.value)}
        >
          <option value="">{t('profile.selectBrand')}</option>
          {Object.keys(RACKET_MODELS).map(b => <option key={b} value={b}>{b}</option>)}
          <option value="Autre">{t('profile.other')}</option>
        </select>
        {brand === 'Autre' && (
          <input
            type="text"
            className={`${INPUT} mt-2`}
            placeholder={t('profile.enterBrandManually')}
            onChange={e => handleChange('racket.brand', e.target.value)}
          />
        )}
      </div>

      {/* Modèle */}
      <div>
        <label htmlFor="racket-model" className={LABEL}>{t('profile.racketModel')}</label>
        {hasBrandList ? (
          <div className="space-y-2">
            <select
              id="racket-model"
              className={`${INPUT} bg-white`}
              value={model}
              onChange={e => handleChange('racket.model', e.target.value)}
            >
              <option value="">{t('profile.selectModel')}</option>
              {RACKET_MODELS[brand].map(m => <option key={m} value={m}>{m}</option>)}
              <option value="Autre">{t('profile.other')}</option>
            </select>
            {model === 'Autre' && (
              <input type="text" className={INPUT} placeholder={t('profile.enterModelManually')}
                onChange={e => handleChange('racket.model', e.target.value)} />
            )}
          </div>
        ) : (
          <input
            id="racket-model"
            type="text"
            className={INPUT}
            placeholder={brand ? t('profile.enterModelManually') : t('profile.selectBrandFirst')}
            value={model}
            onChange={e => handleChange('racket.model', e.target.value)}
            disabled={!brand}
          />
        )}
      </div>

      {/* Détails */}
      <div>
        <label htmlFor="racket-details" className={LABEL}>{t('profile.additionalDetails')}</label>
        <input id="racket-details" type="text" className={INPUT}
          placeholder={t('profile.detailsPlaceholder')}
          value={details}
          onChange={e => handleChange('racket.details', e.target.value)} />
      </div>

      {/* Cordage actuel */}
      <div>
        <p className={LABEL} id="strings-label">
          {t('profile.currentStrings')}{' '}
          <span className="text-gray-400 font-normal text-xs">(optionnel)</span>
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4" role="group" aria-labelledby="strings-label">
          {[
            { val: '',       label: 'Non renseigné' },
            { val: 'mono',   label: t('profile.singleString') },
            { val: 'hybrid', label: t('profile.hybridSetup') },
          ].map(({ val, label }) => (
            <button
              key={val}
              type="button"
              aria-pressed={strings.type === val}
              className={pill(strings.type === val)}
              onClick={() => handleChange('currentStrings.type', val)}
            >
              {label}
            </button>
          ))}
        </div>

        {strings.type === 'mono' && (
          <div className="space-y-4">
            <ComboBox value={selectedStringBrand}
              onChange={v => { setSelectedStringBrand(v); handleChange('currentStrings.mono', ''); }}
              options={stringBrands} placeholder="Marque du cordage (ex: Babolat, Luxilon...)" allowCustom />
            <ComboBox value={strings.mono}
              onChange={v => handleChange('currentStrings.mono', v)}
              options={stringModels} placeholder={t('profile.stringNamePlaceholder')} allowCustom />
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Tension <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <TensionWheel value={strings.monoTension}
                onChange={v => handleChange('currentStrings.monoTension', v)}
                min={15} max={32} step={0.5} label={t('profile.tensionPlaceholder')} />
            </div>
          </div>
        )}

        {strings.type === 'hybrid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Montants */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-600">{t('profile.mains')}</p>
              <ComboBox value={selectedMainBrand}
                onChange={v => { setSelectedMainBrand(v); handleChange('currentStrings.hybridMain', ''); }}
                options={stringBrands} placeholder="Marque montants (ex: Luxilon...)" allowCustom />
              <ComboBox value={strings.hybridMain}
                onChange={v => handleChange('currentStrings.hybridMain', v)}
                options={mainStringModels} placeholder={t('profile.mainStringPlaceholder')} allowCustom />
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Tension <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <TensionWheel value={strings.hybridMainTension}
                  onChange={v => handleChange('currentStrings.hybridMainTension', v)}
                  min={15} max={32} step={0.5} />
              </div>
            </div>
            {/* Travers */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-600">{t('profile.crosses')}</p>
              <ComboBox value={selectedCrossBrand}
                onChange={v => { setSelectedCrossBrand(v); handleChange('currentStrings.hybridCross', ''); }}
                options={stringBrands} placeholder="Marque travers (ex: Wilson...)" allowCustom />
              <ComboBox value={strings.hybridCross}
                onChange={v => handleChange('currentStrings.hybridCross', v)}
                options={crossStringModels} placeholder={t('profile.crossStringPlaceholder')} allowCustom />
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Tension <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <TensionWheel value={strings.hybridCrossTension}
                  onChange={v => handleChange('currentStrings.hybridCrossTension', v)}
                  min={15} max={32} step={0.5} />
              </div>
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default StepEquipment;
