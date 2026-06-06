import type { Metadata } from 'next'
import TennisPage from '@/src/views/TennisPage'

export const metadata: Metadata = {
  title: 'Cordage Tennis — Conseiller IA personnalisé',
  description:
    'Raquette, setup actuel, niveau, style de jeu : notre IA analyse ton profil et te recommande les meilleurs cordages mono et hybrides pour ton jeu.',
}

export default function Page() {
  return <TennisPage />
}
