import { cn } from "@/lib/utils"

interface LimboVisualResultProps {
  actualMultiplier: number | null
  isWinner: boolean | null
  isAnimating: boolean
}

export function LimboVisualResult({ actualMultiplier, isWinner, isAnimating }: LimboVisualResultProps) {
  const displayMultiplier = actualMultiplier !== null ? actualMultiplier.toFixed(2) : "0.00"

  // Determine which GIF to show based on game state
  const getGifSource = () => {
    if (isWinner === null) {
      // Default state - no game played yet
      return "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDlhZW1tbzQ1OG1peG9ya2R5cGQwaml0Z252ZGZsMGh0d216cmlrbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/M1I45lyxk8IVwdxp2z/giphy.gif"
    } else if (isWinner === true) {
      // Win state
      return "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGFvNWxuaG50b3RyanNidjl6anpibm13c2N4aXpsbzF4eHlwNWVkcCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3ohzdGmM14QTUne9tm/giphy.gif"
    } else {
      // Lose state
      return "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dWR2YzN0Zm1pa3FvY2I5N3J6bHd4MndzcHY2OGE4ZWFweGttaGczNyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l4FGF6j0TSMk9ASOs/giphy.gif"
    }
  }

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
            LIMBO GAME
          </div>
          
          {/* Multiplier Display */}
          <div className="text-center mb-6">
            <div
              className={cn(
                "text-white text-8xl font-extrabold drop-shadow-2xl transition-all duration-1000 relative",
                isAnimating ? "animate-pulse" : "",
              )}
            >
              {/* Glow effect behind text */}
              <div className={cn(
                "absolute inset-0 blur-xl transition-all duration-1000",
                isWinner === true ? "text-green-400" : isWinner === false ? "text-red-400" : "text-yellow-400"
              )}>
                x{displayMultiplier}
              </div>
              
              {/* Main text with gradient */}
              <span className={cn(
                "relative z-10 bg-gradient-to-r bg-clip-text text-transparent transition-all duration-1000",
                isWinner === true ? "from-green-300 to-green-500" : 
                isWinner === false ? "from-red-300 to-red-500" : 
                "from-white to-yellow-200"
              )}>
                x{displayMultiplier}
              </span>
            </div>
          </div>

          {/* GIF Image based on game state */}
          <div className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden">
            <img 
              src={getGifSource()} 
              alt={isWinner === null ? "Limbo Game Ready" : isWinner ? "You Won!" : "You Lost!"}
              className="w-full h-full object-cover"
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
