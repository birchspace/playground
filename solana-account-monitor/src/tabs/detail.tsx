import "~style.css"

import React from "react"
import useWebSocket from "react-use-websocket"

interface AccountData {
  account: string
  nativeBalanceChange: number
  tokenBalanceChanges: TokenBalanceChange[]
}

interface TokenBalanceChange {
  mint: string
  rawTokenAmount: RawTokenAmount
  tokenAccount: string
  userAccount: string
}

interface RawTokenAmount {
  decimals: number
  tokenAmount: string
}

interface NftEvent {
  amount: number
  buyer: string
  description: string
  fee: number
  feePayer: string
  nfts: Nft[]
  saleType: string
  seller: string
  signature: string
  slot: number
  source: string
  staker: string
  timestamp: number
  type: string
}

interface Nft {
  mint: string
  tokenStandard: string
}

interface NativeTransfer {
  amount: number
  fromUserAccount: string
  toUserAccount: string
}

interface TokenTransfer {
  fromTokenAccount: string
  fromUserAccount: string
  mint: string
  toTokenAccount: string
  toUserAccount: string
  tokenAmount: number
  tokenStandard: string
}

interface WebhookData {
  accountData: AccountData[]
  description: string
  events: {
    nft: NftEvent
  }
  fee: number
  feePayer: string
  nativeTransfers: NativeTransfer[]
  signature: string
  slot: number
  source: string
  timestamp: number
  tokenTransfers: TokenTransfer[]
  type: string
}

type WebhookDataArray = WebhookData[]

export default function Detail() {
  // 确保使用正确的 WebSocket URL
  const socketUrl =
    "wss://554a3956-4758-4a68-b17e-2ed3448e9b78-00-1vngvzsuiug4y.picard.replit.dev/webhooks"

  const { lastMessage } = useWebSocket(socketUrl, {
    onOpen: () => console.log("WebSocket Connected"),
    shouldReconnect: (closeEvent) => true
  })

  return (
    <div className="py-10 px-8 flex flex-col gap-4 h-screen items-center">
      <h1 className="text-5xl font-bold py-4">Tokenspy</h1>

      {lastMessage?.data ? (
        <>
          {lastMessage.data === "Welcome New Client!" ? (
            <div className="font-bold text-xl flex h-full w-full items-center justify-center font-mono">
              waitting&nbsp;
              <span className="loading loading-dots loading-xs"></span>
            </div>
          ) : (
            <>
              {(JSON.parse(lastMessage.data) as WebhookDataArray).map(
                (item, index) => (
                  <div
                    className="collapse collapse-arrow bg-base-200"
                    key={index}>
                    <input type="radio" name="my-accordion-2" />
                    <div className="collapse-title text-xl font-medium flex items-center gap-4">
                      <div className="badge badge-success">{item.type}</div>
                      <div className="badge badge-secondary">{item.source}</div>
                      {item.feePayer}
                    </div>
                    <div className="collapse-content">
                      <p>{item.description}</p>
                      <a
                      target="_blank"
                        href={`https://solscan.io/tx/${item.signature}`}
                        className="link link-accent text-accent">
                        check
                      </a>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </>
      ) : (
        <div className="font-bold text-4xl flex h-full w-full items-center justify-center font-mono">
          not found
        </div>
      )}
    </div>
  )
}
