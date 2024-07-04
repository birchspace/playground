import { List } from "~features/list"
import { Create } from "~features/create"

import "~style.css"

function IndexPopup() {
  return (
    <div className="min-h-64 max-h-[500px] w-96 bg-[#111113]  text-gray-100 overflow-hidden" data-theme="business">
      <div className="flex items-center justify-center py-2 border-b border-[#1e1e1e]">
        <span className="font-extrabold text-lg tracking-tight">Token spy</span>
      </div>
      <div className="flex flex-col h-full bg-[#111113] p-4">
        <div className=" flex-1 h-full flex rounded-md gap-4 flex-col">
          <Create />
          <List />
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
