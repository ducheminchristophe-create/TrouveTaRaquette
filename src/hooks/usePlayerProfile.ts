/**
 * usePlayerProfile — toute la logique d'état du formulaire 4 étapes.
 * Extrait de PlayerProfile.tsx pour rendre le composant testable et lisible.
 */
import { useState, useEffect } from 'react';
import { PlayerData } from '../App';
import aiStringService from '../services/aiStringService';
import stringDatabase from '../services/stringDatabase';

export const RACKET_MODELS: Record<string, string[]> = {
  Babolat:    ['Pure Drive', 'Pure Aero', 'Pure Strike', 'Pure Control', 'Nadal', 'Boost Drive', 'Boost Aero', 'Satelite', 'Evoke', 'Counter Veron'],
  Wilson:     ['Pro Staff', 'Blade', 'Clash', 'Ultra', 'Burn', 'Six.One', 'Steam', 'Triad', 'Energy XL', 'Federer'],
  Head:       ['Speed', 'Radical', 'Prestige', 'Instinct', 'Extreme', 'Gravity', 'Boom', 'Challenge', 'Ti', 'Graphene 360+'],
  Yonex:      ['EZONE', 'VCORE', 'Percept', 'Astrel', 'VCORE Pro', 'RDiS', 'Regna', 'VCORE SV', 'Ai', 'Nextage'],
  Prince:     ['Textreme Tour', 'Beast', 'Phantom', 'Warrior', 'Attack', 'Lightning', 'Rebel', 'Synergy', 'Diablo', 'Premier'],
  Tecnifibre: ['TFight', 'Tempo', 'TFlash', 'TRebound', 'Carboflex', 'ATP', 'Tour', 'Contact', 'Dynergy', 'Suprem'],
  Dunlop:     ['CX', 'SX', 'FX', 'Biomimetic', 'Aerogel', 'Hotmelt', 'Force', 'Play', 'Precision', 'Revolution'],
  Volkl:      ['V-Feel', 'V-Sense', 'Power Bridge', 'Organix', 'Tour', 'Super G', 'Quantum', 'DNX', 'C10', 'Team'],
  Pacific:    ['BXT', 'X-Fast', 'X-Force', 'Nexus', 'Prime', 'Tough', 'Classic', 'Speed', 'Power', 'Control'],
  Solinco:    ['Whiteout', 'Blackout', 'Pro', 'Tour', 'Control', 'Power', 'Comfort', 'Speed', 'Precision', 'Classic'],
};

/* ------------------------------------------------------------------ */

export interface SetupAnalysis {
  analysis: string;
  power: number;
  control: number;
  spin: number;
  comfort: number;
  durability: number;
}

