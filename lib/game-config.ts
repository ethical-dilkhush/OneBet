import { PublicKey } from "@solana/web3.js"

// Your house wallet configuration
export const HOUSE_WALLET_ADDRESS = "AAiyGPx8EBZtCoHoDfbBNfrLrxSQvVAPz3iyiv1YesZ"
export const HOUSE_WALLET_PUBKEY = new PublicKey(HOUSE_WALLET_ADDRESS)

// Game configuration - REDUCED WINNING AMOUNT
export const MIN_BET_AMOUNT = 0.001 // SOL
export const WINNING_MULTIPLIER = 2.0 // Reduced from 2.7 to 2.0 (0.001 * 2 = 0.002 SOL)

// GLOBAL game counter - shared across ALL players and ALL games
let globalCoinGameCounter = 0

export function getGameResult(): boolean {
  globalCoinGameCounter++
  // Every 3rd game globally wins (1st and 2nd lose, 3rd wins)
  const isWinner = globalCoinGameCounter % 3 === 0
  console.log(`🪙 GLOBAL Coin Game ${globalCoinGameCounter}: Player ${isWinner ? "WINS" : "LOSES"}`)
  console.log(`🔢 Next win will be at game: ${globalCoinGameCounter + (3 - (globalCoinGameCounter % 3))}`)
  return isWinner
}

export function resetGameCounter() {
  globalCoinGameCounter = 0
  console.log("🔄 Global coin game counter reset to 0")
}

export function getCurrentCoinGameCount(): number {
  return globalCoinGameCounter
}

export type CoinSide = "heads" | "tails"

export interface GameResult {
  won: boolean
  playerChoice: CoinSide
  actualResult: CoinSide
  betAmount: number
  winAmount: number
  gameNumber: number // Add game number to track global position
}
