"use client"

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { type ReactNode, useMemo } from "react"
import { HELIUS_RPC_URL, wallets } from "@/lib/wallet-config"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

interface WalletContextProviderProps {
  children: ReactNode
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  const endpoint = useMemo(() => HELIUS_RPC_URL, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
