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

const BASE  = 'px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap'
const ACTIVE   = `${BASE} bg-orange-500 text-white`
const INACTIVE = `${BASE} text-gray-400 hover:text-white`

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="bg-black text-white relative overflow-hidden sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 py-4 relative z-10">
        <div className="flex items-center justify-between gap-3">

          {/* Logo : lockup complet sur fond sombre (≥ sm), icône seule en mobile */}
          <Link href="/" className="shrink-0" aria-label="TrouveTaRaquette — accueil">
            {/* Lockup (icône + wordmark) — fond sombre */}
            <Image
              src="/logo-dark.svg"
              alt="TrouveTaRaquette"
              width={344}
              height={76}
              priority
              unoptimized
              className="hidden sm:block h-10 w-auto"
            />
            {/* Icône seule — mobile */}
            <Image
              src="/logo-icon.svg"
              alt="TrouveTaRaquette"
              width={64}
              height={64}
              priority
              unoptimized
              className="sm:hidden h-10 w-10"
            />
          </Link>

          {/* Onglets + langue */}
          <div className="flex items-center gap-2 min-w-0">
            <nav
              aria-label="Modules"
              className="flex gap-1 bg-gray-900 rounded-full p-1 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {TABS.map(tab => {
                const isActive = pathname?.startsWith(tab.href) ?? false
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={isActive ? ACTIVE : INACTIVE}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="sm:hidden">{tab.label} {tab.short}</span>
                    <span className="hidden sm:inline">{tab.label} {tab.full}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Sélecteur de langue retiré — i18n EN à finir en P3 */}
          </div>

        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600" />
    </header>
  )
}
