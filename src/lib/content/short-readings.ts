import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterString,
  getFrontmatterStringArray,
} from "@/lib/content/frontmatter-helpers";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { ShortReadingEntry } from "@/lib/types";

export function localShortReadingToEntry(document: LocalMarkdownDocument): ShortReadingEntry {
  const title = getFrontmatterString(document.frontmatter, "title", "無題のショートリーディング");
  const publishedDate = getFrontmatterString(document.frontmatter, "publishedAt");

  return {
    id: `local-short-reading-${document.slug}`,
    slug: document.slug,
    title,
    excerpt: getFrontmatterString(document.frontmatter, "excerpt"),
    publishedDate,
    updatedDate: getFrontmatterString(document.frontmatter, "updatedAt", publishedDate),
    topicNames: getFrontmatterStringArray(document.frontmatter, "topics"),
    authors: getFrontmatterStringArray(document.frontmatter, "authors"),
    readingTime: getFrontmatterString(document.frontmatter, "readingTime"),
    body: document.body,
    isLocalPress: true,
  };
}

export function getShortReadingBySlug(slug: string) {
  return readMarkdownDocument(`short-readings/${slug}.md`);
}

export async function getPublishedShortReadingBySlug(slug: string) {
  const document = await getShortReadingBySlug(slug);
  return isPublishedDocument(document) ? document : null;
}

export function getAllShortReadings() {
  return listMarkdownDocuments("short-readings");
}

export async function getPublishedLocalShortReadings() {
  const documents = await getAllShortReadings();
  return documents.filter(isPublishedDocument).map(localShortReadingToEntry);
}
