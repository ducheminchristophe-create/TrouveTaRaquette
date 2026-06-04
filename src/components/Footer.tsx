import React from 'react';
import { ShieldCheck, Zap, BookOpen } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="bg-black text-white py-12 mt-16 border-t-4 border-orange-600">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        <div className="text-center">
          <div className="bg-orange-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="h-7 w-7 text-white" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <h3 className="font-black text-base uppercase mb-1">Moteur à règles</h3>
          <p className="text-gray-400 text-sm">
            Chaque recommandation s'explique. Aucune boîte noire, aucun algorithme opaque.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-orange-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="h-7 w-7 text-white" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <h3 className="font-black text-base uppercase mb-1">Indépendant</h3>
          <p className="text-gray-400 text-sm">
            Pas de marque sponsorisée, pas de mise en avant payante. Juste le bon match.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-orange-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="h-7 w-7 text-white" strokeWidth={2.5} aria-hidden="true" />
          </div>
          <h3 className="font-black text-base uppercase mb-1">2 minutes chrono</h3>
          <p className="text-gray-400 text-sm">
            Quelques questions, et tu as ta raquette. Aucune inscription requise.
          </p>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-6 text-center">
        <p className="text-gray-500 text-sm uppercase tracking-wider">
          &copy; 2025 TrouveTaRaquette. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
