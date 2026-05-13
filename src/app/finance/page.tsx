import type { Metadata } from "next";
import Link from "next/link";
import { RichTextBody } from "@/components/post-body";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import { StructuredData } from "@/components/structured-data";
import { formatDate } from "@/lib/formatters";
import { getReports, getSidebarSnapshot } from "@/lib/microcms";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import type { ResearchReport } from "@/lib/types";

export const metadata: Metadata = buildPageMetadata({
  title: "財務情報",
  description: "松笠研究所の財務情報と決算資料の公開ページです。",
  path: "/finance",
  keywords: ["財務情報", "決算資料", "透明性"],
});

export const revalidate = 3600;

const financePageContent = {
  title: "財務情報の公開",
  summary:
    "松笠研究所では、支援や運営費がどこへ向かうかを、読み手が追える形で順次公開します。数字だけを並べるのではなく、使い道と更新の基準が分かることを重視します。",
  body:
    "このページでは、財務情報の公開方針と決算資料の履歴をまとめます。未確定の数字は見込みで出さず、確定したものだけを更新日付きで反映します。",
  updatedDate: "2026-04-14T00:00:00.000Z",
  disclosureItems: [
    {
      title: "収入",
      body: "個人寄付、助成金、受託制作など、運営に入る資金の区分をこのページで公開します。",
    },
    {
      title: "支出",
      body: "調査設計、回収、取材、編集、図表制作、システム運用などの使途をまとめて示します。",
    },
    {
      title: "更新",
      body: "少なくとも年度ごとに見直し、大きな変更があったときはその都度更新します。",
    },
  ],
  disclosureTable: [
    {
      title: "個人寄付",
      body: "月次または四半期の合計額を公開します。",
    },
    {
      title: "助成・協力金",
      body: "名称、期間、使途の概要を公開します。",
    },
    {
      title: "調査関連支出",
      body: "設計、回収、取材、編集、図表制作の区分を公開します。",
    },
    {
      title: "管理運営費",
      body: "システム、ドメイン、事務などの費用をまとめて公開します。",
    },
  ],
  policyItems: [
    {
      title: "金額は分類とセットで示します",
      body: "合計額だけでなく、どの活動のための支出かが分かる区分と一緒に公開します。",
    },
    {
      title: "個人情報は公開しません",
      body: "寄付者名や個別の連絡先など、個人が特定される情報は掲載しません。",
    },
    {
      title: "未確定の数字は混ぜません",
      body: "精査が済んでいない金額は見込みで出さず、確定後に更新日付きで反映します。",
    },
    {
      title: "変更履歴を残します",
      body: "公開後に修正した場合は、修正日と理由が分かる形で残します。",
    },
  ],
  contactText:
    "公開項目の希望や確認したい点がある場合は、寄付ページまたはメールからお知らせください。運営の透明性に関わる内容は、このページに反映していきます。",
} as const;

function isFinancialReport(report: ResearchReport) {
  const text = `${report.reportType} ${report.title}`.toLowerCase();
  return text.includes("決算") || text.includes("財務");
}

function extractFiscalYear(report: ResearchReport) {
  const match = report.title.match(/20\d{2}年度/);
  return match?.[0] ?? report.reportType;
}

function getVisibleStatements(reports: ResearchReport[]) {
  const now = Date.now();
  return reports.filter(
    (report) => new Date(report.publishedDate).getTime() <= now && isFinancialReport(report),
  );
}

