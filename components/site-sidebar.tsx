"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Hexagon, Map } from "lucide-react"

export function SiteSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const gameItems = [
    { href: "/colours", label: "Colours", gifUrl: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2pzNW85NHEyem5xMHBjNGJrbGN1N2J1NzB2aWhvZzI0NzRoZzQ5aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/30pjsLvNyaRY0eoE0b/giphy.gif", isNew: true },
    { href: "/coinflip", label: "Coinflip", gifUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2ZlejE5ZHN4aG1seDl4ZDJjeGE4ZWtseTMwcDl1M2toOXB5ZmRqdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3og0IyDmtho5lv6huo/giphy.gif" },
    { href: "/dice", label: "Dice", gifUrl: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHRhN3Y1djk4NGgwczJoMXkwOXdqbmtuOTJoYnR0c2gyMHgzcjdsNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f73urdknsWliIEZiDw/giphy.gif" },
    { href: "/limbo", label: "Limbo", gifUrl: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmloMjcwNGxrMTF5bDNwY3M3NzVuOWJyazdqcng5bmhwdWgyODd1OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZHMN9ki2rCld0edNKb/giphy.gif" },
    { href: "/plinko", label: "Plinko", gifUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzUxODB6eTlic3Azd3BxcWM2eHliY2NybzM4YmdiZDJ4Y2Fmb2l6OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u407qDaZgD95Ae4/giphy.gif" },
  ]

  const platformItems = [
    { href: "/nft", label: "NFT", icon: Hexagon },
    { href: "/roadmap", label: "Roadmap", icon: Map },
  ]

  return (
    <aside className="hidden md:block w-64 bg-[#1a1a2e] border-r border-white/10 shadow-lg fixed top-16 left-0 z-10 h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-1 p-4 h-full overflow-y-auto">
        <div className="mb-4 animate-fade-in-up">
          <h2 className="px-4 text-lg font-semibold text-white/80 mb-1 bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">
            Games
          </h2>
        </div>

        <div className="space-y-1">
          {gameItems.map((item, index) => {
            const active = isActive(item.href)
            
            return (
              <div 
                key={item.href} 
                className={`relative animate-fade-in-up`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <Link href={item.href} className="w-full">
                  <div className={`w-full flex items-center justify-start rounded-xl p-3 transition-all duration-300 hover-lift group cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg animate-glow-pulse"
                        : "text-white hover:text-yellow-300 hover:bg-white/5"
                    }`}
                  >
                    <div className={`mr-3 w-10 h-10 rounded-full overflow-hidden bg-white/20 transition-all duration-300 ${active ? 'animate-pulse scale-110' : 'group-hover:scale-125'}`}>
                      <img 
                        src={item.gifUrl} 
                        alt={`${item.label} game`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <span className={`font-semibold text-xl transition-transform duration-300 ${active ? 'text-white' : 'group-hover:scale-110'}`}>{item.label}</span>
                  </div>
                </Link>
                
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-r-full animate-pulse"></div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <h2 className="px-4 text-lg font-semibold text-white/80 mb-1 bg-gradient-to-r from-green-300 to-blue-400 bg-clip-text text-transparent">
            Platform
          </h2>
        </div>

        <div className="space-y-1">
          {platformItems.map((item, index) => {
            const active = isActive(item.href)
            const IconComponent = item.icon
            
            return (
              <div 
                key={item.href} 
                className={`relative animate-fade-in-up`}
                style={{animationDelay: `${0.7 + index * 0.1}s`}}
              >
                <Link href={item.href} className="w-full">
                  <div className={`w-full flex items-center justify-start rounded-xl p-3 transition-all duration-300 hover-lift group cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-green-600 to-blue-600 shadow-lg animate-glow-pulse"
                        : "text-white hover:text-green-300 hover:bg-white/5"
                    }`}
                  >
                    <div className={`mr-3 w-10 h-10 rounded-full overflow-hidden bg-white/20 transition-all duration-300 flex items-center justify-center ${active ? 'animate-pulse scale-110' : 'group-hover:scale-125'}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className={`font-semibold text-xl transition-transform duration-300 ${active ? 'text-white' : 'group-hover:scale-110'}`}>{item.label}</span>
                  </div>
                </Link>
                
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-blue-600 rounded-r-full animate-pulse"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
