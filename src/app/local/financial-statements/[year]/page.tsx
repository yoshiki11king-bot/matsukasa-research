import { notFound } from "next/navigation";
import { FinancialStatementRenderer } from "@/components/content/FinancialStatementRenderer";
import { getChartsBySlug } from "@/lib/content/charts";
import { getPublishedFinancialStatementByYear } from "@/lib/content/financial-statements";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ year: string }>;
};

export default async function LocalFinancialStatementPage({ params }: PageProps) {
  const { year } = await params;
  const document = await getPublishedFinancialStatementByYear(year);

  if (!document) {
    notFound();
  }

  return <FinancialStatementRenderer document={document} charts={await getChartsBySlug()} />;
}
