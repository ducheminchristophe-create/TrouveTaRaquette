'use client'

import { LanguageProvider } from '@/src/contexts/LanguageContext'
import { ConsentProvider } from '@/src/contexts/ConsentContext'
import CookieConsent from '@/src/components/CookieConsent'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <LanguageProvider>
        {children}
        <CookieConsent />
      </LanguageProvider>
    </ConsentProvider>
  )
}
