import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { StructuredData } from "@/components/structured-data";
import { contentSource } from "@/lib/content-source";
import { formatDate } from "@/lib/formatters";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { DatasetEntry } from "@/lib/types";

type DatasetPageProps = {
  params: Promise<{ slug: string }>;
};

function getFormattedDate(dateString?: string) {
  if (!dateString || !Number.isFinite(new Date(dateString).getTime())) {
    return null;
  }

  return formatDate(dateString);
}

function getDatasetDescription(dataset: DatasetEntry) {
  return dataset.description || "松笠研究所が公開するデータセットです。";
}

export async function generateStaticParams() {
  const datasets = contentSource.getDatasets ? await contentSource.getDatasets() : [];
  return datasets.map((dataset) => ({ slug: dataset.slug }));
}

export async function generateMetadata({ params }: DatasetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dataset = contentSource.getDatasetBySlug ? await contentSource.getDatasetBySlug(slug) : null;

  if (!dataset) {
    return {
      title: `データセットが見つかりません | ${siteConfig.name}`,
    };
  }

  return buildPageMetadata({
    title: dataset.title,
    description: getDatasetDescription(dataset),
    path: `/datasets/${dataset.slug}`,
    type: "article",
    keywords: ["データセット", "公開データ", dataset.fileFormat, ...dataset.topics],
  });
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  const { slug } = await params;
  const [dataset, sidebar] = await Promise.all([
    contentSource.getDatasetBySlug ? contentSource.getDatasetBySlug(slug) : null,
    contentSource.getSidebarSnapshot(),
  ]);

  if (!dataset) {
    notFound();
  }

  const publishedDate = getFormattedDate(dataset.publishedDate);
  const updatedDate = getFormattedDate(dataset.updatedDate);
  const structuredData = [
    buildWebPageJsonLd({
      name: dataset.title,
      description: getDatasetDescription(dataset),
      path: `/datasets/${dataset.slug}`,
      dateModified: dataset.updatedDate,
    }),
    buildBreadcrumbJsonLd([
      { name: "ツールとデータセット", path: "/tools-datasets" },
      { name: dataset.title, path: `/datasets/${dataset.slug}` },
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
            <p className="text-xs font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">DATASET</p>
            <h1 className="font-editorial text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-primary)] md:text-5xl">
              {dataset.title}
            </h1>
            <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-secondary-ink)]">
              {getDatasetDescription(dataset)}
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-[color:var(--color-muted)]">
              <span>形式 {dataset.fileFormat.toUpperCase()}</span>
              {publishedDate ? <span>公開日 {publishedDate}</span> : null}
              {updatedDate ? <span>更新日 {updatedDate}</span> : null}
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">ファイル</p>
              {dataset.fileUrl ? (
                <a
                  href={dataset.fileUrl}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-[color:var(--color-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-accent-strong)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  ファイルを開く
                </a>
              ) : (
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">
                  ファイルURLはまだ登録されていません。
                </p>
              )}
            </div>

            <aside className="border border-[color:var(--color-border)] bg-white px-5 py-5">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">トピック</p>
              {dataset.topics.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {dataset.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-secondary-ink)]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[color:var(--color-muted)]">未設定</p>
              )}
            </aside>
          </section>

          {dataset.citation ? (
            <section className="border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">{dataset.citation.label}</p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{dataset.citation.text}</p>
              {dataset.citation.url ? (
                <a
                  href={dataset.citation.url}
                  className="mt-3 inline-flex text-sm font-medium text-[color:var(--color-accent-ink)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  引用元を開く
                </a>
              ) : null}
            </section>
          ) : null}

          {dataset.sourceLinks.length > 0 ? (
            <section className="border-t border-[color:var(--color-border)] pt-6">
              <p className="text-sm font-semibold text-[color:var(--color-primary)]">出典リンク</p>
              <div className="mt-3 grid gap-2">
                {dataset.sourceLinks.map((source) => (
                  source.url ? (
                    <a
                      key={`${source.label}-${source.url}`}
                      href={source.url}
                      className="text-sm font-medium text-[color:var(--color-accent-ink)]"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.label}
                    </a>
                  ) : (
                    <span key={source.label} className="text-sm text-[color:var(--color-text)]">
                      {source.label}
                    </span>
                  )
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>
    </PublicShell>
  );
}
