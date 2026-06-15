import type { Metadata } from 'next'
import TennisRacketPage from '@/src/views/TennisRacketPage'
import JsonLd from '@/src/components/JsonLd'
import { buildSportJsonLd } from '@/src/lib/seo'

const DESCRIPTION =
  'Réponds à 20 questions sur ton niveau, ton style de jeu et tes préférences : notre algorithme analyse 222 raquettes tennis et te recommande les modèles parfaits pour toi — gratuit et sans inscription.'

export const metadata: Metadata = {
  title: 'Trouve ta Raquette Tennis — Conseiller personnalisé 222 modèles',
  description: DESCRIPTION,
  alternates: { canonical: '/tennis/raquette' },
  openGraph: {
    title: 'Trouve ta Raquette Tennis — Conseiller personnalisé',
    description: DESCRIPTION,
    url: '/tennis/raquette',
  },
}

export default function Page() {
  return (
    <>
      <JsonLd data={buildSportJsonLd({ name: 'Raquette Tennis', path: '/tennis/raquette', description: DESCRIPTION })} />
      <TennisRacketPage />
    </>
  )
}
