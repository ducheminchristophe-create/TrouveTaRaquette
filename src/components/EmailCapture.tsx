'use client'

/**
 * EmailCapture — optin e-mail discret en bas de la page de résultats.
 * Intègre avec n'importe quel service via NEXT_PUBLIC_EMAIL_API_URL
 * (Brevo, Mailchimp, Loops, ConvertKit…).
 * Aucun compte requis pour l'utilisateur.
 */
import React, { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface Props {
  /** Contexte affiché dans le message ("padel", "badminton", "cordage tennis") */
  sport: string
}

export default function EmailCapture({ sport }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  // Si aucune URL configurée, on masque le composant silencieusement
  const apiUrl = process.env.NEXT_PUBLIC_EMAIL_API_URL
  if (!apiUrl) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Adresse e-mail invalide.')
      return
    }
    setStatus('loading')
    setError('')

    try {
      const res = await fetch(apiUrl as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sport,
          source: 'trouvetaraquette-results',
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
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
          C&apos;est noté ! On te prévient dès qu&apos;un nouveau modèle ou une promo arrive.
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
            Reçois ta sélection {sport} par e-mail
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Nouveaux modèles, bons plans, mises à jour. Pas de spam — désabonnement en un clic.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="email-capture" className="sr-only">
          Adresse e-mail
        </label>
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
          {status === 'loading' ? 'Envoi…' : 'Je m&apos;inscris'}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>
      )}

      <p className="mt-2 text-xs text-gray-400">
        En t&apos;inscrivant, tu acceptes notre{' '}
        <a href="/politique-confidentialite" className="underline hover:text-gray-600">
          politique de confidentialité
        </a>.
      </p>
    </div>
  )
}
