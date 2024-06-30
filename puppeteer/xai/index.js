const fs = require("fs");
const { createBrowser, newPage } = require('./scraper');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run(address, browser) {
    const claimPage = await newPage(browser)

    await claimPage.goto('https://vanguard.xai.games/')

    const inputElement = await claimPage.waitForSelector('#root > main > div:nth-child(3) > label > div > input');

    await inputElement.click({ clickCount: 3 });
    await claimPage.keyboard.press('Backspace');

    await inputElement.type(address);

    await sleep(3000)

    while (true) {
        try {
            const filteredButtons = [];
            const claimButtons = await claimPage.$$('button');
            for (const button of claimButtons) {
                const text = await claimPage.evaluate(el => el.innerText.trim(), button);
                if (text === 'Claim') {
                    filteredButtons.push(button);
                }
            }

            if (filteredButtons.length === 0) {
                break;
            }

            for (const button of filteredButtons) {
                try {
                    await button.click();
                } catch (e) {
                    console.log(`Failed to click claim button: ${e}`);
                }
            }
            await sleep(500);
        } catch (e) {
            console.log(`Failed to find claim button: ${e}`);
            break;
        }
    }

    claimPage.close()
}
async function main() {

    const browser = await createBrowser(600, 1000)

    const filename = "./address.txt"

    await new Promise((resolve, reject) => {
        fs.readFile(filename, "utf8", async (err, data) => {
            if (err) {
                console.error("Error reading the file:", err);
                return reject(err);
            }

            const keys = data
                .trim()
                .split("\n")
                .map((key) => key.trim());

            for (const key of keys) {
                await run(key, browser);
                await sleep(2000);
            }

            resolve();
        });
    });

    browser.close()

}

main()