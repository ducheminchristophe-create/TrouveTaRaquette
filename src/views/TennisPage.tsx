'use client'

import React, { useState } from 'react'
import PlayerProfile from '../components/PlayerProfile'
import StringingRecommendations from '../components/StringingRecommendations'
import { useLanguage } from '../contexts/LanguageContext'
import { PlayerData } from '@/src/types/player'

export default function TennisPage() {
  const { t } = useLanguage()
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)

  const handleProfileSubmit = (data: PlayerData) => {
    setPlayerData(data)
    setShowRecommendations(true)
    window.scrollTo(0, 0)
  }

  const handleReset = () => {
    setPlayerData(null)
    setShowRecommendations(false)
    window.scrollTo(0, 0)
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      {!showRecommendations ? (
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black uppercase text-black mb-6 tracking-tight">
              {t('app.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              {t('app.subtitle')}
            </p>
          </div>
          <PlayerProfile onSubmit={handleProfileSubmit} />
        </div>
      ) : (
        <StringingRecommendations
          playerData={playerData!}
          onReset={handleReset}
          forceUseRealAPI={true}
        />
      )}
    </div>
  )
}
