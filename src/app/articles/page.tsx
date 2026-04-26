import type { Metadata } from "next";
import Link from "next/link";
import { ArticleSearchPanel } from "@/components/articles/article-search-panel";
import { LeadStory, PopularPostsAside, SideStory, StoryRow } from "@/components/articles/article-story-parts";
import { PublicShell } from "@/components/public-shell";
import { StatusBanner } from "@/components/status-banner";
import { buildArticlesHref, getPopularityScore, parseSelectedTopics } from "@/lib/articles-page";
import { cmsStatus, getPostsPage, getSidebarSnapshot, getTopics } from "@/lib/microcms";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "記事",
  description:
    "統計調査を主軸に、日本社会を読み解くための記事、報告書、方法論、研究員情報を公開しています。",
  path: "/articles",
  keywords: ["記事", "統計調査", "社会分析", "報告書", "シンクタンク"],
});

type HomePageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    topics?: string | string[];
  }>;
};

export default async function ArticlesPage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = Number(resolvedSearchParams.page ?? "1") || 1;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const selectedTopics = parseSelectedTopics(resolvedSearchParams.topics);

  const [page, rankingSource, allTopics, sidebar] = await Promise.all([
    getPostsPage({
      page: currentPage,
      limit: 12,
      q: query || undefined,
      topics: selectedTopics,
    }),
    getPostsPage({
      page: 1,
      limit: 30,
    }),
    getTopics(),
    getSidebarSnapshot(),
  ]);

  const featuredPost = page.contents[0];
  const sideStories = page.contents.slice(1, 5);
  const primarySideStories = sideStories.length > 2 ? sideStories.slice(0, 2) : sideStories;
  const secondarySideStories = sideStories.length > 2 ? sideStories.slice(2, 4) : [];
  const listPosts = page.contents.slice(1 + sideStories.length);
  const hasFilters = Boolean(query) || selectedTopics.length > 0;
  const popularPosts = [...rankingSource.contents]
    .sort((left, right) => getPopularityScore(right) - getPopularityScore(left))
    .slice(0, 5);

  const leadGridClassName =
    secondarySideStories.length > 0
      ? "xl:grid-cols-[250px_minmax(0,1fr)_250px]"
      : primarySideStories.length > 0
        ? "xl:grid-cols-[280px_minmax(0,1fr)]"
        : "";

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
      showSidebar={false}
    >
      <div className="space-y-10 lg:space-y-12">
        {!cmsStatus.configured ? <StatusBanner kind="demo" /> : null}

        <ArticleSearchPanel query={query} selectedTopics={selectedTopics} allTopics={allTopics} />

        {featuredPost ? (
          <section className="space-y-5 rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-[var(--shadow-soft)] lg:px-7 lg:py-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">
                  TOP STORIES
                </p>
                <span className="h-px flex-1 bg-[color:var(--color-border)]" />
              </div>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <h2 className="text-[1.65rem] font-semibold tracking-tight text-[color:var(--color-primary)] lg:text-[2rem]">
                  {hasFilters ? "検索条件に近い記事" : "いま読み始めやすい記事"}
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                  読み始めの負担が少ないように、主題がはっきりしている記事を先に置いています。
                </p>
              </div>
            </div>

            <div className={`grid gap-6 ${leadGridClassName}`}>
              {primarySideStories.length > 0 ? (
                <div className="order-2 space-y-5 xl:order-1">
                  {primarySideStories.map((post) => (
                    <SideStory key={post.id} post={post} />
                  ))}
                </div>
              ) : null}

              <div className={`${primarySideStories.length > 0 ? "order-1 xl:order-2" : ""}`}>
                <LeadStory post={featuredPost} />
              </div>

              {secondarySideStories.length > 0 ? (
                <div className="order-3 space-y-5">
                  {secondarySideStories.map((post) => (
                    <SideStory key={post.id} post={post} />
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {page.contents.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-soft)] px-6 py-14 text-center text-[0.96rem] leading-8 text-[color:var(--color-secondary-ink)]">
            まだ条件に合う記事は見つかっていません。近いテーマに広げると、次に読む記事を見つけやすくなります。
          </section>
        ) : null}

        {listPosts.length > 0 || (!hasFilters && popularPosts.length > 0) ? (
          <section
            className={
              !hasFilters && popularPosts.length > 0
                ? "grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px]"
                : "space-y-5"
            }
          >
            <div className="space-y-4 rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-[var(--shadow-soft)] lg:px-7 lg:py-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">LATEST</p>
                  <span className="h-px flex-1 bg-[color:var(--color-border)]" />
                </div>
                <p className="text-sm font-medium text-[color:var(--color-secondary-ink)]">
                  {hasFilters ? "続けて読める記事" : "新着記事"}
                </p>
              </div>

              {listPosts.length > 0 ? (
                <div>
                  {listPosts.map((post) => (
                    <StoryRow key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-5 py-8 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                  いまは上の注目記事から読み始められるようにしています。
                </div>
              )}
            </div>

            {!hasFilters && popularPosts.length > 0 ? <PopularPostsAside posts={popularPosts} /> : null}
          </section>
        ) : null}

        {page.totalPages > 1 ? (
          <nav className="flex flex-wrap gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-3 shadow-[var(--shadow-card)]">
            {Array.from({ length: page.totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const href = buildArticlesHref(query, selectedTopics, pageNumber);

              return (
                <Link
                  key={pageNumber}
                  href={href}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
                    pageNumber === page.currentPage ? "ui-pill-active" : "ui-pill-outline"
                  }`}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </PublicShell>
  );
}
