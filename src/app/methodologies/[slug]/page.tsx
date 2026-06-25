import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { RichTextBody } from "@/components/post-body";
import { PublicShell } from "@/components/public-shell";
import { StructuredData } from "@/components/structured-data";
import { contentSource } from "@/lib/content-source";
import { formatDate } from "@/lib/formatters";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type MethodologyDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: MethodologyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = contentSource.getMethodologyBySlug
    ? await contentSource.getMethodologyBySlug(slug)
    : null;

  if (!entry) {
    return {
      title: `方法論が見つかりません | ${siteConfig.name}`,
    };
  }

  return buildPageMetadata({
    title: entry.title,
    description: entry.summary,
    path: `/methodologies/${entry.slug}`,
    type: "article",
    keywords: [...entry.focusTopics, "方法論"],
  });
}

export default async function MethodologyDetailPage({ params }: MethodologyDetailPageProps) {
  const { slug } = await params;
  const [entry, posts, reports, sidebar] = await Promise.all([
    contentSource.getMethodologyBySlug ? contentSource.getMethodologyBySlug(slug) : null,
    contentSource.getPostsByMethodology(slug),
    contentSource.getReportsByMethodology(slug),
    contentSource.getSidebarSnapshot(),
  ]);

  if (!entry) {
    notFound();
  }

  if (entry.isLocalPress) {
    const charts = contentSource.getChartsBySlug
      ? await contentSource.getChartsBySlug()
      : {};

    return (
      <PublicShell
        researchers={sidebar.featuredResearchers}
        methodologies={sidebar.featuredMethodologies}
        reports={sidebar.featuredReports}
        showSidebar={false}
      >
        <div className="mx-auto max-w-5xl space-y-8">
          <Link href="/methodologies" className="text-sm font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-accent-ink)]">
            ← 方法論一覧へ戻る
          </Link>
          <article className="mx-auto w-full max-w-4xl space-y-10 bg-white px-5 py-10 sm:px-8 lg:px-0">
            <header className="space-y-5 border-b border-[color:var(--color-border)] pb-8">
              <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">
                <span>METHODOLOGY</span>
                <time dateTime={entry.updatedDate}>{formatDate(entry.updatedDate)}</time>
              </div>
              <h1 className="font-editorial text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-primary)] md:text-5xl">
                {entry.title}
              </h1>
              {entry.summary ? <p className="text-lg leading-9 text-[color:var(--color-secondary-ink)]">{entry.summary}</p> : null}
            </header>
            <MarkdownRenderer body={entry.body} charts={charts} />
          </article>
        </div>
      </PublicShell>
    );
  }

  const structuredData = [
    buildWebPageJsonLd({
      name: entry.title,
      description: entry.summary,
      path: `/methodologies/${entry.slug}`,
      dateModified: entry.updatedDate,
    }),
    buildBreadcrumbJsonLd([
      { name: "方法論", path: "/methodologies" },
      { name: entry.title, path: `/methodologies/${entry.slug}` },
    ]),
    buildItemListJsonLd(
      `${entry.title}に関連する記事と報告書`,
      [
        ...posts.map((post) => ({
          name: post.title,
          path: `/posts/${post.slug}`,
          description: post.excerpt,
          imageUrl: post.coverImage?.url,
        })),
        ...reports.map((report) => ({
          name: report.title,
          path: `/reports/${report.slug}`,
          description: report.summary,
          imageUrl: report.coverImage?.url,
        })),
      ],
    ),
  ];

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
      rightRail={
        <div className="space-y-5">
          <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">更新と基準</p>
              <dl className="space-y-3 text-sm leading-7 text-[color:var(--color-text)]">
                <div>
                  <dt className="text-[color:var(--color-muted)]">更新日</dt>
                  <dd>{formatDate(entry.updatedDate)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">基準</dt>
                  <dd>{entry.sourceBasis}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">レビュー</dt>
                  <dd>{entry.reviewer}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      }
    >
      <div className="space-y-8">
        <StructuredData data={structuredData} />
        <Link href="/methodologies" className="text-sm font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-accent-ink)]">
          ← 方法論一覧へ戻る
        </Link>

        <article className="space-y-8 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <header className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">{entry.title}</h1>
            <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">{entry.summary}</p>
          </header>

          <section className="grid gap-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">向いている場面</p>
              <ul className="space-y-2 text-sm leading-7 text-[color:var(--color-text)]">
                {entry.goodFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">やりすぎないこと</p>
              <ul className="space-y-2 text-sm leading-7 text-[color:var(--color-text)]">
                {entry.limits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <RichTextBody body={entry.body} />

          {posts.length > 0 ? (
            <section className="space-y-3 border-t border-[color:var(--color-border)] pt-6">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">この方法論を使った記事</p>
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="block rounded-lg border border-[color:var(--color-border)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text)] transition hover:border-[color:var(--color-border-stronger)] hover:text-[color:var(--color-primary)]"
                >
                  {post.title}
                </Link>
              ))}
            </section>
          ) : null}

          {reports.length > 0 ? (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">関連報告書</p>
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.slug}`}
                  className="block rounded-lg border border-[color:var(--color-border)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text)] transition hover:border-[color:var(--color-border-stronger)] hover:text-[color:var(--color-primary)]"
                >
                  {report.title}
                </Link>
              ))}
            </section>
          ) : null}
        </article>
      </div>
    </PublicShell>
  );
}
