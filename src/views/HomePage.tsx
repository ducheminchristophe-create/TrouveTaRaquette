import React from 'react';
import Link from 'next/link';
import { FAQ } from '@/src/lib/faq';

const MODULES = [
  {
    to: '/tennis/raquette',
    emoji: '🎾',
    name: 'Raquette Tennis',
    tagline: 'La raquette faite pour toi',
    desc: '20 questions, 222 raquettes analysées sur 8 dimensions : puissance, contrôle, spin, confort, maniabilité, stabilité, tolérance, précision.',
    cta: 'Trouver ma raquette',
    ready: true,
    badge: 'NOUVEAU',
  },
  {
    to: '/tennis',
    emoji: '🧵',
    name: 'Cordage Tennis',
    tagline: 'Le bon cordage pour ton jeu',
    desc: 'Profil joueur + analyse IA de ton setup actuel → recommandations mono et hybrides personnalisées.',
    cta: 'Trouver mon cordage',
    ready: true,
    badge: 'IA',
  },
  {
    to: '/padel',
    emoji: '🟢',
    name: 'Raquette Padel',
    tagline: 'La raquette faite pour toi',
    desc: '7 questions, 59 raquettes analysées sur 5 dimensions : puissance, contrôle, maniabilité, confort, effet.',
    cta: 'Trouver ma raquette',
    ready: true,
    badge: null,
  },
  {
    to: '/badminton',
    emoji: '🏸',
    name: 'Raquette Badminton',
    tagline: 'Tête lourde ou tête légère ?',
    desc: '8 questions, 47 raquettes analysées sur 5 dimensions : puissance, vitesse, répulsion, contrôle, confort.',
    cta: 'Trouver ma raquette',
    ready: true,
    badge: null,
  },
  {
    to: '/ping-pong',
    emoji: '🏓',
    name: 'Raquette Ping-Pong',
    tagline: 'Vitesse, effet ou contrôle ?',
    desc: '6 questions, raquettes pré-assemblées analysées sur 3 dimensions : vitesse, effet, contrôle.',
    cta: 'Trouver ma raquette',
    ready: true,
    badge: null,
  },
] as const;

const HomePage: React.FC = () => (
  <main className="max-w-5xl mx-auto px-6 py-16">
    {/* Hero */}
    <div className="text-center mb-14">
      <h1 className="text-4xl md:text-5xl font-black uppercase text-black tracking-tight mb-4">
        La raquette qui te<br className="hidden sm:block" /> correspond <span className="text-orange-500">vraiment</span>
      </h1>
      <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
        Un moteur de recommandation à règles, 100&nbsp;% explicable.
        Pas de pub, pas de boîte noire — juste le bon match entre toi et ton matériel.
      </p>
    </div>

    {/* Cards modules */}
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Modules disponibles">
      {MODULES.map((m) => (
        <li key={m.to}>
          <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-300 transition-colors p-6 h-full flex flex-col gap-4 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-4xl" aria-hidden="true">{m.emoji}</span>
              {m.badge && (
                <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                  {m.badge}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-black mb-0.5">{m.name}</h2>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-2">{m.tagline}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
            </div>
            <Link
              href={m.to}
              className="mt-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label={`${m.cta} — ${m.name}`}
            >
              {m.cta} →
            </Link>
          </div>
        </li>
      ))}
    </ul>

    {/* Différenciateur */}
    <div className="mt-16 border-t border-gray-100 pt-12 grid sm:grid-cols-3 gap-8 text-center text-sm text-gray-500">
      <div>
        <p className="text-2xl font-black text-black mb-1">100%</p>
        <p>explicable — chaque reco montre pourquoi</p>
      </div>
      <div>
        <p className="text-2xl font-black text-black mb-1">4 sports</p>
        <p>tennis · padel · badminton · ping-pong</p>
      </div>
      <div>
        <p className="text-2xl font-black text-black mb-1">0 inscription</p>
        <p>résultats immédiats, sans compte</p>
      </div>
    </div>

    {/* FAQ (contenu rendu côté serveur, utile au SEO et aux IA) */}
    <section className="mt-16 border-t border-gray-100 pt-12" aria-labelledby="faq-title">
      <h2 id="faq-title" className="text-2xl font-black uppercase text-black tracking-tight mb-6 text-center">
        Questions fréquentes
      </h2>
      <dl className="max-w-2xl mx-auto divide-y divide-gray-100">
        {FAQ.map(({ q, a }) => (
          <div key={q} className="py-4">
            <dt className="font-bold text-gray-900">{q}</dt>
            <dd className="mt-1 text-gray-500 text-sm leading-relaxed">{a}</dd>
          </div>
        ))}
      </dl>
    </section>
  </main>
);

export default HomePage;
