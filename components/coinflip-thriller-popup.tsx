"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { CoinSide } from "@/lib/game-config"

interface CoinflipThrillerPopupProps {
  isVisible: boolean
  betAmount: number
  selectedSide: CoinSide
  actualSide: CoinSide | null
  isWinner: boolean | null
  onComplete: () => void
}

export function CoinflipThrillerPopup({
  isVisible,
  betAmount,
  selectedSide,
  actualSide,
  isWinner,
  onComplete,
}: CoinflipThrillerPopupProps) {
  const [stage, setStage] = useState<"betting" | "flipping" | "result">("betting")

  useEffect(() => {
    if (!isVisible) {
      setStage("betting")
      return
    }

    const timer1 = setTimeout(() => setStage("flipping"), 1000)
    const timer2 = setTimeout(() => setStage("result"), 3000)
    const timer3 = setTimeout(() => {
      onComplete()
      setStage("betting")
    }, 5000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  const coinEmoji = actualSide ? (actualSide === "heads" ? "👑" : "🪙") : "🪙"
  const selectedEmoji = selectedSide === "heads" ? "👑" : "🪙"

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 animate-fade-in-up">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div
        className={cn(
          "glass-morphism-strong rounded-3xl p-8 text-center shadow-2xl transition-all duration-1000 relative overflow-hidden",
          stage === "betting" ? "scale-95 opacity-90 animate-scale-in" : "scale-100 opacity-100",
          stage === "result" && isWinner ? "bg-gradient-to-b from-green-400/20 to-green-600/20 border-green-400/30" : "",
          stage === "result" && !isWinner ? "bg-gradient-to-b from-red-400/20 to-red-600/20 border-red-400/30" : "",
        )}
      >
        {/* Animated background gradient */}
        <div className={cn(
          "absolute inset-0 transition-all duration-1000",
          stage === "betting" ? "gradient-shift opacity-20" : "",
          stage === "flipping" ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-pulse" : "",
          stage === "result" && isWinner ? "bg-gradient-to-r from-green-400/30 to-emerald-500/30 animate-glow-pulse" : "",
          stage === "result" && !isWinner ? "bg-gradient-to-r from-red-400/30 to-rose-500/30 animate-glow-pulse" : "",
        )} />

        {/* Stage 1: Bet Confirmation */}
        {stage === "betting" && (
          <div className="w-80 h-60 flex flex-col items-center justify-center space-y-4 relative z-10">
            <div className="relative">
              <div className="text-6xl animate-float">{selectedEmoji}</div>
              <div className="absolute inset-0 text-6xl animate-pulse-glow opacity-50">{selectedEmoji}</div>
            </div>
            <h2 className="text-2xl font-bold text-white animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <span className="bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">
                Bet Placed!
              </span>
            </h2>
            <p className="text-white/90 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <span className="font-bold text-yellow-300">{betAmount} SOL</span> on <span className="font-bold text-blue-300">{selectedSide.toUpperCase()}</span>
            </p>
            <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-shimmer"></div>
            </div>
          </div>
        )}

        {/* Stage 2: Flipping Animation */}
        {stage === "flipping" && (
          <div className="w-80 h-60 flex flex-col items-center justify-center space-y-4 relative z-10">
            <div className="relative">
              {/* Main spinning coin */}
              <div className="text-8xl animate-coin-flip">🪙</div>
              {/* Glow effect */}
              <div className="absolute inset-0 text-8xl animate-coin-flip opacity-30 blur-sm">🪙</div>
              {/* Sparkle effects */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 text-yellow-300 animate-ping"
                  style={{
                    transform: `rotate(${i * 60}deg) translateY(-60px)`,
                    animationDelay: `${i * 0.2}s`
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white animate-multiplier-pulse">
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Flipping...
              </span>
            </h2>
            <p className="text-white/90 animate-pulse">The coin is spinning through the air!</p>
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce" 
                  style={{animationDelay: `${i * 0.1}s`}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stage 3: Result Reveal */}
        {stage === "result" && (
          <div className="w-80 h-60 flex flex-col items-center justify-center space-y-4 relative z-10">
            <div className="relative">
              <div className={cn(
                "text-8xl transition-all duration-1000 animate-scale-in",
                isWinner ? "animate-multiplier-pulse" : "animate-pulse"
              )}>
                {coinEmoji}
              </div>
              {/* Victory/defeat effects */}
              {isWinner ? (
                <>
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 text-yellow-300 animate-ping"
                      style={{
                        transform: `rotate(${i * 30}deg) translateY(-80px)`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      🎉
                    </div>
                  ))}
                </>
              ) : (
                <div className="absolute inset-0 text-8xl opacity-20 animate-pulse blur-sm">💔</div>
              )}
            </div>
            
            <h2 className={cn(
              "text-4xl font-bold transition-all duration-1000 animate-fade-in-up",
              isWinner ? "text-green-300 animate-multiplier-pulse" : "text-red-300",
            )}>
              <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                isWinner ? "from-green-300 to-emerald-400" : "from-red-300 to-rose-400"
              )}>
                {isWinner ? "🎉 YOU WON! 🎉" : "💔 YOU LOST 💔"}
              </span>
            </h2>
            
            <p className="text-white/90 text-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Result: <span className="font-bold text-yellow-300">{actualSide?.toUpperCase()}</span>
            </p>
            
            {isWinner && (
              <div className="animate-fade-in-up animate-multiplier-pulse" style={{animationDelay: '0.4s'}}>
                <p className="text-green-300 font-bold text-2xl">
                  <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                    +{(betAmount * 2).toFixed(3)} SOL
                  </span>
                </p>
                <p className="text-green-200 text-sm">Transferred to your wallet!</p>
              </div>
            )}
          </div>
        )}

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg"></div>
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl-lg"></div>
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg"></div>
      </div>
    </div>
  )
}
