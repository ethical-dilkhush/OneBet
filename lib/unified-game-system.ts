// UNIFIED GLOBAL GAME SYSTEM
// This ensures EXACTLY 1 winner out of every 3 games across ALL games and ALL players

class UnifiedGameSystem {
  private static instance: UnifiedGameSystem
  private globalCounter = 0

  private constructor() {}

  public static getInstance(): UnifiedGameSystem {
    if (!UnifiedGameSystem.instance) {
      UnifiedGameSystem.instance = new UnifiedGameSystem()
    }
    return UnifiedGameSystem.instance
  }

  public playGame(): { isWinner: boolean; gameNumber: number } {
    this.globalCounter++

    // GUARANTEED: Every 3rd game wins (games 3, 6, 9, 12, etc.)
    const isWinner = this.globalCounter % 3 === 0

    console.log(`🎮 UNIFIED GAME #${this.globalCounter}: ${isWinner ? "🏆 WINNER" : "❌ LOSER"}`)
    console.log(`📊 Games until next win: ${isWinner ? 3 : 3 - (this.globalCounter % 3)}`)

    return {
      isWinner,
      gameNumber: this.globalCounter,
    }
  }

  public getCurrentGameNumber(): number {
    return this.globalCounter
  }

  public getGamesUntilNextWin(): number {
    const remainder = this.globalCounter % 3
    return remainder === 0 ? 3 : 3 - remainder
  }

  public reset(): void {
    this.globalCounter = 0
    console.log("🔄 Unified game system reset")
  }
}

// Export the singleton instance
export const unifiedGameSystem = UnifiedGameSystem.getInstance()

// Helper function for all games to use
export function playUnifiedGame(): { isWinner: boolean; gameNumber: number } {
  return unifiedGameSystem.playGame()
}

export function getCurrentUnifiedGameNumber(): number {
  return unifiedGameSystem.getCurrentGameNumber()
}

export function getGamesUntilNextUnifiedWin(): number {
  return unifiedGameSystem.getGamesUntilNextWin()
}

export function resetUnifiedGameSystem(): void {
  return unifiedGameSystem.reset()
}
