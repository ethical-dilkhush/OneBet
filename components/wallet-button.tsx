"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { WalletError } from "@solana/wallet-adapter-base"

export function WalletButton() {
  const { wallet, connect, disconnect, connecting, connected, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = async () => {
    setError("")

    try {
      if (!wallet) {
        setVisible(true)
      } else if (!connected) {
        await connect()
      } else {
        await disconnect()
      }
    } catch (error) {
      console.error("Wallet connection error:", error)

      if (error instanceof WalletError) {
        if (error.message.includes("User rejected")) {
          setError("Connection cancelled")
        } else {
          setError("Connection failed")
        }
      } else {
        setError("Connection error")
      }

      // Clear error after 3 seconds
      setTimeout(() => setError(""), 3000)
    }
  }

  const getButtonText = () => {
    if (connecting) return "Connecting..."
    if (connected && publicKey) {
      return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    }
    if (error) return error
    return "Connect to One Bets"
  }

  const getButtonClass = () => {
    if (error) return "bg-red-500 hover:bg-red-600"
    if (connected) return "bg-green-500 hover:bg-green-600"
    return "bg-pink-500 hover:bg-pink-600"
  }

  if (!mounted) {
    return (
              <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6">Connect to One Bets</Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={connecting}
      className={`${getButtonClass()} text-white rounded-full px-6 transition-all duration-300 hover-lift hover-scale relative overflow-hidden group shadow-lg hover:shadow-xl`}
    >
      <span className="relative z-10 font-medium">{getButtonText()}</span>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      {/* Glow effect */}
      {connected && (
        <div className="absolute inset-0 bg-green-400/20 rounded-full animate-glow-pulse"></div>
      )}
      {connecting && (
        <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse"></div>
      )}
      {error && (
        <div className="absolute inset-0 bg-red-400/20 rounded-full animate-pulse"></div>
      )}
    </Button>
  )
}
