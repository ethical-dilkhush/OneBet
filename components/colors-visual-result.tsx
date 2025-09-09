"use client"

import { useEffect, useState } from "react"
import { COLOURS } from "@/lib/colors-config"
import type { ColourGameResult } from "@/lib/colors-config"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ColoursVisualResultProps {
  result: ColourGameResult | null
  isVisible: boolean
  onClose?: () => void
}

// Win Modal Component
function WinModal({ result }: { result: ColourGameResult }) {
  const resultColour = COLOURS.find((c) => c.name === result.actualResult)
  const playerColour = COLOURS.find((c) => c.name === result.playerChoice)

  return (
    <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white w-[92vw] sm:max-w-lg max-h-[90vh] overflow-hidden p-6 sm:p-8" style={{borderRadius: '32px'}}>
      <div className="flex flex-col items-center">
        {/* Win GIF Image */}
        <div className="w-48 h-48 sm:w-64 sm:h-64 mb-6">
          <img 
            src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHNlYmoxYTdtcmhlYWRydmVocnJzbmZ4cHBvOGlmcmRpeG44NTJ3ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/8L1Ln4gOOabZIz0Q0s/giphy.gif"
            alt="Victory celebration"
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </div>
        
        {/* Win Description */}
        <div className="text-center">
          <div className="text-green-400 text-2xl sm:text-3xl font-bold mb-4 drop-shadow-lg">
            🎉 YOU WON! 🎉
          </div>
          
          <div className="text-white/90 text-sm sm:text-base mb-2 drop-shadow-md">
            You picked: <span className="font-bold" style={{color: playerColour?.name === 'red' ? '#ef4444' : '#22c55e'}}>
              {playerColour?.name.toUpperCase()}
            </span> {playerColour?.emoji}
          </div>
          
          <div className="text-white/90 text-sm sm:text-base mb-3 drop-shadow-md">
            Result: <span className="font-bold" style={{color: resultColour?.name === 'red' ? '#ef4444' : '#22c55e'}}>
              {resultColour?.name.toUpperCase()}
            </span> {resultColour?.emoji}
          </div>

          <div className="text-white/80 text-xs sm:text-sm mb-3 drop-shadow-md">
            Bet: <span className="font-bold text-yellow-300">{result.betAmount.toFixed(3)} SOL</span>
          </div>

          <div className="text-green-400 font-bold text-base sm:text-lg mb-3 drop-shadow-md">
            Won: <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              {result.winAmount.toFixed(3)} SOL
            </span>
          </div>

          <div className="text-white/60 text-xs drop-shadow-md">
            Game #{result.gameNumber}
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

// Loss Modal Component
function LossModal({ result }: { result: ColourGameResult }) {
  const resultColour = COLOURS.find((c) => c.name === result.actualResult)
  const playerColour = COLOURS.find((c) => c.name === result.playerChoice)

  return (
    <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white w-[92vw] sm:max-w-lg max-h-[90vh] overflow-hidden p-6 sm:p-8" style={{borderRadius: '32px'}}>
      <div className="flex flex-col items-center">
        {/* Loss GIF Image */}
        <div className="w-48 h-48 sm:w-64 sm:h-64 mb-6">
          <img 
            src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGE1c3QxejBtcXlxZ3JyNGNmZDg3b2M0aDgwbmhtZWRwa3V4Ymx5ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/MEQtufVjPctWNil25d/giphy.gif"
            alt="Defeat animation"
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </div>
        
        {/* Loss Description */}
        <div className="text-center">
          <div className="text-red-400 text-2xl sm:text-3xl font-bold mb-4 drop-shadow-lg">
            💔 YOU LOST 💔
          </div>
          
          <div className="text-white/90 text-sm sm:text-base mb-2 drop-shadow-md">
            You picked: <span className="font-bold" style={{color: playerColour?.name === 'red' ? '#ef4444' : '#22c55e'}}>
              {playerColour?.name.toUpperCase()}
            </span> {playerColour?.emoji}
          </div>
          
          <div className="text-white/90 text-sm sm:text-base mb-3 drop-shadow-md">
            Result: <span className="font-bold" style={{color: resultColour?.name === 'red' ? '#ef4444' : '#22c55e'}}>
              {resultColour?.name.toUpperCase()}
            </span> {resultColour?.emoji}
          </div>

          <div className="text-white/80 text-xs sm:text-sm mb-3 drop-shadow-md">
            Bet: <span className="font-bold text-yellow-300">{result.betAmount.toFixed(3)} SOL</span>
          </div>

          <div className="text-red-400 font-bold text-sm sm:text-base mb-3 drop-shadow-md">
            Better luck next time!
          </div>

          <div className="text-white/60 text-xs drop-shadow-md">
            Game #{result.gameNumber}
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

// Main Component that decides which modal to show
export function ColoursVisualResult({ result, isVisible, onClose }: ColoursVisualResultProps) {
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (isVisible && result) {
      const timer = setTimeout(() => {
        setShowResult(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setShowResult(false)
    }
  }, [isVisible, result])

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose()
    }
  }

  if (!isVisible || !result) return null

  // Show appropriate modal based on win/loss status
  return (
    <Dialog open={isVisible} onOpenChange={handleOpenChange}>
      {result.won ? (
        <WinModal result={result} />
      ) : (
        <LossModal result={result} />
      )}
    </Dialog>
  )
}