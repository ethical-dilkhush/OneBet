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
  DICE_OPTIONS,
  rollDice,
  checkDiceWin,
  type DiceChoice,
  type DiceGameResult,
} from "@/lib/dice-config"
import { playGlobalDiceGame } from "@/lib/global-game-service"
import { processGamePayout } from "@/app/actions/game-actions"
import { Dice1, CheckCircle, XCircle, AlertCircle, Wallet } from "lucide-react"
// import { GlobalDebug } from "@/components/global-debug"

// Preset bet amounts
const BET_PRESETS = [0.001, 0.01, 0.1, 1.0]

export function DiceGame() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected, connecting } = useWallet()

  const [betAmount, setBetAmount] = useState(MIN_BET_AMOUNT.toString())
  const [selectedChoice, setSelectedChoice] = useState<DiceChoice>("more")
  const [isRolling, setIsRolling] = useState(false)
  const [gameHistory, setGameHistory] = useState<DiceGameResult[]>([])
  const [currentResult, setCurrentResult] = useState<DiceGameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [diceAnimation, setDiceAnimation] = useState({ dice1: 1, dice2: 1 })

  const handleRoll = useCallback(async () => {
    // Clear previous states
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")

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

    setIsRolling(true)

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

      setPayoutStatus("✅ Bet confirmed! 🎲 Rolling dice...")

      // Step 3: Dice rolling animation
      const animationDuration = 2000
      const animationInterval = 100
      let animationTime = 0

      const animationTimer = setInterval(() => {
        setDiceAnimation({
          dice1: Math.floor(Math.random() * 6) + 1,
          dice2: Math.floor(Math.random() * 6) + 1,
        })
        animationTime += animationInterval

        if (animationTime >= animationDuration) {
          clearInterval(animationTimer)
        }
      }, animationInterval)

      await new Promise((resolve) => setTimeout(resolve, animationDuration))

      // Step 4: DETERMINE WIN/LOSE USING GLOBAL COUNTER WITH BET AMOUNT
      console.log(`🎲 CALLING playGlobalDiceGame(${amount})...`)
      const gameResult = await playGlobalDiceGame(amount)
      console.log("🎲 GLOBAL GAME RESULT:", gameResult)

      const playerWins = gameResult.isWinner
      console.log(`🎲 Player ${playerWins ? "WINS" : "LOSES"} on GLOBAL dice game #${gameResult.gameNumber}`)

      // Step 5: Generate dice roll based on win/lose
      let finalDiceRoll: { dice1: number; dice2: number; total: number }

      if (playerWins) {
        // Player wins - generate a winning roll
        let attempts = 0
        do {
          finalDiceRoll = rollDice()
          attempts++
        } while (!checkDiceWin(selectedChoice, finalDiceRoll.total) && attempts < 100)

        // Fallback if we can't generate a winning roll
        if (!checkDiceWin(selectedChoice, finalDiceRoll.total)) {
          if (selectedChoice === "more") {
            finalDiceRoll = { dice1: 4, dice2: 4, total: 8 } // 8 > 6
          } else {
            finalDiceRoll = { dice1: 2, dice2: 2, total: 4 } // 4 < 6
          }
        }
      } else {
        // Player loses - generate a losing roll
        let attempts = 0
        do {
          finalDiceRoll = rollDice()
          attempts++
        } while (checkDiceWin(selectedChoice, finalDiceRoll.total) && attempts < 100)

        // Fallback if we can't generate a losing roll
        if (checkDiceWin(selectedChoice, finalDiceRoll.total)) {
          if (selectedChoice === "more") {
            finalDiceRoll = { dice1: 2, dice2: 3, total: 5 } // 5 < 6 (loses for "more")
          } else {
            finalDiceRoll = { dice1: 4, dice2: 4, total: 8 } // 8 > 6 (loses for "less")
          }
        }
      }

      // Set final dice animation
      setDiceAnimation({ dice1: finalDiceRoll.dice1, dice2: finalDiceRoll.dice2 })

      const winAmount = playerWins ? amount * WINNING_MULTIPLIER : 0

      const result: DiceGameResult = {
        won: playerWins,
        playerChoice: selectedChoice,
        dice1: finalDiceRoll.dice1,
        dice2: finalDiceRoll.dice2,
        total: finalDiceRoll.total,
        betAmount: amount,
        winAmount,
        gameNumber: gameResult.gameNumber,
      }

      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])

      // Step 6: Process payout if player wins
      if (playerWins && winAmount > 0) {
        setPayoutStatus(
          `🎉 YOU WON ${winAmount.toFixed(3)} SOL! (Dice Game #${gameResult.gameNumber}) Processing payout...`,
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
        setPayoutStatus(`😔 You lost this round! (Dice Game #${gameResult.gameNumber}) Better luck next time!`)
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
      setIsRolling(false)
    }
  }, [publicKey, connection, betAmount, selectedChoice, sendTransaction, connected])

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/70 mb-4">Please connect your Phantom wallet to start playing dice on One Bets.</p>
            <p className="text-sm text-white/50">Click the "Connect Wallet" button in the top right corner.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dice face component
  const DiceFace = ({ value, isAnimating }: { value: number; isAnimating: boolean }) => {
    const getDots = (num: number) => {
      const dotPositions = {
        1: ["center"],
        2: ["top-left", "bottom-right"],
        3: ["top-left", "center", "bottom-right"],
        4: ["top-left", "top-right", "bottom-left", "bottom-right"],
        5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
        6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
      }
      return dotPositions[num as keyof typeof dotPositions] || []
    }

    return (
      <div
        className={`w-16 h-16 bg-white rounded-lg border-2 border-gray-300 relative ${
          isAnimating ? "animate-spin" : ""
        }`}
      >
        {getDots(value).map((position, index) => (
          <div
            key={index}
            className={`absolute w-2 h-2 bg-black rounded-full ${
              position === "center"
                ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                : position === "top-left"
                  ? "top-2 left-2"
                  : position === "top-right"
                    ? "top-2 right-2"
                    : position === "middle-left"
                      ? "top-1/2 left-2 transform -translate-y-1/2"
                      : position === "middle-right"
                        ? "top-1/2 right-2 transform -translate-y-1/2"
                        : position === "bottom-left"
                          ? "bottom-2 left-2"
                          : "bottom-2 right-2"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <Dice1 className="h-6 w-6" />
                Dice Game
              </CardTitle>
              <p className="text-white/70">
                Choose your prediction, roll the dice, and win!
                <br />
                <span className="text-yellow-400">Payout: 2.0x your bet amount</span>
                <br />
                <span className="text-green-400 text-sm">
                  🎯 DICE ONLY: Every 3rd dice player wins! (Games 3, 6, 9, 12...)
                </span>
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
                      disabled={isRolling || connecting}
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
                  disabled={isRolling || connecting}
                />
              </div>

              {/* Choice Selection */}
              <div className="space-y-2">
                <div className="text-white font-medium">Choose Your Prediction</div>
                <div className="grid grid-cols-2 gap-3">
                  {DICE_OPTIONS.map((option) => (
                    <Button
                      key={option.name}
                      variant={selectedChoice === option.name ? "default" : "outline"}
                      onClick={() => setSelectedChoice(option.name)}
                      disabled={isRolling || connecting}
                      className={`${
                        selectedChoice === option.name
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      } flex flex-col items-center gap-2 py-4 h-auto`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="text-center">
                        <div className="font-bold">{option.label}</div>
                        <div className="text-xs opacity-80">{option.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dice Display */}
              <div className="text-center space-y-4">
                <div className="text-white font-medium">Dice Roll</div>
                <div className="flex justify-center items-center gap-4">
                  <DiceFace value={diceAnimation.dice1} isAnimating={isRolling} />
                  <div className="text-white text-2xl">+</div>
                  <DiceFace value={diceAnimation.dice2} isAnimating={isRolling} />
                  <div className="text-white text-2xl">=</div>
                  <div className="text-white text-3xl font-bold bg-white/10 rounded-lg px-4 py-2 min-w-[60px]">
                    {diceAnimation.dice1 + diceAnimation.dice2}
                  </div>
                </div>
              </div>

              {/* Roll Button */}
              <Button
                onClick={handleRoll}
                disabled={isRolling || connecting || !connected}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50"
              >
                {connecting ? "Connecting..." : isRolling ? "🎲 Rolling..." : `Roll Dice (${betAmount} SOL)`}
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
                      <div className="text-4xl mb-2">🎲</div>
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
                      <p className="text-white/80">
                        Rolled: {currentResult.dice1} + {currentResult.dice2} = {currentResult.total}
                      </p>
                      <p className="text-white/80">
                        Your choice: {DICE_OPTIONS.find((o) => o.name === currentResult.playerChoice)?.label}
                      </p>
                      <p className="text-green-400 font-bold">Dice Game #{currentResult.gameNumber}</p>
                      <p className="text-white/80">Bet: {currentResult.betAmount.toFixed(3)} SOL</p>
                      {currentResult.won && (
                        <p className="text-green-400 font-bold text-lg">
                          Won: {currentResult.winAmount.toFixed(3)} SOL
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar - can add other components here later */}
        <div className="space-y-4"></div>
      </div>
    </div>
  )
}
