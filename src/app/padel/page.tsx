import type { Metadata } from 'next'
import PadelPage from '@/src/views/PadelPage'
import JsonLd from '@/src/components/JsonLd'
import { buildSportJsonLd } from '@/src/lib/seo'

const DESCRIPTION =
  '7 questions, 59 raquettes analysées sur 5 dimensions (puissance, contrôle, maniabilité, confort, effet). Trouve ta raquette de padel idéale selon ton niveau, ton style et ton budget — gratuit et sans inscription.'

export const metadata: Metadata = {
  title: 'Raquette Padel — Trouve ta raquette idéale',
  description: DESCRIPTION,
  alternates: { canonical: '/padel' },
  openGraph: { title: 'Raquette Padel — Trouve ta raquette idéale', description: DESCRIPTION, url: '/padel' },
}

export default function Page() {
  return (
    <>
      <JsonLd data={buildSportJsonLd({ name: 'Raquette Padel', path: '/padel', description: DESCRIPTION })} />
      <PadelPage />
    </>
  )
}
