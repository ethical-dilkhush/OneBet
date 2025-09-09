"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Copy, CheckCircle } from "lucide-react"

interface ContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractModal({ open, onOpenChange }: ContractModalProps) {
  const [copied, setCopied] = useState(false)
  
  // Placeholder contract address - will be updated when actual contract is deployed
  const contractAddress = "Coming Soon"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-4 sm:p-6 bg-black/95 backdrop-blur-xl border-white/20 text-white"
        style={{ borderRadius: '24px' }}
      >
        <DialogHeader className="pb-3 sm:pb-6">
          <DialogTitle className="text-xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <FileText className="h-5 w-5 sm:h-7 sm:w-7 text-yellow-400" />
            Contract Address
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-6">
          {/* Contract Address Section */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                Smart Contract
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Contract Address Display */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-white/60 font-medium">Contract Address:</p>
                <div 
                  className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={copyToClipboard}
                >
                  <code className="flex-1 text-xs sm:text-sm text-white/90 font-mono break-all">
                    {contractAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="shrink-0 h-8 w-8 p-0 hover:bg-white/10"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-white/60" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-400">Copied to clipboard!</p>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-xs text-white/60">
                  This is the official One Bets smart contract address on Solana blockchain.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                    Solana Program
                  </Badge>
                  <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
