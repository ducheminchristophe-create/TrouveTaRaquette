import type { Metadata } from 'next'
import HomePage from '@/src/views/HomePage'

export const metadata: Metadata = {
  title: 'TrouveTaRaquette — Trouve ta raquette padel, badminton & cordage tennis',
  description:
    'En 2 minutes, réponds à quelques questions. Notre moteur à règles transparent te recommande la raquette ou le cordage faits pour toi — sans bullshit marketing.',
}

export default function Page() {
  return <HomePage />
}
