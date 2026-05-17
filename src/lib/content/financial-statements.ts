import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";

export function getFinancialStatementByYear(year: string) {
  return readMarkdownDocument(`financial-statements/${year}.md`);
}

export async function getPublishedFinancialStatementByYear(year: string) {
  const document = await getFinancialStatementByYear(year);
  return isPublishedDocument(document) ? document : null;
}

export function getAllFinancialStatements() {
  return listMarkdownDocuments("financial-statements");
}
