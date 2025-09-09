"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, RefreshCw } from "lucide-react"

interface TreasuryData {
  balance: number
  walletAddress: string
}

interface TreasuryWalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TreasuryWalletModal({ open, onOpenChange }: TreasuryWalletModalProps) {
  const [treasuryData, setTreasuryData] = useState<TreasuryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTreasuryData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/treasury')
      const result = await response.json()
      
      if (result.success) {
        setTreasuryData(result.data)
      } else {
        setError(result.error || 'Failed to fetch treasury data')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Treasury fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchTreasuryData()
    }
  }, [open])

  const formatAmount = (amount: number) => {
    return amount.toFixed(6)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/95 backdrop-blur-xl border-white/20 text-white w-[95vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-4 sm:p-6" style={{borderRadius: '24px'}}>
        <DialogHeader className="pb-3 sm:pb-6">
          <DialogTitle className="text-xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3 drop-shadow-lg">
            <Wallet className="h-5 w-5 sm:h-7 sm:w-7 text-yellow-400" />
            Treasury Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-yellow-400 mx-auto mb-3 sm:mb-4" />
                <span className="text-white/90 text-base sm:text-lg font-medium drop-shadow-md">Loading treasury data...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
                <p className="text-red-400 text-base sm:text-lg font-medium mb-3 sm:mb-4 drop-shadow-md">{error}</p>
                <Button 
                  onClick={fetchTreasuryData} 
                  variant="outline" 
                  size="sm"
                  className="border-red-400/30 text-red-400 hover:bg-red-500/10 hover:border-red-400/50 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {treasuryData && !loading && (
            <>
              {/* Wallet Overview */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 glass-morphism">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl font-bold text-white flex items-center justify-between drop-shadow-md">
                    <span>House Wallet Overview</span>
                    <Button
                      onClick={fetchTreasuryData}
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white"
                    >
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
                  {/* Balance */}
                  <div className="text-center py-1 sm:py-2">
                    <p className="text-white/70 text-xs sm:text-sm mb-1 drop-shadow-md">Current Balance</p>
                    <p className="text-xl sm:text-3xl font-bold text-yellow-400 drop-shadow-lg">
                      {formatAmount(treasuryData.balance)} SOL
                    </p>
                  </div>

                  {/* Wallet Address */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <p className="text-white/60 text-xs mb-2">Wallet Address</p>
                    <code className="text-white text-xs font-mono bg-black/20 px-2 py-1.5 rounded block w-full truncate">
                      {treasuryData.walletAddress}
                    </code>
                  </div>
                </CardContent>
              </Card>

            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
