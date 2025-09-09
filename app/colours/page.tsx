"use client"

import { useEffect, useRef } from "react"
import { Palette } from "lucide-react"
import { ColoursGame } from "@/components/colours-game"

// TypeScript declarations for Vanta.js
declare global {
  interface Window {
    VANTA: {
      DOTS: (config: any) => any
    }
  }
}

export default function ColoursPage() {
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  // Vanta.js DOTS Background Effect
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
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

    // Cleanup function
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
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
      <div className="min-h-screen relative pt-0 pb-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-3 drop-shadow-lg">
              <Palette className="h-7 w-7" />
              Colours Game
            </h1>
            <p className="text-white/90 drop-shadow-md text-sm">Pick your favourite colour and test your luck on One Bets!</p>
          </div>

          <div className="w-[100vw] sm:max-w-2xl px-4 sm:p-4 space-y-3 sm:space-y-4 relative left-1/2 transform -translate-x-1/2 sm:left-auto sm:transform-none sm:mx-auto">
            <ColoursGame />
          </div>
        </div>
      </div>
    </>
  )
}