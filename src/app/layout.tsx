import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import Nav from '@/src/components/Nav'
import Footer from '@/src/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'TrouveTaRaquette — Trouve ta raquette padel, badminton & cordage tennis',
    template: '%s | TrouveTaRaquette',
  },
  description:
    'Recommandation de raquettes de padel, badminton et de cordages tennis en 2 minutes. Moteur à règles 100 % transparent, indépendant et gratuit.',
  metadataBase: new URL('https://trouvetaraquette.com'),
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    siteName: 'TrouveTaRaquette',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#F97316',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
