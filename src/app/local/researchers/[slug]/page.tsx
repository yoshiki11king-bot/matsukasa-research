import { notFound } from "next/navigation";
import { ResearcherRenderer } from "@/components/content/ResearcherRenderer";
import { getResearcherBySlug } from "@/lib/content/researchers";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LocalResearcherPage({ params }: PageProps) {
  const { slug } = await params;
  const researcher = await getResearcherBySlug(slug);

  if (!researcher) {
    notFound();
  }

  return <ResearcherRenderer researcher={researcher} />;
}
