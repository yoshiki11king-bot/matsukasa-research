import { notFound } from "next/navigation";
import { LocalPressPreview } from "@/components/local-press/LocalPressPreview";
import { isLocalPressEnabled } from "@/lib/content/config";
import { getChartsBySlug } from "@/lib/content/charts";

export const dynamic = "force-dynamic";

export default async function LocalPressPreviewPage() {
  if (!isLocalPressEnabled()) {
    notFound();
  }

  return <LocalPressPreview charts={await getChartsBySlug()} />;
}
