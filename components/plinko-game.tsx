"use client"

import { useState, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { WalletError } from "@solana/wallet-adapter-base"
import {
  HOUSE_WALLET_PUBKEY,
  MIN_BET_AMOUNT,
  BOARD_ROWS,
  MULTIPLIERS,
  generateBallPath,
  calculateWinAmount,
  isWinningMultiplier,
  getPlinkoGameResult,
  type PlinkoGameResult,
} from "@/lib/plinko-config"
import { processGamePayout } from "@/app/actions/game-actions"
import { Triangle, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle, Wallet } from "lucide-react"
import { Label } from "@/components/ui/label"
import { SimpleGameInstructions } from "@/components/simple-game-instructions"
import { Input } from "@/components/ui/input"

// Preset bet amounts
const BET_PRESETS = [0.001, 0.01, 0.1, 1.0]

export function PlinkoGame() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected, connecting } = useWallet()

  const [betAmount, setBetAmount] = useState("0.001")
  const [isDropping, setIsDropping] = useState(false)
  const [gameHistory, setGameHistory] = useState<PlinkoGameResult[]>([])
  const [currentResult, setCurrentResult] = useState<PlinkoGameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [ballPosition, setBallPosition] = useState<{ row: number; col: number } | null>(null)
  const [ballPath, setBallPath] = useState<number[]>([])
  const [animationStep, setAnimationStep] = useState(0)

  const handleDrop = useCallback(async () => {
    // Clear previous states
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")
    setBallPosition(null)
    setBallPath([])
    setAnimationStep(0)

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

    setIsDropping(true)

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

      setPayoutStatus("✅ Bet confirmed! ✨ Dropping ball...")

      // Step 3: Simulate ball dropping animation
      const path = generateBallPath()
      setBallPath(path)

      // Animate ball through the path
      for (let i = 0; i < path.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setAnimationStep(i)
      }

      // Step 4: Determine final result
      const finalCol = path[path.length - 1]
      const multiplier = MULTIPLIERS[finalCol]
      const isWinner = isWinningMultiplier(multiplier)
      const winAmount = calculateWinAmount(amount, multiplier)

      const result: PlinkoGameResult = {
        won: isWinner,
        multiplier,
        betAmount: amount,
        winAmount,
        ballPath: path,
      }

      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])

      // Step 5: Process payout if player wins
      if (isWinner && winAmount > 0) {
        setPayoutStatus(
          `🎉 YOU WON ${winAmount.toFixed(6)} SOL! (${multiplier}x multiplier) Processing payout...`,
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
        setPayoutStatus(`😔 You lost this round! (${multiplier}x multiplier) Better luck next time!`)
      }
    } catch (error) {
      console.error("❌ Game error:", error)

      let errorMessage = "An unexpected error occurred"

      if (error instanceof Error) {
        if (error.message.includes("User rejected") || error.message.includes("cancelled")) {
          errorMessage = "Transaction was cancelled. Please try again and approve the transaction."
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
      setIsDropping(false)
    }
  }, [publicKey, connection, betAmount, sendTransaction, connected])

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/70 mb-4">
              Please connect your Phantom wallet to start playing Plinko on One Bets.
            </p>
            <p className="text-sm text-white/50">Click the "Connect Wallet" button in the top right corner.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Enhanced Plinko Board Component with realistic physics
  const PlinkoBoard = () => {
    return (
      <div className="relative min-h-[600px] p-8 overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-red-900"></div>
        
        {/* Starry background effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4 relative z-10">
          {/* Enhanced Industrial Pipe System */}
          <div className="relative mb-8">
            <div className="relative">
              {/* Enhanced pipe curves with glow */}
              <div className="absolute -left-16 -top-4 w-20 h-16 border-8 border-gray-400 rounded-tl-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-2xl">
                <div className="absolute inset-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-tl-full"></div>
              </div>

              <div className="absolute -right-16 -top-4 w-20 h-16 border-8 border-gray-400 rounded-tr-full bg-gradient-to-bl from-gray-300 to-gray-500 shadow-2xl">
                <div className="absolute inset-2 bg-gradient-to-bl from-gray-600 to-gray-800 rounded-tr-full"></div>
              </div>

              {/* Enhanced main pipe body */}
              <div className="w-32 h-12 bg-gradient-to-b from-gray-300 to-gray-500 border-4 border-gray-400 relative shadow-2xl rounded-lg">
                <div className="absolute inset-2 bg-gradient-to-b from-gray-700 to-gray-900 rounded"></div>
                
                {/* Metallic shine effect */}
                <div className="absolute top-1 left-2 right-2 h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>

                {/* Enhanced pipe opening */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-b-lg border-4 border-gray-500 shadow-xl">
                  <div className="absolute inset-1 bg-gradient-to-b from-gray-800 to-black rounded-b-md"></div>
                </div>

                {/* Enhanced ball in pipe with glow */}
                {ballPosition && ballPosition.row === -1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-bounce z-10 shadow-2xl">
                    <div className="absolute top-1 left-1 w-2 h-2 bg-red-200 rounded-full"></div>
                    <div className="absolute inset-0 bg-red-400/50 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Enhanced ball dropping with trail effect */}
              {ballPosition && ballPosition.row === -0.5 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-bounce z-10 shadow-2xl">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-red-200 rounded-full"></div>
                  <div className="absolute inset-0 bg-red-400/50 rounded-full animate-pulse"></div>
                  {/* Motion trail */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-red-400/60 to-transparent rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced White Pegs with physics interaction */}
          {Array.from({ length: BOARD_ROWS }, (_, row) => (
            <div
              key={row}
              className="flex justify-center space-x-10 animate-fade-in-up"
              style={{ 
                marginLeft: `${(BOARD_ROWS - row - 1) * 20}px`,
                animationDelay: `${row * 0.1}s`
              }}
            >
              {Array.from({ length: row + 2 }, (_, col) => (
                <div key={col} className="relative">
                  {/* Enhanced peg with metallic effect */}
                  <div className="w-7 h-7 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full relative shadow-2xl border-2 border-gray-200 hover:scale-110 transition-all duration-300">
                    {/* Inner shine */}
                    <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-80"></div>
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </div>

                  {/* Enhanced ball with realistic physics */}
                  {ballPosition && ballPosition.row === row && ballPosition.col === col && (
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-bounce z-20 shadow-2xl">
                      {/* Ball shine effect */}
                      <div className="absolute top-2 left-2 w-3 h-3 bg-red-200 rounded-full"></div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-red-400/60 rounded-full animate-pulse"></div>
                      {/* Impact ripple */}
                      <div className="absolute -inset-2 border-2 border-red-400/40 rounded-full animate-ping"></div>
                      {/* Motion blur trail */}
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-t from-red-400/40 to-transparent rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Enhanced Multiplier Slots */}
          <div className="flex justify-center space-x-4 mt-8">
            {MULTIPLIERS.map((multiplier, index) => (
              <div
                key={index}
                className={`relative w-16 h-16 rounded-lg border-2 flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
                  ballPosition && ballPosition.row === BOARD_ROWS && ballPosition.col === index
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 scale-110 shadow-2xl"
                    : "bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500"
                }`}
              >
                {/* Slot glow effect */}
                {ballPosition && ballPosition.row === BOARD_ROWS && ballPosition.col === index && (
                  <div className="absolute inset-0 bg-yellow-400/30 rounded-lg animate-pulse"></div>
                )}
                
                {/* Multiplier text */}
                <span className="relative z-10">{multiplier}x</span>
                
                {/* Ball in slot */}
                {ballPosition && ballPosition.row === BOARD_ROWS && ballPosition.col === index && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-bounce shadow-xl">
                    <div className="absolute top-1 left-1 w-2 h-2 bg-red-200 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Small blue squares with sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-blue-400/30 rounded-sm flex items-center justify-center"
              style={{
                left: `${10 + (i * 10)}%`,
                top: `${20 + (i % 3 * 20)}%`,
              }}
            >
              <span className="text-yellow-300 text-xs">✨</span>
            </div>
          ))}
        </div>

        {/* Bottom cloud effects */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-white/10 rounded-t-full blur-lg"></div>
        <div className="absolute bottom-0 left-1/4 w-48 h-24 bg-white/15 rounded-t-full blur-md"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-20 bg-white/10 rounded-t-full blur-sm"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
      {/* Left Column: Plinko Board */}
      <div className="lg:col-span-2 space-y-4">
        {/* Plinko Board */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center gap-2">
              <Triangle className="h-6 w-6" />
              Industrial Plinko Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PlinkoBoard />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Game Controls and Info */}
      <div className="space-y-4">
        {/* Game Controls */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Triangle className="h-6 w-6" />
              Plinko Game Controls
            </CardTitle>
            <p className="text-white/70">Drop the ball and watch it bounce to win!</p>
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
                    disabled={isDropping || connecting}
                    className={`${
                      Number.parseFloat(betAmount) === preset
                        ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                        : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                    } text-sm py-2 rounded-xl`}
                  >
                    {preset} SOL
                  </Button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <Input
                id="bet-amount"
                type="number"
                min={0.001}
                step="0.001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                placeholder="Min: 0.001 SOL"
                disabled={isDropping || connecting}
              />
            </div>

            {/* Drop Button */}
            <Button
              onClick={handleDrop}
              disabled={isDropping || connecting || !connected}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50 rounded-xl"
            >
              {connecting ? "Connecting..." : isDropping ? "Processing..." : `Drop Ball (${betAmount} SOL)`}
            </Button>

            {/* Status Messages */}
            {payoutStatus && (
              <div className="text-center p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                <p className="text-green-100">{payoutStatus}</p>
              </div>
            )}

            {payoutError && (
              <div className="text-center p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-100">{payoutError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Result Display */}
        {currentResult && (
          <Card
            className={`${currentResult.won ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"} rounded-2xl`}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {currentResult.won ? (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  ) : currentResult.multiplier > 0 ? (
                    <CheckCircle className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-400" />
                  )}
                  <h3
                    className={`text-lg font-bold ${
                      currentResult.won
                        ? "text-green-400"
                        : currentResult.multiplier > 0
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {currentResult.won
                      ? "YOU WON!"
                      : currentResult.multiplier > 0
                        ? `${(currentResult.multiplier * 100).toFixed(0)}% REFUND`
                        : "TRY AGAIN!"}
                  </h3>
                </div>
                <div className="text-white/80 text-sm mb-2">
                  Multiplier: {currentResult.multiplier}x
                </div>
                <div className="text-white/70 text-sm">
                  Bet: {currentResult.betAmount.toFixed(3)} SOL
                </div>
                <div className="text-white/70 text-sm">
                  Win: {currentResult.winAmount.toFixed(3)} SOL
                </div>
                {currentResult.won && (
                  <div className="text-green-400 font-bold text-sm mt-2">
                    Profit: {(currentResult.winAmount - currentResult.betAmount).toFixed(3)} SOL
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jackpot Alert */}
        <Card className="bg-purple-500/20 border-purple-500/50 rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">💎</div>
            <div className="text-purple-300 font-bold">JACKPOT SLOTS!</div>
            <div className="text-white text-sm">Hit the edges for 6x multiplier!</div>
          </CardContent>
        </Card>

        {/* Game Statistics */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="bg-white/5 border-white/10 rounded-2xl">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <p className="text-white/70 text-sm">Wins</p>
              <p className="text-white font-bold">{gameHistory.filter((g) => g.won).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 rounded-2xl">
            <CardContent className="p-3 text-center">
              <TrendingDown className="h-5 w-5 text-red-400 mx-auto mb-1" />
              <p className="text-white/70 text-sm">Losses</p>
              <p className="text-white font-bold">{gameHistory.filter((g) => !g.won).length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
