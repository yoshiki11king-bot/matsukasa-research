import type { Metadata } from "next";
import { CollectionEmptyState } from "@/components/collection-empty-state";
import { PublicShell } from "@/components/public-shell";
import { ResearcherCard } from "@/components/researcher-card";
import { StructuredData } from "@/components/structured-data";
import { contentSource } from "@/lib/content-source";
import { getSidebarSnapshot } from "@/lib/microcms";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildItemListJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "研究員",
  description:
    "松笠研究所の研究員一覧です。担当領域、専門性、使っている方法論を確認できます。",
  path: "/researchers",
  keywords: ["研究員", "プロフィール", "専門領域"],
});

export default async function ResearchersPage() {
  const [researchers, sidebar] = await Promise.all([contentSource.getResearchers(), getSidebarSnapshot()]);
  const structuredData = [
    buildCollectionPageJsonLd({
      name: "研究員",
      description: "松笠研究所の研究員一覧です。",
      path: "/researchers",
    }),
    buildBreadcrumbJsonLd([{ name: "研究員", path: "/researchers" }]),
    buildItemListJsonLd(
      "研究員一覧",
      researchers.map((researcher) => ({
        name: researcher.name,
        path: `/researchers/${researcher.slug}`,
        description: researcher.summary,
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
        <section className="border-b border-[color:var(--color-border)] pb-8">
          <h1 className="font-editorial text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">研究員</h1>
        </section>

        {researchers.length > 0 ? (
          <div className="grid gap-5">
            {researchers.map((researcher) => (
              <ResearcherCard key={researcher.id} researcher={researcher} />
            ))}
          </div>
        ) : (
          <CollectionEmptyState
            title="研究員ページは準備中です"
            body="担当研究員の公開準備が整い次第、このページに専門領域や方法論を追加します。先に公開している記事や研究所の説明から読むことはできます。"
            actionHref="/about"
            actionLabel="私たちについて"
          />
        )}
      </div>
    </PublicShell>
  );
}
