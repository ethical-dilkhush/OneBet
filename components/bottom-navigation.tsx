"use client"

import { Home, Palette, Coins, Dice1, Settings, Hexagon, Map, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function BottomNavigation() {
  const pathname = usePathname()
  const [currentSet, setCurrentSet] = useState(0) // 0 for main games, 1 for additional games
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Fixed home icon (always visible)
  const homeIcon = { href: "/", label: "Home", icon: Home }

  // Main games (first set - excluding home)
  const mainGames = [
    { href: "/colours", label: "Colours", icon: Palette, gifUrl: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2pzNW85NHEyem5xMHBjNGJrbGN1N2J1NzB2aWhvZzI0NzRoZzQ5aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/30pjsLvNyaRY0eoE0b/giphy.gif" },
    { href: "/coinflip", label: "Coinflip", icon: Coins, gifUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2ZlejE5ZHN4aG1seDl4ZDJjeGE4ZWtseTMwcDl1M2toOXB5ZmRqdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3og0IyDmtho5lv6huo/giphy.gif" },
    { href: "/dice", label: "Dice", icon: Dice1, gifUrl: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHRhN3Y1djk4NGgwczJoMXkwOXdqbmtuOTJoYnR0c2gyMHgzcjdsNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f73urdknsWliIEZiDw/giphy.gif" },
  ]

  // Additional games (second set)
  const additionalGames = [
    { href: "/limbo", label: "Limbo", icon: Hexagon, gifUrl: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmloMjcwNGxrMTF5bDNwY3M3NzVuOWJyazdqcng5bmhwdWgyODd1OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZHMN9ki2rCld0edNKb/giphy.gif" },
    { href: "/plinko", label: "Plinko", icon: Map, gifUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzUxODB6eTlic3Azd3BxcWM2eHliY2NybzM4YmdiZDJ4Y2Fmb2l6OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u407qDaZgD95Ae4/giphy.gif" },
    { href: "/nft", label: "NFT", icon: Settings },
  ]

  const currentGames = currentSet === 0 ? mainGames : additionalGames

  const toggleGameSet = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSet(currentSet === 0 ? 1 : 0)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 150)
  }

  // How to play instructions for each game
  const gameInstructions = [
    "COLOURS: Pick a color and bet amount - if the wheel lands on your color you win",
    "COINFLIP: Choose heads or tails and your bet amount - 50/50 chance to double your money",
    "DICE: Set your target number and bet - roll above your target to win with higher multipliers for riskier bets",
    "LIMBO: Choose your multiplier and bet - the higher the multiplier the lower your chance but bigger payout",
    "PLINKO: Drop the ball and watch it bounce through pegs - different slots have different multipliers"
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
        <div className="flex justify-around items-center py-1 px-4">
          {/* Fixed Home Icon */}
          <Link
            href={homeIcon.href}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 min-w-0 group ${
              pathname === homeIcon.href
                ? "text-yellow-300"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            <homeIcon.icon className={`h-6 w-6 mb-1 transition-all duration-300 ${pathname === homeIcon.href ? "drop-shadow-glow" : ""}`} />
            <span className="text-xs font-medium truncate transition-all duration-300">{homeIcon.label}</span>
          </Link>

                      {/* Sliding Game Icons Container */}
            <div className={`flex justify-around items-center flex-1 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'transform translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
            }`}>
            {currentGames.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 min-w-0 group ${
                    isActive
                      ? "text-yellow-300"
                      : "text-white/60 hover:text-white/90"
                  }`}
                >
                  {item.gifUrl ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden mb-1 group-hover:scale-110 transition-transform duration-300">
                      <img 
                        src={item.gifUrl} 
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <Icon className={`h-6 w-6 mb-1 transition-all duration-300 ${isActive ? "drop-shadow-glow" : ""}`} />
                  )}
                  <span className="text-xs font-medium truncate transition-all duration-300">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Arrow Toggle Button */}
          <button
            onClick={toggleGameSet}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 min-w-0 group text-white/60 hover:text-white/90 hover:bg-white/5"
          >
            {currentSet === 0 ? (
              <ChevronRight className="h-6 w-6 mb-1" />
            ) : (
              <ChevronLeft className="h-6 w-6 mb-1" />
            )}
            <span className="text-xs font-medium truncate">
              {currentSet === 0 ? "More" : "Back"}
            </span>
          </button>
        </div>
      </nav>

      {/* Desktop Game Guidelines Marquee */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 z-50 overflow-hidden py-3 bg-gray-900/90 backdrop-blur-xl border-t border-white/10">
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="text-white/80 text-sm font-medium mr-8">
            {gameInstructions.join(" • ")}
          </span>
          <span className="text-white/80 text-sm font-medium mr-8">
            {gameInstructions.join(" • ")}
          </span>
        </div>
      </div>
    </>
  )
}