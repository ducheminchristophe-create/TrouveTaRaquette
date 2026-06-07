import type { Metadata } from 'next'
import PingPongPage from '@/src/views/PingPongPage'

export const metadata: Metadata = {
  title: 'Raquette Ping-Pong — Trouve ta raquette de tennis de table',
  description:
    '6 questions, raquettes pré-assemblées analysées sur 3 dimensions : vitesse, effet, contrôle. Trouve ta raquette de ping-pong selon ton niveau, ton style et ton budget.',
}

export default function Page() {
  return <PingPongPage />
}
