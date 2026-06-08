import type { Metadata } from 'next'
import TennisPage from '@/src/views/TennisPage'
import JsonLd from '@/src/components/JsonLd'
import { buildSportJsonLd } from '@/src/lib/seo'

const DESCRIPTION =
  'Raquette, setup actuel, niveau, style de jeu : notre conseiller IA analyse ton profil et te recommande les meilleurs cordages tennis (mono et hybrides) pour ton jeu — gratuit et sans inscription.'

export const metadata: Metadata = {
  title: 'Cordage Tennis — Conseiller IA personnalisé',
  description: DESCRIPTION,
  alternates: { canonical: '/tennis' },
  openGraph: { title: 'Cordage Tennis — Conseiller IA personnalisé', description: DESCRIPTION, url: '/tennis' },
}

export default function Page() {
  return (
    <>
      <JsonLd data={buildSportJsonLd({ name: 'Cordage Tennis', path: '/tennis', description: DESCRIPTION })} />
      <TennisPage />
    </>
  )
}
