import { notFound } from "next/navigation";
import { FinanceRenderer } from "@/components/content/FinanceRenderer";
import { getChartsBySlug } from "@/lib/content/charts";
import { getPublishedFinancePage } from "@/lib/content/finance";

export const dynamic = "force-dynamic";

export default async function LocalFinancePage() {
  const document = await getPublishedFinancePage();

  if (!document) {
    notFound();
  }

  return <FinanceRenderer document={document} charts={await getChartsBySlug()} />;
}
