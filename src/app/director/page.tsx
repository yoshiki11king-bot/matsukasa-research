import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichTextBody } from "@/components/post-body";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import { formatDate } from "@/lib/formatters";
import { getCurrentDirectorPage, getSidebarSnapshot } from "@/lib/microcms";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "所長",
  description: "松笠研究所の所長ページです。役割、責任、公開姿勢をまとめています。",
  path: "/director",
  keywords: ["所長", "運営責任", "公開姿勢"],
});

export const revalidate = 3600;

export default async function DirectorPage() {
  const [page, sidebar] = await Promise.all([getCurrentDirectorPage(), getSidebarSnapshot()]);

  if (!page) {
    notFound();
  }

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
    >
      <div className="space-y-10">
        <section className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">所長</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
            {page.title}
          </h1>
          <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">
            {page.summary}
          </p>
          <RichTextBody body={page.body} className="max-w-3xl" />
          <p className="text-sm text-[color:var(--color-muted)]">
            更新日 {formatDate(page.updatedDate)}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {page.roleCards.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]"
            >
              <p className="text-base font-semibold text-[color:var(--color-primary)]">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="公開姿勢"
              title={page.stanceTitle}
              description={page.stanceDescription}
            />
            <div className="grid gap-4 md:grid-cols-3">
              {page.stanceCards.map((item) => (
                <article
                  key={item.title}
                  className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5"
                >
                  <p className="text-base font-semibold text-[color:var(--color-primary)]">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--color-muted)]">関連ページ</p>
              <p className="max-w-3xl text-[1.02rem] leading-8 text-[color:var(--color-text)]">
                {page.relatedSummary}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/about" className="ui-button ui-button-primary h-11 px-5 text-sm">
                私たちについて
              </Link>
              <Link href="/finance" className="ui-button ui-button-secondary h-11 px-5 text-sm">
                財務情報を見る
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
