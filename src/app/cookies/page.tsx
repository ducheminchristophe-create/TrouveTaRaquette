import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique cookies',
  description: 'Utilisation des cookies sur TrouveTaRaquette.',
  robots: { index: false },
}

export default function Cookies() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 prose prose-gray">
      <h1 className="text-2xl font-black uppercase text-black mb-8">Politique cookies</h1>

      <p className="text-gray-500 text-sm mb-8">Dernière mise à jour : [À compléter]</p>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Pas de cookies publicitaires</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          TrouveTaRaquette ne dépose <strong>aucun cookie publicitaire ou de tracking</strong>
          sur ton navigateur.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Analytics (si activé)</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Si des statistiques de visite sont collectées, elles le sont via un outil
          respectueux de la vie privée (ex. Plausible Analytics), configuré sans
          dépôt de cookie et sans transfert de données hors UE. Aucun consentement
          n&apos;est requis dans ce cas (Lignes directrices CNIL).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Cookies techniques</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Des cookies strictement nécessaires au fonctionnement du site (session Next.js)
          peuvent être déposés. Ils ne contiennent aucune donnée personnelle.
        </p>
      </section>
    </div>
  )
}
