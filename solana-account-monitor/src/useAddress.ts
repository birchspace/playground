import React from "react"

import { helius } from "~helius"

const id = "a443cbff-4b70-42a5-bd12-7cc653f18eea"

export const useList = () => {
  const [list, setList] = React.useState<string[]>()

  async function getData() {
    try {
      const result = await helius.getWebhookByID(id)

      if (result.accountAddresses) {
        setList(result.accountAddresses)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  async function add(addr: string) {
    try {
      const accountAddresses = [...list, addr]

      const result = await helius.editWebhook(id, {
        accountAddresses
      })

      if (result.accountAddresses) {
        setList(accountAddresses)
        return
      }
    } catch (error) {
      console.error("Failed to update data:", error)
    }
  }

  async function del(addr: string) {
    try {
      const newList = list.filter((item) => item !== addr)
      setList(newList)
    } catch (error) {
      console.error("Failed to update data:", error)
    }
  }
  React.useEffect(() => {
    getData()

    const intervalId = setInterval(getData, 600)

    return () => {
      clearInterval(intervalId)
    }
  }, [list])

  return { list, add ,del}
}
