import type { Metadata } from 'next'
import TennisHubPage from '@/src/views/TennisHubPage'

export const metadata: Metadata = {
  title: 'Tennis — Raquette et Cordage personnalisés | TrouveTaRaquette',
  description: 'Trouve ta raquette idéale parmi 222 modèles ou reçois des recommandations de cordage personnalisées selon ton profil de joueur.',
  alternates: { canonical: '/tennis' },
}

export default function Page() {
  return <TennisHubPage />
}
