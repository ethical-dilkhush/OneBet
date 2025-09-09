"use server"

import { sendPayout, walletInitialized } from "@/lib/house-wallet"

export async function processGamePayout(playerAddress: string, winAmount: number) {
  console.log(`🎯 PROCESSING PAYOUT REQUEST`)
  console.log(`- Player: ${playerAddress}`)
  console.log(`- Amount: ${winAmount} SOL`)
  console.log(`- Wallet initialized: ${walletInitialized}`)

  try {
    // Validate wallet initialization
    if (!walletInitialized) {
      console.error("❌ House wallet not initialized")
      return {
        success: false,
        error: "House wallet configuration error - wallet not initialized",
      }
    }

    // Validate inputs
    if (!playerAddress || winAmount <= 0) {
      console.error("❌ Invalid payout parameters")
      return {
        success: false,
        error: "Invalid payout parameters",
      }
    }

    // Send payout
    console.log("💸 Sending payout...")
    const signature = await sendPayout(playerAddress, winAmount)

    console.log(`✅ PAYOUT COMPLETED: ${signature}`)

    return {
      success: true,
      signature,
      message: `Payout of ${winAmount} SOL sent successfully!`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown payout error"
    console.error("❌ PAYOUT ERROR:", errorMessage)

    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function testHouseWallet() {
  try {
    console.log("🧪 Testing house wallet...")
    console.log(`- Initialized: ${walletInitialized}`)

    if (!walletInitialized) {
      return {
        success: false,
        error: "House wallet not initialized",
      }
    }

    return {
      success: true,
      message: "House wallet is properly initialized",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Test failed",
    }
  }
}
