import { PublicKey } from "@solana/web3.js"

export const validateSolanaAddress = async (addr: string) => {
  let publicKey: PublicKey

  try {
    publicKey = new PublicKey(addr)

    await new Promise(resolve => setTimeout(resolve, 1500))

    return PublicKey.isOnCurve(publicKey.toBytes())
  } catch (err) {
    return false
  }
}
