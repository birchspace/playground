import "server-only";

import { env } from "~/env";
import { cache } from "react";
import { headers } from "next/headers";

import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(() => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");
  // adds the owner bearer token to the request
  heads.set("Authorization", `Bearer ${env.OWNER_BEARER_TOKEN}`);

  return createTRPCContext({
    headers: heads,
  });
});

export const api = createCaller(createContext);
