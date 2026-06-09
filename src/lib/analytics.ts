/**
 * analytics.ts — suivi d'événements GELÉ par le consentement.
 * track() ne fait STRICTEMENT rien tant que l'utilisateur n'a pas accepté la
 * mesure d'audience (consent.analytics === true). Aucune donnée personnelle.
 */
import { track as vercelTrack } from '@vercel/analytics'
import { analyticsConsentGiven } from './consent'

export type TtrEvent = 'quiz_start' | 'quiz_complete' | 'affiliate_click'

export function track(event: TtrEvent, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return
  if (!analyticsConsentGiven()) return // gelé tant que pas de consentement
  try {
    vercelTrack(event, props)
  } catch {
    /* silencieux — ne jamais casser le parcours pour de l'analytics */
  }
}
