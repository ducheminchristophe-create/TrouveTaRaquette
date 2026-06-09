'use client'

/**
 * CookieConsent — bandeau de consentement RGPD.
 * S'affiche tant qu'aucun choix n'est enregistré (ou si l'utilisateur rouvre les réglages).
 * 3 catégories : nécessaires (toujours actives), mesure d'audience, affiliation/marketing.
 */
import React, { useState } from 'react'
import Link from 'next/link'
import { Cookie } from 'lucide-react'
import { useConsent } from '@/src/contexts/ConsentContext'

export default function CookieConsent() {
  const { consent, ready, acceptAll, rejectAll, save, settingsOpen, closeSettings } = useConsent()
  const [customize, setCustomize] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(true)

  // Affiché si : pas encore de choix, OU réouverture explicite des réglages.
  const visible = ready && (consent === null || settingsOpen)
  if (!visible) return null

  // Pré-remplir les cases si on rouvre les réglages
  const openCustomize = () => {
    if (consent) { setAnalytics(consent.analytics); setMarketing(consent.marketing) }
    setCustomize(true)
  }

  const dismiss = () => { setCustomize(false); closeSettings() }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Gestion des cookies"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-5">
        <div className="flex items-start gap-3">
          <Cookie className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 text-base">On respecte ta vie privée 🍪</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              On utilise des cookies pour mesurer l&apos;audience et, si tu cliques vers un marchand,
              suivre l&apos;affiliation. Les cookies nécessaires au fonctionnement sont toujours actifs.
              Tu peux choisir ce que tu acceptes.{' '}
              <Link href="/cookies" className="underline hover:text-gray-700">Politique cookies</Link>
              {' · '}
              <Link href="/politique-confidentialite" className="underline hover:text-gray-700">Confidentialité</Link>
            </p>

            {/* Réglages détaillés par catégorie */}
            {customize && (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <Category
                  title="Nécessaires"
                  desc="Indispensables au fonctionnement du site. Toujours actifs."
                  checked disabled
                />
                <Category
                  title="Mesure d'audience"
                  desc="Statistiques de visite anonymes (sans cookie publicitaire) pour améliorer le site."
                  checked={analytics}
                  onChange={setAnalytics}
                />
                <Category
                  title="Affiliation / marketing"
                  desc="Permet d'attribuer un achat effectué via nos liens vers les marchands partenaires."
                  checked={marketing}
                  onChange={setMarketing}
                />
              </div>
            )}

            {/* Boutons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
              {customize ? (
                <button
                  onClick={() => { save({ analytics, marketing }); dismiss() }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Enregistrer mes choix
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { acceptAll(); dismiss() }}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Tout accepter
                  </button>
                  <button
                    onClick={() => { rejectAll(); dismiss() }}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Tout refuser
                  </button>
                  <button
                    onClick={openCustomize}
                    className="px-5 py-2.5 rounded-xl text-gray-500 font-bold text-sm hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Personnaliser
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Category({
  title, desc, checked, disabled, onChange,
}: {
  title: string; desc: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void
}) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-70' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange?.(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded accent-orange-500 shrink-0"
      />
      <span>
        <span className="block text-sm font-bold text-gray-900">{title}</span>
        <span className="block text-xs text-gray-500">{desc}</span>
      </span>
    </label>
  )
}
