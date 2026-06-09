'use client'

/**
 * AnalyticsGate — ne monte le script Vercel Web Analytics QUE si l'utilisateur
 * a accepté la mesure d'audience. Vercel Web Analytics est sans cookie, mais on
 * le gèle quand même derrière le consentement pour respecter le choix de l'utilisateur.
 */
import { Analytics } from '@vercel/analytics/react'
import { useConsent } from '@/src/contexts/ConsentContext'

export default function AnalyticsGate() {
  const { consent } = useConsent()
  if (consent?.analytics !== true) return null
  return <Analytics />
}
