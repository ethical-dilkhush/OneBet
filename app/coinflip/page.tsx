"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { WalletError } from "@solana/wallet-adapter-base"
import { Button } from "@/components/ui/button"
import { Wallet, Coins, AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown, Info, Clock } from "lucide-react"
import { CoinflipVisualResult } from "@/components/coinflip-visual-result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  HOUSE_WALLET_PUBKEY,
  MIN_BET_AMOUNT,
  WINNING_MULTIPLIER,
  type CoinSide,
  type GameResult,
} from "@/lib/game-config"
import { processGamePayout } from "@/app/actions/game-actions"
import { playGlobalCoinflipGame } from "@/lib/global-game-service"

// TypeScript declarations for Vanta.js
declare global {
  interface Window {
    VANTA: {
      DOTS: (config: any) => any
    }
  }
}

// Preset bet amounts
const BET_PRESETS = [0.001, 0.01, 0.1, 1.0]

export default function CoinflipPage() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected, connecting } = useWallet()
  
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

    // Cleanup function
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
        vantaEffect.current = null
      }
    }
  }, [])

  const [betAmount, setBetAmount] = useState(MIN_BET_AMOUNT.toString())
  const [selectedSide, setSelectedSide] = useState<CoinSide>("heads")
  const [isFlipping, setIsFlipping] = useState(false)
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [currentResult, setCurrentResult] = useState<GameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [actualCoinSide, setActualCoinSide] = useState<CoinSide | null>(null)

  // Modal states
  const [showSpinningPopup, setShowSpinningPopup] = useState(false)
  const [showRulesPopup, setShowRulesPopup] = useState(false)
  const [showRecentGamesPopup, setShowRecentGamesPopup] = useState(false)

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

      setPayoutStatus("✅ Bet confirmed! Flipping coin...")
      
      // Step 3: Show spinning popup AFTER transaction confirmation
      setShowSpinningPopup(true)

            // Wait for spinning popup to complete its animation
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      // Hide spinning popup
      setShowSpinningPopup(false)
      
      // Step 4: Use GLOBAL COINFLIP game counter
      console.log(`CALLING playGlobalCoinflipGame(${amount})...`)
      const gameResult = await playGlobalCoinflipGame(amount)
      console.log("GLOBAL COINFLIP GAME RESULT:", gameResult)
      const playerWins = gameResult.isWinner

      console.log(
        `COINFLIP GAME: Player ${playerWins ? "WINS" : "LOSES"} on GLOBAL coinflip game #${gameResult.gameNumber}`,
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
          `YOU WON ${winAmount.toFixed(3)} SOL! (Coinflip Game #${gameResult.gameNumber}) Processing payout...`,
        )

        try {
          console.log(`Player won! Processing payout of ${winAmount} SOL`)

          const payoutResult = await processGamePayout(publicKey.toString(), winAmount)
          console.log("Payout result:", payoutResult)

          if (payoutResult.success) {
            setPayoutStatus(`PAYOUT SENT! ${winAmount.toFixed(3)} SOL has been transferred to your wallet!`)
            console.log(`Payout successful: ${payoutResult.signature}`)
          } else {
            setPayoutError(`Payout failed: ${payoutResult.error}`)
            console.error("Payout failed:", payoutResult.error)
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown payout error"
          setPayoutError(`Payout error: ${errorMsg}`)
          console.error("Payout exception:", error)
        }
      } else {
        setPayoutStatus(`You lost this round! (Coinflip Game #${gameResult.gameNumber}) Better luck next time!`)
      }
    } catch (error) {
      console.error("❌ Game error:", error)
      setShowSpinningPopup(false) // Hide spinning popup on error

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
      setShowSpinningPopup(false)
    }
  }, [publicKey, connection, betAmount, selectedSide, sendTransaction, connected])

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <>
        {/* Vanta.js DOTS Background - Complete Body Coverage */}
        <div 
          ref={vantaRef} 
          className="fixed inset-0 w-screen h-screen -z-10 bg-black"
          style={{ minHeight: '100vh', minWidth: '100vw' }}
        ></div>
        
        {/* Content */}
        <div className="min-h-screen relative py-8 w-full">
          <div className="container mx-auto relative z-10 px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Coinflip Game</h1>
              <p className="text-white/80 drop-shadow-md">Test your luck with our provably fair coin flip on One Bets!</p>
            </div>
            <div className="max-w-2xl mx-auto p-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
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
          </div>
        </div>
      </>
    )
  }

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
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">Coinflip Game</h1>
              <p className="text-white/80 drop-shadow-md">Test your luck with our provably fair coin flip on One Bets!</p>
            </div>
            <div className="flex gap-3 justify-center sm:justify-end">
              <Button
                onClick={() => setShowRecentGamesPopup(true)}
                variant="outline"
                className="bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/50 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm min-w-[120px]"
              >
                <Clock className="h-4 w-4 mr-2" />
                Recent Games
              </Button>
              <Button
                onClick={() => setShowRulesPopup(true)}
                variant="outline"
                className="bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/50 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm min-w-[100px]"
              >
                <Info className="h-4 w-4 mr-2" />
                Rules
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Visual Result */}
            <div className="lg:col-span-2 space-y-4">
              <CoinflipVisualResult
                actualSide={actualCoinSide}
                isWinner={currentResult?.won ?? null}
                isAnimating={isFlipping}
                currentResult={currentResult}
              />
            </div>

            {/* Right Column: Game Controls */}
            <div className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-2">
                    <Coins className="h-6 w-6" />
                    Coinflip Controls
                  </CardTitle>
                  <p className="text-white/70">Choose heads or tails, place your bet, and flip!</p>
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
                          className={`${Number.parseFloat(betAmount) === preset ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-white/10 hover:bg-white/20 text-white border-white/20"} text-sm py-2 rounded-xl`}
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
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
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
                        className={`${selectedSide === "heads" ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/20 text-white border-white/20"} flex-1 rounded-xl`}
                      >
                        Heads
                      </Button>
                      <Button
                        variant={selectedSide === "tails" ? "default" : "outline"}
                        onClick={() => setSelectedSide("tails")}
                        disabled={isFlipping || connecting}
                        className={`${selectedSide === "tails" ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/20 text-white border-white/20"} flex-1 rounded-xl`}
                      >
                        Tails
                      </Button>
                    </div>
                  </div>

                  {/* Flip Button */}
                  <Button
                    onClick={handleFlip}
                    disabled={isFlipping || connecting || !connected}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50 rounded-xl"
                  >
                    {connecting ? "Connecting..." : isFlipping ? "Processing..." : `Flip Coin (${betAmount} SOL)`}
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

                  {/* Current Result */}
                  {currentResult && (
                    <Card
                      className={`${currentResult.won ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"} rounded-2xl`}
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
                            <h3
                              className={`text-xl font-bold ${currentResult.won ? "text-green-400" : "text-red-400"}`}
                            >
                              {currentResult.won ? "YOU WON!" : "YOU LOST!"}
                            </h3>
                          </div>
                          <p className="text-white/80">Result: {currentResult.actualResult.toUpperCase()}</p>
                          <p className="text-white/80">Your choice: {currentResult.playerChoice.toUpperCase()}</p>
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
        </div>
      </div>

      {/* Spinning Popup */}
      <Dialog open={showSpinningPopup} onOpenChange={() => {}}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white w-[92vw] sm:max-w-lg max-h-[90vh] overflow-hidden p-6 sm:p-8 rounded-2xl" style={{borderRadius: '32px'}}>
          <div className="flex flex-col items-center">
            {/* GIF Image */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 mb-6 rounded-2xl">
              <img 
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXE5cGlncDVkNzhiNTN4cTMxNmh1bjNkYWZzajN2YWl6OXIzZjE4NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/p2jWWXr20V6UQOP1LJ/giphy.gif"
                alt="Coin flipping animation"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Description Below */}
            <div className="text-center">
              <div className="text-white text-2xl sm:text-3xl font-bold mb-4 drop-shadow-lg">
                Flipping Coin
              </div>
              <div className="text-white/90 text-base sm:text-lg mb-6 drop-shadow-md">
                Determining the winning side...
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                <span className="drop-shadow-md">Please wait</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rules Popup */}
      <Dialog open={showRulesPopup} onOpenChange={setShowRulesPopup}>
        <DialogContent className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8 rounded-2xl" style={{borderRadius: '32px'}}>
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Info className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              How to Play Coinflip
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-white/90">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">How to Play</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Place Your Bet - Minimum bet is 0.001 SOL. Choose your amount.</li>
                <li>Pick Your Choice - Select your prediction and place your bet.</li>
                <li>Win Multiplied Payouts - Test your luck and win big!</li>
                <li>Instant Payouts - Winners receive SOL directly to their wallet.</li>
              </ol>
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
              Recent Games
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {gameHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto rounded-2xl">
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
                          <span className="capitalize font-medium">{game.playerChoice}</span>
                          <span>→</span>
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
    </>
  )
}