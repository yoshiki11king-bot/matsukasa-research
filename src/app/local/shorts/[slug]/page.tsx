import { notFound } from "next/navigation";
import { ShortReadingRenderer } from "@/components/content/ShortReadingRenderer";
import { localPressContentSource } from "@/lib/content-source/local-press-adapter";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LocalShortReadingPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = localPressContentSource.getShortReadingBySlug
    ? await localPressContentSource.getShortReadingBySlug(slug)
    : null;

  if (!entry) {
    notFound();
  }

  return (
    <ShortReadingRenderer
      entry={entry}
      charts={localPressContentSource.getChartsBySlug ? await localPressContentSource.getChartsBySlug() : {}}
    />
  );
}
