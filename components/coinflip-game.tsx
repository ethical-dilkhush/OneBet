"use client"

import { useState, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { WalletError } from "@solana/wallet-adapter-base"
import {
  HOUSE_WALLET_PUBKEY,
  MIN_BET_AMOUNT,
  WINNING_MULTIPLIER,
  type CoinSide,
  type GameResult,
} from "@/lib/game-config"
import { processGamePayout } from "@/app/actions/game-actions"
import { Coins, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle, Wallet } from "lucide-react"
import { playGlobalCoinflipGame } from "@/lib/global-game-service"
import { CoinflipThrillerPopup } from "./coinflip-thriller-popup"

// Preset bet amounts
const BET_PRESETS = [0.001, 0.01, 0.1, 1.0]

export function CoinflipGame() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected, connecting } = useWallet()

  const [betAmount, setBetAmount] = useState(MIN_BET_AMOUNT.toString())
  const [selectedSide, setSelectedSide] = useState<CoinSide>("heads")
  const [isFlipping, setIsFlipping] = useState(false)
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [currentResult, setCurrentResult] = useState<GameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [actualCoinSide, setActualCoinSide] = useState<CoinSide | null>(null)

  // Thriller popup state
  const [showThrillerPopup, setShowThrillerPopup] = useState(false)

  const handleFlip = useCallback(async () => {
    // Clear previous states
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")
    setActualCoinSide(null)

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

    setIsFlipping(true)
    setShowThrillerPopup(true) // Show thriller popup immediately

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

      setPayoutStatus("✅ Bet confirmed! 🪙 Flipping coin...")

      // Step 3: Wait for thriller popup to complete its animation
      await new Promise((resolve) => setTimeout(resolve, 4000))

      // Step 4: Use GLOBAL COINFLIP game counter
      console.log(`🪙 CALLING playGlobalCoinflipGame(${amount})...`)
      const gameResult = await playGlobalCoinflipGame(amount)
      console.log("🪙 GLOBAL COINFLIP GAME RESULT:", gameResult)
      const playerWins = gameResult.isWinner

      console.log(
        `🪙 COINFLIP GAME: Player ${playerWins ? "WINS" : "LOSES"} on GLOBAL coinflip game #${gameResult.gameNumber}`,
      )

      const finalActualSide: CoinSide = playerWins ? selectedSide : selectedSide === "heads" ? "tails" : "heads"
      setActualCoinSide(finalActualSide)
      const winAmount = playerWins ? amount * WINNING_MULTIPLIER : 0

      const result: GameResult = {
        won: playerWins,
        playerChoice: selectedSide,
        actualResult: finalActualSide,
        betAmount: amount,
        winAmount,
        gameNumber: gameResult.gameNumber,
      }

      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])

      // Step 5: Process payout if player wins
      if (playerWins && winAmount > 0) {
        setPayoutStatus(
          `🎉 YOU WON ${winAmount.toFixed(3)} SOL! (Coinflip Game #${gameResult.gameNumber}) Processing payout...`,
        )

        try {
          console.log(`🏆 Player won! Processing payout of ${winAmount} SOL`)

          const payoutResult = await processGamePayout(publicKey.toString(), winAmount)
          console.log("💸 Payout result:", payoutResult)

          if (payoutResult.success) {
            setPayoutStatus(`🎉 PAYOUT SENT! ${winAmount.toFixed(3)} SOL has been transferred to your wallet!`)
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
        setPayoutStatus(`😔 You lost this round! (Coinflip Game #${gameResult.gameNumber}) Better luck next time!`)
      }
    } catch (error) {
      console.error("❌ Game error:", error)
      setShowThrillerPopup(false) // Hide thriller popup on error

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
      setIsFlipping(false)
    }
  }, [publicKey, connection, betAmount, selectedSide, sendTransaction, connected])

  const handleThrillerComplete = () => {
    setShowThrillerPopup(false)
  }

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/70 mb-4">
              Please connect your Phantom wallet to start playing coinflip on One Bets.
            </p>
            <p className="text-sm text-white/50">Click the "Connect Wallet" button in the top right corner.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Coins className="h-6 w-6" />
              Coinflip Game
            </CardTitle>
            <p className="text-white/70">
              Choose heads or tails, place your bet, and flip!
              <br />
              <span className="text-yellow-400">Payout: 2.0x your bet amount</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bet Amount Section */}
            <div className="space-y-3">
              <Label htmlFor="bet-amount" className="text-white font-medium">
                Bet Amount (SOL)
              </Label>

              {/* Preset Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {BET_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    variant={Number.parseFloat(betAmount) === preset ? "default" : "outline"}
                    onClick={() => setBetAmount(preset.toString())}
                    disabled={isFlipping || connecting}
                    className={`${
                      Number.parseFloat(betAmount) === preset
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                    } text-sm py-2`}
                  >
                    {preset} SOL
                  </Button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <Input
                id="bet-amount"
                type="number"
                min={MIN_BET_AMOUNT}
                step="0.001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                placeholder={`Min: ${MIN_BET_AMOUNT} SOL`}
                disabled={isFlipping || connecting}
              />
            </div>

            {/* Coin Side Selection */}
            <div className="space-y-2">
              <Label className="text-white">Choose Your Side</Label>
              <div className="flex gap-4">
                <Button
                  variant={selectedSide === "heads" ? "default" : "outline"}
                  onClick={() => setSelectedSide("heads")}
                  disabled={isFlipping || connecting}
                  className={`flex-1 ${
                    selectedSide === "heads"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  }`}
                >
                  👑 Heads
                </Button>
                <Button
                  variant={selectedSide === "tails" ? "default" : "outline"}
                  onClick={() => setSelectedSide("tails")}
                  disabled={isFlipping || connecting}
                  className={`flex-1 ${
                    selectedSide === "tails"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  }`}
                >
                  🪙 Tails
                </Button>
              </div>
            </div>

            {/* Flip Button */}
            <Button
              onClick={handleFlip}
              disabled={isFlipping || connecting || !connected}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50"
            >
              {connecting ? "Connecting..." : isFlipping ? "🪙 Flipping..." : `Flip Coin (${betAmount} SOL)`}
            </Button>

            {/* Status Messages */}
            {payoutStatus && (
              <div className="text-center p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-100">{payoutStatus}</p>
              </div>
            )}

            {payoutError && (
              <div className="text-center p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 justify-center">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <p className="text-red-100">{payoutError}</p>
              </div>
            )}

            {/* Current Result */}
            {currentResult && (
              <Card
                className={`${
                  currentResult.won ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🪙</div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {currentResult.won ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                      <h3 className={`text-xl font-bold ${currentResult.won ? "text-green-400" : "text-red-400"}`}>
                        {currentResult.won ? "YOU WON!" : "YOU LOST!"}
                      </h3>
                    </div>
                    <p className="text-white/80">Result: {currentResult.actualResult.toUpperCase()}</p>
                    <p className="text-white/80">Your choice: {currentResult.playerChoice.toUpperCase()}</p>
                    <p className="text-white/80">Bet: {currentResult.betAmount.toFixed(3)} SOL</p>
                    {currentResult.won && (
                      <p className="text-green-400 font-bold text-lg">Won: {currentResult.winAmount.toFixed(3)} SOL</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-3 text-center">
                  <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
                  <p className="text-white/70 text-sm">Wins</p>
                  <p className="text-white font-bold">{gameHistory.filter((g) => g.won).length}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-3 text-center">
                  <TrendingDown className="h-5 w-5 text-red-400 mx-auto mb-1" />
                  <p className="text-white/70 text-sm">Losses</p>
                  <p className="text-white font-bold">{gameHistory.filter((g) => !g.won).length}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-3 text-center">
                  <Coins className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                  <p className="text-white/70 text-sm">Total Bet</p>
                  <p className="text-white font-bold">
                    {gameHistory.reduce((sum, g) => sum + g.betAmount, 0).toFixed(3)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Game History */}
        {gameHistory.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gameHistory.map((game, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded ${
                      game.won ? "bg-green-500/20" : "bg-red-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {game.won ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <div className="text-white/80 text-sm">
                        <div>
                          {game.playerChoice} → {game.actualResult}
                        </div>
                        <div className="text-xs opacity-70">Bet: {game.betAmount.toFixed(3)} SOL</div>
                      </div>
                    </div>
                    <div className={`font-bold ${game.won ? "text-green-400" : "text-red-400"}`}>
                      {game.won ? `+${game.winAmount.toFixed(3)}` : `-${game.betAmount.toFixed(3)}`} SOL
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Thriller Popup */}
      <CoinflipThrillerPopup
        isVisible={showThrillerPopup}
        betAmount={Number.parseFloat(betAmount)}
        selectedSide={selectedSide}
        actualSide={actualCoinSide}
        isWinner={currentResult?.won ?? null}
        onComplete={handleThrillerComplete}
      />
    </>
  )
}
