import React, { useState, useEffect } from 'react';
import { User, Target, Activity, AlertCircle, ChevronRight } from 'lucide-react';
import { PlayerData } from '../App';
import aiStringService from '../services/aiStringService';
import stringDatabase from '../services/stringDatabase';
import { useLanguage } from '../contexts/LanguageContext';
import ComboBox from './ComboBox';
import TensionWheel from './TensionWheel';
import TennisCourtAnimation from './TennisCourtAnimation';

interface PlayerProfileProps {
  onSubmit: (data: PlayerData) => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ onSubmit }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<PlayerData>({
    racket: { brand: '', model: '', details: '' },
    currentStrings: {
      type: '',
      mono: '',
      monoTension: '',
      hybridMain: '',
      hybridCross: '',
      hybridMainTension: '',
      hybridCrossTension: ''
    },
    preferences: {
      alternativeTypes: ['mono', 'hybrid'],
      monoCount: 3,
      hybridCount: 3,
      preferredBrands: []
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [setupAnalysis, setSetupAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [stringBrands, setStringBrands] = useState<string[]>([]);
  const [stringModels, setStringModels] = useState<string[]>([]);
  const [selectedStringBrand, setSelectedStringBrand] = useState('');
  const [selectedMainBrand, setSelectedMainBrand] = useState('');
  const [selectedCrossBrand, setSelectedCrossBrand] = useState('');
  const [mainStringModels, setMainStringModels] = useState<string[]>([]);
  const [crossStringModels, setCrossStringModels] = useState<string[]>([]);

  useEffect(() => {
    const loadBrands = async () => {
      const brands = await stringDatabase.getUniqueBrands();
      setStringBrands(brands);
    };
    loadBrands();
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      if (selectedStringBrand) {
        const models = await stringDatabase.getStringNamesByBrand(selectedStringBrand);
        setStringModels(models);
      } else {
        setStringModels([]);
      }
    };
    loadModels();
  }, [selectedStringBrand]);

  useEffect(() => {
    const loadMainModels = async () => {
      if (selectedMainBrand) {
        const models = await stringDatabase.getStringNamesByBrand(selectedMainBrand);
        setMainStringModels(models);
      } else {
        setMainStringModels([]);
      }
    };
    loadMainModels();
  }, [selectedMainBrand]);

  useEffect(() => {
    const loadCrossModels = async () => {
      if (selectedCrossBrand) {
        const models = await stringDatabase.getStringNamesByBrand(selectedCrossBrand);
        setCrossStringModels(models);
      } else {
        setCrossStringModels([]);
      }
    };
    loadCrossModels();
  }, [selectedCrossBrand]);

  const racketModels: { [key: string]: string[] } = {
    'Babolat': [
      'Pure Drive', 'Pure Aero', 'Pure Strike', 'Pure Control', 'Nadal',
      'Boost Drive', 'Boost Aero', 'Satelite', 'Evoke', 'Counter Veron'
    ],
    'Wilson': [
      'Pro Staff', 'Blade', 'Clash', 'Ultra', 'Burn',
      'Six.One', 'Steam', 'Triad', 'Energy XL', 'Federer'
    ],
    'Head': [
      'Speed', 'Radical', 'Prestige', 'Instinct', 'Extreme',
      'Gravity', 'Boom', 'Challenge', 'Ti', 'Graphene 360+'
    ],
    'Yonex': [
      'EZONE', 'VCORE', 'Percept', 'Astrel', 'VCORE Pro',
      'RDiS', 'Regna', 'VCORE SV', 'Ai', 'Nextage'
    ],
    'Prince': [
      'Textreme Tour', 'Beast', 'Phantom', 'Warrior', 'Attack',
      'Lightning', 'Rebel', 'Synergy', 'Diablo', 'Premier'
    ],
    'Tecnifibre': [
      'TFight', 'Tempo', 'TFlash', 'TRebound', 'Carboflex',
      'ATP', 'Tour', 'Contact', 'Dynergy', 'Suprem'
    ],
    'Dunlop': [
      'CX', 'SX', 'FX', 'Biomimetic', 'Aerogel',
      'Hotmelt', 'Force', 'Play', 'Precision', 'Revolution'
    ],
    'Volkl': [
      'V-Feel', 'V-Sense', 'Power Bridge', 'Organix', 'Tour',
      'Super G', 'Quantum', 'DNX', 'C10', 'Team'
    ],
    'Pacific': [
      'BXT', 'X-Fast', 'X-Force', 'Nexus', 'Prime',
      'Tough', 'Classic', 'Speed', 'Power', 'Control'
    ],
    'Solinco': [
      'Whiteout', 'Blackout', 'Pro', 'Tour', 'Control',
      'Power', 'Comfort', 'Speed', 'Precision', 'Classic'
    ]
  };

  const handleChange = (field: string, value: string | number | string[]) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent as keyof PlayerData], [child]: value }
        }));

        if (field === 'racket.brand') {
          setFormData(prev => ({
            ...prev,
            racket: { ...prev.racket, model: '' }
          }));
        }

        if (field === 'currentStrings.type') {
          setFormData(prev => ({
            ...prev,
            currentStrings: {
              ...prev.currentStrings,
              mono: '',
              monoTension: '',
              hybridMain: '',
              hybridCross: '',
              hybridMainTension: '',
              hybridCrossTension: ''
            }
          }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleAlternativeType = (type: string) => {
    setFormData(prev => {
      const types = prev.preferences.alternativeTypes.includes(type)
        ? prev.preferences.alternativeTypes.filter(t => t !== type)
        : [...prev.preferences.alternativeTypes, type];
      return {
        ...prev,
        preferences: { ...prev.preferences, alternativeTypes: types }
      };
    });
  };

  const toggleBrand = (brand: string) => {
    setFormData(prev => {
      const brands = prev.preferences.preferredBrands.includes(brand)
        ? prev.preferences.preferredBrands.filter(b => b !== brand)
        : [...prev.preferences.preferredBrands, brand];
      return {
        ...prev,
        preferences: { ...prev.preferences, preferredBrands: brands }
      };
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    if (step === 1) {
      if (!formData.racket.brand || formData.racket.brand.trim() === '') newErrors.push('Marque de raquette requise');
      if (!formData.racket.model.trim()) newErrors.push('Modèle de raquette requis');
      if (!formData.currentStrings.type) newErrors.push('Type de cordage requis');

      if (formData.currentStrings.type === 'mono') {
        if (!formData.currentStrings.mono.trim()) newErrors.push('Nom du cordage requis');
        if (!formData.currentStrings.monoTension.trim()) newErrors.push('Tension du cordage requise');
      } else if (formData.currentStrings.type === 'hybrid') {
        if (!formData.currentStrings.hybridMain.trim()) newErrors.push('Cordage montants requis');
        if (!formData.currentStrings.hybridCross.trim()) newErrors.push('Cordage travers requis');
        if (!formData.currentStrings.hybridMainTension.trim()) newErrors.push('Tension montants requise');
        if (!formData.currentStrings.hybridCrossTension.trim()) newErrors.push('Tension travers requise');
      }
    } else if (step === 2) {
      if (formData.preferences.alternativeTypes.length === 0) {
        newErrors.push('Sélectionnez au moins un type d\'alternative');
      }
      if (formData.preferences.alternativeTypes.includes('mono') && formData.preferences.monoCount < 1) {
        newErrors.push('Le nombre d\'alternatives mono doit être au moins 1');
      }
      if (formData.preferences.alternativeTypes.includes('hybrid') && formData.preferences.hybridCount < 1) {
        newErrors.push('Le nombre d\'alternatives hybrides doit être au moins 1');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (currentStep === 3 && !setupAnalysis && !loadingAnalysis) {
      const analyzeSetup = async () => {
        setLoadingAnalysis(true);
        try {
          const analysis = await aiStringService.analyzeSetup({
            racket: {
              brand: formData.racket.brand || '',
              model: formData.racket.model,
              details: formData.racket.details
            },
            currentStrings: formData.currentStrings
          });
          setSetupAnalysis(analysis);
        } catch (error) {
          console.error('Erreur lors de l\'analyse du setup:', error);
        } finally {
          setLoadingAnalysis(false);
        }
      };
      analyzeSetup();
    }
  }, [currentStep, formData, setupAnalysis, loadingAnalysis]);

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      onSubmit(formData);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="bg-white shadow-2xl max-w-4xl mx-auto overflow-hidden">
      <div className="bg-black text-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {t('profile.step')} {currentStep} {t('profile.of')} 3
          </h2>
          <span className="text-orange-500 font-bold text-xl">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-l-4 border-orange-600 pl-4">
              <h3 className="text-2xl font-black uppercase mb-2">{t('profile.yourEquipment')}</h3>
              <p className="text-gray-600">{t('profile.equipmentDesc')}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                  {t('profile.racketBrand')}
                </label>
                <select
                  className="w-full p-4 border-2 border-gray-300 hover:border-orange-500 focus:border-orange-600 focus:ring-0 transition-colors font-medium bg-white"
                  value={formData.racket.brand}
                  onChange={(e) => handleChange('racket.brand', e.target.value)}
                >
                  <option value="">{t('profile.selectBrand')}</option>
                  <option value="Babolat">Babolat</option>
                  <option value="Wilson">Wilson</option>
                  <option value="Head">Head</option>
                  <option value="Yonex">Yonex</option>
                  <option value="Prince">Prince</option>
                  <option value="Tecnifibre">Tecnifibre</option>
                  <option value="Dunlop">Dunlop</option>
                  <option value="Volkl">Volkl</option>
                  <option value="Pacific">Pacific</option>
                  <option value="Solinco">Solinco</option>
                  <option value="Autre">{t('profile.other')}</option>
                </select>

                {formData.racket.brand === 'Autre' && (
                  <input
                    type="text"
                    className="w-full p-4 border-2 border-gray-300 hover:border-orange-500 focus:border-orange-600 focus:ring-0 transition-colors font-medium mt-2"
                    placeholder={t('profile.enterBrandManually')}
                    onChange={(e) => handleChange('racket.brand', e.target.value)}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                  {t('profile.racketModel')}
                </label>
                {formData.racket.brand && formData.racket.brand !== 'Autre' && racketModels[formData.racket.brand] ? (
                  <div className="space-y-2">
                    <select
                      className="w-full p-4 border-2 border-gray-300 hover:border-orange-500 focus:border-orange-600 focus:ring-0 transition-colors font-medium bg-white"
                      value={formData.racket.model}
                      onChange={(e) => handleChange('racket.model', e.target.value)}
                    >
                      <option value="">{t('profile.selectModel')}</option>
                      {racketModels[formData.racket.brand].map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                      <option value="Autre">{t('profile.other')}</option>
                    </select>

                    {formData.racket.model === 'Autre' && (
                      <input
                        type="text"
                        className="w-full p-4 border-2 border-gray-300 hover:border-orange-500 focus:border-orange-600 focus:ring-0 transition-colors font-medium"
                        placeholder={t('profile.enterModelManually')}
                        onChange={(e) => handleChange('racket.model', e.target.value)}
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="w-full p-4 border-2 border-gray-300 hover:border-orange-500 focus:border-orange-600 focus:ring-0 transition-colors font-medium"
                    placeholder={formData.racket.brand ? t('profile.enterModelManually') : t('profile.selectBrandFirst')}
                    value={formData.racket.model}
                    onChange={(e) => handleChange('racket.model', e.target.value)}
                    disabled={!formData.racket.brand}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                  {t('profile.additionalDetails')}
                </label>
                <input
                  type="text"
                  className="w-full p-4 border-2 border-gray-300 hover:border-orange-500 focus:border-orange-600 focus:ring-0 transition-colors font-medium"
                  placeholder={t('profile.detailsPlaceholder')}
                  value={formData.racket.details}
                  onChange={(e) => handleChange('racket.details', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  {t('profile.currentStrings')}
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    className={`p-4 font-bold uppercase text-sm tracking-wide transition-all ${
                      formData.currentStrings.type === 'mono'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChange('currentStrings.type', 'mono')}
                  >
                    {t('profile.singleString')}
                  </button>
                  <button
                    type="button"
                    className={`p-4 font-bold uppercase text-sm tracking-wide transition-all ${
                      formData.currentStrings.type === 'hybrid'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChange('currentStrings.type', 'hybrid')}
                  >
                    {t('profile.hybridSetup')}
                  </button>
                </div>

                {formData.currentStrings.type === 'mono' && (
                  <div className="space-y-4">
                    <ComboBox
                      value={selectedStringBrand}
                      onChange={(value) => {
                        setSelectedStringBrand(value);
                        handleChange('currentStrings.mono', '');
                      }}
                      options={stringBrands}
                      placeholder="Marque du cordage (ex: Babolat, Luxilon...)"
                      allowCustom={true}
                    />
                    <ComboBox
                      value={formData.currentStrings.mono}
                      onChange={(value) => handleChange('currentStrings.mono', value)}
                      options={stringModels}
                      placeholder={t('profile.stringNamePlaceholder')}
                      allowCustom={true}
                    />
                    <TensionWheel
                      value={formData.currentStrings.monoTension}
                      onChange={(value) => handleChange('currentStrings.monoTension', value)}
                      min={15}
                      max={32}
                      step={0.5}
                      label={t('profile.tensionPlaceholder')}
                    />
                  </div>
                )}

                {formData.currentStrings.type === 'hybrid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase">{t('profile.mains')}</label>
                      <ComboBox
                        value={selectedMainBrand}
                        onChange={(value) => {
                          setSelectedMainBrand(value);
                          handleChange('currentStrings.hybridMain', '');
                        }}
                        options={stringBrands}
                        placeholder="Marque montants (ex: Luxilon...)"
                        allowCustom={true}
                      />
                      <ComboBox
                        value={formData.currentStrings.hybridMain}
                        onChange={(value) => handleChange('currentStrings.hybridMain', value)}
                        options={mainStringModels}
                        placeholder={t('profile.mainStringPlaceholder')}
                        allowCustom={true}
                      />
                      <TensionWheel
                        value={formData.currentStrings.hybridMainTension}
                        onChange={(value) => handleChange('currentStrings.hybridMainTension', value)}
                        min={15}
                        max={32}
                        step={0.5}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase">{t('profile.crosses')}</label>
                      <ComboBox
                        value={selectedCrossBrand}
                        onChange={(value) => {
                          setSelectedCrossBrand(value);
                          handleChange('currentStrings.hybridCross', '');
                        }}
                        options={stringBrands}
                        placeholder="Marque travers (ex: Wilson...)"
                        allowCustom={true}
                      />
                      <ComboBox
                        value={formData.currentStrings.hybridCross}
                        onChange={(value) => handleChange('currentStrings.hybridCross', value)}
                        options={crossStringModels}
                        placeholder={t('profile.crossStringPlaceholder')}
                        allowCustom={true}
                      />
                      <TensionWheel
                        value={formData.currentStrings.hybridCrossTension}
                        onChange={(value) => handleChange('currentStrings.hybridCrossTension', value)}
                        min={15}
                        max={32}
                        step={0.5}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-l-4 border-orange-600 pl-4">
              <h3 className="text-2xl font-black uppercase mb-2">Vos Préférences d'Alternatives</h3>
              <p className="text-gray-600">Personnalisez les recommandations selon vos besoins</p>
            </div>

            {/* Type d'alternatives */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Type d'alternatives souhaités <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`p-5 font-bold uppercase text-sm tracking-wide transition-all ${
                    formData.preferences.alternativeTypes.includes('mono')
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleAlternativeType('mono')}
                >
                  Mono-cordages
                </button>
                <button
                  type="button"
                  className={`p-5 font-bold uppercase text-sm tracking-wide transition-all ${
                    formData.preferences.alternativeTypes.includes('hybrid')
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleAlternativeType('hybrid')}
                >
                  Hybrides
                </button>
              </div>
            </div>

            {/* Nombre d'alternatives mono */}
            {formData.preferences.alternativeTypes.includes('mono') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Nombre d'alternatives mono-cordages (max 3)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`p-4 font-bold text-2xl transition-all ${
                        formData.preferences.monoCount === num
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleChange('preferences.monoCount', num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nombre d'alternatives hybrides */}
            {formData.preferences.alternativeTypes.includes('hybrid') && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Nombre d'alternatives hybrides (max 3)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`p-4 font-bold text-2xl transition-all ${
                        formData.preferences.hybridCount === num
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleChange('preferences.hybridCount', num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Marques préférées */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                Marques préférées (optionnel)
              </label>
              <p className="text-sm text-gray-600 mb-3">Sélectionnez les marques que vous souhaitez privilégier</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {stringBrands.sort().map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className={`p-3 text-sm font-medium transition-all ${
                      formData.preferences.preferredBrands.includes(brand)
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
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            {loadingAnalysis && (
              <TennisCourtAnimation />
            )}

            {!loadingAnalysis && setupAnalysis && (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 border-l-4 border-orange-600">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="h-6 w-6 text-orange-600" />
                  <h3 className="text-xl font-black uppercase">{t('profile.currentSetupAnalysis')}</h3>
                </div>

                <p className="text-gray-800 mb-4 font-medium italic">{setupAnalysis.analysis}</p>

                <div className="grid grid-cols-5 gap-2 text-center text-sm">
                  {[
                    { label: t('profile.power'), value: setupAnalysis.power },
                    { label: t('profile.control'), value: setupAnalysis.control },
                    { label: t('profile.spin'), value: setupAnalysis.spin },
                    { label: t('profile.comfort'), value: setupAnalysis.comfort },
                    { label: t('profile.durability'), value: setupAnalysis.durability }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white p-3">
                      <div className="font-bold text-xs text-gray-600 uppercase">{stat.label}</div>
                      <div className={`text-2xl font-black ${
                        stat.value >= 8 ? 'text-green-600' :
                        stat.value >= 6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        <div className="flex justify-between pt-6 border-t-2 border-gray-200">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-8 py-4 bg-gray-200 text-gray-900 font-bold uppercase text-sm hover:bg-gray-300 transition-colors"
            >
              {t('profile.backButton')}
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={loadingAnalysis}
              className="px-8 py-4 bg-black text-white font-bold uppercase text-sm hover:bg-gray-900 transition-colors ml-auto disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loadingAnalysis ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('profile.analyzing')}</span>
                </>
              ) : (
                <>
                  <span>{t('profile.next')}</span>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loadingAnalysis}
              className="px-8 py-4 bg-orange-600 text-white font-black uppercase text-sm hover:bg-orange-700 transition-colors ml-auto disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>{t('profile.getRecommendations')}</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PlayerProfile;