export function usePlayerProfile(onSubmit: (data: PlayerData) => void) {
  /* ---- État principal ---- */
  const [formData, setFormData] = useState<PlayerData>({
    racket: { brand: '', model: '', details: '' },
    currentStrings: {
      type: '', mono: '', monoTension: '',
      hybridMain: '', hybridCross: '',
      hybridMainTension: '', hybridCrossTension: '',
    },
    playerProfile: { level: 2, playStyle: '', grip: '', courtHabits: [], injuries: '' },
    preferences: {
      alternativeTypes: ['mono', 'hybrid'],
      monoCount: 3, hybridCount: 3,
      preferredBrands: [],
      performancePriorities: [],
      priceRange: [10, 20] as [number, number],
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [setupAnalysis, setSetupAnalysis] = useState<SetupAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  /* ---- Listes cordage ---- */
  const [stringBrands, setStringBrands] = useState<string[]>([]);
  const [stringModels, setStringModels] = useState<string[]>([]);
  const [selectedStringBrand, setSelectedStringBrand] = useState('');
  const [selectedMainBrand, setSelectedMainBrand] = useState('');
  const [selectedCrossBrand, setSelectedCrossBrand] = useState('');
  const [mainStringModels, setMainStringModels] = useState<string[]>([]);
  const [crossStringModels, setCrossStringModels] = useState<string[]>([]);

  /* ---- Chargement initial des marques ---- */
  useEffect(() => {
    stringDatabase.getUniqueBrands().then(setStringBrands);
  }, []);

  useEffect(() => {
    if (selectedStringBrand) {
      stringDatabase.getStringNamesByBrand(selectedStringBrand).then(setStringModels);
    } else {
      setStringModels([]);
    }
  }, [selectedStringBrand]);

  useEffect(() => {
    if (selectedMainBrand) {
      stringDatabase.getStringNamesByBrand(selectedMainBrand).then(setMainStringModels);
    } else {
      setMainStringModels([]);
    }
  }, [selectedMainBrand]);

  useEffect(() => {
    if (selectedCrossBrand) {
      stringDatabase.getStringNamesByBrand(selectedCrossBrand).then(setCrossStringModels);
    } else {
      setCrossStringModels([]);
    }
  }, [selectedCrossBrand]);

  /* ---- Analyse IA au step 4 ---- */
  useEffect(() => {
    if (currentStep !== 4 || setupAnalysis || loadingAnalysis) return;
    setLoadingAnalysis(true);
    aiStringService
      .analyzeSetup({ racket: formData.racket, currentStrings: formData.currentStrings })
      .then(setSetupAnalysis)
      .catch(() => {/* silencieux — pas bloquant */})
      .finally(() => setLoadingAnalysis(false));
  }, [currentStep, formData, setupAnalysis, loadingAnalysis]);

  /* ---- Handlers ---- */
  const handleChange = (field: string, value: string | number | string[]) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof PlayerData] as object, [child]: value },
      }));
      if (field === 'racket.brand') {
        setFormData(prev => ({ ...prev, racket: { ...prev.racket, model: '' } }));
      }
      if (field === 'currentStrings.type') {
        setFormData(prev => ({
          ...prev,
          currentStrings: {
            ...prev.currentStrings,
            mono: '', monoTension: '',
            hybridMain: '', hybridCross: '',
            hybridMainTension: '', hybridCrossTension: '',
          },
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleAlternativeType = (type: string) =>
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        alternativeTypes: prev.preferences.alternativeTypes.includes(type)
          ? prev.preferences.alternativeTypes.filter(t => t !== type)
          : [...prev.preferences.alternativeTypes, type],
      },
    }));

  const toggleCourtHabit = (surface: string) =>
    setFormData(prev => ({
      ...prev,
      playerProfile: {
        ...prev.playerProfile,
        courtHabits: prev.playerProfile.courtHabits.includes(surface)
          ? prev.playerProfile.courtHabits.filter(s => s !== surface)
          : [...prev.playerProfile.courtHabits, surface],
      },
    }));

  const toggleBrand = (brand: string) =>
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferredBrands: prev.preferences.preferredBrands.includes(brand)
          ? prev.preferences.preferredBrands.filter(b => b !== brand)
          : [...prev.preferences.preferredBrands, brand],
      },
    }));

  const togglePerformancePriority = (priority: string) =>
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        performancePriorities: prev.preferences.performancePriorities.includes(priority)
          ? prev.preferences.performancePriorities.filter(p => p !== priority)
          : [...prev.preferences.performancePriorities, priority],
      },
    }));

  const togglePlayStyle = (style: string) =>
    setFormData(prev => ({
      ...prev,
      playerProfile: {
        ...prev.playerProfile,
        playStyle: prev.playerProfile.playStyle === style ? '' : style,
      },
    }));

  const toggleGrip = (grip: string) =>
    setFormData(prev => ({
      ...prev,
      playerProfile: {
        ...prev.playerProfile,
        grip: prev.playerProfile.grip === grip ? '' : grip,
      },
    }));

  /* ---- Navigation entre étapes ---- */
  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];
    if (step === 1) {
      if (!formData.racket.brand.trim()) newErrors.push('Marque de raquette requise');
      if (!formData.racket.model.trim()) newErrors.push('Modèle de raquette requis');
    }
    if (step === 3) {
      if (formData.preferences.alternativeTypes.length === 0)
        newErrors.push("Sélectionnez au moins un type d'alternative");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(s => s + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(s => s - 1);
    setErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) onSubmit(formData);
  };

  return {
    /* état */
    formData, setFormData,
    currentStep,
    errors,
    setupAnalysis,
    loadingAnalysis,
    progressPercentage: (currentStep / 4) * 100,
    /* listes cordage */
    stringBrands,
    stringModels,
    selectedStringBrand, setSelectedStringBrand,
    selectedMainBrand, setSelectedMainBrand,
    selectedCrossBrand, setSelectedCrossBrand,
    mainStringModels,
    crossStringModels,
    /* handlers */
    handleChange,
    toggleAlternativeType,
    toggleCourtHabit,
    toggleBrand,
    togglePerformancePriority,
    togglePlayStyle,
    toggleGrip,
    handleNext,
    handlePrevious,
    handleSubmit,
  };
}
