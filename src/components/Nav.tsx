'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/tennis', label: '🎾', short: 'Tennis',    full: 'Cordage Tennis' },
  { href: '/padel',  label: '🟢', short: 'Padel',     full: 'Padel' },
  { href: '/badminton', label: '🏸', short: 'Badm.', full: 'Badminton' },
  { href: '/ping-pong', label: '🏓', short: 'Ping', full: 'Ping-Pong' },
]

// Onglet desktop (pill)
const BASE  = 'px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap'
const ACTIVE   = `${BASE} bg-orange-500 text-white`
const INACTIVE = `${BASE} text-gray-400 hover:text-white`

// Onglet mobile (cellule de grille, icône + label court)
const M_BASE = 'flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-colors'
const M_ACTIVE   = `${M_BASE} bg-orange-500 text-white`
const M_INACTIVE = `${M_BASE} text-gray-400 hover:text-white`

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="bg-black text-white relative sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 relative z-10">
        {/* Ligne logo + onglets desktop */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo : lockup complet (≥ sm), icône seule en mobile */}
          <Link href="/" className="shrink-0" aria-label="TrouveTaRaquette — accueil">
            <Image
              src="/logo-dark.svg"
              alt="TrouveTaRaquette"
              width={344}
              height={76}
              priority
              unoptimized
              className="hidden sm:block h-10 w-auto"
            />
            <Image
              src="/logo-icon.svg"
              alt="TrouveTaRaquette"
              width={64}
              height={64}
              priority
              unoptimized
              className="sm:hidden h-9 w-9"
            />
          </Link>

          {/* Onglets DESKTOP (≥ sm) */}
          <nav aria-label="Modules" className="hidden sm:flex gap-1 bg-gray-900 rounded-full p-1">
            {TABS.map(tab => {
              const isActive = pathname?.startsWith(tab.href) ?? false
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={isActive ? ACTIVE : INACTIVE}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label} {tab.full}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Onglets MOBILE (< sm) : grille 4 colonnes pleine largeur, tous visibles */}
        <nav aria-label="Modules" className="sm:hidden mt-3 grid grid-cols-4 gap-1 bg-gray-900 rounded-2xl p-1">
          {TABS.map(tab => {
            const isActive = pathname?.startsWith(tab.href) ?? false
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={isActive ? M_ACTIVE : M_INACTIVE}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-base leading-none" aria-hidden="true">{tab.label}</span>
                <span>{tab.short}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600" />
    </header>
  )
}
