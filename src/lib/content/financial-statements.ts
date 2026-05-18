import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { FinancialStatement } from "@/lib/types";

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

function getString(document: LocalMarkdownDocument, key: string, fallback = "") {
  const value = document.frontmatter[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function getStringArray(document: LocalMarkdownDocument, key: string) {
  const value = document.frontmatter[key];
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export function localFinancialStatementToContent(document: LocalMarkdownDocument): FinancialStatement {
  const year = getString(document, "year", document.slug);
  const publishedDate =
    getString(document, "publishedAt") ||
    getString(document, "updatedAt") ||
    new Date().toISOString();

  return {
    id: `local-financial-statement-${document.slug}`,
    slug: document.slug,
    title: getString(document, "title", `${year}年度 決算資料`),
    fiscalYear: year,
    summary:
      getString(document, "summary") ||
      getString(document, "excerpt") ||
      `${year}年度の決算資料です。`,
    publishedDate,
    updatedDate: getString(document, "updatedAt", publishedDate),
    pdfUrl: getString(document, "pdfUrl"),
    sourceBasis: getString(document, "sourceNote", "Local Press"),
    highlights: getStringArray(document, "highlights"),
    body: document.body,
    isLocalPress: true,
  };
}

export async function getPublishedLocalFinancialStatements() {
  const documents = await getAllFinancialStatements();
  return documents.filter(isPublishedDocument).map(localFinancialStatementToContent);
}
