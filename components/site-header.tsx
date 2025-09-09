"use client"

import Link from "next/link"
import Image from "next/image"
import { WalletButton } from "@/components/wallet-button"
import { TreasuryWalletModal } from "@/components/treasury-wallet-modal"
import { ContractModal } from "@/components/contract-modal"
import { Button } from "@/components/ui/button"
import { Menu, Wallet } from "lucide-react"
import { useState } from "react"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [treasuryModalOpen, setTreasuryModalOpen] = useState(false)
  const [contractModalOpen, setContractModalOpen] = useState(false)

  return (
    <header className="fixed top-0 z-[9999] w-full bg-[#1a1a2e] border-b border-white/10 shadow-lg">
      <div className="w-full max-w-none flex h-16 items-center justify-between px-2 md:px-4">
        {/* Left - Logo + Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-lg md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Image 
                src="/images/hl.webp" 
                alt="One Bets Logo" 
                width={32} 
                height={32} 
                className="w-8 h-8 rounded-lg object-contain"
              />
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">
              One Bets
            </span>
          </Link>

        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Navigation Links - Hidden on mobile, visible on desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white/80 hover:text-white transition-colors duration-300 font-medium">
              Home
            </Link>
            <button
              onClick={() => setTreasuryModalOpen(true)}
              className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
            >
              Treasury Wallet
            </button>
            <button
              onClick={() => setContractModalOpen(true)}
              className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
            >
              Contract
            </button>
            <a 
              href="https://x.com/onebets_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors duration-300 font-medium"
            >
              X
            </a>
            <a 
              href="https://onebets.gitbook.io/home/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors duration-300 font-medium"
            >
              Docs
            </a>
          </div>

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#1a1a2e] border-b border-white/10 shadow-lg z-50">
          <div className="flex flex-col p-4 space-y-4">
            <Link 
              href="/" 
              className="text-white/80 hover:text-white transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <a 
              href="https://x.com/onebets_" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-white/5"
            >
              X
            </a>
            <a 
              href="https://onebets.gitbook.io/home/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-white/5"
            >
              Docs
            </a>
            <button
              onClick={() => {
                setTreasuryModalOpen(true)
                setMobileMenuOpen(false)
              }}
              className="text-white/80 hover:text-white transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-white/5 text-left w-full"
            >
              Treasury Wallet
            </button>
            <button
              onClick={() => {
                setContractModalOpen(true)
                setMobileMenuOpen(false)
              }}
              className="text-white/80 hover:text-white transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-white/5 text-left w-full"
            >
              Contract
            </button>
            <Link 
              href="/roadmap" 
              className="text-white/80 hover:text-white transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Roadmap
            </Link>
          </div>
        </div>
      )}
      
      {/* Treasury Wallet Modal */}
      <TreasuryWalletModal 
        open={treasuryModalOpen} 
        onOpenChange={setTreasuryModalOpen} 
      />
      
      {/* Contract Modal */}
      <ContractModal 
        open={contractModalOpen} 
        onOpenChange={setContractModalOpen} 
      />
    </header>
  )
}
