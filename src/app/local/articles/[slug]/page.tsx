import { notFound } from "next/navigation";
import { ArticleRenderer } from "@/components/content/ArticleRenderer";
import { getPublishedArticleBySlug } from "@/lib/content/articles";
import { getChartsBySlug } from "@/lib/content/charts";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LocalArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const document = await getPublishedArticleBySlug(slug);

  if (!document) {
    notFound();
  }

  return <ArticleRenderer document={document} charts={await getChartsBySlug()} />;
}
