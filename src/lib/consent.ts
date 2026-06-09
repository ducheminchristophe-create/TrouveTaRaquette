/**
 * consent.ts — gestion du consentement RGPD (sans dépendance React).
 *
 * Tant qu'aucun choix n'est enregistré (getConsent() === null), AUCUN cookie non
 * essentiel ni script analytics ne doit se charger. Le choix est stocké à la fois
 * dans localStorage et dans un cookie 1ʳᵉ partie (versionné, ~12 mois).
 */

export const CONSENT_KEY = 'ttr_consent'
export const CONSENT_VERSION = 1
const MAX_AGE_DAYS = 365

export interface ConsentState {
  analytics: boolean
  marketing: boolean
  ts: number
  version: number
}

/* ------------------------------------------------------------------ */
/* Lecture / écriture                                                  */
/* ------------------------------------------------------------------ */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function parse(raw: string | null): ConsentState | null {
  if (!raw) return null
  try {
    const c = JSON.parse(raw) as ConsentState
    // Choix obsolète si la version a changé → on redemande
    if (!c || typeof c.analytics !== 'boolean' || c.version !== CONSENT_VERSION) return null
    return c
  } catch {
    return null
  }
}

/** Renvoie le consentement enregistré, ou null si l'utilisateur n'a pas encore choisi. */
export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  // localStorage prioritaire, repli sur le cookie
  return parse(window.localStorage.getItem(CONSENT_KEY)) ?? parse(readCookie(CONSENT_KEY))
}

/** Enregistre le choix (localStorage + cookie) et notifie l'app. */
export function setConsent(partial: { analytics: boolean; marketing: boolean }): ConsentState {
  const state: ConsentState = {
    analytics: partial.analytics,
    marketing: partial.marketing,
    ts: Date.now(),
    version: CONSENT_VERSION,
  }
  const value = JSON.stringify(state)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CONSENT_KEY, value)
    document.cookie =
      `${CONSENT_KEY}=${encodeURIComponent(value)};path=/;max-age=${MAX_AGE_DAYS * 86400};SameSite=Lax`
    // Notifie les abonnés (contexte React, analytics…)
    window.dispatchEvent(new CustomEvent('ttr-consent-change', { detail: state }))
  }
  return state
}

/* ------------------------------------------------------------------ */
/* Helpers métier                                                      */
/* ------------------------------------------------------------------ */

/** true uniquement si l'utilisateur a accepté la catégorie analytics. */
export function analyticsConsentGiven(): boolean {
  return getConsent()?.analytics === true
}

/** true uniquement si l'utilisateur a accepté la catégorie affiliation/marketing. */
export function affiliateConsentGiven(): boolean {
  return getConsent()?.marketing === true
}
