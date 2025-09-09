"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useEffect, useState } from "react"

export function WalletInfo() {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true)
      connection
        .getBalance(publicKey)
        .then((balance) => {
          setBalance(balance / LAMPORTS_PER_SOL)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      setBalance(null)
    }
  }, [connection, publicKey, connected])

  if (!connected || !publicKey) return null

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 text-white max-w-sm mx-auto">
      <h3 className="font-bold mb-2 text-sm sm:text-base">Wallet Connected</h3>
      <p className="text-xs sm:text-sm mb-1">
        <span className="opacity-70">Address:</span> {publicKey.toString().slice(0, 6)}...
        {publicKey.toString().slice(-6)}
      </p>
      <p className="text-xs sm:text-sm">
        <span className="opacity-70">Balance:</span> {loading ? "Loading..." : `${balance?.toFixed(4) || "0"} SOL`}
      </p>
    </div>
  )
}
