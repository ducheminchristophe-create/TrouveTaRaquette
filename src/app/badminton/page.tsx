import type { Metadata } from 'next'
import BadmintonPage from '@/src/views/BadmintonPage'

export const metadata: Metadata = {
  title: 'Raquette Badminton — Trouve ta raquette idéale',
  description:
    '8 questions, 47 raquettes analysées sur 5 dimensions. Tête lourde ou légère ? Notre moteur te guide en 2 minutes selon ton jeu.',
}

export default function Page() {
  return <BadmintonPage />
}
