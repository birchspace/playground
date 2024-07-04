import { useList } from "~useAddress"

export function List() {
  const { list, del } = useList()

  const navigateToDetail = () => {
    chrome.tabs.create({ url: "tabs/detail.html" })
  }

  return (
    <div className="h-full">
      {list ? (
        <div className="felx flex-col gap-2 space-y-2">
          {list.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <button
                onClick={navigateToDetail}
                className="flex flex-col items-start gap-2 rounded-lg p-3 w-full text-left text-sm btn hover:text-white transition-all card bg-base-100 font-semibold font-mono">
                {item.slice(0, 4)}...{item.slice(-4)}
              </button>
              <button className="btn btn-circle" onClick={() => del(item)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center w-full h-full">
          <span className="loading loading-bars loading-sm"></span>
        </div>
      )}
    </div>
  )
}
