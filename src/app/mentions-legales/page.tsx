import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de TrouveTaRaquette.',
  robots: { index: false },
}

export default function MentionsLegales() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 prose prose-gray">
      <h1 className="text-2xl font-black uppercase text-black mb-8">Mentions légales</h1>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Éditeur du site</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          <strong>Nom / Raison sociale :</strong> [À compléter]<br />
          <strong>Forme juridique :</strong> [À compléter]<br />
          <strong>SIRET :</strong> [À compléter]<br />
          <strong>Adresse :</strong> [À compléter]<br />
          <strong>E-mail :</strong> [À compléter]<br />
          <strong>Directeur de la publication :</strong> [À compléter]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Hébergement</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ce site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133,
          Covina, CA 91723, États-Unis — <a href="https://vercel.com" className="underline">vercel.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Propriété intellectuelle</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          L&apos;ensemble du contenu de ce site (textes, code, données) est protégé par le droit
          d&apos;auteur. Toute reproduction sans autorisation est interdite.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Liens d&apos;affiliation</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Certains liens vers des marchands partenaires sont des liens d&apos;affiliation.
          TrouveTaRaquette peut percevoir une commission sur les achats effectués via ces liens,
          sans coût supplémentaire pour toi. Cela ne biaise pas nos recommandations,
          qui restent basées exclusivement sur les caractéristiques techniques des produits.
        </p>
      </section>
    </div>
  )
}
