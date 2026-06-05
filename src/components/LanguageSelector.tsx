'use client'

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-5 w-5 text-orange-500" />
      <button
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 text-sm font-bold uppercase transition-all ${
          language === 'fr'
            ? 'bg-orange-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-bold uppercase transition-all ${
          language === 'en'
            ? 'bg-orange-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;
