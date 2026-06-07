import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions générales d\'utilisation',
  description: 'CGU de TrouveTaRaquette.',
  robots: { index: false },
}

export default function CGU() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 prose prose-gray">
      <h1 className="text-2xl font-black uppercase text-black mb-8">
        Conditions générales d&apos;utilisation
      </h1>

      <p className="text-gray-500 text-sm mb-8">Dernière mise à jour : [À compléter]</p>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">1. Objet</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          TrouveTaRaquette est un outil gratuit de recommandation de raquettes de sport
          (padel, badminton) et de cordages tennis. Il est fourni à titre indicatif,
          sans garantie d&apos;exhaustivité ni de mise à jour des prix.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">2. Recommandations</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Les recommandations sont générées par un moteur à règles basé sur des
          caractéristiques techniques publiques. Elles ne remplacent pas l&apos;avis d&apos;un
          professionnel. Les prix affichés sont indicatifs et peuvent varier.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">3. Liens d&apos;affiliation</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Certains liens sont des liens d&apos;affiliation (voir mentions légales).
          TrouveTaRaquette n&apos;est pas responsable des achats effectués sur les sites partenaires.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-black mb-3">4. Limitation de responsabilité</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          TrouveTaRaquette ne saurait être tenu responsable des dommages directs ou
          indirects résultant de l&apos;utilisation de ses recommandations.
        </p>
      </section>
    </div>
  )
}
