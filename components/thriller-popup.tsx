"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ThrillerPopupProps {
  isVisible: boolean
  onComplete: () => void
  selectedColour: string
  betAmount: string
}

export function ThrillerPopup({ isVisible, onComplete, selectedColour, betAmount }: ThrillerPopupProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setStage(0)
      return
    }

    const timer1 = setTimeout(() => setStage(1), 100)
    const timer2 = setTimeout(() => setStage(2), 1000)
    const timer3 = setTimeout(() => setStage(3), 2000)
    const timer4 = setTimeout(() => {
      setStage(0)
      onComplete()
    }, 4000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500",
          stage >= 1 ? "bg-black/90 backdrop-blur-sm" : "bg-transparent",
        )}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Stage 1: Bet confirmation */}
        {stage >= 1 && (
          <div
            className={cn(
              "transition-all duration-700 transform",
              stage >= 2 ? "scale-90 opacity-60" : "scale-100 opacity-100",
            )}
          >
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-12 border border-white/30 shadow-2xl">
              <div className="text-6xl mb-6">🎯</div>
              <div className="text-white text-3xl font-bold mb-4">Bet Placed!</div>
              <div className="text-white/90 text-xl mb-2">
                {betAmount} SOL on {selectedColour.toUpperCase()}
              </div>
              <div className="text-white/70 text-lg">{selectedColour === "red" ? "🔴" : "🟢"} Good luck!</div>
            </div>
          </div>
        )}

        {/* Stage 2: Spinning effect */}
        {stage >= 2 && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-700",
              stage >= 3 ? "scale-110 opacity-80" : "scale-100 opacity-100",
            )}
          >
            <div className="text-center">
              <div className="text-9xl animate-spin mb-4">{selectedColour === "red" ? "🔴" : "🟢"}</div>
              <div className="text-white text-2xl font-bold">Spinning...</div>
            </div>
          </div>
        )}

        {/* Stage 3: Final dramatic effect */}
        {stage >= 3 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-pulse">✨</div>
              <div className="text-white text-4xl font-bold animate-bounce mb-4">REVEALING RESULT...</div>
              <div className="text-white/80 text-xl">The colours are spinning!</div>
              <div className="text-white/60 text-lg mt-2">Get ready...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
