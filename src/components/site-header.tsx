import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "@/components/search-icon";
import { siteConfig } from "@/lib/site";
import { topicPageDefinitions } from "@/lib/topic-pages";

type SiteHeaderProps = {
  variant?: "default" | "rudbeckia";
};

const topicColumns = [
  topicPageDefinitions.slice(0, 5),
  topicPageDefinitions.slice(5),
];

const guideLinks = [
  { href: "/articles", label: "記事" },
  { href: "/reports", label: "報告書" },
  { href: "/methodologies", label: "方法論" },
  { href: "/tools-datasets", label: "ツールとデータセット" },
  { href: "/researchers", label: "研究員" },
];

const projectLinks = [
  { href: "/about", label: "私たちについて" },
  { href: "/donate", label: "寄付" },
  { href: "/projects/rudbeckia", label: "Project Rudbeckia" },
];

export function SiteHeader({ variant = "default" }: SiteHeaderProps) {
  const isRudbeckia = variant === "rudbeckia";
  const switchHref = isRudbeckia ? "/" : "/projects/rudbeckia";
  const switchLabel = isRudbeckia ? "松笠研究所へ切り替える" : "Project: Rudbeckia へ切り替える";

  if (isRudbeckia) {
    return (
      <header className="ui-site-settle sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] [background-image:linear-gradient(180deg,#ffffff_0%,#ffffff_100%)] shadow-[0_10px_34px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1480px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/projects/rudbeckia"
              className="ui-logo-link flex min-w-0 items-center gap-4 text-[color:var(--color-primary)]"
            >
              <span className="relative h-14 w-[260px] shrink-0 sm:w-[340px] lg:h-16 lg:w-[390px]">
                <Image
                  src="/projects/rudbeckia/title-image.png"
                  alt="Project: Rudbeckia"
                  fill
                  priority
                  sizes="(min-width: 1024px) 390px, (min-width: 640px) 340px, 260px"
                  className="object-contain object-left mix-blend-multiply"
                />
              </span>
            </Link>
            <Link
              href={switchHref}
              aria-label={switchLabel}
              title={switchLabel}
              className="ui-rudbeckia-switch group ui-rudbeckia-switch-return"
            >
              <span className="ui-rudbeckia-switch-rule" />
              <span className="relative h-7 w-7 shrink-0 sm:h-8 sm:w-8">
                <Image
                  src="/projects/rudbeckia/switch-icon.png"
                  alt=""
                  fill
                  sizes="32px"
                  className="object-contain mix-blend-multiply"
                />
              </span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="ui-site-settle sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-text)]">
      <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-2 px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="max-w-full truncate">統計・事実・トレンドで日本を形づくる</p>
          <nav className="flex max-w-full items-center gap-4 overflow-x-auto">
            <Link href="/articles" className="transition hover:text-[color:var(--color-primary)]">記事</Link>
            <Link href="/reports" className="transition hover:text-[color:var(--color-primary)]">レポート</Link>
            <a href={`mailto:${siteConfig.contactEmail}`} className="transition hover:text-[color:var(--color-primary)]">お問い合わせ</a>
          </nav>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1320px] flex-col items-start gap-6 px-5 py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-9">
        <div className="flex w-full min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5 lg:w-auto">
          <Link
            href="/"
            className="ui-logo-link flex min-w-0 items-center gap-4 text-[color:var(--color-primary)]"
          >
            <span className="relative h-12 w-[76px] shrink-0 lg:h-[58px] lg:w-[90px]">
              <Image
                src="/matsukasa-logo.png"
                alt={`${siteConfig.name} のロゴ`}
                fill
                sizes="90px"
                className="object-contain"
              />
            </span>
            <span className="min-w-0 space-y-1">
              <span className="font-editorial block text-[1.7rem] font-semibold tracking-tight leading-none text-[color:var(--color-primary)] sm:text-[2rem] lg:text-[2.45rem]">
                {siteConfig.name}
              </span>
              <span className="block text-sm text-[color:var(--color-secondary-ink)] sm:text-base">
                {siteConfig.englishName}
              </span>
            </span>
          </Link>
          <Link
            href={switchHref}
            aria-label={switchLabel}
            title={switchLabel}
            className="ui-rudbeckia-switch group ui-rudbeckia-switch-gold"
          >
            <span className="ui-rudbeckia-switch-rule" />
            <span className="ui-rudbeckia-switch-text">To The Rudbeckia</span>
            <span className="relative h-7 w-7 shrink-0 sm:h-8 sm:w-8">
                <Image
                  src="/projects/rudbeckia/switch-icon.png"
                  alt=""
                  fill
                  sizes="32px"
                  className="object-contain mix-blend-multiply"
                />
            </span>
          </Link>
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col items-stretch gap-4 lg:items-end">
          <form action="/articles" className="flex w-full max-w-none items-center gap-0 lg:max-w-[380px]">
            <input
              type="search"
              name="q"
              placeholder="記事を検索"
              className="h-12 min-w-0 flex-1 rounded-none border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 text-sm text-[color:var(--color-text)] outline-none transition placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-focus-ring)]"
            />
            <button
              type="submit"
              aria-label="記事を検索"
              className="ui-button ui-button-secondary h-12 w-12 shrink-0 rounded-none border-l-0 px-0 text-sm"
            >
              <SearchIcon />
            </button>
          </form>
        </div>
      </div>

      <nav className="relative border-t border-[color:var(--color-border)]">
        <div className="mx-auto flex w-full max-w-[1320px] items-center gap-7 overflow-x-auto px-5 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-[color:var(--color-secondary-ink)] lg:overflow-visible lg:px-8">
          <div className="group shrink-0">
            <Link
              href="/topics/media"
              className="inline-flex items-center gap-2 transition hover:text-[color:var(--color-primary)] focus-visible:text-[color:var(--color-primary)]"
            >
              <span>研究テーマ</span>
              <span aria-hidden="true" className="text-[0.7rem] text-[color:var(--color-muted)]">▾</span>
            </Link>
            <div className="invisible absolute left-0 right-0 top-full z-50 opacity-0 shadow-[0_22px_55px_rgba(15,23,42,0.12)] transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                <div className="mx-auto grid w-full max-w-[1320px] gap-8 px-5 py-7 text-left lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:px-8">
                  <section className="space-y-4">
                    <h2 className="font-sans text-sm font-semibold normal-case tracking-normal text-[color:var(--color-primary)]">
                      研究テーマ
                    </h2>
                    <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
                      {topicColumns.map((column, columnIndex) => (
                        <div key={columnIndex} className="space-y-3">
                          {column.map((topic) => (
                            <Link
                              key={topic.slug}
                              href={`/topics/${topic.slug}`}
                              className="block text-base font-medium normal-case tracking-normal text-[color:var(--color-secondary-ink)] transition hover:text-[color:var(--color-accent-ink)]"
                            >
                              {topic.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4 border-t border-[color:var(--color-border)] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <h2 className="font-sans text-sm font-semibold normal-case tracking-normal text-[color:var(--color-primary)]">
                      入口
                    </h2>
                    <div className="space-y-3">
                      {guideLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block text-base font-medium normal-case tracking-normal text-[color:var(--color-secondary-ink)] transition hover:text-[color:var(--color-accent-ink)]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4 border-t border-[color:var(--color-border)] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <h2 className="font-sans text-sm font-semibold normal-case tracking-normal text-[color:var(--color-primary)]">
                      案内
                    </h2>
                    <div className="space-y-3">
                      {projectLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block text-base font-medium normal-case tracking-normal text-[color:var(--color-secondary-ink)] transition hover:text-[color:var(--color-accent-ink)]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
          <Link href="/articles" className="shrink-0 transition hover:text-[color:var(--color-primary)]">記事</Link>
          <Link href="/reports" className="shrink-0 transition hover:text-[color:var(--color-primary)]">報告書</Link>
          <Link href="/methodologies" className="shrink-0 transition hover:text-[color:var(--color-primary)]">方法論</Link>
          <Link href="/tools-datasets" className="shrink-0 transition hover:text-[color:var(--color-primary)]">ツールとデータセット</Link>
          <Link href="/researchers" className="shrink-0 transition hover:text-[color:var(--color-primary)]">研究員</Link>
          <Link href="/about" className="shrink-0 transition hover:text-[color:var(--color-primary)]">私たちについて</Link>
          <Link href="/donate" className="ml-auto shrink-0 text-[color:var(--color-accent)] transition hover:text-[color:var(--color-primary)]">寄付</Link>
        </div>
      </nav>
    </header>
  );
}
