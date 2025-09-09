import { cn } from "@/lib/utils"
import type { DiceChoice, DiceGameResult } from "@/lib/dice-config"

interface DiceVisualResultProps {
  diceTotal: number | null
  playerChoice: DiceChoice | null
  isWinner: boolean | null
  isAnimating: boolean
  currentResult?: DiceGameResult | null
}

export function DiceVisualResult({ diceTotal, playerChoice, isWinner, isAnimating, currentResult }: DiceVisualResultProps) {
  // Debug logging
  console.log('DiceVisualResult render:', { currentResult, diceTotal, playerChoice, isWinner, isAnimating })

  const getDiceText = (total: number | null) => {
    if (total === null) return "ROLL DICE"
    return total.toString()
  }

  const getChoiceEmoji = (choice: DiceChoice | null) => {
    if (!choice) return "🎲"
    return choice === "more" ? "📈" : "📉"
  }

  const getChoiceGradient = (choice: DiceChoice | null) => {
    if (!choice) return "bg-gradient-to-br from-gray-400 to-gray-600"
    return choice === "more" ? "bg-gradient-to-br from-green-400 to-green-600" : "bg-gradient-to-br from-red-400 to-red-600"
  }

  // Show result with GIF if we have a currentResult
  if (currentResult) {
    console.log('Showing result with GIF:', currentResult)
    return (
      <div key={`result-${currentResult.gameNumber}`} className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-red-900"></div>
        
        {/* Starry background effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
          <div className="text-center space-y-4">
            {currentResult.won ? (
              // Win Result
              <>
                <div className="text-3xl font-bold text-green-400 mb-4">
                  YOU WON!
                </div>
                
                {/* Win GIF Image */}
                <div className="w-48 h-48 mx-auto mb-6">
                  <img 
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3cxeGNoc242ejE5YTRscmw3OWF3YjI4N3JveGc5enQwYjd5eHQ3MSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/ghDlzU7nhLMVgSL8B4/giphy.gif?v=2"
                    alt="Win celebration"
                    className="w-full h-full rounded-2xl"
                  />
                </div>
                
                <div className="text-white/90 text-base">
                  You picked: <span className="font-bold text-blue-400">{currentResult.playerChoice.toUpperCase()}</span>
                </div>
                <div className="text-white/90 text-base">
                  Result: <span className="font-bold text-blue-400">{currentResult.dice1} + {currentResult.dice2} = {currentResult.total}</span>
                </div>
                <div className="text-white/80 text-sm">
                  Bet: <span className="font-bold text-yellow-300">{currentResult.betAmount.toFixed(3)} SOL</span>
                </div>
                <div className="text-green-400 font-bold text-lg">
                  Won: <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                    {currentResult.winAmount.toFixed(3)} SOL
                  </span>
                </div>
                <div className="text-white/60 text-sm">
                  Game #{currentResult.gameNumber}
                </div>
              </>
            ) : (
              // Loss Result
              <>
                <div className="text-3xl font-bold text-red-400 mb-4">
                  YOU LOST
                </div>
                
                {/* Loss GIF Image */}
                <div className="w-48 h-48 mx-auto mb-6">
                  <img 
                    src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eXBxbXUyZTJ5MmRsYjlzdWZwcXh3eWYxMTZueTU1ams4NGg3andvciZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/IjVrBogKTnVTMWFpYo/giphy.gif"
                    alt="Loss result"
                    className="w-full h-full rounded-2xl"
                  />
                </div>
                
                <div className="text-white/90 text-base">
                  You picked: <span className="font-bold text-blue-400">{currentResult.playerChoice.toUpperCase()}</span>
                </div>
                <div className="text-white/90 text-base">
                  Result: <span className="font-bold text-blue-400">{currentResult.dice1} + {currentResult.dice2} = {currentResult.total}</span>
                </div>
                <div className="text-white/80 text-sm">
                  Bet: <span className="font-bold text-yellow-300">{currentResult.betAmount.toFixed(3)} SOL</span>
                </div>
                <div className="text-red-400 font-bold text-lg">
                  You lost this round! (Dice Game #{currentResult.gameNumber}) Better luck next time!
                </div>
              </>
            )}
          </div>
        </div>

        {/* Small blue squares with sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-blue-400/30 rounded-sm flex items-center justify-center"
              style={{
                left: `${10 + (i * 10)}%`,
                top: `${20 + (i % 3 * 20)}%`,
              }}
            >
              <span className="text-yellow-300 text-xs">✨</span>
            </div>
          ))}
        </div>

        {/* Bottom cloud effects */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-white/10 rounded-t-full blur-lg"></div>
        <div className="absolute bottom-0 left-1/4 w-48 h-24 bg-white/15 rounded-t-full blur-md"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-20 bg-white/10 rounded-t-full blur-sm"></div>
      </div>
    )
  }

  // Default Component - Show default visual when no result
  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-red-900"></div>
      
      {/* Starry background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
        <div className="text-center space-y-6">
          {/* Title */}
          <div className="text-4xl font-bold text-white mb-6 drop-shadow-2xl">
            ROLL DICE
          </div>
          
          {/* Default GIF Image */}
          <div className="w-64 h-64 mx-auto">
            <img 
              src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ejdtdWt6MXpmeGtrNWg2dmVkdm1ocWVvejBrY2t5Z2F5eWttc3g3bCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/Gj3gfsSGGGdathUeEg/giphy.gif"
              alt="Default dice game"
              className="w-full h-full rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Small blue squares with sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-blue-400/30 rounded-sm flex items-center justify-center"
            style={{
              left: `${10 + (i * 10)}%`,
              top: `${20 + (i % 3 * 20)}%`,
            }}
          >
            <span className="text-yellow-300 text-xs">✨</span>
          </div>
        ))}
      </div>

      {/* Bottom cloud effects */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-white/10 rounded-t-full blur-lg"></div>
      <div className="absolute bottom-0 left-1/4 w-48 h-24 bg-white/15 rounded-t-full blur-md"></div>
      <div className="absolute bottom-0 right-1/4 w-40 h-20 bg-white/10 rounded-t-full blur-sm"></div>
    </div>
  )
}
