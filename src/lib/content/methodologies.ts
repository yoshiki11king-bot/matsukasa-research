import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";

export function getMethodologyBySlug(slug: string) {
  return readMarkdownDocument(`methodologies/${slug}.md`);
}

export async function getPublishedMethodologyBySlug(slug: string) {
  const document = await getMethodologyBySlug(slug);
  return isPublishedDocument(document) ? document : null;
}

export function getAllMethodologies() {
  return listMarkdownDocuments("methodologies");
}
