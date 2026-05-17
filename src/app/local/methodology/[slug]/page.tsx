import { notFound } from "next/navigation";
import { MethodologyRenderer } from "@/components/content/MethodologyRenderer";
import { getChartsBySlug } from "@/lib/content/charts";
import { getPublishedMethodologyBySlug } from "@/lib/content/methodologies";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LocalMethodologyPage({ params }: PageProps) {
  const { slug } = await params;
  const document = await getPublishedMethodologyBySlug(slug);

  if (!document) {
    notFound();
  }

  return <MethodologyRenderer document={document} charts={await getChartsBySlug()} />;
}
