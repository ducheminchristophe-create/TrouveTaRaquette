'use client'

import React, { useState } from 'react'
import PlayerProfile from '../components/PlayerProfile'
import StringingRecommendations from '../components/StringingRecommendations'
import { PlayerData } from '@/src/types/player'

export default function TennisPage() {
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

  // Le formulaire (PlayerProfile) gère sa propre mise en page (max-w-2xl, titre, progression).
  if (!showRecommendations) {
    return <PlayerProfile onSubmit={handleProfileSubmit} />
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <StringingRecommendations
        playerData={playerData!}
        onReset={handleReset}
        forceUseRealAPI={true}
      />
    </div>
  )
}
