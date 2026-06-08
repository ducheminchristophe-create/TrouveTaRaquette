import type { Metadata } from 'next'
import PingPongPage from '@/src/views/PingPongPage'
import JsonLd from '@/src/components/JsonLd'
import { buildSportJsonLd } from '@/src/lib/seo'

const DESCRIPTION =
  '6 questions, raquettes de tennis de table pré-assemblées analysées sur 3 dimensions (vitesse, effet, contrôle). Trouve ta raquette de ping-pong selon ton niveau, ton style et ton budget — gratuit et sans inscription.'

export const metadata: Metadata = {
  title: 'Raquette Ping-Pong — Trouve ta raquette de tennis de table',
  description: DESCRIPTION,
  alternates: { canonical: '/ping-pong' },
  openGraph: { title: 'Raquette Ping-Pong — Trouve ta raquette de tennis de table', description: DESCRIPTION, url: '/ping-pong' },
}

export default function Page() {
  return (
    <>
      <JsonLd data={buildSportJsonLd({ name: 'Raquette Ping-Pong', path: '/ping-pong', description: DESCRIPTION })} />
      <PingPongPage />
    </>
  )
}
