export interface PlayerData {
  racket: {
    brand: string
    model: string
    details: string
  }
  currentStrings: {
    type: string
    mono: string
    monoTension: string
    hybridMain: string
    hybridCross: string
    hybridMainTension: string
    hybridCrossTension: string
  }
  playerProfile: {
    level: number
    playStyle: string
    grip: string
    courtHabits: string[]
  }
  preferences: {
    alternativeTypes: string[]
    monoCount: number
    hybridCount: number
    preferredBrands: string[]
    performancePriorities: string[]
    priceRange: [number, number]
  }
}
