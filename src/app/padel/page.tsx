import type { Metadata } from 'next'
import PadelPage from '@/src/views/PadelPage'

export const metadata: Metadata = {
  title: 'Raquette Padel — Trouve ta raquette idéale',
  description:
    '7 questions, 59 raquettes analysées sur 5 dimensions. Trouve ta raquette de padel idéale selon ton niveau, ton style et ton budget.',
}

export default function Page() {
  return <PadelPage />
}
