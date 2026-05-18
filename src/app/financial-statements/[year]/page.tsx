import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinancialStatementRenderer } from "@/components/content/FinancialStatementRenderer";
import { PublicShell } from "@/components/public-shell";
import { StructuredData } from "@/components/structured-data";
import { getChartsBySlug } from "@/lib/content/charts";
import { getFinancialStatements, getSidebarSnapshot } from "@/lib/microcms";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const statements = await getFinancialStatements();
  const statement = statements.find((item) => item.fiscalYear === year || item.slug === year);

  if (!statement) {
    return {
      title: `決算資料が見つかりません | ${siteConfig.name}`,
    };
  }

  return buildPageMetadata({
    title: statement.title,
    description: statement.summary,
    path: `/financial-statements/${statement.fiscalYear}`,
    type: "article",
    keywords: ["決算資料", "財務情報", statement.fiscalYear],
  });
}

export default async function FinancialStatementPage({ params }: PageProps) {
  const { year } = await params;
  const [statements, sidebar, charts] = await Promise.all([
    getFinancialStatements(),
    getSidebarSnapshot(),
    getChartsBySlug(),
  ]);
  const statement = statements.find((item) => item.fiscalYear === year || item.slug === year);

  if (!statement) {
    notFound();
  }

  const document = {
    slug: statement.slug,
    path: `financial-statements/${statement.fiscalYear}.md`,
    frontmatter: {
      type: "financial-statement",
      title: statement.title,
      slug: statement.slug,
      year: statement.fiscalYear,
      status: "published",
      publishedAt: statement.publishedDate,
      updatedAt: statement.updatedDate,
      summary: statement.summary,
      sourceNote: statement.sourceBasis,
      highlights: statement.highlights,
    },
    body: statement.body,
  };
  const structuredData = [
    buildWebPageJsonLd({
      name: statement.title,
      description: statement.summary,
      path: `/financial-statements/${statement.fiscalYear}`,
      dateModified: statement.updatedDate,
    }),
    buildBreadcrumbJsonLd([
      { name: "財務情報", path: "/finance" },
      { name: statement.title, path: `/financial-statements/${statement.fiscalYear}` },
    ]),
  ];

  return (
    <PublicShell
      researchers={sidebar.featuredResearchers}
      methodologies={sidebar.featuredMethodologies}
      reports={sidebar.featuredReports}
      showSidebar={false}
    >
      <div className="space-y-8">
        <StructuredData data={structuredData} />
        <Link href="/finance" className="text-sm font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-accent-ink)]">
          ← 財務情報へ戻る
        </Link>
        <FinancialStatementRenderer document={document} charts={charts} />
      </div>
    </PublicShell>
  );
}
