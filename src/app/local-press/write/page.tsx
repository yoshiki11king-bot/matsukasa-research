import { notFound } from "next/navigation";
import { LocalPressWriter } from "@/components/local-press/LocalPressWriter";
import { getContentTypeFromQuery, isLocalPressEnabled } from "@/lib/content/config";
import { getChartsBySlug } from "@/lib/content/charts";

export const dynamic = "force-dynamic";

type WritePageProps = {
  searchParams?: Promise<{ type?: string }>;
};

export default async function LocalPressWritePage({ searchParams }: WritePageProps) {
  if (!isLocalPressEnabled()) {
    notFound();
  }

  const params = await searchParams;
  return <LocalPressWriter initialType={getContentTypeFromQuery(params?.type)} charts={await getChartsBySlug()} />;
}
