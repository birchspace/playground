"use client";

import React from "react";
import Link from "next/link";

import { cn } from "~/lib/utils";
import { useInView } from "framer-motion";
import { siteConfig } from "~/config/site";
import { WalletButton } from "~/components/wallet-btn";

export function SiteHeader() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "40px 0px 0px", amount: "all" });

  return (
    <>
      <div ref={ref} />
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-background/95 py-6 backdrop-blur-md duration-100 ease-linear",
          !inView &&
            "border-b supports-[backdrop-filter]:bg-background/10 dark:border-[#747978]/20",
        )}
      >
        <div className="container flex items-center justify-between">
          <Link
            href="/"
            className="w-fit px-1.5 py-0.5 font-bold uppercase dark:bg-[#898989]"
          >
            {siteConfig.name}
          </Link>
          <WalletButton />
        </div>
      </header>
    </>
  );
}
