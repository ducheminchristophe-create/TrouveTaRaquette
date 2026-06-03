import React from 'react';
import { Award, TrendingUp, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-black text-white py-16 mt-24 border-t-4 border-orange-600">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="text-center">
            <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-lg uppercase mb-2">{t('footer.expertAnalysis')}</h3>
            <p className="text-gray-400 text-sm font-medium">
              {t('footer.expertAnalysisDesc')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-lg uppercase mb-2">{t('footer.performance')}</h3>
            <p className="text-gray-400 text-sm font-medium">
              {t('footer.performanceDesc')}
            </p>
          </div>

          <div className="text-center">
            <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-lg uppercase mb-2">{t('footer.instantResults')}</h3>
            <p className="text-gray-400 text-sm font-medium">
              {t('footer.instantResultsDesc')}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            &copy; 2025 TennisTuner. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
