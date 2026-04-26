import type { Metadata } from "next";
import { CollectionEmptyState } from "@/components/collection-empty-state";
import { PublicShell } from "@/components/public-shell";
import { ResearcherCard } from "@/components/researcher-card";
import { getResearchers, getSidebarSnapshot } from "@/lib/microcms";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "研究員",
  description:
    "松笠研究所の研究員一覧です。担当領域、専門性、使っている方法論を確認できます。",
  path: "/researchers",
  keywords: ["研究員", "プロフィール", "専門領域"],
});

export default async function ResearchersPage() {
  const [researchers, sidebar] = await Promise.all([getResearchers(), getSidebarSnapshot()]);

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
    >
      <div className="space-y-8">
        <section className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">研究員</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">誰が調べているか</h1>
          <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">
            調査テーマごとに、担当研究員と専門領域、使っている方法論をまとめています。
          </p>
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
