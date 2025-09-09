import { type NextRequest, NextResponse } from "next/server"
import { generateRandomMultiplier, MIN_LOSING_MULTIPLIER } from "@/lib/limbo-config"

// In-memory storage for demo (in production, use a real database)
// Structure: gameType -> betAmount -> counter
// Also track Limbo-specific earnings for the new win logic
let globalGameCounters: Record<string, Record<string, number>> & {
  limbo_total_bets: number
  limbo_total_payouts: number
} = {
  dice: {},
  colors: {},
  coinflip: {},
  plinko: {},
  limbo: {},
  // --- USER REQUESTED RESET FOR LIMBO PROFIT TRACKING ---
  // From this point forward, limbo_total_bets and limbo_total_payouts will start from 0
  // for the purpose of calculating the house profit and win threshold.
  limbo_total_bets: 0, // Reset to 0 as per user request
  limbo_total_payouts: 0, // Reset to 0 as per user request
  // -------------------------------------------------------
}

// Define a small epsilon for floating-point comparisons
const EPSILON = 0.000001 // Represents a very small tolerance, e.g., 0.0001%

// Helper function to get counter key from bet amount
function getBetAmountKey(betAmount: number): string {
  return betAmount.toString()
}

// GET - Get current counters
export async function GET() {
  try {
    console.log("📊 GET /api/game-counter - Current counters:", globalGameCounters)

    return NextResponse.json({
      success: true,
      counters: globalGameCounters,
      limbo_total_bets: globalGameCounters.limbo_total_bets,
      limbo_total_payouts: globalGameCounters.limbo_total_payouts,
    })
  } catch (error) {
    console.error("❌ GET /api/game-counter error:", error)
    return NextResponse.json({ success: false, error: "Failed to get counters" }, { status: 500 })
  }
}

// POST - Play a game and increment counter for specific bet amount
export async function POST(request: NextRequest) {
  try {
    const { gameType, betAmount, targetMultiplier } = await request.json()

    if (!gameType || !["dice", "colors", "coinflip", "plinko", "limbo"].includes(gameType)) {
      return NextResponse.json({ success: false, error: "Invalid game type" }, { status: 400 })
    }

    if (!betAmount || typeof betAmount !== "number" || betAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid bet amount" }, { status: 400 })
    }

    const betKey = getBetAmountKey(betAmount)

    // Initialize counter for this bet amount if it doesn't exist
    if (!globalGameCounters[gameType][betKey]) {
      globalGameCounters[gameType][betKey] = 0
    }

    // Increment the counter for this specific game type and bet amount
    globalGameCounters[gameType][betKey] += 1
    const gameNumber = globalGameCounters[gameType][betKey]

    let isWinner = false
    let actualMultiplier = 0 // Initialize actualMultiplier

    if (gameType === "limbo") {
      // --- IMPORTANT: Limbo game logic is determined SOLELY by house profit, NOT by 1-in-3 counter ---
      if (typeof targetMultiplier !== "number" || targetMultiplier <= 0) {
        return NextResponse.json({ success: false, error: "Invalid target multiplier for Limbo" }, { status: 400 })
      }

      // Record the bet for Limbo house earnings immediately
      globalGameCounters.limbo_total_bets += betAmount

      const potentialWinAmount = betAmount * targetMultiplier
      const currentLimboProfit = globalGameCounters.limbo_total_bets - globalGameCounters.limbo_total_payouts
      const winThresholdForCurrentProfit = 0.7 * currentLimboProfit // 70% of current profit

      // New win condition: Player wins only if their potential win amount
      // is EXACTLY 70% of the current house profit from Limbo games (within a small epsilon).
      if (Math.abs(potentialWinAmount - winThresholdForCurrentProfit) < EPSILON) {
        isWinner = true
        // If player wins, update the total payouts
        globalGameCounters.limbo_total_payouts += potentialWinAmount
        console.log("🎉 Limbo Player WINS based on current house profit logic (exact 70%)!")
        console.log(`   Potential Win: ${potentialWinAmount.toFixed(6)} SOL`)
        console.log(`   Win Threshold (70% of Current Profit): ${winThresholdForCurrentProfit.toFixed(6)} SOL`)
        // When winning based on this specific rule, the actual multiplier is the target multiplier
        actualMultiplier = targetMultiplier

        // --- NEW LOGIC: Reset Limbo profit counters after a win ---
        globalGameCounters.limbo_total_bets = 0
        globalGameCounters.limbo_total_payouts = 0
        console.log("🔄 Limbo house profit counters reset to 0 after a win.")
        // ----------------------------------------------------------
      } else {
        isWinner = false
        console.log("❌ Limbo Player LOSES to maintain house profit margin (not exact 70%).")
        console.log(`   Potential Win: ${potentialWinAmount.toFixed(6)} SOL`)
        console.log(`   Win Threshold (70% of Current Profit): ${winThresholdForCurrentProfit.toFixed(6)} SOL`)
        // Generate actual multiplier < target
        // Ensure the upper bound for losing is strictly less than targetMultiplier
        const maxLosingValue = targetMultiplier - 0.01 // Ensure it's at least 0.01 less than target
        actualMultiplier = generateRandomMultiplier(
          MIN_LOSING_MULTIPLIER, // Use the new minimum losing multiplier
          Math.max(MIN_LOSING_MULTIPLIER, maxLosingValue), // Ensure max is not less than min
        )
      }

      console.log(`💰 Limbo Total Bets: ${globalGameCounters.limbo_total_bets.toFixed(6)} SOL`)
      console.log(`💸 Limbo Total Payouts: ${globalGameCounters.limbo_total_payouts.toFixed(6)} SOL`)
      console.log(
        `📊 Limbo House Profit: ${(globalGameCounters.limbo_total_bets - globalGameCounters.limbo_total_payouts).toFixed(6)} SOL`,
      )
    } else {
      // Existing 1-in-3 logic for other games (unchanged)
      isWinner = gameNumber % 3 === 0
    }

    console.log(
      `🎮 GLOBAL ${gameType.toUpperCase()} (${betAmount} SOL) GAME #${gameNumber}: ${isWinner ? "WIN" : "LOSE"}`,
    )
    console.log(`📊 Updated counters for ${gameType}:`, globalGameCounters[gameType])

    return NextResponse.json({
      success: true,
      gameNumber,
      isWinner,
      betAmount,
      targetMultiplier,
      actualMultiplier, // Return the actualMultiplier from server
      counters: globalGameCounters,
      limbo_total_bets: globalGameCounters.limbo_total_bets, // Return updated earnings
      limbo_total_payouts: globalGameCounters.limbo_total_payouts, // Return updated payouts
    })
  } catch (error) {
    console.error("❌ POST /api/game-counter error:", error)
    return NextResponse.json({ success: false, error: "Failed to process game" }, { status: 500 })
  }
}

// DELETE - Reset all counters (for testing)
export async function DELETE() {
  try {
    globalGameCounters = {
      dice: {},
      colors: {},
      coinflip: {},
      plinko: {},
      limbo: {},
      limbo_total_bets: 0,
      limbo_total_payouts: 0,
    }

    console.log("🔄 All global counters reset to empty")

    return NextResponse.json({
      success: true,
      message: "All counters reset",
      counters: globalGameCounters,
      limbo_total_bets: globalGameCounters.limbo_total_bets,
      limbo_total_payouts: globalGameCounters.limbo_total_payouts,
    })
  } catch (error) {
    console.error("❌ DELETE /api/game-counter error:", error)
    return NextResponse.json({ success: false, error: "Failed to reset counters" }, { status: 500 })
  }
}
