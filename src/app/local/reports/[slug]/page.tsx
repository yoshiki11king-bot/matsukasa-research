import { notFound } from "next/navigation";
import { ReportRenderer } from "@/components/content/ReportRenderer";
import { getChartsBySlug } from "@/lib/content/charts";
import { getPublishedReportBySlug } from "@/lib/content/reports";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LocalReportPage({ params }: PageProps) {
  const { slug } = await params;
  const document = await getPublishedReportBySlug(slug);

  if (!document) {
    notFound();
  }

  return <ReportRenderer document={document} charts={await getChartsBySlug()} />;
}
