import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { TypologyQuizDeck } from "@/components/typology-quiz-deck";
import { contentSource } from "@/lib/content-source";
import type { LocalChart } from "@/lib/content/types";
import { formatDate } from "@/lib/formatters";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd, buildPageMetadata } from "@/lib/seo";
import type { DatasetEntry } from "@/lib/types";

export const revalidate = 3600;

export const metadata: Metadata = buildPageMetadata({
  title: "ツールとデータセット",
  description:
    "松笠研究所が公開する調査票、集計ノート、図表サンプル、データセットをまとめるページです。",
  path: "/tools-datasets",
  keywords: ["ツール", "データセット", "統計調査", "調査票", "公開データ"],
});

const plannedResources = [
  {
    title: "類型クイズ",
    label: "QUIZ",
    body: "政治、宗教、グループ参加の傾向を、短い設問で確認できる試作ツールです。",
  },
  {
    title: "調査票テンプレート",
    label: "QUESTIONNAIRE",
    body: "質問文、選択肢、回答形式を確認できる形で公開します。",
  },
  {
    title: "集計ノート",
    label: "NOTEBOOK",
    body: "集計条件、処理手順、除外条件を追える資料を置きます。",
  },
  {
    title: "図表サンプル",
    label: "VISUALIZATION",
    body: "グラフや図表の読み方と、再利用しやすい表示例をまとめます。",
  },
  {
    title: "公開データセット",
    label: "DATASET",
    body: "CSV などの形式で公開できるデータを、利用条件と一緒に掲載します。",
  },
];

const publicationRules = [
  ["更新日", "いつ公開・更新したデータかを先に確認できるようにします。"],
  ["出典表記", "利用時に必要な表記や引用方法を、資料ごとに添えます。"],
  ["利用範囲", "再配布、加工、商用利用などの扱いを明記します。"],
];

function getChartUpdatedAt(chart: LocalChart) {
  return chart.updatedAt || chart.createdAt;
}

function getFormattedDate(dateString?: string) {
  if (!dateString || !Number.isFinite(new Date(dateString).getTime())) {
    return null;
  }

  return formatDate(dateString);
}

function getResourceListItems(charts: LocalChart[], datasets: DatasetEntry[]) {
  return [
    ...charts.map((chart) => ({
      name: chart.title,
      path: `/charts/${chart.slug}`,
      description: chart.description,
    })),
    ...datasets.map((dataset) => ({
      name: dataset.title,
      path: `/datasets/${dataset.slug}`,
      description: dataset.description,
    })),
  ];
}

