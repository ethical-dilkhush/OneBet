import { PublicKey } from "@solana/web3.js"

// Your house wallet configuration
export const HOUSE_WALLET_ADDRESS = "AAiyGPx8EBZtCoHoDfbBNfrLrxSQvVAPz3iyiv1YesZ"
export const HOUSE_WALLET_PUBKEY = new PublicKey(HOUSE_WALLET_ADDRESS)

// Game configuration
export const MIN_BET_AMOUNT = 0.001 // SOL
export const WINNING_MULTIPLIER = 2.0 // 2x payout for winning

// Plinko board configuration - REDUCED TO 6 ROWS
export const BOARD_ROWS = 6
export const BOARD_WIDTH = 7

// NEW Multiplier slots at the bottom (left to right): 6, 2, 0.7, 0.4, 0.7, 1.8, 6
export const MULTIPLIERS = [6.0, 2.0, 0.7, 0.4, 0.7, 1.8, 6.0]

// Colors for multiplier slots - Matching the screenshot design exactly
export const MULTIPLIER_COLORS = [
  "bg-gradient-to-b from-red-400 to-red-600", // 6.0x - RED (left edge)
  "bg-gradient-to-b from-orange-500 to-orange-700", // 2.0x - ORANGE
  "bg-gradient-to-b from-yellow-400 to-orange-500", // 0.7x - YELLOW-ORANGE
  "bg-gradient-to-b from-yellow-300 to-yellow-500", // 0.4x - BRIGHT YELLOW (center)
  "bg-gradient-to-b from-yellow-400 to-orange-500", // 0.7x - YELLOW-ORANGE
  "bg-gradient-to-b from-orange-500 to-orange-700", // 1.8x - ORANGE
  "bg-gradient-to-b from-red-400 to-red-600", // 6.0x - RED (right edge)
]

export interface PlinkoGameResult {
  won: boolean
  betAmount: number
  winAmount: number
  multiplier: number
  slotIndex: number
  gameNumber: number
  ballPath: number[] // Array of peg positions the ball hit
}

// Generate random ball path through the 6-row Plinko board
export function generateBallPath(): { path: number[]; finalSlot: number } {
  const path: number[] = []
  let position = Math.floor(BOARD_WIDTH / 2) // Start from center top (position 3)

  // Ball bounces through each row
  for (let row = 0; row < BOARD_ROWS; row++) {
    path.push(position)

    // Random bounce left or right (50/50 chance)
    const bounceRight = Math.random() > 0.5

    if (bounceRight && position < BOARD_WIDTH - 1) {
      position += 1
    } else if (!bounceRight && position > 0) {
      position -= 1
    }
    // If at edge, ball stays in same position
  }

  // Final slot is determined by final position, mapped to 6 slots
  const finalSlot = Math.max(
    0,
    Math.min(MULTIPLIERS.length - 1, Math.floor((position / BOARD_WIDTH) * MULTIPLIERS.length)),
  )

  return { path, finalSlot }
}

// Calculate win amount based on multiplier
export function calculateWinAmount(betAmount: number, multiplier: number): number {
  return betAmount * multiplier
}

// Determine if player wins (multiplier > 1.0)
export function isWinningMultiplier(multiplier: number): boolean {
  return multiplier > 1.0
}

// 4-BET CYCLE LOGIC: 0.7x → 0.4x → 0.7x → WIN (2x or 1.8x)
// MULTIPLIER EXPLANATION:
// - 0.7x = Player gets 70% refund (loses 30%)
// - 0.4x = Player gets 40% refund (loses 60%)
// - 1.8x = Player gets 180% (wins 80% profit)
// - 2.0x = Player gets 200% (wins 100% profit)
// - 6.0x = Player gets 600% (wins 500% profit)
export function getPlinkoGameResult(betAmount: number): {
  isWinner: boolean
  forcedMultiplier: number
  gameNumber: number
  shouldReceivePayout: boolean // New field to determine if payout is needed
} {
  // Get current counter for this bet amount from localStorage
  const storageKey = `plinko_counter_${betAmount}`
  let currentCounter = 0

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey)
    currentCounter = stored ? Number.parseInt(stored, 10) : 0
  }

  // Increment counter
  currentCounter += 1

  // Save updated counter
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, currentCounter.toString())
  }

  // Determine position in 4-bet cycle (1, 2, 3, 4)
  const cyclePosition = ((currentCounter - 1) % 4) + 1

  let forcedMultiplier: number
  let isWinner: boolean
  let shouldReceivePayout: boolean

  switch (cyclePosition) {
    case 1:
      // First bet: 0.7x (partial refund - player gets 70% back)
      forcedMultiplier = 0.7
      isWinner = false // Still considered a loss since < 1.0x
      shouldReceivePayout = true // But player gets partial refund
      break
    case 2:
      // Second bet: 0.4x (partial refund - player gets 40% back)
      forcedMultiplier = 0.4
      isWinner = false // Still considered a loss since < 1.0x
      shouldReceivePayout = true // But player gets partial refund
      break
    case 3:
      // Third bet: 0.7x (partial refund - player gets 70% back)
      forcedMultiplier = 0.7
      isWinner = false // Still considered a loss since < 1.0x
      shouldReceivePayout = true // But player gets partial refund
      break
    case 4:
      // Fourth bet: WIN with 2x or 1.8x (full win)
      forcedMultiplier = Math.random() > 0.5 ? 2.0 : 1.8
      isWinner = true
      shouldReceivePayout = true
      break
    default:
      forcedMultiplier = 0.4
      isWinner = false
      shouldReceivePayout = true
  }

  console.log(
    `🔴 PLINKO (${betAmount} SOL) Game #${currentCounter}: Cycle position ${cyclePosition}/4 = ${forcedMultiplier}x ${isWinner ? "WIN" : "PARTIAL REFUND"}`,
  )

  return {
    isWinner,
    forcedMultiplier,
    gameNumber: currentCounter,
    shouldReceivePayout,
  }
}

// Helper function to get current game count for a bet amount
export function getCurrentPlinkoGameCount(betAmount: number): number {
  if (typeof window === "undefined") return 0
  const storageKey = `plinko_counter_${betAmount}`
  const stored = localStorage.getItem(storageKey)
  return stored ? Number.parseInt(stored, 10) : 0
}

// Helper function to reset counter for a bet amount (for testing)
export function resetPlinkoCounter(betAmount: number): void {
  if (typeof window === "undefined") return
  const storageKey = `plinko_counter_${betAmount}`
  localStorage.removeItem(storageKey)
  console.log(`🔄 Plinko counter reset for ${betAmount} SOL`)
}
