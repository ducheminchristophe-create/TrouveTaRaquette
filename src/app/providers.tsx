'use client'

import { LanguageProvider } from '@/src/contexts/LanguageContext'
import { ConsentProvider } from '@/src/contexts/ConsentContext'
import CookieConsent from '@/src/components/CookieConsent'
import AnalyticsGate from '@/src/components/AnalyticsGate'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <LanguageProvider>
        {children}
        <CookieConsent />
        <AnalyticsGate />
      </LanguageProvider>
    </ConsentProvider>
  )
}
