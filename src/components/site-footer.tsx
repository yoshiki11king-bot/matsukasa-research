import Image from "next/image";
import Link from "next/link";
import { getTopics } from "@/lib/microcms";
import { siteConfig } from "@/lib/site";
import { getTopicHref } from "@/lib/topic-pages";

export async function SiteFooter() {
  const topics = await getTopics();
  const footerLinks = [
    { href: "/about", label: "私たちについて" },
    { href: "/reports", label: "報告書" },
    { href: "/methodologies", label: "方法論" },
    { href: "/tools-datasets", label: "ツールとデータセット" },
    { href: "/projects/rudbeckia", label: "Project: Rudbeckia" },
    { href: "/researchers", label: "研究員" },
    { href: "/finance", label: "財務情報" },
    { href: "/careers", label: "採用" },
    { href: "/donate", label: "寄付" },
  ];

  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] [background-image:var(--gradient-warm-footer)]">
      <div className="mx-auto w-full max-w-[1480px] px-5 py-10 lg:px-8 lg:py-12">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_280px]">
          <section className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="relative h-12 w-[74px] shrink-0">
                <Image
                  src="/matsukasa-logo.png"
                  alt={`${siteConfig.name} のロゴ`}
                  fill
                  sizes="74px"
                  className="object-contain mix-blend-multiply"
                />
              </span>
              <div className="space-y-1">
                <p className="font-editorial text-2xl font-semibold tracking-tight text-[color:var(--color-primary)]">
                  {siteConfig.name}
                </p>
                <p className="text-sm text-[color:var(--color-secondary-ink)]">
                  {siteConfig.englishName}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
              <p>{siteConfig.headerLabel}</p>
              <p>{siteConfig.description}</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="border-b border-dotted border-[color:var(--color-border-stronger)] pb-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">研究テーマ</p>
              <div className="ui-accent-rule mt-3 h-px w-full opacity-70" />
            </div>
            <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <Link
                  key={topic.name}
                  href={getTopicHref(topic.name)}
                  className="ui-signal-link inline-flex w-fit text-lg font-medium leading-8 text-[color:var(--color-primary)] transition hover:text-[color:var(--color-accent-ink)]"
                >
                  {topic.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="border-b border-dotted border-[color:var(--color-border-stronger)] pb-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">案内</p>
              <div className="ui-accent-rule mt-3 h-px w-full opacity-70" />
            </div>
            <div className="grid gap-3 text-base text-[color:var(--color-primary)]">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="ui-signal-link inline-flex w-fit transition hover:text-[color:var(--color-accent-ink)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 border-t border-[color:var(--color-border)] pt-6">
          <p className="max-w-5xl text-sm leading-8 text-[color:var(--color-secondary-ink)]">
            松笠研究所は、統計調査を主軸に、日本社会をより正確に理解するための知見を蓄積・公開する独立系シンクタンクです。結論を急がず、調査設計、更新日、解釈の前提を公開しながら、誰もが参照できる形で積み上げていきます。
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-border)] pt-4 text-sm text-[color:var(--color-secondary-ink)]">
          <p>© 2026 {siteConfig.name} / {siteConfig.englishName}</p>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/about" className="ui-signal-link transition hover:text-[color:var(--color-primary)]">
              私たちについて
            </Link>
            <Link href="/reports" className="ui-signal-link transition hover:text-[color:var(--color-primary)]">
              報告書
            </Link>
            <Link href="/methodologies" className="ui-signal-link transition hover:text-[color:var(--color-primary)]">
              方法論
            </Link>
            <Link href="/tools-datasets" className="ui-signal-link transition hover:text-[color:var(--color-primary)]">
              ツールとデータセット
            </Link>
            <Link href="/projects/rudbeckia" className="ui-signal-link transition hover:text-[color:var(--color-primary)]">
              Project: Rudbeckia
            </Link>
            <Link href="/finance" className="ui-signal-link transition hover:text-[color:var(--color-primary)]">
              財務情報
            </Link>
            <Link href="/careers" className="ui-signal-link transition hover:text-[color:var(--color-primary)]">
              採用
            </Link>
            <Link href="/donate" className="ui-signal-link transition hover:text-[color:var(--color-primary)]">
              寄付
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
