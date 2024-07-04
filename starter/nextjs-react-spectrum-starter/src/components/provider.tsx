"use client";

import { useRouter } from "next/navigation";
import { defaultTheme } from "@adobe/react-spectrum";
import { Provider as ReactSpectrumProvider } from "@adobe/react-spectrum";

interface ProviderProps {
  children: React.ReactNode;
}

declare module "@adobe/react-spectrum" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Provider({ children }: ProviderProps) {
  const router = useRouter();
  return (
    <ReactSpectrumProvider
      theme={defaultTheme}
      router={{ navigate: (e) => router.push(e) }}
    >
      {children}
    </ReactSpectrumProvider>
  );
}
