"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown, Target } from "lucide-react"
import { MIN_TARGET_MULTIPLIER, MAX_TARGET_MULTIPLIER, type LimboGameResult } from "@/lib/limbo-config"

// Preset bet amounts
const BET_PRESETS = [0.001, 0.01, 0.1, 1.0]

interface LimboGameControlsProps {
  betAmount: string
  setBetAmount: (amount: string) => void
  targetMultiplier: string
  setTargetMultiplier: (multiplier: string) => void
  potentialWin: number
  handlePlay: () => Promise<void>
  isPlaying: boolean
  connecting: boolean
  connected: boolean
  payoutStatus: string
  payoutError: string
  currentResult: LimboGameResult | null
  gameHistory: LimboGameResult[]
}

export function LimboGameControls({
  betAmount,
  setBetAmount,
  targetMultiplier,
  setTargetMultiplier,
  potentialWin,
  handlePlay,
  isPlaying,
  connecting,
  connected,
  payoutStatus,
  payoutError,
  currentResult,
  gameHistory,
}: LimboGameControlsProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            Limbo Game Controls
          </CardTitle>
          <p className="text-white/70">Set your target multiplier and see how high it goes!</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bet Amount Section */}
          <div className="space-y-3">
            <Label htmlFor="bet-amount" className="text-white font-medium">
              Bet Amount (SOL)
            </Label>

            {/* Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {BET_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  variant={Number.parseFloat(betAmount) === preset ? "default" : "outline"}
                  onClick={() => setBetAmount(preset.toString())}
                  disabled={isPlaying || connecting}
                  className={`${
                    Number.parseFloat(betAmount) === preset
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  } text-sm py-2 rounded-xl`}
                >
                  {preset} SOL
                </Button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <Input
              id="bet-amount"
              type="number"
              min={0.001}
              step="0.001"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
              placeholder="Min: 0.001 SOL"
              disabled={isPlaying || connecting}
            />
          </div>

          {/* Target Multiplier Input */}
          <div className="space-y-3">
            <Label htmlFor="target-multiplier" className="text-white font-medium">
              Target Multiplier (X)
            </Label>
            <Input
              id="target-multiplier"
              type="number"
              min={MIN_TARGET_MULTIPLIER}
              max={MAX_TARGET_MULTIPLIER}
              step="0.01"
              value={targetMultiplier}
              onChange={(e) => setTargetMultiplier(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
              placeholder={`Min: ${MIN_TARGET_MULTIPLIER}x, Max: ${MAX_TARGET_MULTIPLIER}x`}
              disabled={isPlaying || connecting}
            />
          </div>

          {/* Potential Win Display */}
          <div className="text-center p-4 bg-white/5 border border-white/20 rounded-xl">
            <p className="text-white/70 text-sm mb-1">Potential Win</p>
            <p className="text-green-400 font-bold text-xl">
              {potentialWin.toFixed(3)} SOL
            </p>
          </div>

          {/* Play Button */}
          <Button
            onClick={handlePlay}
            disabled={isPlaying || connecting || !connected}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50 rounded-xl"
          >
            {connecting ? "Connecting..." : isPlaying ? "Processing..." : `Play Limbo (${betAmount} SOL)`}
          </Button>

          {/* Status Messages */}
          {payoutStatus && (
            <div className="text-center p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
              <p className="text-green-100">{payoutStatus}</p>
            </div>
          )}

          {payoutError && (
            <div className="text-center p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 justify-center">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-100">{payoutError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Result Display */}
      {currentResult && (
        <Card
          className={`${currentResult.won ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"} rounded-2xl`}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <div className={`text-lg font-bold mb-2 ${currentResult.won ? "text-green-400" : "text-red-400"}`}>
                {currentResult.won ? "YOU WON!" : "YOU LOST!"}
              </div>
              <div className="text-white/80 text-sm mb-2">
                Target: {currentResult.targetMultiplier.toFixed(2)}x | Actual: {currentResult.actualMultiplier.toFixed(2)}x
              </div>
              <div className="text-white/70 text-sm">
                Bet: {currentResult.betAmount.toFixed(3)} SOL
              </div>
              {currentResult.won && (
                <div className="text-green-400 font-bold text-sm mt-2">
                  Won: {currentResult.winAmount.toFixed(3)} SOL
                </div>
              )}
              <div className="text-white/60 text-xs mt-2">
                Game #{currentResult.gameNumber}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Statistics */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-white/5 border-white/10 rounded-2xl">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <p className="text-white/70 text-sm">Wins</p>
            <p className="text-white font-bold">{gameHistory.filter((g) => g.won).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 rounded-2xl">
          <CardContent className="p-3 text-center">
            <TrendingDown className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <p className="text-white/70 text-sm">Losses</p>
            <p className="text-white font-bold">{gameHistory.filter((g) => !g.won).length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
