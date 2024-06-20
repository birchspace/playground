import dotenv from "dotenv";

import { Redis } from "ioredis";
import { Logger } from "@book000/node-utils";
import { Twitter } from "@book000/twitterts";
import { SamechanCrawlerConfiguration } from "./config/index.js";
import { checkUrlsForDomains } from "./utils/checkUrlsForDomains.js";

dotenv.config();
async function main() {
  const time = process.env.TIME!;
  const main = process.env.MAIN!;
  const channel = process.env.NAME!;
  const redisUrl = process.env.REDIS_URL!;
  // const chromium = process.env.CHROMIUM_PATH!;
  const configPath = process.env.CONFIG_PATH;

  // Initialize Redis client
  const client = new Redis(redisUrl);

  // Configure logger
  const logger = Logger.configure("main");
  logger.info("✨ start");

  // Load and validate configuration
  const config = new SamechanCrawlerConfiguration(configPath);

  config.load();

  if (!config.validate()) {
    logger.error("❌ Config is invalid");
    for (const failure of config.getValidateFailures()) {
      logger.error("- " + failure);
    }
    return;
  }

  // Login to Twitter
  const twitter = await Twitter.login({
    username: config.get("twitter").username,
    password: config.get("twitter").password,
    otpSecret: config.get("twitter").otpSecret,
    puppeteerOptions: {
      // executablePath: chromium,
      // userDataDirectory: process.env.USER_DATA_DIRECTORY ?? "./data/userdata",
    },
    debugOptions: {
      outputResponse: {
        enable: true,
      },
    },
  });

  // Set interval to fetch and publish tweets every 60 seconds
  setInterval(async () => {
    const tweets = await twitter.searchRawTweets({
      query: main,
      searchType: "live",
      limit: 20,
    });

    logger.info(`🔍 Fetched ${tweets.length} tweets`);

    const domainsToCheck = [main];

    for (const tweet of tweets) {
      const id = tweet.core?.user_results.result?.id;
      const name = tweet.core?.user_results.result?.legacy?.name;
      const tweetUrl = tweet.core?.user_results.result?.legacy?.url;
      const fansNum = tweet.core?.user_results.result?.legacy?.followers_count;
      const urls = tweet.legacy?.entities.urls;

      logger.info(`Name: ${name}    Followers count: ${fansNum}`);

      if (urls) {
        const resList = checkUrlsForDomains(urls, domainsToCheck);
        for (const res of resList) {
          if (res.isMatchFound) {
            logger.info(` ${res.originalUrl}`);

            // Prepare tweet data
            const tweetData = {
              id,
              name,
              tweetUrl,
              fansNum,
              urls: urls.map((url) => url.expanded_url),
            };

            // Publish tweet data to Redis channel
            client.publish(channel, JSON.stringify({ tweetData }));
          }
        }
      } else {
        logger.warn("No found url");
      }
    }
  }, Number(time));
}

// Start the main function
(async () => {
  await main().catch((error: unknown) => {
    Logger.configure("main").error("❌ Error", error as Error);
    process.exit(1);
  });
})();
