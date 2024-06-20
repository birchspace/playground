import Link from "next/link";

import { siteConfig } from "~/config/site";

export function SiteFooter() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 text-balance py-4 text-center text-sm leading-loose text-muted-foreground md:flex-row md:py-6">
        <div className="md:text-left">
          <ul className="flex space-x-2">
            <li>{`© ${new Date().getFullYear()}`}</li>
            <li>{` • `}</li>
            <li>
              <Link href="/">{siteConfig.name}</Link>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          The source code is available on
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
