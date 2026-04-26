import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "@/components/search-icon";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="ui-site-settle sticky top-0 z-40 border-b border-[rgba(249,115,22,0.14)] bg-[color:var(--color-surface-elevated)] [background-image:linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,247,237,0.82)_100%)] shadow-[0_10px_34px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1480px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="ui-logo-link flex items-center gap-4 text-[color:var(--color-primary)]">
          <span className="relative h-12 w-[76px] shrink-0 lg:h-[54px] lg:w-[84px]">
            <Image
              src="/matsukasa-logo.png"
              alt={`${siteConfig.name} のロゴ`}
              fill
              sizes="84px"
              className="object-contain mix-blend-multiply"
            />
          </span>
          <span className="space-y-1">
            <span className="font-editorial block text-[2rem] font-semibold tracking-tight leading-none lg:text-[2.15rem]">
              {siteConfig.name}
            </span>
            <span className="hidden text-sm text-[color:var(--color-secondary-ink)] sm:block">
              {siteConfig.englishName}
            </span>
          </span>
        </Link>
        <div className="flex min-w-[280px] flex-1 flex-col items-end gap-3">
          <nav className="flex flex-wrap items-center justify-end gap-4 text-sm text-[color:var(--color-secondary-ink)] lg:gap-5">
            <Link href="/articles" className="ui-signal-link rounded-md px-1 py-2 transition hover:text-[color:var(--color-primary)]">
              記事
            </Link>
            <Link href="/reports" className="ui-signal-link rounded-md px-1 py-2 transition hover:text-[color:var(--color-primary)]">
              報告書
            </Link>
            <Link href="/about" className="ui-signal-link rounded-md px-1 py-2 transition hover:text-[color:var(--color-primary)]">
              私たちについて
            </Link>
            <Link
              href="/donate"
              className="ui-button ui-button-primary h-10 px-4 text-sm"
            >
              寄付
            </Link>
          </nav>
          <form action="/articles" className="flex w-full max-w-[320px] items-center gap-2">
            <input
              type="search"
              name="q"
              placeholder="記事を検索"
              className="h-10 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm text-[color:var(--color-text)] outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
            />
            <button
              type="submit"
              aria-label="記事を検索"
              className="ui-button ui-button-secondary h-10 w-10 shrink-0 px-0 text-sm"
            >
              <SearchIcon />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
