import { ConfigFramework } from "@book000/node-utils";

interface Config {
  twitter: {
    username: string;
    password: string;
    otpSecret: string;
  };
}

export class SamechanCrawlerConfiguration extends ConfigFramework<Config> {
  protected validates(): Record<string, (config: Config) => boolean> {
    return {
      "twitter is required": (config) => !!config.twitter,
      "twitter is object": (config) => typeof config.twitter === "object",
      "twitter.username is required": (config) => !!config.twitter.username,
      "twitter.username is string": (config) =>
        typeof config.twitter.username === "string",
      "twitter.password is required": (config) => !!config.twitter.password,
      "twitter.password is string": (config) =>
        typeof config.twitter.password === "string",
    };
  }
}
