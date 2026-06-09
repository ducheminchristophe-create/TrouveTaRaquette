'use client'

import React, { useState, useEffect } from 'react'
import PlayerProfile from '../components/PlayerProfile'
import StringingRecommendations from '../components/StringingRecommendations'
import { PlayerData } from '@/src/types/player'
import { track } from '@/src/lib/analytics'

export default function TennisPage() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Événement : début du parcours cordage tennis
  useEffect(() => {
    track('quiz_start', { sport: 'tennis' })
  }, [])

  const handleProfileSubmit = (data: PlayerData) => {
    track('quiz_complete', { sport: 'tennis' })
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
