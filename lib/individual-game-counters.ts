// INDIVIDUAL GAME COUNTERS WITH PERSISTENT STORAGE
// Each game has its own 1-out-of-3 system that persists across page reloads

class PersistentGameCounter {
  private storageKey: string

  constructor(gameType: string) {
    this.storageKey = `${gameType}_game_counter`
  }

  private getCounter(): number {
    if (typeof window === "undefined") return 0
    const stored = localStorage.getItem(this.storageKey)
    return stored ? Number.parseInt(stored, 10) : 0
  }

  private setCounter(value: number): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.storageKey, value.toString())
  }

  public playGame(): { isWinner: boolean; gameNumber: number } {
    const currentCounter = this.getCounter()
    const newCounter = currentCounter + 1
    this.setCounter(newCounter)

    // GUARANTEED: Every 3rd game wins (games 3, 6, 9, 12, etc.)
    const isWinner = newCounter % 3 === 0

    console.log(`🎮 ${this.storageKey.toUpperCase()}: Game #${newCounter} - ${isWinner ? "🏆 WINNER" : "❌ LOSER"}`)
    console.log(`📊 Next win at game: ${isWinner ? newCounter + 3 : newCounter + (3 - (newCounter % 3))}`)

    return {
      isWinner,
      gameNumber: newCounter,
    }
  }

  public getCurrentGameNumber(): number {
    return this.getCounter()
  }

  public reset(): void {
    this.setCounter(0)
    console.log(`🔄 ${this.storageKey.toUpperCase()} reset to 0`)
  }
}

// Create separate persistent counters for each game
const diceGameCounter = new PersistentGameCounter("dice")
const colorsGameCounter = new PersistentGameCounter("colors")
const coinflipGameCounter = new PersistentGameCounter("coinflip")

// Export functions for each game
export function playDiceGame(): { isWinner: boolean; gameNumber: number } {
  const result = diceGameCounter.playGame()
  console.log(`🎲 DICE RESULT: Game #${result.gameNumber} = ${result.isWinner ? "WIN" : "LOSE"}`)
  return result
}

export function playColorsGame(): { isWinner: boolean; gameNumber: number } {
  const result = colorsGameCounter.playGame()
  console.log(`🎨 COLORS RESULT: Game #${result.gameNumber} = ${result.isWinner ? "WIN" : "LOSE"}`)
  return result
}

export function playCoinflipGame(): { isWinner: boolean; gameNumber: number } {
  const result = coinflipGameCounter.playGame()
  console.log(`🪙 COINFLIP RESULT: Game #${result.gameNumber} = ${result.isWinner ? "WIN" : "LOSE"}`)
  return result
}

// Get current game numbers
export function getCurrentDiceGameNumber(): number {
  return diceGameCounter.getCurrentGameNumber()
}

export function getCurrentColorsGameNumber(): number {
  return colorsGameCounter.getCurrentGameNumber()
}

export function getCurrentCoinflipGameNumber(): number {
  return coinflipGameCounter.getCurrentGameNumber()
}

// Reset functions (for testing)
export function resetDiceGameCounter(): void {
  diceGameCounter.reset()
}

export function resetColorsGameCounter(): void {
  colorsGameCounter.reset()
}

export function resetCoinflipGameCounter(): void {
  coinflipGameCounter.reset()
}

// Reset all counters
export function resetAllGameCounters(): void {
  resetDiceGameCounter()
  resetColorsGameCounter()
  resetCoinflipGameCounter()
  console.log("🔄 ALL GAME COUNTERS RESET")
}
