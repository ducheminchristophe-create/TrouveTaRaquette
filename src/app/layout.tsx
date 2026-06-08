import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import Nav from '@/src/components/Nav'
import Footer from '@/src/components/Footer'
import JsonLd from '@/src/components/JsonLd'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/src/lib/site'

export const metadata: Metadata = {
  title: {
    default: 'TrouveTaRaquette — Trouve ta raquette padel, badminton & cordage tennis',
    template: '%s | TrouveTaRaquette',
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  keywords: [
    'raquette padel', 'raquette badminton', 'raquette ping-pong', 'cordage tennis',
    'choisir sa raquette', 'recommandation raquette', 'quelle raquette padel',
    'meilleure raquette débutant', 'comparateur raquette', 'TrouveTaRaquette',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    siteName: SITE_NAME,
    title: 'TrouveTaRaquette — La raquette qui te correspond vraiment',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TrouveTaRaquette' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrouveTaRaquette — La raquette qui te correspond vraiment',
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export const viewport: Viewport = {
  themeColor: '#F97316',
}

/** Données structurées globales : organisation + site web. */
const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  description: SITE_DESCRIPTION,
}

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'fr-FR',
  description: SITE_DESCRIPTION,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <JsonLd data={[orgJsonLd, siteJsonLd]} />
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
