'use client'

import Link from 'next/link'

export default function TennisHubPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        <p className="text-5xl mb-4">🎾</p>
        <h1 className="text-3xl font-black text-black mb-2">Tennis</h1>
        <p className="text-gray-500 mb-10">Que veux-tu trouver aujourd'hui ?</p>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Raquette */}
          <Link
            href="/tennis/raquette"
            className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-400 p-7 text-left shadow-sm hover:shadow-md transition-all"
          >
            <div className="text-4xl mb-4">🎾</div>
            <h2 className="text-xl font-black text-black mb-1 group-hover:text-orange-500 transition-colors">
              Ma raquette
            </h2>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-3">
              La raquette faite pour toi
            </p>
            <p className="text-sm text-gray-500 mb-5">
              20 questions, 222 raquettes analysées sur 8 dimensions : puissance, contrôle, spin, confort, maniabilité, stabilité, tolérance, précision.
            </p>
            <span className="inline-block bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl group-hover:bg-orange-500 transition-colors">
              Trouver ma raquette →
            </span>
          </Link>

          {/* Cordage */}
          <Link
            href="/tennis/cordage"
            className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-400 p-7 text-left shadow-sm hover:shadow-md transition-all"
          >
            <div className="text-4xl mb-4">🧵</div>
            <h2 className="text-xl font-black text-black mb-1 group-hover:text-orange-500 transition-colors">
              Mon cordage
            </h2>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-3">
              Le bon cordage pour ton jeu
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Profil du joueur et analyse de ton setup actuel → recommandations mono et hybrides personnalisées.
            </p>
            <span className="inline-block bg-black text-white text-sm font-bold px-5 py-2.5 rounded-xl group-hover:bg-orange-500 transition-colors">
              Trouver mon cordage →
            </span>
          </Link>
        </div>
      </div>
    </main>
  )
}
