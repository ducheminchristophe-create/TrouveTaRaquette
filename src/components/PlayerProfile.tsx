'use client'

/**
 * PlayerProfile — orchestrateur 4 étapes.
 * Délègue l'état à usePlayerProfile, le rendu à StepEquipment/StepProfile/StepPreferences/StepSummary.
 */
import React from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
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

const PlayerProfile: React.FC<Props> = ({ onSubmit }) => {
  const { t } = useLanguage();
  const p = usePlayerProfile(onSubmit);

  const stepTitles = [
    t('profile.yourEquipment'),
    'Profil de joueur',
    "Préférences d'alternatives",
    'Récapitulatif',
  ];

  return (
    <div className="bg-white shadow-2xl max-w-4xl mx-auto overflow-hidden">
      {/* En-tête avec barre de progression */}
      <header className="bg-black text-white p-6">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {t('profile.step')} {p.currentStep} {t('profile.of')} 4
          </h2>
          <span className="text-orange-500 font-bold text-xl" aria-live="polite">
            {Math.round(p.progressPercentage)}%
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4">{stepTitles[p.currentStep - 1]}</p>
        <div
          className="w-full bg-gray-800 h-2 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(p.progressPercentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression du formulaire"
        >
          <div
            className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 transition-all duration-500 ease-out"
            style={{ width: `${p.progressPercentage}%` }}
          />
        </div>
      </header>

      <form onSubmit={p.handleSubmit} noValidate>
        <div className="p-8">
          {/* Messages d'erreur */}
          {p.errors.length > 0 && (
            <div role="alert" className="mb-6 flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <ul className="text-sm text-red-700 space-y-1">
                {p.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Contenu de l'étape courante */}
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

        {/* Navigation */}
        <div className="flex justify-between px-8 py-5 border-t-2 border-gray-200 bg-gray-50">
          {p.currentStep > 1 ? (
            <button
              type="button"
              onClick={p.handlePrevious}
              className="px-8 py-4 bg-gray-200 text-gray-900 font-bold uppercase text-sm hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              {t('profile.backButton')}
            </button>
          ) : (
            <span /> /* Placeholder pour garder le bouton "Suivant" à droite */
          )}

          {p.currentStep < 4 ? (
            <button
              type="button"
              onClick={p.handleNext}
              disabled={p.loadingAnalysis}
              className="px-8 py-4 bg-black text-white font-bold uppercase text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {p.loadingAnalysis ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t('profile.analyzing')}</span>
                </>
              ) : (
                <>
                  <span>{t('profile.next')}</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={p.loadingAnalysis}
              className="px-8 py-4 bg-orange-600 text-white font-black uppercase text-sm hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <span>{t('profile.getRecommendations')}</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PlayerProfile;
