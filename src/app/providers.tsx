'use client'

import { LanguageProvider } from '@/src/contexts/LanguageContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}
