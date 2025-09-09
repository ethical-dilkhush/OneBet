import { PublicKey } from "@solana/web3.js"

// Your house wallet configuration
export const HOUSE_WALLET_ADDRESS = "AAiyGPx8EBZtCoHoDfbBNfrLrxSQvVAPz3iyiv1YesZ"
export const HOUSE_WALLET_PUBKEY = new PublicKey(HOUSE_WALLET_ADDRESS)

// Game configuration
export const MIN_BET_AMOUNT = 0.001 // SOL (fixed)
export const WINNING_MULTIPLIER = 2.0 // 0.001 * 2 = 0.002 SOL

// Dice options
export const DICE_OPTIONS = [
  { name: "less", label: "Less than 6", emoji: "📉", description: "Roll 2-5 to win" },
  { name: "more", label: "More than 6", emoji: "📈", description: "Roll 7-12 to win" },
] as const

export type DiceChoice = (typeof DICE_OPTIONS)[number]["name"]

// GLOBAL game counter - shared across ALL players
let globalDiceGameCounter = 0

export function getDiceGameResult(): boolean {
  globalDiceGameCounter++
  // Every 3rd game globally wins (1st and 2nd lose, 3rd wins)
  const isWinner = globalDiceGameCounter % 3 === 0
  console.log(`🎲 GLOBAL Dice Game ${globalDiceGameCounter}: Player ${isWinner ? "WINS" : "LOSES"}`)
  console.log(`🔢 Next win will be at game: ${globalDiceGameCounter + (3 - (globalDiceGameCounter % 3))}`)
  return isWinner
}

export function resetDiceGameCounter() {
  globalDiceGameCounter = 0
  console.log("🔄 Global dice game counter reset to 0")
}

export function getCurrentGameCount(): number {
  return globalDiceGameCounter
}

export function getGamesUntilNextWin(): number {
  const remainder = globalDiceGameCounter % 3
  return remainder === 0 ? 3 : 3 - remainder
}

export interface DiceGameResult {
  won: boolean
  playerChoice: DiceChoice
  dice1: number
  dice2: number
  total: number
  betAmount: number
  winAmount: number
  gameNumber: number // Add game number to track global position
}

// Generate random dice roll (1-6 each)
export function rollDice(): { dice1: number; dice2: number; total: number } {
  const dice1 = Math.floor(Math.random() * 6) + 1
  const dice2 = Math.floor(Math.random() * 6) + 1
  const total = dice1 + dice2
  return { dice1, dice2, total }
}

// Check if player's choice matches the result
export function checkDiceWin(choice: DiceChoice, total: number): boolean {
  if (choice === "less") {
    return total < 6 // 2, 3, 4, 5
  } else {
    return total > 6 // 7, 8, 9, 10, 11, 12
  }
}
