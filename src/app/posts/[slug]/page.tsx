import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { PostBody } from "@/components/post-body";
import { PublicShell } from "@/components/public-shell";
import { StatusBanner } from "@/components/status-banner";
import { StructuredData } from "@/components/structured-data";
import { getChartsBySlug } from "@/lib/content/charts";
import { estimateReadingTime, formatDate } from "@/lib/formatters";
import {
  cmsStatus,
  getAllPostSlugs,
  getPostBySlug,
  getSidebarSnapshot,
} from "@/lib/microcms";
import { buildBreadcrumbJsonLd, buildPageMetadata, getAbsoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { BlogPost } from "@/lib/types";

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

function getReadingSource(post: BlogPost) {
  if (post.contentBlocks.length === 0) {
    return post.body;
  }

  return post.contentBlocks
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
    .join(" ");
}

function ArticleReadingRail({
  post,
  readingMinutes,
}: {
  post: BlogPost;
  readingMinutes: number;
}) {
  const topics = post.topics.length > 0 ? post.topics : [post.category].filter(Boolean);

  return (
    <aside className="article-reading-rail" aria-label="記事の補助情報">
      <section className="article-reading-rail-section">
        <h2 className="article-reading-rail-title">関連している</h2>
        <div className="article-reading-rail-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      {topics.length > 0 ? (
        <section className="article-reading-rail-section">
          <h2 className="article-reading-rail-title">トピック</h2>
          <div className="article-reading-topic-list">
            {topics.map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="article-reading-rail-section">
        <h2 className="article-reading-rail-title">人気ランキング</h2>
        <ol className="article-reading-ranking" aria-label="人気ランキング枠">
          {[1, 2, 3, 4, 5].map((rank) => (
            <li key={rank}>
              <span>{rank}</span>
              <i />
            </li>
          ))}
        </ol>
      </section>

      <section className="article-reading-rail-section">
        <h2 className="article-reading-rail-title">記事情報</h2>
        <dl className="article-reading-facts">
          <div>
            <dt>形式</dt>
            <dd>{post.format}</dd>
          </div>
          <div>
            <dt>公開日</dt>
            <dd>{formatDate(post.publishedDate)}</dd>
          </div>
          <div>
            <dt>読了目安</dt>
            <dd>{readingMinutes}分</dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}

function ArticleShareRow({ slug }: { slug: string }) {
  return (
    <div className="article-reading-share" aria-label="共有">
      <Link href="/articles" aria-label="記事一覧へ戻る">
        ←
      </Link>
      <a href={`mailto:?subject=${encodeURIComponent(siteConfig.name)}&body=${encodeURIComponent(getAbsoluteUrl(`/posts/${slug}`))}`}>
        ✉
      </a>
      <span>{getAbsoluteUrl(`/posts/${slug}`)}</span>
    </div>
  );
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, sidebar] = await Promise.all([
    getPostBySlug(slug),
    getSidebarSnapshot(),
  ]);

  if (!post) {
    notFound();
  }

  const readingSource = getReadingSource(post);
  const readingMinutes = estimateReadingTime(readingSource);
  const charts = post.isLocalPress ? await getChartsBySlug() : {};
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
      showSidebar={false}
      showHeaderCarousel={false}
      mainClassName="max-w-none px-0 py-0 lg:px-0 lg:py-0"
    >
      <StructuredData data={structuredData} />
      <div className="article-reading-surface">
        {!cmsStatus.configured ? <StatusBanner kind="demo" /> : null}
        <nav className="article-reading-breadcrumb" aria-label="パンくずリスト">
          <Link href="/">家</Link>
          <span>›</span>
          <Link href="/articles">記事</Link>
          {post.category ? (
            <>
              <span>›</span>
              <span>{post.category}</span>
            </>
          ) : null}
        </nav>

        <div className="article-reading-layout">
          <article className="article-reading-main">
            <header className="article-reading-header">
              <div className="article-reading-meta">
                {post.isLocalPress ? <span>Local Press</span> : null}
                <span>{post.format}</span>
                <time dateTime={post.publishedDate}>{formatDate(post.publishedDate)}</time>
              </div>
              <h1 className="article-reading-title">{post.title}</h1>
              {post.excerpt ? <p className="article-reading-excerpt">{post.excerpt}</p> : null}
              <ArticleShareRow slug={post.slug} />
              <p className="article-reading-author">
                による <span>{post.authorName}</span>
              </p>
            </header>

            {post.coverImage ? (
              <figure className="article-reading-cover">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverImage.url}
                    alt={post.coverImage.alt || post.title}
                    fill
                    priority
                    sizes="(min-width: 1180px) 820px, 100vw"
                    className="object-cover"
                  />
                </div>
                {post.coverImage.alt ? <figcaption>{post.coverImage.alt}</figcaption> : null}
              </figure>
            ) : null}

            {(post.sourceBasis || post.updatedNote || post.methodologySummary) ? (
              <section className="article-reading-research-note">
                <h2>この研究について</h2>
                <dl>
                  {post.sourceBasis ? (
                    <div>
                      <dt>出典・基準</dt>
                      <dd>{post.sourceBasis}</dd>
                    </div>
                  ) : null}
                  {post.updatedNote ? (
                    <div>
                      <dt>更新</dt>
                      <dd>{post.updatedNote}</dd>
                    </div>
                  ) : null}
                  {post.methodologySummary ? (
                    <div>
                      <dt>方法</dt>
                      <dd>{post.methodologySummary}</dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            {post.keyFindings.length > 0 ? (
              <section className="article-reading-key-findings">
                <h2>要点</h2>
                <ul>
                  {post.keyFindings.map((finding) => (
                    <li key={finding}>{finding}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="article-reading-body">
              {post.isLocalPress ? (
                <MarkdownRenderer body={post.body} charts={charts} />
              ) : (
                <PostBody body={post.body} blocks={post.contentBlocks} />
              )}
            </div>

            {post.sourceLinks.length > 0 ? (
              <section className="article-reading-reference">
                <h2>参考メモ</h2>
                <ul>
                  {post.sourceLinks.map((item) => (
                    <li key={`${item.label}-${item.url ?? ""}`}>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer">
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

          <div className="article-reading-divider" aria-hidden="true" />
          <ArticleReadingRail post={post} readingMinutes={readingMinutes} />
        </div>
      </div>
    </PublicShell>
  );
}
