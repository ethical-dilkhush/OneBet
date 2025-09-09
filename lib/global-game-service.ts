// CLIENT-SIDE SERVICE FOR GLOBAL GAME COUNTERS WITH BET AMOUNT SPECIFICITY
// This communicates with the server API to maintain global state per bet amount

export interface GameCounters {
  dice: Record<string, number>
  colors: Record<string, number>
  coinflip: Record<string, number>
  plinko: Record<string, number>
  limbo: Record<string, number>
  limbo_total_bets?: number // Optional, as it's a global property, not per-game-type
  limbo_total_payouts?: number // Optional
}

export interface GameResult {
  gameNumber: number
  isWinner: boolean
  betAmount: number
  targetMultiplier?: number // Added for Limbo
  actualMultiplier?: number // Added for Limbo - now returned from server
  counters: GameCounters
  limbo_total_bets?: number // Added for Limbo
  limbo_total_payouts?: number // Added for Limbo
}

export type GameType = "dice" | "colors" | "coinflip" | "plinko" | "limbo"

// Get current global counters
export async function getGlobalCounters(): Promise<GameCounters> {
  try {
    const response = await fetch("/api/game-counter", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to get counters")
    }

    console.log("📊 Retrieved global counters:", data.counters)
    return {
      ...data.counters,
      limbo_total_bets: data.limbo_total_bets,
      limbo_total_payouts: data.limbo_total_payouts,
    }
  } catch (error) {
    console.error("❌ Failed to get global counters:", error)
    // Return default counters if API fails
    return { dice: {}, colors: {}, coinflip: {}, plinko: {}, limbo: {}, limbo_total_bets: 0, limbo_total_payouts: 0 }
  }
}

// Play a game with specific bet amount and get the result
export async function playGlobalGame(
  gameType: GameType,
  betAmount: number,
  targetMultiplier?: number,
): Promise<GameResult> {
  try {
    console.log(`🎮 Playing global ${gameType} game with ${betAmount} SOL...`)

    const body: { gameType: GameType; betAmount: number; targetMultiplier?: number } = { gameType, betAmount }
    if (gameType === "limbo" && targetMultiplier !== undefined) {
      body.targetMultiplier = targetMultiplier
    }

    const response = await fetch("/api/game-counter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to play game")
    }

    console.log(`🎮 GLOBAL ${gameType.toUpperCase()} (${betAmount} SOL) RESULT:`, {
      gameNumber: data.gameNumber,
      isWinner: data.isWinner,
      targetMultiplier: data.targetMultiplier,
      actualMultiplier: data.actualMultiplier, // Pass this through
    })

    return {
      gameNumber: data.gameNumber,
      isWinner: data.isWinner,
      betAmount: data.betAmount,
      targetMultiplier: data.targetMultiplier,
      actualMultiplier: data.actualMultiplier, // Pass this through
      counters: data.counters,
      limbo_total_bets: data.limbo_total_bets,
      limbo_total_payouts: data.limbo_total_payouts,
    }
  } catch (error) {
    console.error(`❌ Failed to play global ${gameType} game:`, error)
    throw error
  }
}

// Reset all global counters (for testing)
export async function resetGlobalCounters(): Promise<GameCounters> {
  try {
    console.log("🔄 Resetting all global counters...")

    const response = await fetch("/api/game-counter", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to reset counters")
    }

    console.log("🔄 Global counters reset successfully:", data.counters)
    return {
      ...data.counters,
      limbo_total_bets: data.limbo_total_bets,
      limbo_total_payouts: data.limbo_total_payouts,
    }
  } catch (error) {
    console.error("❌ Failed to reset global counters:", error)
    throw error
  }
}

// Convenience functions for each game type with bet amount
export const playGlobalDiceGame = (betAmount: number) => playGlobalGame("dice", betAmount)
export const playGlobalColorsGame = (betAmount: number) => playGlobalGame("colors", betAmount)
export const playGlobalCoinflipGame = (betAmount: number) => playGlobalGame("coinflip", betAmount)
export const playGlobalPlinkoGame = (betAmount: number) => playGlobalGame("plinko", betAmount)
export const playGlobalLimboGame = (betAmount: number, targetMultiplier: number) =>
  playGlobalGame("limbo", betAmount, targetMultiplier)
