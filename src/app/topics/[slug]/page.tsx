import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionEmptyState } from "@/components/collection-empty-state";
import { PostCard } from "@/components/post-card";
import { PublicShell } from "@/components/public-shell";
import { StructuredData } from "@/components/structured-data";
import {
  getMethodologies,
  getPostsPage,
  getReports,
  getResearchers,
  getSidebarSnapshot,
  getTopics,
} from "@/lib/microcms";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import {
  getTopicDefinitionBySlug,
  getTopicHref,
  getTopicPageCopy,
  getTopicSlug,
  topicPageDefinitions,
} from "@/lib/topic-pages";

export const revalidate = 3600;

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return topicPageDefinitions.map((topic) => ({
    slug: topic.slug,
  }));
}

async function resolveTopic(slug: string) {
  const topics = await getTopics();
  const topic = topics.find((entry) => getTopicSlug(entry.name) === slug);

  if (!topic && !getTopicDefinitionBySlug(slug)) {
    return null;
  }

  return topic ?? null;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await resolveTopic(slug);

  if (!topic) {
    return buildPageMetadata({
      title: "研究テーマ",
      description: "研究テーマのページです。",
      path: `/topics/${slug}`,
      noindex: true,
    });
  }

  const copy = getTopicPageCopy(topic);

  return buildPageMetadata({
    title: `${topic.name} | 研究テーマ`,
    description: copy.summary,
    path: getTopicHref(topic.name),
    keywords: [topic.name, "研究テーマ", "記事", "報告書", "方法論"],
  });
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = await resolveTopic(slug);

  if (!topic) {
    notFound();
  }

  const [postsPage, reports, methodologies, researchers, sidebar] = await Promise.all([
    getPostsPage({
      page: 1,
      limit: 24,
      topics: [topic.name],
    }),
    getReports(),
    getMethodologies(),
    getResearchers(),
    getSidebarSnapshot(),
  ]);

  const topicReports = reports.filter((report) => report.topicNames.includes(topic.name));
  const topicMethodologies = methodologies.filter((entry) => entry.focusTopics.includes(topic.name));
  const topicResearchers = researchers.filter((researcher) => researcher.focusTopics.includes(topic.name));
  const copy = getTopicPageCopy(topic);
  const topicPath = getTopicHref(topic.name);
  const structuredData = [
    buildCollectionPageJsonLd({
      name: `${topic.name} | 研究テーマ`,
      description: copy.summary,
      path: topicPath,
    }),
    buildBreadcrumbJsonLd([
      { name: "研究テーマ", path: "/articles" },
      { name: topic.name, path: topicPath },
    ]),
    buildItemListJsonLd(
      `${topic.name}の記事`,
      postsPage.contents.map((post) => ({
        name: post.title,
        path: `/posts/${post.slug}`,
        description: post.excerpt,
        imageUrl: post.coverImage?.url,
      })),
    ),
  ];

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
    >
      <StructuredData data={structuredData} />
      <div className="space-y-10">
        <section className="overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)]">
          <div className="relative h-[240px] sm:h-[300px] lg:h-[340px]">
            <Image
              src={copy.imageUrl}
              alt={`${topic.name}の特設ページ画像`}
              fill
              sizes="(min-width: 1024px) 1040px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,23,42,0.78)] via-[rgba(15,23,42,0.52)] to-[rgba(15,23,42,0.2)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <div className="max-w-[620px] space-y-3">
                <p className="text-xs font-semibold tracking-[0.14em] text-white/78">TOPIC PAGE</p>
                <h1 className="text-[2.1rem] font-semibold tracking-tight sm:text-[2.6rem]">{topic.name}</h1>
                <p className="text-base leading-8 text-white/88">{copy.strapline}</p>
                <p className="text-sm leading-7 text-white/74 sm:text-base">{copy.summary}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-6 py-5">
            <Link href={`/articles?topics=${encodeURIComponent(topic.name)}`} className="ui-button ui-button-primary px-5 py-3 text-sm">
              このテーマで記事を探す
            </Link>
            <Link href="/reports" className="ui-button ui-button-secondary px-5 py-3 text-sm">
              関連報告書
            </Link>
            <Link href="/methodologies" className="ui-button ui-button-secondary px-5 py-3 text-sm">
              方法論
            </Link>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">ARTICLES</p>
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-[color:var(--color-primary)]">
                {topic.name}の記事
              </h2>
              <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">{topic.description}</p>
            </div>

            {postsPage.contents.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {postsPage.contents.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <CollectionEmptyState
                title={`${topic.name}の記事はこれから追加します`}
                body="いまは特設ページの導線を先に整えています。公開された記事はここにまとまって並びます。"
                actionHref="/"
                actionLabel="ホームへ戻る"
              />
            )}
          </div>

          <aside className="space-y-5">
            <section className="space-y-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">REPORTS</p>
                <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary)]">関連報告書</h2>
              </div>
              {topicReports.length > 0 ? (
                <div className="space-y-3">
                  {topicReports.slice(0, 2).map((report) => (
                    <Link
                      key={report.id}
                      href={`/reports/${report.slug}`}
                      className="block rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-4 transition hover:border-[color:var(--color-border-stronger)] hover:bg-[color:var(--color-surface-subtle)]"
                    >
                      <p className="text-sm text-[color:var(--color-muted)]">{report.reportType}</p>
                      <p className="mt-1 text-base font-semibold leading-7 text-[color:var(--color-primary)]">
                        {report.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">{report.summary}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                  このテーマの報告書は、公開されしだいここにまとまります。
                </p>
              )}
            </section>

            <section className="space-y-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">METHODS</p>
                <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary)]">関連方法論</h2>
              </div>
              {topicMethodologies.length > 0 ? (
                <div className="space-y-3">
                  {topicMethodologies.slice(0, 2).map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/methodologies/${entry.slug}`}
                      className="block rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-4 transition hover:border-[color:var(--color-border-stronger)] hover:bg-[color:var(--color-surface-subtle)]"
                    >
                      <p className="text-sm text-[color:var(--color-muted)]">更新 {entry.updatedDate}</p>
                      <p className="mt-1 text-base font-semibold leading-7 text-[color:var(--color-primary)]">
                        {entry.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">{entry.summary}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                  調査設計やレビュー基準の整理が進みしだい、このテーマに結びつく方法論を追加します。
                </p>
              )}
            </section>

            <section className="space-y-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">RESEARCHERS</p>
                <h2 className="text-xl font-semibold tracking-tight text-[color:var(--color-primary)]">担当研究員</h2>
              </div>
              {topicResearchers.length > 0 ? (
                <div className="space-y-3">
                  {topicResearchers.slice(0, 2).map((researcher) => (
                    <Link
                      key={researcher.id}
                      href={`/researchers/${researcher.slug}`}
                      className="block rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-4 py-4 transition hover:border-[color:var(--color-border-stronger)] hover:bg-[color:var(--color-surface-subtle)]"
                    >
                      <p className="text-sm text-[color:var(--color-muted)]">
                        {researcher.role} / {researcher.team}
                      </p>
                      <p className="mt-1 text-base font-semibold leading-7 text-[color:var(--color-primary)]">
                        {researcher.name}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                        {researcher.summary}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                  担当研究員の公開設定が整いしだい、このテーマとの関係をここから見られるようにします。
                </p>
              )}
            </section>
          </aside>
        </section>
      </div>
    </PublicShell>
  );
}
