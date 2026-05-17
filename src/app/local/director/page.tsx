import { notFound } from "next/navigation";
import { DirectorRenderer } from "@/components/content/DirectorRenderer";
import { getChartsBySlug } from "@/lib/content/charts";
import { isPublishedDocument } from "@/lib/content";
import { getDirectorPage } from "@/lib/content/director";

export const dynamic = "force-dynamic";

export default async function LocalDirectorPage() {
  const document = await getDirectorPage();

  if (!isPublishedDocument(document)) {
    notFound();
  }

  return <DirectorRenderer document={document} charts={await getChartsBySlug()} />;
}
