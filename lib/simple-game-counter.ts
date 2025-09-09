// SIMPLE GAME COUNTER SYSTEM
// Each game type has its own counter that GUARANTEES every 3rd player wins

interface GameCounterState {
  dice: number
  colors: number
  coinflip: number
}

// Initialize counters
let gameCounters: GameCounterState = {
  dice: 0,
  colors: 0,
  coinflip: 0,
}

// Load from localStorage if available
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("game_counters")
  if (stored) {
    try {
      gameCounters = JSON.parse(stored)
    } catch (e) {
      console.log("Failed to load counters, using defaults")
    }
  }
}

// Save to localStorage
function saveCounters() {
  if (typeof window !== "undefined") {
    localStorage.setItem("game_counters", JSON.stringify(gameCounters))
  }
}

// DICE GAME FUNCTIONS
export function playDiceGame(): { isWinner: boolean; gameNumber: number } {
  gameCounters.dice += 1
  const gameNumber = gameCounters.dice
  const isWinner = gameNumber % 3 === 0 // Win on games 3, 6, 9, 12...

  saveCounters()

  console.log(`🎲 DICE GAME #${gameNumber}: ${isWinner ? "WIN" : "LOSE"}`)
  console.log(`🎲 Dice counter is now: ${gameCounters.dice}`)

  return { isWinner, gameNumber }
}

export function getDiceGameNumber(): number {
  return gameCounters.dice
}

// COLORS GAME FUNCTIONS
export function playColorsGame(): { isWinner: boolean; gameNumber: number } {
  gameCounters.colors += 1
  const gameNumber = gameCounters.colors
  const isWinner = gameNumber % 3 === 0 // Win on games 3, 6, 9, 12...

  saveCounters()

  console.log(`🎨 COLORS GAME #${gameNumber}: ${isWinner ? "WIN" : "LOSE"}`)
  console.log(`🎨 Colors counter is now: ${gameCounters.colors}`)

  return { isWinner, gameNumber }
}

export function getColorsGameNumber(): number {
  return gameCounters.colors
}

// COINFLIP GAME FUNCTIONS
export function playCoinflipGame(): { isWinner: boolean; gameNumber: number } {
  gameCounters.coinflip += 1
  const gameNumber = gameCounters.coinflip
  const isWinner = gameNumber % 3 === 0 // Win on games 3, 6, 9, 12...

  saveCounters()

  console.log(`🪙 COINFLIP GAME #${gameNumber}: ${isWinner ? "WIN" : "LOSE"}`)
  console.log(`🪙 Coinflip counter is now: ${gameCounters.coinflip}`)

  return { isWinner, gameNumber }
}

export function getCoinflipGameNumber(): number {
  return gameCounters.coinflip
}

// DEBUG FUNCTIONS
export function getAllCounters(): GameCounterState {
  return { ...gameCounters }
}

export function resetAllCounters(): void {
  gameCounters = { dice: 0, colors: 0, coinflip: 0 }
  saveCounters()
  console.log("🔄 ALL COUNTERS RESET TO 0")
}

export function resetDiceCounter(): void {
  gameCounters.dice = 0
  saveCounters()
  console.log("🔄 DICE COUNTER RESET TO 0")
}

export function resetColorsCounter(): void {
  gameCounters.colors = 0
  saveCounters()
  console.log("🔄 COLORS COUNTER RESET TO 0")
}

export function resetCoinflipCounter(): void {
  gameCounters.coinflip = 0
  saveCounters()
  console.log("🔄 COINFLIP COUNTER RESET TO 0")
}
