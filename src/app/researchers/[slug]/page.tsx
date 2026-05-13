import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichTextBody } from "@/components/post-body";
import { PublicShell } from "@/components/public-shell";
import { StructuredData } from "@/components/structured-data";
import { formatDate } from "@/lib/formatters";
import {
  getMethodologies,
  getPostsByResearcher,
  getReportsByResearcher,
  getResearcherBySlug,
  getSidebarSnapshot,
} from "@/lib/microcms";
import { buildBreadcrumbJsonLd, buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type ResearcherDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ResearcherDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const researcher = await getResearcherBySlug(slug);

  if (!researcher) {
    return {
      title: `研究員が見つかりません | ${siteConfig.name}`,
    };
  }

  return buildPageMetadata({
    title: researcher.name,
    description: researcher.summary,
    path: `/researchers/${researcher.slug}`,
    type: "profile",
    keywords: [researcher.role, researcher.team, ...researcher.focusTopics],
    imageUrl: researcher.portraitImage?.url,
  });
}

export default async function ResearcherDetailPage({ params }: ResearcherDetailPageProps) {
  const { slug } = await params;
  const [researcher, posts, reports, methodologies, sidebar] = await Promise.all([
    getResearcherBySlug(slug),
    getPostsByResearcher(slug),
    getReportsByResearcher(slug),
    getMethodologies(),
    getSidebarSnapshot(),
  ]);

  if (!researcher) {
    notFound();
  }

  const relatedMethods = methodologies.filter((entry) =>
    researcher.methodologySlugs.includes(entry.slug),
  );
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: researcher.name,
    description: researcher.summary,
    jobTitle: researcher.role,
    worksFor: {
      "@type": "Organization",
      name: siteConfig.name,
      alternateName: siteConfig.englishName,
      url: getAbsoluteUrl("/"),
    },
    url: getAbsoluteUrl(`/researchers/${researcher.slug}`),
    image: researcher.portraitImage?.url,
    knowsAbout: researcher.focusTopics,
  };
  const structuredData = [
    personJsonLd,
    buildBreadcrumbJsonLd([
      { name: "研究員", path: "/researchers" },
      { name: researcher.name, path: `/researchers/${researcher.slug}` },
    ]),
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
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">更新情報</p>
              <dl className="space-y-3 text-sm leading-7 text-[color:var(--color-text)]">
                <div>
                  <dt className="text-[color:var(--color-muted)]">更新日</dt>
                  <dd>{formatDate(researcher.updatedDate)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">基準</dt>
                  <dd>{researcher.sourceBasis}</dd>
                </div>
                {researcher.email ? (
                  <div>
                    <dt className="text-[color:var(--color-muted)]">連絡先</dt>
                    <dd>{researcher.email}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </section>
        </div>
      }
    >
      <div className="space-y-8">
        <StructuredData data={structuredData} />
        <Link href="/researchers" className="text-sm font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-accent-ink)]">
          ← 研究員一覧へ戻る
        </Link>

        <article className="space-y-8 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
            {researcher.portraitImage ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
                <Image
                  src={researcher.portraitImage.url}
                  alt={researcher.portraitImage.alt || researcher.name}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-[color:var(--color-muted)]">{researcher.role} / {researcher.team}</p>
                <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">{researcher.name}</h1>
                <p className="text-lg leading-9 text-[color:var(--color-text)]">{researcher.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[color:var(--color-muted)]">
                {researcher.focusTopics.map((topic) => (
                  <span key={topic} className="rounded-md bg-[color:var(--color-surface-muted)] px-2.5 py-1 text-[color:var(--color-text)]">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <p className="text-sm font-semibold text-[color:var(--color-primary)]">紹介</p>
            <RichTextBody body={researcher.bio} />
          </section>

          {relatedMethods.length > 0 ? (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">担当する方法論</p>
              <div className="flex flex-wrap gap-3">
                {relatedMethods.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/methodologies/${entry.slug}`}
                    className="rounded-md bg-[color:var(--color-surface-subtle)] px-3 py-2 text-sm text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]"
                  >
                    {entry.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {posts.length > 0 ? (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">担当した記事</p>
              <div className="space-y-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="block rounded-lg border border-[color:var(--color-border)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text)] transition hover:border-[color:var(--color-border-stronger)] hover:text-[color:var(--color-primary)]"
                  >
                    {post.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {reports.length > 0 ? (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">関連報告書</p>
              <div className="space-y-3">
                {reports.map((report) => (
                  <Link
                    key={report.id}
                    href={`/reports/${report.slug}`}
                    className="block rounded-lg border border-[color:var(--color-border)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text)] transition hover:border-[color:var(--color-border-stronger)] hover:text-[color:var(--color-primary)]"
                  >
                    {report.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>
    </PublicShell>
  );
}
