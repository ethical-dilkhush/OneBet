import { NextResponse } from "next/server"
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getHouseWalletBalance, houseWallet } from "@/lib/house-wallet"
import { getWorkingConnection } from "@/lib/wallet-config"

export async function GET() {
  try {
    // Get house wallet balance (this is fast)
    const balance = await getHouseWalletBalance()
    
    // Get recent transaction signatures (this is fast)
    const workingConnection = await getWorkingConnection()
    const signatures = await workingConnection.getSignaturesForAddress(
      houseWallet.publicKey,
      { limit: 10 }
    )

    // Simplified and fast transaction processing - use only signature data
    const transactions = signatures.slice(0, 8).map((sig) => {
      // Use only the data available from getSignaturesForAddress (very fast)
      const status = sig.err ? 'failed' : 'success'
      
      // For successful transactions, we'll show basic info
      // For failed transactions, show as failed
      let transactionType = 'transaction'
      let otherWallet = 'Click to View Details'
      
      if (status === 'success') {
        // We can make educated guesses based on common patterns
        // Most transactions involving house wallet are either:
        // - Payouts to users (outgoing)
        // - Deposits from users (incoming) 
        transactionType = 'activity' // Generic successful activity
        otherWallet = 'View Transaction'
      }
      
      return {
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime,
        change: 0, // We don't calculate this to keep it fast
        type: transactionType,
        amount: 0, // We don't calculate this to keep it fast
        status: status,
        otherWallet: otherWallet
      }
    })

    const validTransactions = transactions.filter(tx => tx !== null)

    return NextResponse.json({
      success: true,
      data: {
        balance: balance,
        walletAddress: houseWallet.publicKey.toString(),
        transactions: transactions
      }
    })
  } catch (error) {
    console.error("Treasury API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch treasury data" },
      { status: 500 }
    )
  }
}
