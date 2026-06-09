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
        <h2 className="text-lg font-bold text-black mb-3">Cookies nécessaires</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Des cookies strictement nécessaires au fonctionnement du site (mémorisation de ton
          choix de consentement) peuvent être déposés. Ils ne contiennent aucune donnée
          personnelle et sont toujours actifs.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Mesure d&apos;audience</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Nous utilisons <strong>Vercel Web Analytics</strong>, un outil de mesure d&apos;audience{' '}
          <strong>sans cookie</strong> et respectueux de la vie privée (données agrégées, aucun
          profilage publicitaire). Il n&apos;est chargé <strong>que si tu acceptes</strong> la
          catégorie « Mesure d&apos;audience » dans le bandeau de consentement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Affiliation / marketing</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Lorsque tu cliques sur un lien vers un marchand partenaire (Décathlon, Amazon,
          Smashinn…), un paramètre de suivi d&apos;affiliation peut être ajouté à l&apos;URL pour nous
          permettre de percevoir une commission, sans surcoût pour toi. Ces paramètres ne sont
          ajoutés <strong>que si tu acceptes</strong> la catégorie « Affiliation/marketing ».
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Ton consentement</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Tu peux accepter, refuser ou personnaliser ces catégories à tout moment via le bandeau,
          ou le lien <strong>« Gérer les cookies »</strong> en pied de page. Tant qu&apos;aucun choix
          n&apos;est fait, aucun cookie non essentiel ni outil de mesure n&apos;est activé.
        </p>
      </section>
    </div>
  )
}
