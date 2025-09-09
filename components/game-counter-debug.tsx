"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getCurrentDiceGameNumber,
  getCurrentColorsGameNumber,
  getCurrentCoinflipGameNumber,
  resetAllGameCounters,
  playDiceGame,
  playColorsGame,
  playCoinflipGame,
} from "@/lib/individual-game-counters"

export function GameCounterDebug() {
  const [diceCount, setDiceCount] = useState(0)
  const [colorsCount, setColorsCount] = useState(0)
  const [coinflipCount, setCoinflipCount] = useState(0)
  const [lastResults, setLastResults] = useState<string[]>([])

  const updateCounts = () => {
    setDiceCount(getCurrentDiceGameNumber())
    setColorsCount(getCurrentColorsGameNumber())
    setCoinflipCount(getCurrentCoinflipGameNumber())
  }

  useEffect(() => {
    updateCounts()
    const interval = setInterval(updateCounts, 1000)
    return () => clearInterval(interval)
  }, [])

  const testDiceGame = () => {
    const result = playDiceGame()
    const message = `🎲 Dice Game #${result.gameNumber}: ${result.isWinner ? "🏆 WON" : "❌ LOST"}`
    setLastResults((prev) => [message, ...prev.slice(0, 4)])
    updateCounts()
  }

  const testColorsGame = () => {
    const result = playColorsGame()
    const message = `🎨 Colors Game #${result.gameNumber}: ${result.isWinner ? "🏆 WON" : "❌ LOST"}`
    setLastResults((prev) => [message, ...prev.slice(0, 4)])
    updateCounts()
  }

  const testCoinflipGame = () => {
    const result = playCoinflipGame()
    const message = `🪙 Coinflip Game #${result.gameNumber}: ${result.isWinner ? "🏆 WON" : "❌ LOST"}`
    setLastResults((prev) => [message, ...prev.slice(0, 4)])
    updateCounts()
  }

  const resetAll = () => {
    resetAllGameCounters()
    setLastResults((prev) => ["🔄 ALL COUNTERS RESET", ...prev.slice(0, 4)])
    updateCounts()
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white">🔧 Game Counter Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Counts */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 p-2 rounded">
            <div className="text-white/70 text-xs">Dice</div>
            <div className="text-white font-bold">{diceCount}</div>
            <div className="text-xs text-green-400">
              Next win: {diceCount === 0 ? 3 : diceCount + (3 - (diceCount % 3))}
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded">
            <div className="text-white/70 text-xs">Colors</div>
            <div className="text-white font-bold">{colorsCount}</div>
            <div className="text-xs text-green-400">
              Next win: {colorsCount === 0 ? 3 : colorsCount + (3 - (colorsCount % 3))}
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded">
            <div className="text-white/70 text-xs">Coinflip</div>
            <div className="text-white font-bold">{coinflipCount}</div>
            <div className="text-xs text-green-400">
              Next win: {coinflipCount === 0 ? 3 : coinflipCount + (3 - (coinflipCount % 3))}
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={testDiceGame} size="sm" className="bg-blue-500 hover:bg-blue-600">
            Test Dice
          </Button>
          <Button onClick={testColorsGame} size="sm" className="bg-green-500 hover:bg-green-600">
            Test Colors
          </Button>
          <Button onClick={testCoinflipGame} size="sm" className="bg-yellow-500 hover:bg-yellow-600">
            Test Coinflip
          </Button>
          <Button onClick={resetAll} size="sm" className="bg-red-500 hover:bg-red-600">
            Reset All
          </Button>
        </div>

        {/* Recent Results */}
        {lastResults.length > 0 && (
          <div className="space-y-1">
            <div className="text-white/70 text-xs">Recent Tests:</div>
            {lastResults.map((result, index) => (
              <div key={index} className="text-xs text-white/80 bg-white/5 p-1 rounded">
                {result}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-white/50 text-center">🎯 Pattern: Games 3, 6, 9, 12... WIN for each game type</div>
      </CardContent>
    </Card>
  )
}
