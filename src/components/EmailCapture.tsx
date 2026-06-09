'use client'

/**
 * EmailCapture — optin e-mail OPTIONNEL en bas de la page de résultats.
 * L'accès aux résultats reste libre et immédiat : on ne force jamais l'inscription.
 * Conforme RGPD : consentement explicite (case non pré-cochée), honeypot anti-bot,
 * validation client + serveur, et la clé ESP reste côté serveur (/api/subscribe).
 */
import React, { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Props {
  /** Contexte ("padel", "badminton", "ping-pong", "cordage tennis"). */
  sport: string
  /** Noms des 3 raquettes recommandées (pour les attributs ESP). */
  rackets?: string[]
}

export default function EmailCapture({ sport, rackets = [] }: Props) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('') // honeypot (doit rester vide)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) {
      setError('Adresse e-mail invalide.')
      return
    }
    if (!consent) {
      setError('Merci de cocher la case de consentement.')
      return
    }
    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sport,
          consent: true,
          rackets: rackets.slice(0, 3),
          ts: Date.now(),
          website, // honeypot
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      setStatus('success')
    } catch {
      setStatus('error')
      setError('Une erreur est survenue. Réessaie dans quelques instants.')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />
        <p className="text-sm text-emerald-800 font-medium">
          C&apos;est envoyé, vérifie ta boîte mail (pense aux spams) !
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-200">
      <div className="flex items-start gap-3 mb-4">
        <Mail className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-bold text-gray-900">
            Reçois ta sélection {sport} par e-mail <span className="font-normal text-gray-400">(optionnel)</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Tes résultats restent accessibles ici. Si tu veux les garder sous la main, on te les envoie.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* Honeypot anti-bot : invisible, ne pas remplir */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="ttr-website">Ne pas remplir</label>
          <input
            id="ttr-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={e => setWebsite(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="email-capture" className="sr-only">Adresse e-mail</label>
          <input
            id="email-capture"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ton@email.com"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 whitespace-nowrap"
          >
            {status === 'loading' ? 'Envoi…' : 'Recevoir ma sélection'}
          </button>
        </div>

        {/* Consentement explicite — case NON pré-cochée */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-orange-500 shrink-0"
          />
          <span className="text-xs text-gray-500 leading-relaxed">
            J&apos;accepte de recevoir ma sélection et des conseils par e-mail. Désinscription à tout moment.{' '}
            <a href="/politique-confidentialite" className="underline hover:text-gray-700">
              Politique de confidentialité
            </a>.
          </span>
        </label>

        {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
      </form>
    </div>
  )
}
