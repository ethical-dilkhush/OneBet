"use client"

import { useRef, useEffect, useState } from "react"
import { PlinkoGame } from "@/components/plinko-game"
import Link from "next/link" // Import Link
import { Button } from "@/components/ui/button" // Import Button
import { Home, Info, Clock } from "lucide-react" // Import Home icon
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// TypeScript declarations for Vanta.js
declare global {
  interface Window {
    VANTA: {
      DOTS: (config: any) => any
    }
  }
}

export default function PlinkoPage() {
  // Vanta.js background effect
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  // State for popup modals
  const [showRulesPopup, setShowRulesPopup] = useState(false)
  const [showRecentGamesPopup, setShowRecentGamesPopup] = useState(false)

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Plinko Game</h1>
              <p className="text-white/80 drop-shadow-md">Drop the ball and watch it bounce to win on One Bets!</p>
            </div>
            <div className="flex gap-2 justify-center sm:justify-end">
              <Button
                onClick={() => setShowRulesPopup(true)}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl"
              >
                <Info className="h-4 w-4 mr-2" />
                Rules
              </Button>
              <Button
                onClick={() => setShowRecentGamesPopup(true)}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl"
              >
                <Clock className="h-4 w-4 mr-2" />
                Recent Games
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <PlinkoGame />
          </div>
        </div>
      </div>

      {/* Rules Popup */}
      <Dialog open={showRulesPopup} onOpenChange={setShowRulesPopup}>
        <DialogContent className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8 rounded-2xl" style={{borderRadius: '32px'}}>
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Info className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              How to Play Plinko
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-white/90">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">How to Play</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Choose Your Bet - Select from 0.001, 0.01, 0.1, or 1.0 SOL</li>
                <li>Drop the Ball - Watch it bounce through the pegs to a multiplier slot</li>
                <li>Hit the Jackpot - Land on the edges for 6x multiplier!</li>
                <li>Win Big - Get payouts based on where your ball lands</li>
                <li>Instant Payouts - Winners receive SOL directly to their wallet</li>
              </ol>
            </div>
            
            <div className="pt-4 border-t border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Game Rules</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Minimum bet: 0.001 SOL</li>
                <li>Ball bounces randomly through 10 rows of pegs</li>
                <li>Edge slots offer the highest multipliers (up to 6x)</li>
                <li>Center slots offer lower multipliers but higher chances</li>
                <li>All games are provably fair and transparent</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Multiplier Slots</h3>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="text-center p-2 bg-purple-500/20 rounded border border-purple-500/30">
                  <div className="font-bold text-purple-300">6x</div>
                  <div className="text-white/70">Edge</div>
                </div>
                <div className="text-center p-2 bg-blue-500/20 rounded border border-blue-500/30">
                  <div className="font-bold text-blue-300">3x</div>
                  <div className="text-white/70">Near</div>
                </div>
                <div className="text-center p-2 bg-green-500/20 rounded border border-green-500/30">
                  <div className="font-bold text-green-300">2x</div>
                  <div className="text-white/70">Center</div>
                </div>
                <div className="text-center p-2 bg-blue-500/20 rounded border border-blue-500/30">
                  <div className="font-bold text-blue-300">3x</div>
                  <div className="text-white/70">Near</div>
                </div>
                <div className="text-center p-2 bg-purple-500/20 rounded border border-purple-500/30">
                  <div className="font-bold text-purple-300">6x</div>
                  <div className="text-white/70">Edge</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-white/70">
                Tip: Make sure to approve transactions in your Phantom wallet when prompted!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Games Popup */}
      <Dialog open={showRecentGamesPopup} onOpenChange={setShowRecentGamesPopup}>
        <DialogContent className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8 rounded-2xl" style={{borderRadius: '32px'}}>
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              Recent Plinko Games
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-12 bg-white/5 rounded-2xl">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl sm:text-2xl font-bold text-white/70 mb-3">Game History Coming Soon</h3>
            <p className="text-base sm:text-lg text-white/60">
              Your plinko game history will be displayed here once you start playing!
            </p>
            <div className="mt-4 text-sm text-white/50">
              Note: Game history is currently managed within the PlinkoGame component
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
