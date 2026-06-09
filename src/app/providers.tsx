'use client'

import { LanguageProvider } from '@/src/contexts/LanguageContext'
import { ConsentProvider } from '@/src/contexts/ConsentContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ConsentProvider>
  )
}
