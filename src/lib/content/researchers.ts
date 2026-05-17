import { readdir } from "node:fs/promises";
import path from "node:path";
import { assertInsideContentRoot, CONTENT_ROOT, readJsonDocument } from "@/lib/content";
import type { LocalResearcher } from "@/lib/content/types";

export function getResearcherBySlug(slug: string) {
  return readJsonDocument<LocalResearcher>(`researchers/${slug}.json`);
}

export async function getAllResearchers() {
  const folderPath = path.join(CONTENT_ROOT, "researchers");
  assertInsideContentRoot(folderPath);

  try {
    const entries = await readdir(folderPath, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));
    const researchers = await Promise.all(files.map((entry) => readJsonDocument<LocalResearcher>(`researchers/${entry.name}`)));
    return researchers.filter((item): item is LocalResearcher => Boolean(item));
  } catch {
    return [];
  }
}
