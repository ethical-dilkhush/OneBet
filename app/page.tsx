"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Wallet, LogOut } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useState, useEffect, useRef } from "react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

// TypeScript interface for VANTA
declare global {
  interface Window {
    VANTA: {
      DOTS: (config: any) => any
    }
  }
}

export default function HomePage() {
  const { connected, publicKey, disconnect } = useWallet()
  const { connection } = useConnection()
  const { setVisible } = useWalletModal()
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [solPrice, setSolPrice] = useState<number>(0)
  const [priceLoading, setPriceLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [basePosition, setBasePosition] = useState(280) // Responsive positioning
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  // Games data
  const games = [
    { 
      title: "Colours", 
      href: "/colours", 
      gradient: "from-purple-600 to-pink-600", 
      gifUrl: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2pzNW95NHEyem5xMHBjNGJrbGN1N2J1NzB2aWhvZzI0NzRoZzQ5aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/30pjsLvNyaRY0eoE0b/giphy.gif"
    },
    { 
      title: "Coinflip", 
      href: "/coinflip", 
      gradient: "from-emerald-600 to-teal-600", 
      gifUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2ZlejE5ZHN4aG1seDl4ZDJjeGE4ZWtseTMwcDl1M2toOXB5ZmRqdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3og0IyDmtho5lv6huo/giphy.gif"
    },
    { 
      title: "Dice", 
      href: "/dice", 
      gradient: "from-orange-500 to-amber-600", 
      gifUrl: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHRhN3Y1djk4NGgwczJoMXkwOXdqbmtuOTJoYnR0c2gyMHgzcjdsNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f73urdknsWliIEZiDw/giphy.gif"
    },
    { 
      title: "Limbo", 
      href: "/limbo", 
      gradient: "from-blue-600 to-indigo-600", 
      gifUrl: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmloMjcwNGxrMTF5bDNwY3M3NzVuOWJyazdqcng5bmhwdWgyODd1OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZHMN9ki2rCld0edNKb/giphy.gif"
    },
    { 
      title: "Plinko", 
      href: "/plinko", 
      gradient: "from-cyan-600 to-blue-700", 
      gifUrl: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzUxODB6eTlic3Azd3BxcWM2eHliY2NybzM4YmdiZDJ4Y2Fmb2l6OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u407qDaZgD95Ae4/giphy.gif"
    },
  ]

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        setLoading(true)
        try {
          const balance = await connection.getBalance(publicKey)
          setBalance(balance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error('Error fetching balance:', error)
          setBalance(0)
        } finally {
          setLoading(false)
        }
      } else {
        setBalance(0)
      }
    }

    fetchBalance()
  }, [connected, publicKey, connection])

  // Fetch SOL price from CoinGecko API
  useEffect(() => {
    const fetchSolPrice = async () => {
      setPriceLoading(true)
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        const data = await response.json()
        setSolPrice(data.solana.usd)
      } catch (error) {
        console.error('Error fetching SOL price:', error)
        setSolPrice(174.69) // Fallback price
      } finally {
        setPriceLoading(false)
      }
    }

    fetchSolPrice()
    
    // Refresh price every 5 minutes
    const interval = setInterval(fetchSolPrice, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // VANTA.DOTS Background Effect
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

  // Update responsive positioning on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updatePosition = () => {
        setBasePosition(window.innerWidth < 768 ? 200 : 280)
      }
      
      updatePosition() // Initial update
      window.addEventListener('resize', updatePosition)
      
      return () => window.removeEventListener('resize', updatePosition)
    }
  }, [])

  // True infinite loop auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => prev + 1) // Just increment, no boundaries
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [])

  // Format wallet address for header (short version)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Format wallet address with center ellipsis for display
  const formatAddressCenter = (address: string, maxLength: number = 32) => {
    if (address.length <= maxLength) return address
    const start = Math.floor((maxLength - 3) / 2)
    const end = Math.ceil((maxLength - 3) / 2)
    return `${address.slice(0, start)}...${address.slice(-end)}`
  }

  const handleWalletAction = async () => {
    if (connected) {
      await disconnect()
    } else {
      setVisible(true)
    }
  }

  return (
    <>
      {/* Vanta.js DOTS Background - Complete Body Coverage */}
      <div 
        ref={vantaRef} 
        className="fixed inset-0 w-screen h-screen -z-10 bg-black"
        style={{ minHeight: '100vh', minWidth: '100vw' }}
      ></div>
      
      <div className="container mx-auto px-4 py-4 page-transition">
        {/* Hero + Promo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 relative overflow-visible rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] border border-white/10 shadow-2xl">
            <div className="absolute -top-12 md:-top-24 -right-12 md:-right-24 w-[200px] h-[200px] md:w-[420px] md:h-[420px] bg-white/10 rounded-full blur-3xl" />
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 md:p-6 lg:p-8">
              <div className="flex-1 text-white text-center md:text-left">
                <p className="text-sm md:text-base text-white/80">Start Gaming!</p>
                <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                  Experience the <span className="text-yellow-300">ultimate</span> gaming thrill
                </h1>
                <div className="mt-4 md:mt-6">
                  <Link href="/colours">
                    <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-4 md:px-6 py-3 md:py-5 rounded-xl hover:from-yellow-300 hover:to-yellow-500 text-sm md:text-base">
                      Play now
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-[160px] w-[200px] sm:h-[180px] sm:w-[220px] md:h-[200px] md:w-[240px] lg:h-[280px] lg:w-[320px] mx-auto md:mx-0 -mt-4 md:-mt-8">
                <img
                  src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmdyM3BmNGoyZXFoNnpvZjA5ZXEyemNlbGkzemV0eXJ6N2h2bmNjYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/EG2oywMyYPG4uIcZkK/giphy.gif"
                  alt="Hero Animation"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] border border-white/10 shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col justify-between">
          <div className="text-white">
            {connected ? (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-center md:text-left">Your <span className="text-yellow-300">Wallet</span></h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Wallet Address Box - Spans full width */}
                  <div className="col-span-1 sm:col-span-2 bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-xs text-white/60 mb-1">Wallet Address</p>
                    <p className="font-mono text-white text-xs md:text-sm lg:text-xs xl:text-sm break-all">
                      {publicKey ? formatAddressCenter(publicKey.toString()) : 'N/A'}
                    </p>
                  </div>
                  
                  {/* SOL Balance Box */}
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-xs text-white/60 mb-1">SOL Balance</p>
                    <p className="text-sm font-semibold text-white">
                      {loading ? 'Loading...' : `${balance.toFixed(4)} SOL`}
                    </p>
                  </div>
                  
                  {/* USD Equivalent Box */}
                  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <p className="text-xs text-white/60 mb-1">USD Equivalent</p>
                    <p className="text-sm font-semibold text-white">
                      ${(loading || priceLoading) ? '0.00' : (balance * solPrice).toFixed(2)} USD
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-center md:text-left">Cashbacks <span className="text-yellow-300">every week</span></h3>
                <p className="text-white/70 mt-2 text-center md:text-left">Connect your wallet to start earning rewards.</p>
              </>
            )}
          </div>
          <div className="mt-4 md:mt-6 flex gap-2 justify-center md:justify-start">
            <Button 
              onClick={handleWalletAction}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-4 md:px-6 py-3 md:py-5 rounded-xl hover:from-yellow-300 hover:to-yellow-500 flex items-center gap-2 text-sm md:text-base w-full sm:w-auto"
            >
              {connected ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </div>
        </div>
      </div>



      {/* 3D Games Carousel */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Featured Games</span>
          </h2>
        </div>

        <div className="relative h-[250px] md:h-[350px] flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-7xl">
            {/* Continuous Loop Carousel Container */}
            <div className="relative w-full h-[180px] md:h-[250px] mx-auto flex items-center justify-center overflow-visible">
              {/* Render infinite cards based on current position */}
              {Array.from({ length: 7 }, (_, i) => {
                // Calculate which cards to show around current position
                const cardIndex = currentSlide + i - 3 // Show 3 cards before, current, and 3 after
                const gameIndex = ((cardIndex % games.length) + games.length) % games.length // Handle negative numbers
                const game = games[gameIndex]
                const offset = i - 3 // Center card is at offset 0
                const absOffset = Math.abs(offset)
                const isActive = offset === 0
                
                // Calculate position to ensure no gaps - responsive positioning
                const position = offset * basePosition
                
                return (
                  <div
                    key={`infinite-${cardIndex}`}
                    className={`absolute cursor-pointer transition-all duration-700 ease-in-out`}
                    style={{
                      transform: `
                        translateX(${position}px)
                        scale(${isActive ? 1.1 : 0.7})
                      `,
                      opacity: absOffset > 3 ? 0 : isActive ? 1 : 0.6,
                      zIndex: isActive ? 10 : 8 - Math.min(absOffset, 7),
                      width: isActive ? '240px' : '180px',
                      height: isActive ? '140px' : '100px',
                    }}
                    onClick={() => {
                      setCurrentSlide(cardIndex)
                    }}
                  >
                    <GameCard3D {...game} isActive={isActive} />
                  </div>
                )
              })}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-8 gap-2">
              {games.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide % games.length === index 
                      ? 'bg-purple-500 scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

function GameCard3D({
  title,
  href,
  gradient,
  gifUrl,
  isActive,
}: {
  title: string
  href: string
  gradient: string
  gifUrl: string
  isActive: boolean
}) {
  return (
    <Link href={href} className="block w-full h-full">
      <div className={`
        relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} 
        w-full h-full flex flex-col justify-center items-center p-4 shadow-2xl
        transition-all duration-500 transform-gpu
        ${isActive ? 'shadow-2xl border-2 border-white/30' : 'border border-white/10'}
      `}> 
        {/* Background Effects */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        
        {/* GIF Image - Full Background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <img 
            src={gifUrl} 
            alt={`${title} game`}
            className="w-full h-full object-cover transition-all duration-500"
            style={{ objectFit: 'cover' }}
          />
          {/* Light overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20 rounded-2xl" />
        </div>
        
        {/* Title */}
        <div className="relative z-10 text-center">
          <div className="relative inline-block">
            {/* Animated Border */}
            <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${
              isActive 
                ? 'bg-gradient-to-r from-black-500 to-blue-500 animate-gradient-x p-[2px]' 
                : 'bg-gradient-to-r from-black-400 to-blue-400 animate-gradient-x p-[1px]'
            }`}>
              <div className="bg-black/30 backdrop-blur-xl rounded-xl h-full w-full"></div>
            </div>
            
            {/* Text Content */}
            <div className="relative bg-white/20 backdrop-blur-xl rounded-xl px-2 md:px-3 py-0.2 border border-white/40">
              <h3 className={`text-white font-bold transition-all duration-500 drop-shadow-2xl ${
                isActive 
                  ? 'text-lg md:text-2xl lg:text-3xl text-yellow-300 animate-pulse' 
                  : 'text-sm md:text-lg lg:text-xl text-white'
              }`}>
                {title}
              </h3>
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/5" />
        
        {/* Active Highlight */}
        {isActive && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-yellow-400/20 to-transparent" />
        )}
      </div>
    </Link>
  )
}
