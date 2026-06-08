import type { Metadata } from 'next'
import BadmintonPage from '@/src/views/BadmintonPage'
import JsonLd from '@/src/components/JsonLd'
import { buildSportJsonLd } from '@/src/lib/seo'

const DESCRIPTION =
  '8 questions, 47 raquettes analysées sur 5 dimensions (puissance, vitesse, répulsion, contrôle, confort). Tête lourde ou tête légère ? Trouve ta raquette de badminton selon ton jeu — gratuit et sans inscription.'

export const metadata: Metadata = {
  title: 'Raquette Badminton — Trouve ta raquette idéale',
  description: DESCRIPTION,
  alternates: { canonical: '/badminton' },
  openGraph: { title: 'Raquette Badminton — Trouve ta raquette idéale', description: DESCRIPTION, url: '/badminton' },
}

export default function Page() {
  return (
    <>
      <JsonLd data={buildSportJsonLd({ name: 'Raquette Badminton', path: '/badminton', description: DESCRIPTION })} />
      <BadmintonPage />
    </>
  )
}
