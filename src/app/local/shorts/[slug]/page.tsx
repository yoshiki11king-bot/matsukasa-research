import { notFound } from "next/navigation";
import { ShortReadingRenderer } from "@/components/content/ShortReadingRenderer";
import { getChartsBySlug } from "@/lib/content/charts";
import { getPublishedShortReadingBySlug } from "@/lib/content/short-readings";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LocalShortReadingPage({ params }: PageProps) {
  const { slug } = await params;
  const document = await getPublishedShortReadingBySlug(slug);

  if (!document) {
    notFound();
  }

  return <ShortReadingRenderer document={document} charts={await getChartsBySlug()} />;
}
