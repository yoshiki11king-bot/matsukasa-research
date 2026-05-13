import type { Metadata } from "next";
import { CollectionEmptyState } from "@/components/collection-empty-state";
import { MethodologyCard } from "@/components/methodology-card";
import { PublicShell } from "@/components/public-shell";
import { StructuredData } from "@/components/structured-data";
import { getMethodologies, getSidebarSnapshot } from "@/lib/microcms";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "方法論",
  description:
    "統計調査の前提、向いている場面、限界、レビュー体制を先に公開する方法論ページです。",
  path: "/methodologies",
  keywords: ["方法論", "統計調査", "社会調査", "レビュー", "調査設計"],
});

export default async function MethodologiesPage() {
  const [methodologies, sidebar] = await Promise.all([getMethodologies(), getSidebarSnapshot()]);
  const structuredData = [
    buildCollectionPageJsonLd({
      name: "方法論",
      description: "統計調査の前提、限界、レビュー体制を公開する方法論ページです。",
      path: "/methodologies",
    }),
    buildBreadcrumbJsonLd([{ name: "方法論", path: "/methodologies" }]),
    buildItemListJsonLd(
      "方法論一覧",
      methodologies.map((entry) => ({
        name: entry.title,
        path: `/methodologies/${entry.slug}`,
        description: entry.summary,
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
      <div className="space-y-8">
        <section className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">方法論</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">どう調べているか</h1>
          <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">
            統計調査の前提、向いている場面、言えることと言えないことを先に公開します。
          </p>
        </section>

        {methodologies.length > 0 ? (
          <div className="grid gap-5">
            {methodologies.map((entry) => (
              <MethodologyCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <CollectionEmptyState
            title="方法論ページは準備中です"
            body="調査設計やレビュー基準の公開準備が整い次第、このページに順次追加します。公開済みの記事から先に読めるよう、ホームでは検索とトピック導線を保っています。"
            actionHref="/articles"
            actionLabel="記事を探す"
          />
        )}
      </div>
    </PublicShell>
  );
}
