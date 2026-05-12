import type { Metadata } from "next";
import { CollectionEmptyState } from "@/components/collection-empty-state";
import { PublicShell } from "@/components/public-shell";
import { ReportCard } from "@/components/report-card";
import { getReports, getSidebarSnapshot } from "@/lib/microcms";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "報告書",
  description:
    "図表や PDF を含む調査報告書を一覧で公開しています。決算資料や研究報告もここから確認できます。",
  path: "/reports",
  keywords: ["報告書", "PDF", "調査報告", "決算資料"],
});

export default async function ReportsPage() {
  const [reports, sidebar] = await Promise.all([getReports(), getSidebarSnapshot()]);

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
    >
      <div className="space-y-8">
        <section className="space-y-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-6 py-7 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">REPORTS</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">報告書</h1>
          <p className="max-w-3xl text-base leading-8 text-[color:var(--color-secondary-ink)]">
            図表と PDF を添えた、少し厚めの調査記録をまとめています。
          </p>
        </section>

        {reports.length > 0 ? (
          <div className="grid gap-5">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <CollectionEmptyState
            title="報告書ページは準備中です"
            body="図表や PDF を添えた報告書は、公開準備が整い次第このページに追加します。決算資料や調査ブリーフもここに集約していきます。"
            actionHref="/finance"
            actionLabel="財務情報を見る"
          />
        )}
      </div>
    </PublicShell>
  );
}
