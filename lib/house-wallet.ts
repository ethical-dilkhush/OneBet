import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getWorkingConnection } from "./wallet-config"

// House wallet configuration
const HOUSE_PRIVATE_KEY_STRING = process.env.HOUSE_PRIVATE_KEY_STRING
const HOUSE_WALLET_ADDRESS = process.env.HOUSE_WALLET_ADDRESS

// Convert base58 string to Uint8Array manually
function base58ToBytes(base58: string): Uint8Array {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  let decoded = BigInt(0)
  let multi = BigInt(1)

  for (let i = base58.length - 1; i >= 0; i--) {
    const char = base58[i]
    const index = alphabet.indexOf(char)
    if (index === -1) throw new Error(`Invalid character: ${char}`)
    decoded += BigInt(index) * multi
    multi *= BigInt(58)
  }

  const bytes: number[] = []
  while (decoded > 0) {
    bytes.unshift(Number(decoded % BigInt(256)))
    decoded = decoded / BigInt(256)
  }

  // Handle leading zeros
  for (let i = 0; i < base58.length && base58[i] === "1"; i++) {
    bytes.unshift(0)
  }

  return new Uint8Array(bytes)
}

// Create house wallet keypair
let houseWallet: Keypair
let walletInitialized = false

try {
  console.log("🔑 Initializing house wallet...")

  // Check if private key is available
  if (!HOUSE_PRIVATE_KEY_STRING) {
    throw new Error("HOUSE_PRIVATE_KEY_STRING environment variable is not set")
  }

  // Convert the private key
  const secretKeyBytes = base58ToBytes(HOUSE_PRIVATE_KEY_STRING)
  console.log(`📏 Secret key length: ${secretKeyBytes.length} bytes`)

  if (secretKeyBytes.length !== 64) {
    throw new Error(`Invalid secret key length: ${secretKeyBytes.length}, expected 64`)
  }

  houseWallet = Keypair.fromSecretKey(secretKeyBytes)

  console.log(`🏦 House wallet public key: ${houseWallet.publicKey.toString()}`)
  console.log(`🎯 Expected address: ${HOUSE_WALLET_ADDRESS}`)

  if (houseWallet.publicKey.toString() === HOUSE_WALLET_ADDRESS) {
    walletInitialized = true
    console.log("✅ House wallet initialized successfully!")
  } else {
    console.error("❌ Public key mismatch!")
  }
} catch (error) {
  console.error("❌ Failed to initialize house wallet:", error)
  houseWallet = Keypair.generate() // Fallback
}

// Create connection
const connection = new Connection(
  process.env.HELIUS_API_KEY 
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    : "https://mainnet.helius-rpc.com/?api-key=a5c09a94-239c-431b-a09c-175942f60081", 
  "confirmed"
)

export { houseWallet, walletInitialized }

export async function sendPayout(recipientAddress: string, amountSOL: number): Promise<string> {
  if (!walletInitialized) {
    throw new Error("House wallet not properly initialized")
  }

  try {
    console.log(`💰 PAYOUT INITIATED`)
    console.log(`- From: ${houseWallet.publicKey.toString()}`)
    console.log(`- To: ${recipientAddress}`)
    console.log(`- Amount: ${amountSOL} SOL`)

    const recipientPubkey = new PublicKey(recipientAddress)
    const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL)

    // Get working connection with fallbacks
    const workingConnection = await getWorkingConnection()

    // Check house wallet balance
    const houseBalance = await workingConnection.getBalance(houseWallet.publicKey)
    console.log(`🏦 House balance: ${houseBalance / LAMPORTS_PER_SOL} SOL`)

    if (houseBalance < lamports) {
      throw new Error(`Insufficient house funds: need ${amountSOL} SOL, have ${houseBalance / LAMPORTS_PER_SOL} SOL`)
    }

    // Create and send transaction
    const transaction = new Transaction()
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: houseWallet.publicKey,
        toPubkey: recipientPubkey,
        lamports: lamports,
      }),
    )

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await workingConnection.getLatestBlockhash("finalized")
    transaction.recentBlockhash = blockhash
    transaction.feePayer = houseWallet.publicKey

    // Sign transaction
    transaction.sign(houseWallet)

    // Send transaction
    const signature = await workingConnection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: "finalized",
    })

    console.log(`📤 Transaction sent: ${signature}`)

    // Confirm transaction
    const confirmation = await workingConnection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      "finalized",
    )

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
    }

    console.log(`✅ PAYOUT SUCCESSFUL: ${amountSOL} SOL sent to ${recipientAddress}`)
    console.log(`🔗 Signature: ${signature}`)

    return signature
  } catch (error) {
    console.error("❌ PAYOUT FAILED:", error)
    throw error
  }
}

export async function getHouseWalletBalance(): Promise<number> {
  try {
    if (!walletInitialized) return 0
    const workingConnection = await getWorkingConnection()
    const balance = await workingConnection.getBalance(houseWallet.publicKey)
    return balance / LAMPORTS_PER_SOL
  } catch (error) {
    console.error("Failed to get house balance:", error)
    return 0
  }
}
