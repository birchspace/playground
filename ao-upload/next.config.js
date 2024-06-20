/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  webpack: (config) => {
    // Add the alias to the webpack configuration
    config.resolve.alias["@permaweb/aoconnect"] = path.resolve(
      process.cwd(),
      "node_modules/@permaweb/aoconnect/dist/browser",
    );
    // Return the modified config
    return config;
  },
};

export default config;
import path from "path";
