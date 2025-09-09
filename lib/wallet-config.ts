import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { Connection } from "@solana/web3.js"

// Your Helius RPC configuration
export const HELIUS_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=a5c09a94-239c-431b-a09c-175942f60081"
export const HELIUS_WS_URL = "wss://mainnet.helius-rpc.com/?api-key=a5c09a94-239c-431b-a09c-175942f60081"

// Fallback RPC endpoints
export const FALLBACK_RPC_URLS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.g.alchemy.com/v2/demo",
  "https://rpc.ankr.com/solana"
]

// Create connection with fallback
export const connection = new Connection(HELIUS_RPC_URL, "confirmed")

// Function to get a working connection with fallbacks
export async function getWorkingConnection(): Promise<Connection> {
  const endpoints = [HELIUS_RPC_URL, ...FALLBACK_RPC_URLS]
  
  for (const endpoint of endpoints) {
    try {
      const testConnection = new Connection(endpoint, "confirmed")
      // Test the connection
      await testConnection.getLatestBlockhash("confirmed")
      console.log(`✅ Using RPC endpoint: ${endpoint}`)
      return testConnection
    } catch (error) {
      console.warn(`⚠️ RPC endpoint failed: ${endpoint}`, error)
      continue
    }
  }
  
  // If all fail, return the default connection
  console.warn("⚠️ All RPC endpoints failed, using default connection")
  return connection
}

// Wallet adapters
export const wallets = [new PhantomWalletAdapter()]

export const network = WalletAdapterNetwork.Mainnet
