"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WalletButton } from "@/components/wallet-button"
import { WalletInfo } from "@/components/wallet-info"
import { ArrowLeft, CheckCircle, Clock, Users, Gamepad2, Rocket, Coins, Hexagon, Plus } from "lucide-react"
import Link from "next/link"

// TypeScript declarations for Vanta.js
declare global {
  interface Window {
    VANTA: {
      DOTS: (config: any) => any
    }
  }
}

export default function RoadmapPage() {
  // Vanta.js background effect
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  // Vanta.js DOTS Background Effect
  useEffect(() => {
    if (!vantaEffect.current) {
      // Load Three.js and Vanta.js scripts dynamically
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve()
            return
          }

          const script = document.createElement("script")
          script.src = src
          script.onload = () => resolve()
          script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
          document.head.appendChild(script)
        })
      }

      const initVanta = async () => {
        try {
          // Load Three.js first
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js")
          // Then load Vanta DOTS
          await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js")

          // Check if Vanta is available and initialize
          if (window.VANTA && vantaRef.current) {
            vantaEffect.current = window.VANTA.DOTS({
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: 1.0,
              scaleMobile: 1.0,
              backgroundColor: 0x000000,
              color: 0xffffff,
              color2: 0xcccccc,
              size: 3.0,
              spacing: 35.0,
              showLines: true,
              lineColor: 0xffffff,
              lineWidth: 1.0,
              points: 20.0,
              maxDistance: 50.0,
            })
          }
        } catch (error) {
          console.error("Failed to load Vanta.js:", error)
        }
      }

      initVanta()
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
      }
    }
  }, [])

  return (
    <>
      {/* Vanta.js DOTS Background - Complete Body Coverage */}
      <div 
        ref={vantaRef} 
        className="fixed inset-0 w-screen h-screen -z-10 bg-black"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      ></div>
      
      {/* Content */}
      <div className="min-h-screen relative py-4 w-full">
        <div className="container mx-auto relative z-10 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
            </div>

            <div className="flex items-center gap-3">
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">One Bets Roadmap</h1>
              <p className="text-lg md:text-xl text-white/90">Building the future of crypto gaming on Solana</p>
            </div>

            {/* Roadmap Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
              {/* Phase 1 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-green-500 rounded-full p-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Phase 1: Foundation</h3>
                    <div className="text-green-400 font-semibold text-sm">✅ COMPLETED</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">Create expert development team</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">Build best experience betting platform</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">Core One Bets development</span>
                  </div>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-green-500 rounded-full p-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Phase 2: Game Development</h3>
                    <div className="text-green-400 font-semibold text-sm">✅ COMPLETED</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">Develop 5 games (First Phase)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">Dice, Coinflip, Colors, Limbo, Plinko</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">Launch platform for Solana users</span>
                  </div>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-green-500 rounded-full p-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Phase 3: Token Launch</h3>
                    <div className="text-green-400 font-semibold text-sm">✅ COMPLETED</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">Launch $BETS Token</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">100% Release at Token Launch</span>
                  </div>
          
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">100% Liquidity Locked</span>
                  </div>
                </div>
                
              </div>

              {/* Phase 4 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-purple-500 rounded-full p-4">
                    <Hexagon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white">Phase 4: NFT & Expansion</h3>
                    <div className="text-purple-400 font-semibold text-sm">🔮 PLANNED</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Clock className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <span className="text-white/90">First BETS NFT Collection launch</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Clock className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <span className="text-white/90">NFT utility integration</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Clock className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <span className="text-white/90">Add 5 more games (within a month)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 mb-8 md:mb-12 border border-white/20">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 md:mb-8">Development Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="bg-green-500 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-green-400">100%</div>
                  <div className="text-white/70 text-xs md:text-sm">Phase 1 Complete</div>
                </div>
                <div className="text-center">
                  <div className="bg-green-500 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-green-400">95%</div>
                  <div className="text-white/70 text-xs md:text-sm">Phase 2 Complete</div>
                </div>
                <div className="text-center">
                  <div className="bg-green-500 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-green-400">100%</div>
                  <div className="text-white/70 text-xs md:text-sm">Phase 3 Complete</div>
                </div>
                <div className="text-center">
                  <div className="bg-purple-500 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <Hexagon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-purple-400">10%</div>
                  <div className="text-white/70 text-xs md:text-sm">Phase 4 Planned</div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-8 md:mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8 border border-white/20">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Join the Journey</h2>
                <p className="text-white/90 mb-4 md:mb-6 text-sm md:text-base">Connect with us on social media for updates and community</p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                  <a 
                    href="https://x.com/onebets_" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 md:px-6 lg:px-8 py-3 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Follow on X
                  </a>
                  
                </div>
              </div>
              <WalletInfo />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
