'use client'

/**
 * ConsentContext — expose l'état de consentement à toute l'app via useConsent().
 * S'appuie sur src/lib/consent.ts pour le stockage.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  type ConsentState,
  getConsent,
  setConsent as persistConsent,
} from '@/src/lib/consent'

interface ConsentContextValue {
  /** null = l'utilisateur n'a pas encore choisi (le bandeau doit s'afficher). */
  consent: ConsentState | null
  /** true une fois la valeur initiale lue côté client (évite le flash SSR). */
  ready: boolean
  acceptAll: () => void
  rejectAll: () => void
  save: (choice: { analytics: boolean; marketing: boolean }) => void
  /** Rouvrir le panneau de réglages (ex. depuis le footer). */
  reopen: () => void
  settingsOpen: boolean
  closeSettings: () => void
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined)

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState | null>(null)
  const [ready, setReady] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    setConsentState(getConsent())
    setReady(true)
    // Synchronise si le choix change ailleurs (autre onglet, helper direct)
    const onChange = (e: Event) => setConsentState((e as CustomEvent<ConsentState>).detail)
    window.addEventListener('ttr-consent-change', onChange)
    return () => window.removeEventListener('ttr-consent-change', onChange)
  }, [])

  const save = useCallback((choice: { analytics: boolean; marketing: boolean }) => {
    setConsentState(persistConsent(choice))
    setSettingsOpen(false)
  }, [])

  const acceptAll = useCallback(() => save({ analytics: true, marketing: true }), [save])
  const rejectAll = useCallback(() => save({ analytics: false, marketing: false }), [save])
  const reopen = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  return (
    <ConsentContext.Provider
      value={{ consent, ready, acceptAll, rejectAll, save, reopen, settingsOpen, closeSettings }}
    >
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent doit être utilisé dans un ConsentProvider')
  return ctx
}
