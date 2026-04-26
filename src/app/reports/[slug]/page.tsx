import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { PublicShell } from "@/components/public-shell";
import { StructuredData } from "@/components/structured-data";
import { formatDate } from "@/lib/formatters";
import {
  getMethodologies,
  getReportBySlug,
  getResearchers,
  getSidebarSnapshot,
} from "@/lib/microcms";
import { buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type ReportDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ReportDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReportBySlug(slug);

  if (!report) {
    return {
      title: `報告書が見つかりません | ${siteConfig.name}`,
    };
  }

  return buildPageMetadata({
    title: report.title,
    description: report.summary,
    path: `/reports/${report.slug}`,
    type: "article",
    keywords: [report.reportType, ...report.topicNames],
    imageUrl: report.coverImage?.url,
  });
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { slug } = await params;
  const [report, sidebar, researchers, methodologies] = await Promise.all([
    getReportBySlug(slug),
    getSidebarSnapshot(),
    getResearchers(),
    getMethodologies(),
  ]);

  if (!report) {
    notFound();
  }

  const relatedResearchers = researchers.filter((researcher) =>
    report.researcherSlugs.includes(researcher.slug),
  );
  const relatedMethods = methodologies.filter((entry) =>
    report.methodologySlugs.includes(entry.slug),
  );
  const reportJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: report.title,
    description: report.summary,
    datePublished: report.publishedDate,
    dateModified: report.updatedDate,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      alternateName: siteConfig.englishName,
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/matsukasa-logo.png"),
      },
    },
    mainEntityOfPage: getAbsoluteUrl(`/reports/${report.slug}`),
    image: report.coverImage?.url ? [report.coverImage.url] : [getAbsoluteUrl("/opengraph-image")],
    genre: report.reportType,
    keywords: report.topicNames.join(", "),
    inLanguage: "ja-JP",
    about: report.topicNames,
  };

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
      rightRail={
        <div className="space-y-5">
          <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">報告書の前提</p>
              <dl className="space-y-3 text-sm leading-7 text-[color:var(--color-text)]">
                <div>
                  <dt className="text-[color:var(--color-muted)]">更新日</dt>
                  <dd>{formatDate(report.updatedDate)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">基準</dt>
                  <dd>{report.sourceBasis}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">対象地域</dt>
                  <dd>{report.region}</dd>
                </div>
              </dl>
            </div>
          </section>

          {relatedResearchers.length > 0 ? (
            <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">担当研究員</p>
                {relatedResearchers.map((researcher) => (
                  <Link
                    key={researcher.id}
                    href={`/researchers/${researcher.slug}`}
                    className="block text-sm leading-7 text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]"
                  >
                    {researcher.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {relatedMethods.length > 0 ? (
            <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">方法論</p>
                {relatedMethods.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/methodologies/${entry.slug}`}
                    className="block text-sm leading-7 text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]"
                  >
                    {entry.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      }
    >
      <div className="space-y-8">
        <StructuredData data={reportJsonLd} />
        <Link href="/reports" className="text-sm font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-accent-ink)]">
          ← 報告書一覧へ戻る
        </Link>

        <article className="space-y-8 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <header className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted)]">
              <span className="rounded-md bg-[color:var(--color-primary)] px-2.5 py-1 font-medium text-[color:var(--color-primary-contrast)]">
                {report.reportType}
              </span>
              <time dateTime={report.publishedDate}>{formatDate(report.publishedDate)}</time>
              {report.topicNames.map((topic) => (
                <span key={topic} className="rounded-md bg-[color:var(--color-surface-muted)] px-2.5 py-1 text-[color:var(--color-text)]">
                  {topic}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">{report.title}</h1>
            <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">{report.summary}</p>
          </header>

          {report.coverImage ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
              <Image
                src={report.coverImage.url}
                alt={report.coverImage.alt || report.title}
                fill
                priority
                sizes="(min-width: 1024px) 900px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <section className="grid gap-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">出典</p>
              <p className="text-sm leading-7 text-[color:var(--color-text)]">{report.sourceBasis}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">更新日</p>
              <p className="text-sm leading-7 text-[color:var(--color-text)]">{formatDate(report.updatedDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">PDF</p>
              {report.pdfUrl ? (
                <a
                  href={report.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm leading-7 text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]"
                >
                  PDF を開く
                </a>
              ) : (
                <p className="text-sm leading-7 text-[color:var(--color-text)]">PDF 準備中</p>
              )}
            </div>
          </section>

          <PostBody body={report.body} blocks={report.contentBlocks} />

          {report.figures.length > 0 ? (
            <section className="space-y-4">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">図表</p>
              <div className="grid gap-4 md:grid-cols-2">
                {report.figures.map((figure) => (
                  <figure
                    key={`${figure.title}-${figure.url}`}
                    className="overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
                  >
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src={figure.url}
                        alt={figure.title}
                        fill
                        sizes="(min-width: 1024px) 420px, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="px-4 py-3 text-sm text-[color:var(--color-secondary-ink)]">{figure.title}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          {report.sourceLinks.length > 0 ? (
            <section className="space-y-3 border-t border-[color:var(--color-border)] pt-6">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">関連資料</p>
              <ul className="space-y-2 text-sm text-[color:var(--color-secondary-ink)]">
                {report.sourceLinks.map((item) => (
                  <li key={`${item.label}-${item.url ?? ""}`}>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer" className="transition hover:text-[color:var(--color-primary)]">
                        {item.label}
                      </a>
                    ) : (
                      item.label
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </div>
    </PublicShell>
  );
}
