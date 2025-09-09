"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { DiceChoice } from "@/lib/dice-config"

interface DiceThrillerPopupProps {
  isVisible: boolean
  onComplete: () => void
  selectedChoice: DiceChoice
  betAmount: string
}

export function DiceThrillerPopup({ isVisible, onComplete, selectedChoice, betAmount }: DiceThrillerPopupProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setStage(0)
      return
    }

    const timer1 = setTimeout(() => setStage(1), 100)
    const timer2 = setTimeout(() => setStage(2), 800)
    const timer3 = setTimeout(() => setStage(3), 1500)
    const timer4 = setTimeout(() => {
      setStage(0)
      onComplete()
    }, 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  const getChoiceEmoji = (choice: DiceChoice) => {
    return choice === "more" ? "📈" : "📉"
  }

  const getChoiceText = (choice: DiceChoice) => {
    return choice === "more" ? "MORE THAN 6" : "LESS THAN 6"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500",
          stage >= 1 ? "bg-black/80 backdrop-blur-sm" : "bg-transparent",
        )}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Stage 1: Bet confirmation */}
        {stage >= 1 && (
          <div
            className={cn(
              "transition-all duration-500 transform",
              stage >= 2 ? "scale-75 opacity-50" : "scale-100 opacity-100",
            )}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-4xl mb-4">🎯</div>
              <div className="text-white text-2xl font-bold mb-2">Bet Placed!</div>
              <div className="text-white/80 text-lg">
                {betAmount} SOL on {getChoiceText(selectedChoice)}
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Rolling dice effect */}
        {stage >= 2 && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-500",
              stage >= 3 ? "scale-125 opacity-75" : "scale-100 opacity-100",
            )}
          >
            <div className="text-8xl animate-spin">🎲</div>
          </div>
        )}

        {/* Stage 3: Final dramatic effect */}
        {stage >= 3 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">✨</div>
              <div className="text-white text-3xl font-bold animate-bounce">ROLLING DICE...</div>
              <div className="text-white/60 text-lg mt-2 flex items-center justify-center gap-2">
                <span>{getChoiceEmoji(selectedChoice)}</span>
                <span>Good luck!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
