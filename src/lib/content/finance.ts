import { isPublishedDocument, readMarkdownDocument } from "@/lib/content";

export function getFinancePage() {
  return readMarkdownDocument("finance/index.md");
}

export async function getPublishedFinancePage() {
  const document = await getFinancePage();
  return isPublishedDocument(document) ? document : null;
}
