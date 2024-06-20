import React from "react"

import { useList } from "~useAddress"
import { validateSolanaAddress } from "~validate"

export function Create() {
  // Wallet Tracker
  const { add } = useList()

  // Form data
  const [address, setAddress] = React.useState("")

  // Loading state
  const [loading, setLoading] = React.useState(false)

  // Error
  const [error, setError] = React.useState(false)

  // Success
  const [success, setSuccess] = React.useState(false)

  async function submit(event) {
    // Shadowing event
    event.preventDefault()

    try {
      setError(false)
      setLoading(true)
      setSuccess(false)
      // Validate a Solana wallet address with web3js
      const isAddress =await validateSolanaAddress(address)

      if (isAddress) {
        // Update
        add(address)
        // Wait 60s
        await new Promise(resolve => setTimeout(resolve, 60000))
      } else {
        setError(true)
      }
    } catch (err) {
      console.log("Error:", err)
    } finally {
      setLoading(false)
    }
  }
  return (
    <form className="rounded-lg flex items-center gap-4" onSubmit={submit}>
      <label
        className={`input input-bordered flex items-center gap-2 rounded-lg w-full ${error ? " border-red-900" : ""}`}>
        <input
          type="text"
          className="grow "
          placeholder="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </label>
      {!loading ? (
        <button
          className={`btn btn-square rounded-xl ${success ? "bg-green-950" : ""}`}
          type="submit">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-badge-plus">
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
            <line x1="12" x2="12" y1="8" y2="16" />
            <line x1="8" x2="16" y1="12" y2="12" />
          </svg>
        </button>
      ) : (
        <button className="btn btn-square rounded-xl">
          <span className="loading loading-spinner"></span>
        </button>
      )}
    </form>
  )
}
