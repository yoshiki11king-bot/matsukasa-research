import { readdir } from "node:fs/promises";
import path from "node:path";
import { assertInsideContentRoot, CONTENT_ROOT, readJsonDocument } from "@/lib/content";
import type { LocalChart, LocalChartsBySlug } from "@/lib/content/types";
export { chartToD3Block } from "@/lib/content/chart-rendering";

export function getChartBySlug(slug: string) {
  return readJsonDocument<LocalChart>(`charts/${slug}.json`);
}

export async function getAllCharts() {
  const folderPath = path.join(CONTENT_ROOT, "charts");
  assertInsideContentRoot(folderPath);

  try {
    const entries = await readdir(folderPath, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));
    const charts = await Promise.all(files.map((entry) => readJsonDocument<LocalChart>(`charts/${entry.name}`)));
    return charts.filter((item): item is LocalChart => Boolean(item));
  } catch {
    return [];
  }
}

export async function getChartsBySlug(): Promise<LocalChartsBySlug> {
  const charts = await getAllCharts();
  return Object.fromEntries(charts.map((chart) => [chart.slug, chart]));
}
