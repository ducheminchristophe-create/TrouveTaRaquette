import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent"></div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src="/TennisTuner.jpeg"
              alt="TennisTuner Logo"
              className="h-32 w-32 object-contain"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-4xl font-black tracking-tight">
                  <span className="uppercase">T</span>
                  <span className="lowercase">ennis</span>
                  <span className="uppercase">T</span>
                  <span className="lowercase">uner</span>
                </h1>
                <span className="text-orange-500 text-sm font-bold uppercase tracking-wide px-2 py-1 border border-orange-500 rounded">
                  Version Bêta
                </span>
              </div>
              <p className="text-gray-400 text-sm font-medium tracking-wide uppercase mt-1">
                {t('header.subtitle')}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <LanguageSelector />
            <div className="text-right">
              <div className="text-orange-500 font-black text-3xl">{t('header.aiPowered') === 'Powered' ? 'AI' : 'IA'}</div>
              <div className="text-gray-400 text-xs uppercase tracking-wider">{t('header.aiPowered')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600"></div>
    </header>
  );
};

export default Header;
