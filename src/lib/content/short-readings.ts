import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";

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
