import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterString,
  getFrontmatterStringArray,
} from "@/lib/content/frontmatter-helpers";
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

export function localFinancialStatementToContent(document: LocalMarkdownDocument): FinancialStatement {
  const year = getFrontmatterString(document.frontmatter, "year", document.slug);
  const publishedDate =
    getFrontmatterString(document.frontmatter, "publishedAt") ||
    getFrontmatterString(document.frontmatter, "updatedAt") ||
    new Date().toISOString();

  return {
    id: `local-financial-statement-${document.slug}`,
    slug: document.slug,
    title: getFrontmatterString(document.frontmatter, "title", `${year}年度 決算資料`),
    fiscalYear: year,
    summary:
      getFrontmatterString(document.frontmatter, "summary") ||
      getFrontmatterString(document.frontmatter, "excerpt") ||
      `${year}年度の決算資料です。`,
    publishedDate,
    updatedDate: getFrontmatterString(document.frontmatter, "updatedAt", publishedDate),
    pdfUrl: getFrontmatterString(document.frontmatter, "pdfUrl"),
    sourceBasis: getFrontmatterString(document.frontmatter, "sourceNote", "Local Press"),
    highlights: getFrontmatterStringArray(document.frontmatter, "highlights"),
    body: document.body,
    isLocalPress: true,
  };
}

export async function getPublishedLocalFinancialStatements() {
  const documents = await getAllFinancialStatements();
  return documents.filter(isPublishedDocument).map(localFinancialStatementToContent);
}
