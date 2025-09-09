"use client" // This page now manages state, so it must be a client component

import { useState, useCallback, useMemo } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { WalletError } from "@solana/wallet-adapter-base"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Wallet } from "lucide-react"
import { GameInstructions } from "@/components/game-instructions"
import { LimboVisualResult } from "@/components/limbo-visual-result"
import { LimboGameControls } from "@/components/limbo-game-controls" // Renamed component
import {
  HOUSE_WALLET_PUBKEY,
  MIN_BET_AMOUNT,
  MIN_TARGET_MULTIPLIER,
  MAX_TARGET_MULTIPLIER,
  type LimboGameResult,
} from "@/lib/limbo-config"
import { processGamePayout } from "@/app/actions/game-actions"
import { playGlobalLimboGame } from "@/lib/global-game-service"
import { Card, CardContent } from "@/components/ui/card" // Import Card and CardContent for wallet prompt

export default function LimboPage() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected, connecting } = useWallet()

  const [betAmount, setBetAmount] = useState(MIN_BET_AMOUNT.toString())
  const [targetMultiplier, setTargetMultiplier] = useState("2.00")
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameHistory, setGameHistory] = useState<LimboGameResult[]>([])
  const [currentResult, setCurrentResult] = useState<LimboGameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [rolledMultiplier, setRolledMultiplier] = useState<number | null>(null)

  // Calculate potential win amount
  const potentialWin = useMemo(() => {
    const amount = Number.parseFloat(betAmount)
    const target = Number.parseFloat(targetMultiplier)
    if (isNaN(amount) || isNaN(target) || amount <= 0 || target < MIN_TARGET_MULTIPLIER) {
      return 0
    }
    return amount * target
  }, [betAmount, targetMultiplier])

  const handlePlay = useCallback(async () => {
    // Clear previous states
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")
    setRolledMultiplier(null) // Reset visual multiplier

    // Validate wallet connection
    if (!connected || !publicKey) {
      setPayoutError("❌ Please connect your Phantom wallet first!")
      return
    }

    if (!connection) {
      setPayoutError("❌ No connection to Solana network!")
      return
    }

    // Validate bet amount
    const amount = Number.parseFloat(betAmount)
    if (isNaN(amount) || amount < MIN_BET_AMOUNT) {
      setPayoutError(`❌ Minimum bet is ${MIN_BET_AMOUNT} SOL`)
      return
    }

    // Validate target multiplier
    const target = Number.parseFloat(targetMultiplier)
    if (isNaN(target) || target < MIN_TARGET_MULTIPLIER || target > MAX_TARGET_MULTIPLIER) {
      setPayoutError(`❌ Target multiplier must be between ${MIN_TARGET_MULTIPLIER}x and ${MAX_TARGET_MULTIPLIER}x`)
      return
    }

    setIsPlaying(true)

    try {
      // Step 1: Check user's wallet balance
      setPayoutStatus("🔍 Checking your wallet balance...")

      const userBalance = await connection.getBalance(publicKey)
      const requiredLamports = amount * LAMPORTS_PER_SOL

      if (userBalance < requiredLamports) {
        throw new Error(
          `Insufficient balance. You need ${amount} SOL but have ${(userBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
        )
      }

      // Step 2: Create and send bet transaction
      setPayoutStatus("🎯 Creating bet transaction...")

      const transaction = new Transaction()
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: HOUSE_WALLET_PUBKEY,
          lamports: requiredLamports,
        }),
      )

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash("confirmed")
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      setPayoutStatus("📝 Please approve the transaction in your wallet...")

      // Send transaction with better error handling
      let betSignature: string
      try {
        betSignature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        })
      } catch (error) {
        if (error instanceof WalletError) {
          if (error.message.includes("User rejected")) {
            throw new Error("Transaction was cancelled. Please try again and approve the transaction.")
          }
        }
        throw error
      }

      setPayoutStatus("⏳ Confirming your bet transaction...")
      console.log(`💰 Bet transaction sent: ${betSignature}`)

      // Wait for confirmation
      await connection.confirmTransaction(betSignature, "confirmed")
      console.log(`✅ Bet confirmed: ${betSignature}`)

      setPayoutStatus("✅ Bet confirmed! ✨ Rolling multiplier...")

      // Step 3: Play Limbo game - server determines actual multiplier and win/loss randomly
      console.log(`✨ CALLING playGlobalLimboGame(${amount}, ${target})...`)
      const gameResult = await playGlobalLimboGame(amount, target) // Server now returns actualMultiplier
      console.log("✨ GLOBAL LIMBO GAME RESULT:", gameResult)

      const playerWins = gameResult.isWinner
      // Use actualMultiplier directly from server response
      const actualMultiplier = gameResult.actualMultiplier! // Assert non-null as server will provide it
      setRolledMultiplier(actualMultiplier) // Update visual multiplier

      const winAmount = playerWins ? amount * actualMultiplier : 0

      const result: LimboGameResult = {
        won: playerWins,
        betAmount: amount,
        winAmount,
        targetMultiplier: target,
        actualMultiplier, // Use the actualMultiplier from server
        gameNumber: gameResult.gameNumber,
      }

      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])

      // Step 5: Process payout if player wins
      if (playerWins && winAmount > 0) {
        setPayoutStatus(
          `🎉 YOU WON ${winAmount.toFixed(6)} SOL! (${actualMultiplier.toFixed(2)}x multiplier) Processing payout...`,
        )

        try {
          console.log(`🏆 Player won! Processing payout of ${winAmount} SOL`)

          const payoutResult = await processGamePayout(publicKey.toString(), winAmount)
          console.log("💸 Payout result:", payoutResult)

          if (payoutResult.success) {
            setPayoutStatus(`🎉 PAYOUT SENT! ${winAmount.toFixed(6)} SOL has been transferred to your wallet!`)
            console.log(`✅ Payout successful: ${payoutResult.signature}`)
          } else {
            setPayoutError(`❌ Payout failed: ${payoutResult.error}`)
            console.error("❌ Payout failed:", payoutResult.error)
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown payout error"
          setPayoutError(`❌ Payout error: ${errorMsg}`)
          console.error("❌ Payout exception:", error)
        }
      } else {
        setPayoutStatus(`😔 You lost this round! (Limbo Game #${gameResult.gameNumber}) Better luck next time!`)
      }
    } catch (error) {
      console.error("❌ Game error:", error)

      let errorMessage = "An unexpected error occurred"

      if (error instanceof Error) {
        if (error.message.includes("User rejected") || error.message.includes("cancelled")) {
          errorMessage = "Transaction was cancelled. Please try again and approve the transaction in your wallet."
        } else if (error.message.includes("Insufficient")) {
          errorMessage = error.message
        } else if (error.message.includes("blockhash")) {
          errorMessage = "Network error. Please try again."
        } else {
          errorMessage = error.message
        }
      }

      setPayoutError(`❌ ${errorMessage}`)
    } finally {
      setIsPlaying(false)
    }
  }, [publicKey, connection, betAmount, targetMultiplier, sendTransaction, connected])

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 py-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Home className="h-5 w-5 mr-2" />
                Home
              </Button>
            </Link>
            <div className="text-center flex-grow">
              <h1 className="text-4xl font-bold text-white mb-2">📈 Limbo Game</h1>
              <p className="text-white/80">Set your target multiplier and cash out before it crashes!</p>
            </div>
            <div className="w-20"></div> {/* Placeholder for alignment */}
          </div>
          <div className="max-w-2xl mx-auto p-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8 text-center">
                <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-white/70 mb-4">
                  Please connect your Phantom wallet to start playing Limbo on One Bets.
                </p>
                <p className="text-sm text-white/50">Click the "Connect Wallet" button in the top right corner.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Home className="h-5 w-5 mr-2" />
              Home
            </Button>
          </Link>
          <div className="text-center flex-grow">
            <h1 className="text-4xl font-bold text-white mb-2">📈 Limbo Game</h1>
            <p className="text-white/80">Set your target multiplier and cash out before it crashes!</p>
          </div>
          <div className="w-20"></div> {/* Placeholder for alignment */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Visual Result and How to Play */}
          <div className="lg:col-span-2 space-y-4">
            <LimboVisualResult
              actualMultiplier={rolledMultiplier}
              isWinner={currentResult?.won ?? null}
              isAnimating={isPlaying}
            />
            <GameInstructions />
          </div>

          {/* Right Column: Game Controls and Debug Panels */}
          <div className="space-y-4">
            <LimboGameControls
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              targetMultiplier={targetMultiplier}
              setTargetMultiplier={setTargetMultiplier}
              potentialWin={potentialWin}
              handlePlay={handlePlay}
              isPlaying={isPlaying}
              connecting={connecting}
              connected={connected}
              payoutStatus={payoutStatus}
              payoutError={payoutError}
              currentResult={currentResult}
              gameHistory={gameHistory}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