export default async function ToolsDatasetsPage() {
  const [sidebar, charts, datasets] = await Promise.all([
    contentSource.getSidebarSnapshot(),
    contentSource.getCharts ? contentSource.getCharts() : Promise.resolve([]),
    contentSource.getDatasets ? contentSource.getDatasets() : Promise.resolve([]),
  ]);
  const resourceListItems = getResourceListItems(charts, datasets);
  const structuredData = [
    buildCollectionPageJsonLd({
      name: "ツールとデータセット",
      description: "調査票、集計ノート、図表サンプル、公開データセットをまとめるページです。",
      path: "/tools-datasets",
    }),
    buildBreadcrumbJsonLd([{ name: "ツールとデータセット", path: "/tools-datasets" }]),
    buildItemListJsonLd(
      resourceListItems.length > 0 ? "公開中のツールとデータセット" : "公開予定のツールとデータセット",
      resourceListItems.length > 0
        ? resourceListItems
        : plannedResources.map((resource) => ({
            name: resource.title,
            path: "/tools-datasets",
            description: resource.body,
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
        <section className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">ツールとデータセット</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
            調査をたどるための道具
          </h1>
          <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">
            調査票、集計ノート、図表サンプル、公開データセットをここにまとめます。公開時には更新日、出典表記、利用条件を添えて掲載します。
          </p>
        </section>

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="PUBLISHED"
              title="公開中の資料"
              description={
                resourceListItems.length > 0
                  ? "Local Press と content source から読める図表・データセットです。"
                  : "公開できる図表とデータセットが入り次第、ここに表示されます。"
              }
            />
            {resourceListItems.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {charts.map((chart) => (
                  <Link
                    key={`chart-${chart.slug}`}
                    href={`/charts/${chart.slug}`}
                    className="group rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5 transition hover:border-[color:var(--color-accent)] hover:bg-white"
                  >
                    <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">CHART</p>
                    <h2 className="mt-3 text-xl font-semibold text-[color:var(--color-primary)] group-hover:text-[color:var(--color-primary)]">
                      {chart.title}
                    </h2>
                    {chart.description ? (
                      <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{chart.description}</p>
                    ) : null}
                    {getFormattedDate(getChartUpdatedAt(chart)) ? (
                      <p className="mt-4 text-xs font-medium text-[color:var(--color-muted)]">
                        更新日 {getFormattedDate(getChartUpdatedAt(chart))}
                      </p>
                    ) : null}
                  </Link>
                ))}
                {datasets.map((dataset) => (
                  <Link
                    key={`dataset-${dataset.slug}`}
                    href={`/datasets/${dataset.slug}`}
                    className="group rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5 transition hover:border-[color:var(--color-accent)] hover:bg-white"
                  >
                    <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">DATASET</p>
                    <h2 className="mt-3 text-xl font-semibold text-[color:var(--color-primary)] group-hover:text-[color:var(--color-primary)]">
                      {dataset.title}
                    </h2>
                    {dataset.description ? (
                      <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{dataset.description}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-[color:var(--color-muted)]">
                      <span>{dataset.fileFormat.toUpperCase()}</span>
                      {getFormattedDate(dataset.updatedDate) ? (
                        <span>更新日 {getFormattedDate(dataset.updatedDate)}</span>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[color:var(--color-border-stronger)] bg-[color:var(--color-surface-subtle)] px-5 py-5 text-sm leading-7 text-[color:var(--color-text)]">
                まだ公開中の図表・データセットはありません。
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="RESOURCE"
              title="公開予定のもの"
              description="まだ準備中の項目も、掲載場所を先に用意しています。"
            />
            <div className="grid gap-4 md:grid-cols-2">
              {plannedResources.map((resource) => (
                <article
                  key={resource.title}
                  className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5"
                >
                  <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">
                    {resource.label}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-[color:var(--color-primary)]">{resource.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{resource.body}</p>
                  <p className="mt-4 inline-flex rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-medium text-[color:var(--color-secondary-ink)]">
                    準備中
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <TypologyQuizDeck />

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-6 shadow-[var(--shadow-soft)]">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[color:var(--color-primary)]">参考にした形式</p>
            <p className="text-sm leading-7 text-[color:var(--color-text)]">
              Pew Research Center の政治類型、宗教類型、グループクイズの考え方を参考にしています。設問、類型名、結果文は日本向けに独自作成した試作版です。
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href="https://www.pewresearch.org/politics/quiz/political-typology/"
                target="_blank"
                rel="noreferrer"
                className="ui-signal-link text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-primary)]"
              >
                Political Typology Quiz
              </a>
              <a
                href="https://www.pewresearch.org/religion/quiz/religious-typology/"
                target="_blank"
                rel="noreferrer"
                className="ui-signal-link text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-primary)]"
              >
                Religious Typology Quiz
              </a>
              <a
                href="https://www.pewresearch.org/typology-group-quiz-help-center/"
                target="_blank"
                rel="noreferrer"
                className="ui-signal-link text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-primary)]"
              >
                Typology Group Quiz Help Center
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-dashed border-[color:var(--color-border-stronger)] bg-[color:var(--color-surface-subtle)] px-6 py-7">
            <p className="text-sm font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">FILES</p>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--color-primary)]">ファイル掲載欄</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--color-text)]">
              公開できるファイルが整い次第、ここに CSV、PDF、スプレッドシート、コード断片などを追加します。
            </p>
          </div>

          <aside className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
            <p className="text-base font-semibold text-[color:var(--color-primary)]">関連するページ</p>
            <div className="mt-4 grid gap-3">
              <Link href="/methodologies" className="ui-button ui-button-secondary h-10 px-4 text-sm">
                方法論
              </Link>
              <Link href="/reports" className="ui-button ui-button-secondary h-10 px-4 text-sm">
                報告書
              </Link>
            </div>
          </aside>
        </section>

        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <SectionHeading eyebrow="RULES" title="公開時に添える情報" />
            <div className="grid gap-4 md:grid-cols-3">
              {publicationRules.map(([title, body]) => (
                <article
                  key={title}
                  className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5"
                >
                  <p className="text-base font-semibold text-[color:var(--color-primary)]">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
