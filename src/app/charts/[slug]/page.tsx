import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartRenderer } from "@/components/content/ChartRenderer";
import { PublicShell } from "@/components/public-shell";
import { StructuredData } from "@/components/structured-data";
import { contentSource } from "@/lib/content-source";
import type { LocalChart } from "@/lib/content/types";
import { formatDate } from "@/lib/formatters";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type ChartPageProps = {
  params: Promise<{ slug: string }>;
};

function getChartDate(chart: LocalChart) {
  return chart.updatedAt || chart.createdAt;
}

function getFormattedDate(dateString?: string) {
  if (!dateString || !Number.isFinite(new Date(dateString).getTime())) {
    return null;
  }

  return formatDate(dateString);
}

export async function generateStaticParams() {
  const charts = contentSource.getCharts ? await contentSource.getCharts() : [];
  return charts.map((chart) => ({ slug: chart.slug }));
}

export async function generateMetadata({ params }: ChartPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chart = contentSource.getChartBySlug ? await contentSource.getChartBySlug(slug) : null;

  if (!chart) {
    return {
      title: `図表が見つかりません | ${siteConfig.name}`,
    };
  }

  return buildPageMetadata({
    title: chart.title,
    description: chart.description || "松笠研究所が公開する図表です。",
    path: `/charts/${chart.slug}`,
    type: "article",
    keywords: ["図表", "チャート", chart.chartType],
  });
}

export default async function ChartPage({ params }: ChartPageProps) {
  const { slug } = await params;
  const [chart, sidebar] = await Promise.all([
    contentSource.getChartBySlug ? contentSource.getChartBySlug(slug) : null,
    contentSource.getSidebarSnapshot(),
  ]);

  if (!chart) {
    notFound();
  }

  const chartDate = getChartDate(chart);
  const formattedDate = getFormattedDate(chartDate);
  const structuredData = [
    buildWebPageJsonLd({
      name: chart.title,
      description: chart.description || "松笠研究所が公開する図表です。",
      path: `/charts/${chart.slug}`,
      dateModified: chartDate,
    }),
    buildBreadcrumbJsonLd([
      { name: "ツールとデータセット", path: "/tools-datasets" },
      { name: chart.title, path: `/charts/${chart.slug}` },
    ]),
  ];

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
      showSidebar={false}
    >
      <StructuredData data={structuredData} />
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/tools-datasets" className="text-sm font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-accent-ink)]">
          ← ツールとデータセットへ戻る
        </Link>

        <article className="space-y-8 border border-[color:var(--color-border)] bg-white px-5 py-8 shadow-[var(--shadow-soft)] sm:px-8">
          <header className="space-y-4 border-b border-[color:var(--color-border)] pb-7">
            <p className="text-xs font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">CHART</p>
            <h1 className="font-editorial text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-primary)] md:text-5xl">
              {chart.title}
            </h1>
            {chart.description ? (
              <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-secondary-ink)]">{chart.description}</p>
            ) : null}
            {formattedDate ? <p className="text-sm text-[color:var(--color-muted)]">更新日 {formattedDate}</p> : null}
          </header>

          <ChartRenderer chart={chart} />

          {chart.sourceNote || chart.methodologyNote ? (
            <section className="grid gap-4 md:grid-cols-2">
              {chart.sourceNote ? (
                <div className="border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5">
                  <p className="text-sm font-semibold text-[color:var(--color-primary)]">出典</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{chart.sourceNote}</p>
                </div>
              ) : null}
              {chart.methodologyNote ? (
                <div className="border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5">
                  <p className="text-sm font-semibold text-[color:var(--color-primary)]">作成方法</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{chart.methodologyNote}</p>
                </div>
              ) : null}
            </section>
          ) : null}
        </article>
      </div>
    </PublicShell>
  );
}
