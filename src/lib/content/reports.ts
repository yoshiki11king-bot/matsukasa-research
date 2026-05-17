import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";

export function getReportBySlug(slug: string) {
  return readMarkdownDocument(`reports/${slug}.md`);
}

export async function getPublishedReportBySlug(slug: string) {
  const document = await getReportBySlug(slug);
  return isPublishedDocument(document) ? document : null;
}

export function getAllReports() {
  return listMarkdownDocuments("reports");
}
