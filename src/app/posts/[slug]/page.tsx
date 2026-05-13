import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { PublicShell } from "@/components/public-shell";
import { StatusBanner } from "@/components/status-banner";
import { StructuredData } from "@/components/structured-data";
import { estimateReadingTime, formatDate } from "@/lib/formatters";
import {
  cmsStatus,
  getAllPostSlugs,
  getMethodologies,
  getPostBySlug,
  getResearchers,
  getReports,
  getSidebarSnapshot,
} from "@/lib/microcms";
import { buildBreadcrumbJsonLd, buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: `記事が見つかりません | ${siteConfig.name}`,
    };
  }

  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/posts/${post.slug}`,
    type: "article",
    keywords: [post.category, ...post.topics],
    imageUrl: post.coverImage?.url,
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, sidebar, researchers, methodologies, reports] = await Promise.all([
    getPostBySlug(slug),
    getSidebarSnapshot(),
    getResearchers(),
    getMethodologies(),
    getReports(),
  ]);

  if (!post) {
    notFound();
  }

  const relatedResearchers = researchers.filter((researcher) => post.researcherSlugs.includes(researcher.slug));
  const relatedMethods = methodologies.filter((entry) => post.methodologySlugs.includes(entry.slug));
  const relatedReports = reports.filter((report) =>
    report.methodologySlugs.some((methodSlug) => post.methodologySlugs.includes(methodSlug)),
  );
  const readingSource =
    post.contentBlocks.length > 0
      ? post.contentBlocks
          .map((block) => {
            if (block.type === "heading") {
              return block.text;
            }

            if (block.type === "paragraph") {
              return block.body;
            }

            if (block.type === "image") {
              return [block.caption, block.sourceText].filter(Boolean).join(" ");
            }

            return [block.title, block.description].filter(Boolean).join(" ");
          })
          .join(" ")
      : post.body;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedDate,
    dateModified: post.updatedAt ?? post.publishedDate,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      alternateName: siteConfig.englishName,
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/matsukasa-logo.png"),
      },
    },
    mainEntityOfPage: getAbsoluteUrl(`/posts/${post.slug}`),
    image: post.coverImage?.url ? [post.coverImage.url] : [getAbsoluteUrl("/opengraph-image")],
    articleSection: post.category,
    keywords: post.topics.join(", "),
    inLanguage: "ja-JP",
    about: post.topics,
  };
  const structuredData = [
    articleJsonLd,
    buildBreadcrumbJsonLd([
      { name: "記事", path: "/articles" },
      { name: post.title, path: `/posts/${post.slug}` },
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
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">出典・更新・基準</p>
              <dl className="space-y-3 text-sm leading-7 text-[color:var(--color-text)]">
                <div>
                  <dt className="text-[color:var(--color-muted)]">更新日</dt>
                  <dd>{post.updatedNote || formatDate(post.publishedDate)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">基準</dt>
                  <dd>{post.sourceBasis}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">調査方法</dt>
                  <dd>{post.methodologySummary}</dd>
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
                    {researcher.name} / {researcher.role}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {relatedMethods.length > 0 ? (
            <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">関連する方法論</p>
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

          {relatedReports.length > 0 ? (
            <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[color:var(--color-primary)]">関連報告書</p>
                {relatedReports.slice(0, 2).map((report) => (
                  <Link
                    key={report.id}
                    href={`/reports/${report.slug}`}
                    className="block text-sm leading-7 text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]"
                  >
                    {report.title}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      }
    >
      <div className="space-y-8">
        <StructuredData data={structuredData} />
        {!cmsStatus.configured ? <StatusBanner kind="demo" /> : null}

        <Link href="/articles" className="text-sm font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-accent-ink)]">
          ← 記事一覧へ戻る
        </Link>

        <article className="space-y-8 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <header className="space-y-5 border-b border-[color:var(--color-border)] pb-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted)]">
              <span className="rounded-md bg-[color:var(--color-primary)] px-2.5 py-1 font-medium text-[color:var(--color-primary-contrast)]">
                {post.format}
              </span>
              {post.topics.map((topic) => (
                <span key={topic} className="rounded-md bg-[color:var(--color-surface-muted)] px-2.5 py-1 text-[color:var(--color-text)]">
                  {topic}
                </span>
              ))}
              <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-[color:var(--color-primary)] sm:text-5xl">
                {post.title}
              </h1>
              <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">{post.excerpt}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--color-muted)]">
              <span>{post.authorName}</span>
              <span>{estimateReadingTime(readingSource)}分で読めます</span>
            </div>
          </header>

          {post.coverImage ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alt || post.title}
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
              <p className="text-sm leading-7 text-[color:var(--color-text)]">{post.sourceBasis}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">更新日</p>
              <p className="text-sm leading-7 text-[color:var(--color-text)]">{post.updatedNote}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-muted)]">基準</p>
              <p className="text-sm leading-7 text-[color:var(--color-text)]">{post.methodologySummary}</p>
            </div>
          </section>

          {post.keyFindings.length > 0 ? (
            <section className="space-y-4">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">要点</p>
              <ul className="space-y-3">
                {post.keyFindings.map((finding) => (
                  <li
                    key={finding}
                    className="border-l-4 border-[color:var(--color-accent-ink)] pl-4 text-sm leading-7 text-[color:var(--color-text)]"
                  >
                    {finding}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <PostBody body={post.body} blocks={post.contentBlocks} />

          {post.sourceLinks.length > 0 ? (
            <section className="space-y-3 border-t border-[color:var(--color-border)] pt-6">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">参考メモ</p>
              <ul className="space-y-2 text-sm text-[color:var(--color-secondary-ink)]">
                {post.sourceLinks.map((item) => (
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
