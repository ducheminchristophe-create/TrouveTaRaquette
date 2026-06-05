'use client'

/**
 * StepEquipment — Étape 1 : raquette + cordage actuel.
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
const INPUT = `w-full p-4 border-2 border-gray-300 hover:border-orange-500 focus:border-orange-600 ${FOCUS} transition-colors font-medium`;

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
      <legend className="border-l-4 border-orange-600 pl-4 mb-2">
        <h3 className="text-2xl font-black uppercase mb-1">{t('profile.yourEquipment')}</h3>
        <p className="text-gray-600 text-sm">{t('profile.equipmentDesc')}</p>
      </legend>

      {/* Marque */}
      <div>
        <label htmlFor="racket-brand" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
          {t('profile.racketBrand')}
        </label>
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
        <label htmlFor="racket-model" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
          {t('profile.racketModel')}
        </label>
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
        <label htmlFor="racket-details" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
          {t('profile.additionalDetails')}
        </label>
        <input id="racket-details" type="text" className={INPUT}
          placeholder={t('profile.detailsPlaceholder')}
          value={details}
          onChange={e => handleChange('racket.details', e.target.value)} />
      </div>

      {/* Cordage actuel */}
      <div>
        <p className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide" id="strings-label">
          {t('profile.currentStrings')}{' '}
          <span className="text-gray-400 font-normal normal-case text-xs">(optionnel)</span>
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
              className={`p-4 font-bold uppercase text-sm tracking-wide transition-all ${FOCUS} ${
                strings.type === val ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
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
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Tension <span className="text-gray-400 font-normal normal-case">(optionnel)</span>
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
              <p className="text-xs font-bold text-gray-600 uppercase">{t('profile.mains')}</p>
              <ComboBox value={selectedMainBrand}
                onChange={v => { setSelectedMainBrand(v); handleChange('currentStrings.hybridMain', ''); }}
                options={stringBrands} placeholder="Marque montants (ex: Luxilon...)" allowCustom />
              <ComboBox value={strings.hybridMain}
                onChange={v => handleChange('currentStrings.hybridMain', v)}
                options={mainStringModels} placeholder={t('profile.mainStringPlaceholder')} allowCustom />
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Tension <span className="text-gray-400 font-normal normal-case">(optionnel)</span>
                </label>
                <TensionWheel value={strings.hybridMainTension}
                  onChange={v => handleChange('currentStrings.hybridMainTension', v)}
                  min={15} max={32} step={0.5} />
              </div>
            </div>
            {/* Travers */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-600 uppercase">{t('profile.crosses')}</p>
              <ComboBox value={selectedCrossBrand}
                onChange={v => { setSelectedCrossBrand(v); handleChange('currentStrings.hybridCross', ''); }}
                options={stringBrands} placeholder="Marque travers (ex: Wilson...)" allowCustom />
              <ComboBox value={strings.hybridCross}
                onChange={v => handleChange('currentStrings.hybridCross', v)}
                options={crossStringModels} placeholder={t('profile.crossStringPlaceholder')} allowCustom />
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Tension <span className="text-gray-400 font-normal normal-case">(optionnel)</span>
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
