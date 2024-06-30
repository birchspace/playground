const fs = require("fs");
const axios = require("axios");


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// 查询是否 Mint NFT成功
async function fetchMintInformation(walletAddress) {
    const config = {
        method: "get",
        url: `https://vanguard-queue-backend.xai.games/mints?walletAddress=${encodeURIComponent(
            walletAddress
        )}&day=15`,
        headers: {
            authority: "vanguard-queue-backend.xai.games",
            method: "GET",
            "access-control-request-method": "GET",
            path: `/mints?walletAddress=${encodeURIComponent(
                walletAddress
            )}&day=15`,
            "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
            Accept: "*/*",
            Host: "vanguard-queue-backend.xai.games",
            Connection: "keep-alive",
        },
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.log("error");
    }
}

// 查询是否在队列中
async function fetchIsQueued(walletAddress) {
    const config = {
        method: "get",
        url: `https://vanguard-queue-backend.xai.games/is-queued?walletAddress=${encodeURIComponent(walletAddress)}`,
        headers: {
            authority: "vanguard-queue-backend.xai.games",
            method: "GET",
            "access-control-request-method": "GET",
            path: `/mints?walletAddress=${encodeURIComponent(walletAddress)}`,
            "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
            Accept: "*/*",
            Host: "vanguard-queue-backend.xai.games",
            Connection: "keep-alive",
        },
    };

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.log("error");
    }
}

// 输出没有mint成功的NFT的序号
async function statusHandle(mintList, queueList) {
    const combinedResult = []
    for (let i = 0; i < mintList.length; i++) {
        if (mintList[i]) {
            null
        } else if (!queueList[i]) {
            combinedResult.push(i + 1);
        }
    }
    return combinedResult
}


async function run(walletAddress) {
    try {
        const mintInfo = await fetchMintInformation(walletAddress);
        const queuedInfo = await fetchIsQueued(walletAddress);
        const mintList = mintInfo.isMinted;
        // console.log("mintList:", mintList);
        const queuedList = queuedInfo.isQueued;
        // console.log("queuedList:", queuedList);
        const idList = statusHandle(mintList, queuedList);

        console.log(walletAddress, ":", idList);
    } catch (error) {
        console.error('An error occurred:');
    }
}


function main() {

    const filename = "./address.txt"

    fs.readFile(filename, "utf8", async (err, data) => {
        if (err) {
            console.error("Error reading the file:", err);
            return;
        }

        const keys = data
            .trim()
            .split("\n")
            .map((key) => key.trim());

        for (const key of keys) {
            await run(key);
            await sleep(2000)
        }

    });
}

main()