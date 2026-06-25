import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import { getFrontmatterString } from "@/lib/content/frontmatter-helpers";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { CorrectionEntry } from "@/lib/types";

const correctionTargetTypes = new Set<CorrectionEntry["targetType"]>([
  "post",
  "report",
  "methodology",
  "dataset",
  "chart",
  "page",
]);

function getCorrectionTargetType(value: string): CorrectionEntry["targetType"] {
  return correctionTargetTypes.has(value as CorrectionEntry["targetType"])
    ? (value as CorrectionEntry["targetType"])
    : "page";
}

export function getCorrectionBySlug(slug: string) {
  return readMarkdownDocument(`corrections/${slug}.md`);
}

export async function getPublishedCorrectionBySlug(slug: string) {
  const document = await getCorrectionBySlug(slug);
  return isPublishedDocument(document) ? document : null;
}

export function getAllCorrections() {
  return listMarkdownDocuments("corrections");
}

export function localCorrectionToEntry(document: LocalMarkdownDocument): CorrectionEntry {
  const publishedDate =
    getFrontmatterString(document.frontmatter, "publishedAt") ||
    getFrontmatterString(document.frontmatter, "updatedAt") ||
    new Date().toISOString();

  return {
    id: `local-correction-${document.slug}`,
    slug: document.slug,
    title: getFrontmatterString(document.frontmatter, "title", document.slug),
    summary:
      getFrontmatterString(document.frontmatter, "summary") ||
      getFrontmatterString(document.frontmatter, "excerpt"),
    targetType: getCorrectionTargetType(getFrontmatterString(document.frontmatter, "targetType")),
    targetSlug: getFrontmatterString(document.frontmatter, "targetSlug"),
    publishedDate,
    updatedDate: getFrontmatterString(document.frontmatter, "updatedAt", publishedDate),
    body: document.body,
    isLocalPress: true,
  };
}

export async function getPublishedLocalCorrections() {
  const documents = await getAllCorrections();
  return documents.filter(isPublishedDocument).map(localCorrectionToEntry);
}
