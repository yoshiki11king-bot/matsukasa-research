import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocalPressEnabled } from "@/lib/content/config";
import { getAllCharts } from "@/lib/content/charts";

export const dynamic = "force-dynamic";

export default async function LocalPressChartsPage() {
  if (!isLocalPressEnabled()) {
    notFound();
  }

  const charts = await getAllCharts();

  return (
    <main className="min-h-screen bg-white px-5 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/local-press" className="text-sm font-semibold text-[color:var(--color-muted)]">Matsukasa Local Press</Link>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">保存済み図表</h1>
          </div>
          <Link href="/local-press/tools/chart-builder" className="ui-button ui-button-primary h-10 px-4 text-sm">図表を作る</Link>
        </div>
        <div className="grid gap-3">
          {charts.length > 0 ? charts.map((chart) => (
            <div key={chart.slug} className="rounded-lg border border-[color:var(--color-border)] px-5 py-4">
              <p className="font-semibold text-[color:var(--color-primary)]">{chart.title}</p>
              <p className="mt-1 text-sm text-[color:var(--color-muted)]">{chart.slug} / {chart.chartType}</p>
              <pre className="mt-3 rounded-md bg-[color:var(--color-surface-subtle)] px-3 py-2 text-sm">{`:::chart slug="${chart.slug}"
:::`}</pre>
            </div>
          )) : (
            <p className="rounded-lg border border-dashed border-[color:var(--color-border)] px-5 py-8 text-sm text-[color:var(--color-muted)]">まだ保存済み図表はありません。</p>
          )}
        </div>
      </div>
    </main>
  );
}
