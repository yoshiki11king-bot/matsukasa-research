import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomeLatestResources } from "@/components/home-latest-resources";
import { LaunchGate } from "@/components/LaunchGate";
import { LatestPostsStrip } from "@/components/latest-posts-strip";
import { PublicShell } from "@/components/public-shell";
import { StatusBanner } from "@/components/status-banner";
import { buildLegacyArticlesSearch, pickFeaturedPosts } from "@/lib/home-page";
import {
  cmsStatus,
  getMethodologies,
  getPostsPage,
  getReports,
  getSidebarSnapshot,
} from "@/lib/microcms";
import { buildPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  description: siteConfig.description,
  path: "/",
  keywords: siteConfig.keywords,
});

type RootPageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    topics?: string | string[];
  }>;
};

export default async function HomePage({ searchParams }: RootPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const legacyArticlesSearch = buildLegacyArticlesSearch(resolvedSearchParams);

  if (legacyArticlesSearch) {
    redirect(`/articles?${legacyArticlesSearch}`);
  }

  const [sidebar, postsPage, reports, methodologies] = await Promise.all([
    getSidebarSnapshot(),
    getPostsPage({ page: 1, limit: 12 }),
    getReports(),
    getMethodologies(),
  ]);

  const featuredPosts = pickFeaturedPosts(postsPage.contents, 5);
  const latestArticle = postsPage.contents[0] ?? null;
  const latestReport = reports[0] ?? null;
  const latestMethodology = methodologies[0] ?? null;

  return (
    <>
      <LaunchGate />
      <PublicShell
        researchers={sidebar.featuredResearchers}
        methodologies={sidebar.featuredMethodologies}
        reports={sidebar.featuredReports}
        showSidebar={false}
      >
        <div className="space-y-10 lg:space-y-12">
          <LatestPostsStrip posts={featuredPosts} />

          {!cmsStatus.configured ? <StatusBanner kind="demo" /> : null}

          <HomeLatestResources
            latestArticle={latestArticle}
            latestReport={latestReport}
            latestMethodology={latestMethodology}
          />
        </div>
      </PublicShell>
    </>
  );
}
