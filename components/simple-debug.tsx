"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  playDiceGame,
  playColorsGame,
  playCoinflipGame,
  getAllCounters,
  resetAllCounters,
} from "@/lib/simple-game-counter"

export function SimpleDebug() {
  const [counters, setCounters] = useState({ dice: 0, colors: 0, coinflip: 0 })
  const [results, setResults] = useState<string[]>([])

  const updateCounters = () => {
    setCounters(getAllCounters())
  }

  useEffect(() => {
    updateCounters()
  }, [])

  const testDice = () => {
    const result = playDiceGame()
    const message = `🎲 Dice #${result.gameNumber}: ${result.isWinner ? "🏆 WIN" : "❌ LOSE"}`
    setResults((prev) => [message, ...prev.slice(0, 9)])
    updateCounters()
  }

  const testColors = () => {
    const result = playColorsGame()
    const message = `🎨 Colors #${result.gameNumber}: ${result.isWinner ? "🏆 WIN" : "❌ LOSE"}`
    setResults((prev) => [message, ...prev.slice(0, 9)])
    updateCounters()
  }

  const testCoinflip = () => {
    const result = playCoinflipGame()
    const message = `🪙 Coinflip #${result.gameNumber}: ${result.isWinner ? "🏆 WIN" : "❌ LOSE"}`
    setResults((prev) => [message, ...prev.slice(0, 9)])
    updateCounters()
  }

  const resetAll = () => {
    resetAllCounters()
    setResults((prev) => ["🔄 ALL RESET", ...prev.slice(0, 9)])
    updateCounters()
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-sm">🔧 Simple Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Counters */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-white/70">Dice</div>
            <div className="text-white font-bold">{counters.dice}</div>
            <div className="text-green-400 text-xs">
              Next: {counters.dice === 0 ? 3 : Math.ceil(counters.dice / 3) * 3}
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-white/70">Colors</div>
            <div className="text-white font-bold">{counters.colors}</div>
            <div className="text-green-400 text-xs">
              Next: {counters.colors === 0 ? 3 : Math.ceil(counters.colors / 3) * 3}
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-white/70">Coinflip</div>
            <div className="text-white font-bold">{counters.coinflip}</div>
            <div className="text-green-400 text-xs">
              Next: {counters.coinflip === 0 ? 3 : Math.ceil(counters.coinflip / 3) * 3}
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-1">
          <Button onClick={testDice} size="sm" className="bg-blue-500 hover:bg-blue-600 text-xs">
            Test Dice
          </Button>
          <Button onClick={testColors} size="sm" className="bg-green-500 hover:bg-green-600 text-xs">
            Test Colors
          </Button>
          <Button onClick={testCoinflip} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-xs">
            Test Coinflip
          </Button>
          <Button onClick={resetAll} size="sm" className="bg-red-500 hover:bg-red-600 text-xs">
            Reset All
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-1">
            <div className="text-white/70 text-xs">Results:</div>
            {results.slice(0, 5).map((result, index) => (
              <div key={index} className="text-xs text-white/80 bg-white/5 p-1 rounded">
                {result}
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-white/50 text-center">Pattern: 3, 6, 9, 12... WIN</div>
      </CardContent>
    </Card>
  )
}
