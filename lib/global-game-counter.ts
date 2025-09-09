// UNIFIED GLOBAL GAME COUNTER
// This counter is shared across ALL games (dice, colors, coinflip)
// Every 3rd game played by ANY player on ANY game will win

let unifiedGlobalGameCounter = 0

export function getUnifiedGameResult(): { isWinner: boolean; gameNumber: number; nextWinAt: number } {
  unifiedGlobalGameCounter++

  // Every 3rd game globally wins (1st and 2nd lose, 3rd wins)
  const isWinner = unifiedGlobalGameCounter % 3 === 0
  const nextWinAt = unifiedGlobalGameCounter + (3 - (unifiedGlobalGameCounter % 3))

  console.log(`🎮 UNIFIED GLOBAL Game ${unifiedGlobalGameCounter}: Player ${isWinner ? "WINS" : "LOSES"}`)
  console.log(`🔢 Next win will be at game: ${isWinner ? nextWinAt : nextWinAt}`)

  return {
    isWinner,
    gameNumber: unifiedGlobalGameCounter,
    nextWinAt: isWinner ? unifiedGlobalGameCounter + 3 : nextWinAt,
  }
}

export function resetUnifiedGameCounter() {
  unifiedGlobalGameCounter = 0
  console.log("🔄 UNIFIED global game counter reset to 0")
}

export function getCurrentUnifiedGameCount(): number {
  return unifiedGlobalGameCounter
}

export function getGamesUntilNextUnifiedWin(): number {
  const remainder = unifiedGlobalGameCounter % 3
  return remainder === 0 ? 3 : 3 - remainder
}
