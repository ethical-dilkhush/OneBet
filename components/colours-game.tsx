"use client"

import { useState, useCallback, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { WalletError } from "@solana/wallet-adapter-base"
import {
  HOUSE_WALLET_PUBKEY,
  MIN_BET_AMOUNT,
  WINNING_MULTIPLIER,
  COLOURS,
  getRandomColour,
  type ColourChoice,
  type ColourGameResult,
} from "@/lib/colors-config"
import { processGamePayout } from "@/app/actions/game-actions"
import { Palette, CheckCircle, XCircle, AlertCircle, Wallet, Circle, Info, Clock } from "lucide-react"
import { playGlobalColorsGame } from "@/lib/global-game-service"
import { ColoursVisualResult } from "./colors-visual-result"

// Preset bet amounts
const BET_PRESETS = [0.001, 0.01, 0.1, 1.0]

export function ColoursGame() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected, connecting } = useWallet()

  const [betAmount, setBetAmount] = useState(MIN_BET_AMOUNT.toString())
  const [selectedColour, setSelectedColour] = useState<ColourChoice>("red")
  const [isSpinning, setIsSpinning] = useState(false)
  const [gameHistory, setGameHistory] = useState<ColourGameResult[]>([])
  const [currentResult, setCurrentResult] = useState<ColourGameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [showVisualResult, setShowVisualResult] = useState(false)
  const [showRulesPopup, setShowRulesPopup] = useState(false)
  const [showRecentGamesPopup, setShowRecentGamesPopup] = useState(false)
  const [showSpinningPopup, setShowSpinningPopup] = useState(false)


  const handleSpin = useCallback(async () => {
    // Clear previous states
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")
    setShowVisualResult(false)

    // Validate wallet connection
    if (!connected || !publicKey) {
      setPayoutError("❌ Please connect your Phantom wallet first!")
      return
    }

    console.log(`🔑 Wallet connected: ${publicKey.toString()}`)
    console.log(`🔑 Connection status: ${connected}`)
    console.log(`🔑 Wallet adapter: ${typeof sendTransaction === 'function' ? 'Available' : 'Not available'}`)

    if (!connection) {
      setPayoutError("❌ No connection to Solana network!")
      return
    }

    // Test connection health
    try {
      await connection.getLatestBlockhash("confirmed")
      console.log("✅ Solana connection is healthy")
    } catch (connectionError) {
      console.error("❌ Solana connection test failed:", connectionError)
      setPayoutError("❌ Solana network connection failed. Please try again.")
      return
    }

    // Validate bet amount
    const amount = Number.parseFloat(betAmount)
    if (isNaN(amount) || amount < MIN_BET_AMOUNT) {
      setPayoutError(`❌ Minimum bet is ${MIN_BET_AMOUNT} SOL`)
      return
    }

    // Clear previous states and start transaction immediately
    setPayoutError("")

    try {
      // Step 1: Check user's wallet balance
      setPayoutStatus("🔍 Checking your wallet balance...")

      console.log(`🔍 Checking balance for wallet: ${publicKey.toString()}`)
      console.log(`🔍 Required amount: ${amount} SOL (${amount * LAMPORTS_PER_SOL} lamports)`)
      
      const userBalance = await connection.getBalance(publicKey)
      const userBalanceSOL = userBalance / LAMPORTS_PER_SOL
      
      console.log(`🔍 User wallet balance: ${userBalance} lamports (${userBalanceSOL.toFixed(6)} SOL)`)
      
      const requiredLamports = amount * LAMPORTS_PER_SOL
      console.log(`🔍 Balance check: ${userBalance} >= ${requiredLamports} = ${userBalance >= requiredLamports}`)

      if (userBalance < requiredLamports) {
        throw new Error(
          `Insufficient balance. You need ${amount} SOL but have ${userBalanceSOL.toFixed(4)} SOL`,
        )
      }
      
      console.log(`✅ Balance check passed! User has sufficient funds.`)

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

      setPayoutStatus("✅ Bet confirmed!")
      
      // Show spinning popup after transaction confirmation
      setShowSpinningPopup(true)

      // Step 3: Colour spinning animation (simulate game processing)
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      // Hide spinning popup
      setShowSpinningPopup(false)

      // Step 4: Use GLOBAL COLOURS game counter with bet amount
      console.log(`🎨 CALLING playGlobalColorsGame(${amount})...`)
      const gameResult = await playGlobalColorsGame(amount)
      console.log("🎨 GLOBAL COLOURS GAME RESULT:", gameResult)
      const playerWins = gameResult.isWinner

      console.log(
        `🎨 COLOURS GAME: Player ${playerWins ? "WINS" : "LOSES"} on GLOBAL colours game #${gameResult.gameNumber}`,
      )

      // Step 5: Determine game result
      const actualResult: ColourChoice = playerWins ? selectedColour : getRandomColour()

      // Make sure actual result is different from player choice if they lose
      let finalResult = actualResult
      if (!playerWins && finalResult === selectedColour) {
        const otherColours = COLOURS.filter((c) => c.name !== selectedColour)
        const randomIndex = Math.floor(Math.random() * otherColours.length)
        finalResult = otherColours[randomIndex].name
      }

      const winAmount = playerWins ? amount * WINNING_MULTIPLIER : 0

      const result: ColourGameResult = {
        won: playerWins,
        playerChoice: selectedColour,
        actualResult: finalResult,
        betAmount: amount,
        winAmount,
        gameNumber: gameResult.gameNumber,
      }

      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])

      // Show visual result
      setShowVisualResult(true)

      // Hide visual result after 8 seconds
      setTimeout(() => {
        setShowVisualResult(false)
      }, 8000)

      // Step 6: Process payout if player wins
      if (playerWins && winAmount > 0) {
        setPayoutStatus(
          `🎉 YOU WON ${winAmount.toFixed(3)} SOL! (Colours Game #${gameResult.gameNumber}) Processing payout...`,
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
        setPayoutStatus(`😔 You lost this round! (Colours Game #${gameResult.gameNumber}) Better luck next time!`)
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
      // Cleanup is handled by popup state
    }
  }, [publicKey, connection, betAmount, selectedColour, sendTransaction, connected])

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/70 mb-4">
              Please connect your Phantom wallet to start playing colours on One Bets.
            </p>
            <p className="text-sm text-white/50">Click the "Connect Wallet" button in the top right corner.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedColourData = COLOURS.find((c) => c.name === selectedColour)!

  return (
    <>
      <div className="w-[100vw] sm:max-w-2xl px-4 sm:p-4 space-y-3 sm:space-y-4 relative left-1/2 transform -translate-x-1/2 sm:left-auto sm:transform-none sm:mx-auto">
        <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-2xl rounded-2xl sm:rounded-3xl">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-white text-xl sm:text-2xl flex items-center gap-2 drop-shadow-md">
                  <Palette className="h-5 w-5 sm:h-6 sm:w-6" />
                  Colours Game
                </CardTitle>
                <p className="text-white/80 drop-shadow-sm text-sm sm:text-base">
                  Choose from 8 colours, place your bet, and test your luck!
                </p>
              </div>
              <div className="flex gap-3 sm:gap-3">
                <Button
                  onClick={() => setShowRecentGamesPopup(true)}
                  variant="outline"
                  className="bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/50 rounded-2xl px-4 sm:px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm min-w-[80px] sm:min-w-[120px]"
                >
                  <Clock className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Recent Games</span>
                  <span className="sm:hidden">Recent</span>
                </Button>
                <Button
                  onClick={() => setShowRulesPopup(true)}
                  variant="outline"
                  className="bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/50 rounded-2xl px-4 sm:px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm min-w-[70px] sm:min-w-[100px]"
                >
                  <Info className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Rules</span>
                  <span className="sm:hidden">Rules</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">


            {/* Colour Selection - Now First */}
            <div className="space-y-4">
              <Label className="text-white font-medium drop-shadow-sm text-lg sm:text-xl text-center block">Choose Your Colour</Label>
              
              {/* Spherical Color Arrangement */}
              <div className="relative w-72 h-72 mx-auto">
                {COLOURS.map((colour, index) => {
                  const angle = (index * 360) / COLOURS.length
                  const radian = (angle * Math.PI) / 180
                  const radius = 120
                  const x = Math.cos(radian) * radius + 144 // 144 = 288/2 (center)
                  const y = Math.sin(radian) * radius + 144
                  
                  // Define specific colors for each button
                  const colorStyles = {
                    red: 'from-red-400 via-red-500 to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700',
                    green: 'from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700',
                    blue: 'from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700',
                    yellow: 'from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700',
                    purple: 'from-purple-400 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700',
                    orange: 'from-orange-400 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-600 hover:to-orange-700',
                    pink: 'from-pink-400 via-pink-500 to-pink-600 hover:from-pink-500 hover:via-pink-600 hover:to-pink-700',
                    cyan: 'from-cyan-400 via-cyan-500 to-cyan-600 hover:from-cyan-500 hover:via-cyan-600 hover:to-cyan-700',
                  }
                  
                  return (
                    <button
                      key={colour.name}
                      onClick={() => setSelectedColour(colour.name)}
                      disabled={showSpinningPopup || connecting}
                      className={`absolute w-16 h-16 bg-gradient-to-br ${colorStyles[colour.name]} rounded-full border-4 transition-all duration-300 transform hover:scale-110 ${
                        selectedColour === colour.name
                          ? `border-white shadow-2xl scale-125 z-10`
                          : `border-white/30 hover:border-white/60 shadow-lg`
                      }`}
                      style={{
                        left: `${x - 32}px`, // 32 = 64/2 (half button width)
                        top: `${y - 32}px`,
                        boxShadow: selectedColour === colour.name 
                          ? 'inset 0 4px 8px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.3)'
                          : 'inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.2)'
                      }}
                      title={colour.name}
                    >
                    </button>
                  )
                })}
                
                {/* Center Place Bet Button */}
                <button
                  onClick={handleSpin}
                  disabled={showSpinningPopup || connecting || !connected}
                  className="absolute w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border-4 border-yellow-300/30 hover:border-yellow-200/50"
                  style={{
                    left: '104px', 
                    top: '104px',
                    boxShadow: 'inset 0 4px 8px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {connecting ? (
                      <>
                        <Palette className="h-4 w-4 mb-1 animate-spin" />
                        <span className="text-xs font-bold leading-none">Connect</span>
                      </>
                    ) : showSpinningPopup ? (
                      <>
                        <Palette className="h-4 w-4 mb-1" />
                        <span className="text-xs font-bold leading-none">Process</span>
                      </>
                    ) : (
                      <>
                        <Palette className="h-5 w-5 mb-1" />
                        <span className="text-xs font-bold leading-tight">Place<br/>Bet</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
              
              {/* Selected Color Display */}
              {selectedColour && (
                <div className="text-center">
                  <p className="text-white/80 text-sm">Selected: 
                    <span className="ml-2 capitalize font-semibold text-white">{selectedColour}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Bet Amount Section - Now Second */}
            <div className="space-y-3">
              <Label htmlFor="bet-amount" className="text-white font-medium drop-shadow-sm text-sm sm:text-base">
                Bet Amount (SOL)
              </Label>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3 mb-4">
                {BET_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    variant={Number.parseFloat(betAmount) === preset ? "default" : "outline"}
                    onClick={() => setBetAmount(preset.toString())}
                    disabled={showSpinningPopup || connecting}
                    className={`${
                      Number.parseFloat(betAmount) === preset
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black shadow-lg"
                        : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40"
                    } text-sm sm:text-sm py-3 sm:py-3 px-4 sm:px-4 rounded-2xl font-semibold transition-all duration-300 min-w-[100px] sm:min-w-[120px]`}
                  >
                    <span className="hidden sm:inline">{preset} SOL</span>
                    <span className="sm:hidden">{preset}</span>
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
                className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-2xl py-3 px-4 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 text-sm sm:text-base"
                placeholder={`Min: ${MIN_BET_AMOUNT} SOL`}
                disabled={showSpinningPopup || connecting}
              />
            </div>



            {/* Status Messages */}
            {payoutStatus && (
              <div className="text-center p-4 bg-green-500/20 border border-green-500/50 rounded-2xl backdrop-blur-sm">
                <p className="text-green-100 font-medium text-sm sm:text-base">{payoutStatus}</p>
              </div>
            )}

            {payoutError && (
              <div className="text-center p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-sm flex items-center gap-3 justify-center">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-100 font-medium text-sm sm:text-base">{payoutError}</p>
              </div>
            )}


          </CardContent>
        </Card>


      </div>

      {/* Thriller Popup */}
     

      {/* Visual Result */}
      <ColoursVisualResult 
        result={currentResult} 
        isVisible={showVisualResult} 
        onClose={() => setShowVisualResult(false)}
      />

      {/* Rules Popup */}
      <Dialog open={showRulesPopup} onOpenChange={setShowRulesPopup}>
        <DialogContent className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8" style={{borderRadius: '32px'}}>
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Info className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              How to Play Colours
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Game Rules */}
            <div className="space-y-5">
              <h3 className="text-lg sm:text-xl font-bold text-yellow-400 text-center">Game Rules</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 p-3 bg-white/5 rounded-2xl">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg font-medium">Select any of the 8 available colours</span>
                </li>
                <li className="flex items-start gap-4 p-3 bg-white/5 rounded-2xl">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg font-medium">Place your bet (minimum 0.001 SOL)</span>
                </li>
                <li className="flex items-start gap-4 p-3 bg-white/5 rounded-2xl">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg font-medium">Click 'Place Bet' to play</span>
                </li>
                <li className="flex items-start gap-4 p-3 bg-white/5 rounded-2xl">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg font-medium">Win 2x your bet if you guess correctly</span>
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Games Popup */}
      <Dialog open={showRecentGamesPopup} onOpenChange={setShowRecentGamesPopup}>
        <DialogContent className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8" style={{borderRadius: '32px'}}>
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              Recent Games
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {gameHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {gameHistory.map((game, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 rounded-xl backdrop-blur-sm ${
                      game.won ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {game.won ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <div className="text-white/80">
                        <div className="flex items-center gap-2 mb-1">
                          <Circle className={`h-4 w-4 ${COLOURS.find((c) => c.name === game.playerChoice)?.textColor} fill-current`} />
                          <span className="capitalize font-medium">{game.playerChoice}</span>
                          <span>→</span>
                          <Circle className={`h-4 w-4 ${COLOURS.find((c) => c.name === game.actualResult)?.textColor} fill-current`} />
                          <span className="capitalize font-medium">{game.actualResult}</span>
                        </div>
                        <div className="text-sm opacity-70">
                          Bet: {game.betAmount.toFixed(3)} SOL | Game #{game.gameNumber}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold text-lg ${game.won ? "text-green-400" : "text-red-400"}`}>
                      {game.won ? `+${game.winAmount.toFixed(3)}` : `-${game.betAmount.toFixed(3)}`} SOL
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <Clock className="h-20 w-20 text-white/40 mx-auto mb-6" />
                <h3 className="text-xl sm:text-2xl font-bold text-white/70 mb-3">No Games Played Yet</h3>
                <p className="text-base sm:text-lg text-white/60">Start playing to see your game history here!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Spinning Popup */}
      <Dialog open={showSpinningPopup} onOpenChange={() => {}}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white w-[92vw] sm:max-w-lg max-h-[90vh] overflow-hidden p-6 sm:p-8" style={{borderRadius: '32px'}}>
          <div className="flex flex-col items-center">
            {/* GIF Image */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 mb-6">
              <img 
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXE5cGlncDVkNzhiNTN4cTMxNmh1bjNkYWZzajN2YWl6OXIzZjE4NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/p2jWWXr20V6UQOP1LJ/giphy.gif"
                alt="Spinning animation"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Description Below */}
            <div className="text-center">
              <div className="text-white text-2xl sm:text-3xl font-bold mb-4 drop-shadow-lg">
                Spinning
              </div>
              <div className="text-white/90 text-base sm:text-lg mb-6 drop-shadow-md">
                Determining the winning color...
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                <span className="drop-shadow-md">Please wait</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}
