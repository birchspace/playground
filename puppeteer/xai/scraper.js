const puppeteer = require('puppeteer');

async function createBrowser(width, height) {

    const puppeteerArguments = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--lang=en',
        `--window-size=${600},${height}`,
        '--disable-session-crashed-bubble',
    ]

    const browser = await puppeteer.launch({
        headless: false,
        channel: 'chrome',
        args: puppeteerArguments,
        defaultViewport: {
            width,
            height,
        },
    })

    process.on('SIGINT', () => {
        browser
            .close()
            .then(() => {
                process.exit(0)
            })
            .catch((error) => {
                console.error('Failed to close browser', error)
                process.exit(1)
            })
    })

    return browser
}

async function newPage(browser) {
    const page = await browser.newPage()

    page.setDefaultNavigationTimeout(120 * 1000)

    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', () => { })
        delete navigator.__proto__.webdriver
    })

    return page
}

exports.createBrowser = createBrowser
exports.newPage = newPage
