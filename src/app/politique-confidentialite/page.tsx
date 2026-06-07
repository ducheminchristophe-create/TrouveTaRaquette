import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Comment TrouveTaRaquette traite tes données personnelles.',
  robots: { index: false },
}

export default function PolitiqueConfidentialite() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 prose prose-gray">
      <h1 className="text-2xl font-black uppercase text-black mb-8">Politique de confidentialité</h1>

      <p className="text-gray-500 text-sm mb-8">Dernière mise à jour : [À compléter]</p>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Données collectées</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          TrouveTaRaquette ne collecte <strong>aucune donnée personnelle</strong> lors du
          questionnaire de recommandation. Aucun compte n&apos;est requis.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed mt-2">
          Si tu choisis de renseigner ton adresse e-mail (formulaire de capture optionnel),
          elle est transmise à notre prestataire d&apos;emailing
          [Brevo / Mailchimp / autre — <em>À préciser</em>] et utilisée uniquement pour
          t&apos;envoyer les informations demandées.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Cookies et traceurs</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Ce site n&apos;utilise <strong>aucun cookie publicitaire</strong>. Si des analytics
          sont activés, ils sont configurés en mode sans cookie et conformes au RGPD
          (voir notre <a href="/cookies" className="underline">politique cookies</a>).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Tes droits (RGPD)</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification et
          de suppression de tes données. Pour l&apos;exercer : [adresse e-mail — À compléter].
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">Liens d&apos;affiliation</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Les clics sur les liens sortants peuvent être tracés par les marchands partenaires
          (Décathlon, Amazon, etc.) conformément à leurs propres politiques de confidentialité.
        </p>
      </section>
    </div>
  )
}
