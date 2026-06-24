import { readdir } from "node:fs/promises";
import path from "node:path";
import { assertInsideContentRoot, CONTENT_ROOT, readJsonDocument } from "@/lib/content";
import type { LocalResearcher } from "@/lib/content/types";
import type { ResearcherProfile } from "@/lib/types";

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

export function localResearcherToProfile(researcher: LocalResearcher): ResearcherProfile {
  return {
    id: `local-${researcher.slug}`,
    slug: researcher.slug,
    name: researcher.name || "No Name",
    role: researcher.role || "研究員",
    team: researcher.affiliation || "研究ユニット",
    summary: researcher.bio,
    bio: researcher.bio,
    portraitImage: researcher.avatarUrl ? { url: researcher.avatarUrl, alt: researcher.name } : null,
    focusTopics: researcher.interests,
    methodologySlugs: [],
    updatedDate: new Date().toISOString(),
    email: "",
    sourceBasis: "Local Press",
    isDemo: false,
    isLocalPress: true,
  };
}

export async function getPublishedLocalResearchers() {
  const researchers = await getAllResearchers();
  return researchers.map(localResearcherToProfile);
}
