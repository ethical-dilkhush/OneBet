"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WalletButton } from "@/components/wallet-button"
import { WalletInfo } from "@/components/wallet-info"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// TypeScript declarations for Vanta.js
declare global {
  interface Window {
    VANTA: {
      DOTS: (config: any) => any
    }
  }
}

export default function NFTPage() {
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">BETS COLLECTION LAUNCHING SOON.........</h1>
          </div>

          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Blurred NFT Preview */}
            <div className="mb-8">
              <div className="relative">
                <Image
                  src="/images/nft.webp"
                  alt="BETS NFT Collection Preview"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-2xl mx-auto blur-sm"
                  priority
                />
                <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
              </div>
            </div>

            {/* Collection Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
              <div className="grid md:grid-cols-3 gap-6 text-white">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">1,000</div>
                  <div className="text-lg">Total Supply</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">🎰</div>
                  <div className="text-lg">Gaming Utility</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">⭐</div>
                  <div className="text-lg">Exclusive Perks</div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="text-white/90 mb-8">
              <h2 className="text-2xl font-bold mb-4">Collection Benefits</h2>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="font-semibold text-yellow-400">🎲 Gaming Bonuses</div>
                  <div>Exclusive multipliers and bonus rounds</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="font-semibold text-yellow-400">💰 Profit Sharing</div>
                  <div>Share in platform revenue</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="font-semibold text-yellow-400">🏆 VIP Access</div>
                  <div>Early access to new games</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="font-semibold text-yellow-400">🎁 Airdrops</div>
                  <div>Regular token and NFT airdrops</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              disabled
              className="bg-gray-500 text-white font-bold px-8 py-3 rounded-full text-lg cursor-not-allowed"
            >
              Get Notified
            </Button>

            <div className="mt-8">
              <WalletInfo />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
