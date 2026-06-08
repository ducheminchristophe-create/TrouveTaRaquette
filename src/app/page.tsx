import type { Metadata } from 'next'
import HomePage from '@/src/views/HomePage'
import JsonLd from '@/src/components/JsonLd'
import { FAQ } from '@/src/lib/faq'

export const metadata: Metadata = {
  title: 'TrouveTaRaquette — Trouve ta raquette padel, badminton & cordage tennis',
  description:
    'En 2 minutes, réponds à quelques questions. Notre moteur à règles transparent te recommande la raquette ou le cordage faits pour toi — padel, badminton, ping-pong, cordage tennis. Gratuit et indépendant.',
  alternates: { canonical: '/' },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function Page() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <HomePage />
    </>
  )
}