export default async function FinancePage() {
  const [reports, sidebar] = await Promise.all([getReports(), getSidebarSnapshot()]);

  const visibleStatements = getVisibleStatements(reports);
  const sortedStatements = [...visibleStatements].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
  );
  const latestStatement = sortedStatements[0] ?? null;
  const structuredData = [
    buildWebPageJsonLd({
      name: financePageContent.title,
      description: financePageContent.summary,
      path: "/finance",
      dateModified: financePageContent.updatedDate,
    }),
    buildBreadcrumbJsonLd([{ name: "財務情報", path: "/finance" }]),
  ];

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
    >
      <StructuredData data={structuredData} />
      <div className="space-y-10">
        <section className="ui-warm-panel space-y-4 rounded-[2rem] border border-[color:var(--color-border)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-medium text-[color:var(--color-muted)]">財務情報</p>
          <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
            {financePageContent.title}
          </h1>
          <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-text)]">
            {financePageContent.summary}
          </p>
          <RichTextBody body={financePageContent.body} className="max-w-3xl" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="ui-warm-panel-soft rounded-lg border border-[color:var(--color-border)] px-5 py-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-medium text-[color:var(--color-muted)]">最終更新</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">
              {formatDate(financePageContent.updatedDate)}
            </p>
          </article>
          <article className="ui-warm-panel-soft rounded-lg border border-[color:var(--color-border)] px-5 py-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-medium text-[color:var(--color-muted)]">公開中の決算資料</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">
              {sortedStatements.length}
            </p>
          </article>
          <article className="ui-warm-panel-soft rounded-lg border border-[color:var(--color-border)] px-5 py-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-medium text-[color:var(--color-muted)]">最新年度</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">
              {latestStatement ? extractFiscalYear(latestStatement) : "未設定"}
            </p>
          </article>
        </section>

        <section className="space-y-8">
          <SectionHeading
            eyebrow="公開方針"
            title="何を公開し、どう更新するか"
            description="公開の対象と更新基準を先に示し、このページを財務情報の入口にします。"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {financePageContent.disclosureItems.map((item) => (
              <article
                key={item.title}
                className="ui-warm-panel-soft rounded-lg border border-[color:var(--color-border)] px-5 py-5 shadow-[var(--shadow-soft)]"
              >
                <p className="text-base font-semibold text-[color:var(--color-primary)]">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {latestStatement ? (
          <section className="ui-warm-panel rounded-lg border border-[color:var(--color-border)] px-6 py-7 shadow-[var(--shadow-soft)]">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="最新の決算資料"
                title={latestStatement.title}
                description={latestStatement.summary}
              />
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-[color:var(--color-muted)]">
                    <span className="rounded-md bg-[color:var(--color-primary)] px-2.5 py-1 font-medium text-[color:var(--color-primary-contrast)]">
                      {extractFiscalYear(latestStatement)}
                    </span>
                    <span>公開 {formatDate(latestStatement.publishedDate)}</span>
                    <span>更新 {formatDate(latestStatement.updatedDate)}</span>
                  </div>
                  <p className="ui-warm-panel-soft rounded-lg border border-[color:var(--color-border)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text)]">
                    {latestStatement.summary}
                  </p>
                  <RichTextBody body={latestStatement.body} tone="compact" />
                </div>
                <aside className="ui-warm-panel-soft space-y-4 rounded-lg border border-[color:var(--color-border)] px-5 py-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">出典・基準</p>
                    <p className="text-sm leading-7 text-[color:var(--color-text)]">
                      {latestStatement.sourceBasis}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {latestStatement.pdfUrl ? (
                      <a
                        href={latestStatement.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ui-button ui-button-primary h-11 px-5 text-sm"
                      >
                        PDF を開く
                      </a>
                    ) : (
                      <span className="text-sm text-[color:var(--color-muted)]">PDF 未登録</span>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </section>
        ) : null}

        <section className="ui-warm-panel rounded-lg border border-[color:var(--color-border)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="公開予定の区分"
              title="このページで出す項目"
              description="現時点では、何をどの粒度で出すかを先に固定します。確定値はこの区分に沿って追加します。"
            />
            <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)]">
              {financePageContent.disclosureTable.map((item, index) => (
                <div
                  key={item.title}
                  className={`grid gap-3 px-4 py-4 md:grid-cols-[180px_minmax(0,1fr)] ${
                    index === financePageContent.disclosureTable.length - 1
                      ? ""
                      : "border-b border-[color:var(--color-border)]"
                  }`}
                >
                  <p className="text-sm font-semibold text-[color:var(--color-primary)]">{item.title}</p>
                  <p className="text-sm leading-7 text-[color:var(--color-text)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ui-warm-panel-soft rounded-lg border border-[color:var(--color-border)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="公開の線引き"
              title="出すものと出さないものを分けます"
              description="透明性を保ちながら、個人情報や未確定情報を混ぜないための基準です。"
            />
            <div className="grid gap-4 md:grid-cols-2">
              {financePageContent.policyItems.map((item) => (
                <article
                  key={item.title}
                  className="ui-warm-panel-soft rounded-lg border border-[color:var(--color-border)] px-5 py-5"
                >
                  <p className="text-base font-semibold text-[color:var(--color-primary)]">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--color-text)]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ui-warm-panel rounded-lg border border-[color:var(--color-border)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="決算履歴"
              title="過去の決算資料"
              description="公開済みの決算資料を年度順に残し、あとから参照できるようにしています。"
            />
            {sortedStatements.length > 0 ? (
              <div className="grid gap-4">
                {sortedStatements.map((statement) => (
                  <article
                    key={statement.id}
                    className="ui-warm-panel-soft rounded-lg border border-[color:var(--color-border)] px-5 py-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 text-xs text-[color:var(--color-muted)]">
                          <span className="rounded-md bg-[color:var(--color-primary)] px-2.5 py-1 font-medium text-[color:var(--color-primary-contrast)]">
                            {extractFiscalYear(statement)}
                          </span>
                          <span>公開 {formatDate(statement.publishedDate)}</span>
                          <span>更新 {formatDate(statement.updatedDate)}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-[color:var(--color-primary)]">
                            {statement.title}
                          </p>
                          <p className="text-sm leading-7 text-[color:var(--color-text)]">
                            {statement.summary}
                          </p>
                        </div>
                        <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">{statement.sourceBasis}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-3">
                        {statement.pdfUrl ? (
                          <a
                            href={statement.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ui-button ui-button-primary h-10 px-4 text-sm"
                          >
                            PDF
                          </a>
                        ) : null}
                        <Link href={`/reports/${statement.slug}`} className="ui-button ui-button-secondary h-10 px-4 text-sm">
                          詳細
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[color:var(--color-border-strong)] px-4 py-10 text-sm text-[color:var(--color-secondary-ink)]">
                まだ決算資料が登録されていません。管理画面の「報告書」で種類を「決算資料」にして追加してください。
              </div>
            )}
          </div>
        </section>

        <section className="ui-warm-panel rounded-lg border border-[color:var(--color-border)] px-6 py-7 shadow-[var(--shadow-soft)]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--color-muted)]">お問い合わせ</p>
              <p className="max-w-3xl text-[1.02rem] leading-8 text-[color:var(--color-text)]">
                {financePageContent.contactText}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/donate" className="ui-button ui-button-primary h-11 px-5 text-sm">
                寄付ページへ
              </Link>
              <Link
                href={`mailto:${siteConfig.contactEmail}?subject=松笠研究所の財務情報について`}
                className="ui-button ui-button-secondary h-11 px-5 text-sm"
              >
                メールで連絡
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
