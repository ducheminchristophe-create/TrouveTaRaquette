'use client'

import { useConsent } from '@/src/contexts/ConsentContext'

/** Lien « Gérer les cookies » — rouvre le panneau de consentement. */
export default function ManageCookiesButton() {
  const { reopen } = useConsent()
  return (
    <button
      onClick={reopen}
      className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
    >
      Gérer les cookies
    </button>
  )
}
