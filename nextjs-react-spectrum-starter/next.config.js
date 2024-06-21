/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import { glob } from "glob";

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: [
    "@adobe/react-spectrum",
    "@react-spectrum/*",
    "@spectrum-icons/*",
  ].flatMap((spec) => glob.sync(`${spec}`, { cwd: "node_modules/" })),

  experimental: {
    optimizePackageImports: ["package-name"],
  },
};

export default config;
