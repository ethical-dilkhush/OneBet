"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGlobalCounters, resetGlobalCounters, type GameCounters } from "@/lib/global-game-service"

export function GlobalDebug() {
  const [counters, setCounters] = useState<GameCounters>({
    dice: {},
    colors: {},
    coinflip: {},
    plinko: {},
    limbo: {},
    limbo_total_bets: 0,
    limbo_total_payouts: 0,
  })
  const [loading, setLoading] = useState(false)

  const updateCounters = async () => {
    try {
      const newCounters = await getGlobalCounters()
      setCounters(newCounters)
    } catch (error) {
      console.error("Failed to update counters:", error)
    }
  }

  useEffect(() => {
    updateCounters()
    // Refresh counters every 5 seconds to show other players' games
    const interval = setInterval(updateCounters, 5000)
    return () => clearInterval(interval)
  }, [])

  const resetAll = async () => {
    setLoading(true)
    try {
      const newCounters = await resetGlobalCounters()
      updateCounters()
    } catch (error) {
      console.error("Failed to reset counters:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTotal = (gameType: keyof GameCounters): number => {
    let total = 0
    if (typeof counters[gameType] === "object" && counters[gameType] !== null) {
      const amounts = counters[gameType] as Record<string, number>
      for (const amount in amounts) {
        if (amounts.hasOwnProperty(amount)) {
          total += amounts[amount]
        }
      }
    }
    return total
  }

  const limboTotalBets = counters.limbo_total_bets || 0
  const limboTotalPayouts = counters.limbo_total_payouts || 0
  const limboHouseProfit = limboTotalBets - limboTotalPayouts // Current profit from Limbo games

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-white text-sm sm:text-base">🌍 Global Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3 sm:p-4">
        <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-white/70">Dice</div>
            <div className="text-white font-bold text-sm sm:text-base">{getTotal("dice")}</div>
          </div>
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-white/70">Colors</div>
            <div className="text-white font-bold text-sm sm:text-base">{getTotal("colors")}</div>
          </div>
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-white/70">Coinflip</div>
            <div className="text-white font-bold text-sm sm:text-base">{getTotal("coinflip")}</div>
          </div>
        </div>

        <div className="bg-white/5 p-2 rounded text-center">
          <div className="text-white/70">Total Bets (Limbo)</div>
          <div className="text-white font-bold text-sm sm:text-base">{limboTotalBets.toFixed(6)} SOL</div>
        </div>
        <div className="bg-white/5 p-2 rounded text-center">
          <div className="text-white/70">Total Payouts (Limbo)</div>
          <div className="text-white font-bold text-sm sm:text-base">{limboTotalPayouts.toFixed(6)} SOL</div>
        </div>
        <div className="bg-white/5 p-2 rounded text-center">
          <div className="text-white/70">Limbo House Profit</div>
          <div className="text-white font-bold text-sm sm:text-base">{limboHouseProfit.toFixed(6)} SOL</div>
        </div>

        <Button
          onClick={resetAll}
          disabled={loading}
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-xs col-span-2"
        >
          {loading ? "..." : "Reset All Counters"}
        </Button>

        <div className="text-xs text-white/50 text-center">Auto-refreshes every 5s</div>
      </CardContent>
    </Card>
  )
}
