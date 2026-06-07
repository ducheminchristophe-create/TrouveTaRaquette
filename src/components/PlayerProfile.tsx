'use client'

/**
 * PlayerProfile — orchestrateur 4 étapes.
 * Délègue l'état à usePlayerProfile, le rendu à StepEquipment/StepProfile/StepPreferences/StepSummary.
 * UI alignée sur le quiz Padel/Badminton : carte blanche arrondie, barre claire, boutons doux.
 */
import React from 'react';
import { ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { PlayerData } from '@/src/types/player';
import { usePlayerProfile } from '../hooks/usePlayerProfile';
import { useLanguage } from '../contexts/LanguageContext';
import StepEquipment from './steps/StepEquipment';
import StepProfile from './steps/StepProfile';
import StepPreferences from './steps/StepPreferences';
import StepSummary from './steps/StepSummary';

interface Props {
  onSubmit: (data: PlayerData) => void;
}

const STEP_TITLES = [
  'Ton équipement',
  'Ton profil de joueur',
  'Tes préférences',
  'Ton analyse',
];

const PlayerProfile: React.FC<Props> = ({ onSubmit }) => {
  const { t } = useLanguage();
  const p = usePlayerProfile(onSubmit);
  const progress = Math.round((p.currentStep / 4) * 100);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Titre */}
      <h2 className="text-3xl font-black uppercase text-black tracking-tight mb-1">
        Trouve ton <span className="text-orange-500">cordage</span> tennis
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        4 étapes · Recommandation personnalisée par IA
      </p>

      {/* Barre de progression claire */}
      <div
        className="mb-8"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression du questionnaire"
      >
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Étape {p.currentStep} / 4 · {STEP_TITLES[p.currentStep - 1]}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={p.handleSubmit} noValidate>
        {/* Carte blanche douce */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {/* Messages d'erreur */}
          {p.errors.length > 0 && (
            <div role="alert" className="mb-6 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <ul className="text-sm text-red-700 space-y-1">
                {p.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {p.currentStep === 1 && (
            <StepEquipment
              formData={p.formData}
              stringBrands={p.stringBrands}
              stringModels={p.stringModels}
              selectedStringBrand={p.selectedStringBrand}
              setSelectedStringBrand={p.setSelectedStringBrand}
              selectedMainBrand={p.selectedMainBrand}
              setSelectedMainBrand={p.setSelectedMainBrand}
              selectedCrossBrand={p.selectedCrossBrand}
              setSelectedCrossBrand={p.setSelectedCrossBrand}
              mainStringModels={p.mainStringModels}
              crossStringModels={p.crossStringModels}
              handleChange={p.handleChange}
            />
          )}

          {p.currentStep === 2 && (
            <StepProfile
              formData={p.formData}
              setFormData={p.setFormData}
              togglePlayStyle={p.togglePlayStyle}
              toggleGrip={p.toggleGrip}
              toggleCourtHabit={p.toggleCourtHabit}
            />
          )}

          {p.currentStep === 3 && (
            <StepPreferences
              formData={p.formData}
              setFormData={p.setFormData}
              stringBrands={p.stringBrands}
              toggleAlternativeType={p.toggleAlternativeType}
              togglePerformancePriority={p.togglePerformancePriority}
              toggleBrand={p.toggleBrand}
              handleChange={p.handleChange}
            />
          )}

          {p.currentStep === 4 && (
            <StepSummary
              loadingAnalysis={p.loadingAnalysis}
              setupAnalysis={p.setupAnalysis}
            />
          )}
        </div>

        {/* Navigation douce */}
        <div className="flex justify-between gap-3 mt-6">
          {p.currentStep > 1 ? (
            <button
              type="button"
              onClick={p.handlePrevious}
              className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Précédent
            </button>
          ) : (
            <span />
          )}

          {p.currentStep < 4 ? (
            <button
              type="button"
              onClick={p.handleNext}
              disabled={p.loadingAnalysis}
              className="px-6 py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {p.loadingAnalysis ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyse…</span>
                </>
              ) : (
                <>
                  <span>Suivant</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={p.loadingAnalysis}
              className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <span>Voir mes recommandations</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PlayerProfile;
