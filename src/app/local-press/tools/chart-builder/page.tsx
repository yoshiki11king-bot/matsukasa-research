import { notFound } from "next/navigation";
import { ChartBuilder } from "@/components/local-press/ChartBuilder";
import { isLocalPressEnabled } from "@/lib/content/config";

export const dynamic = "force-dynamic";

export default function ChartBuilderPage() {
  if (!isLocalPressEnabled()) {
    notFound();
  }

  return <ChartBuilder />;
}
