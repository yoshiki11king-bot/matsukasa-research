import { isPublishedDocument, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterLabeledBlocks,
  getFrontmatterString,
} from "@/lib/content/frontmatter-helpers";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { FinancePageContent } from "@/lib/types";

export function getFinancePage() {
  return readMarkdownDocument("finance/index.md");
}

export async function getPublishedFinancePage() {
  const document = await getFinancePage();
  return isPublishedDocument(document) ? document : null;
}

export function localFinanceToPageContent(document: LocalMarkdownDocument): FinancePageContent {
  const updatedDate = getFrontmatterString(document.frontmatter, "updatedAt") || new Date().toISOString();

  return {
    id: "local-finance",
    slug: "finance",
    title: getFrontmatterString(document.frontmatter, "title", "財務情報の公開"),
    summary:
      getFrontmatterString(document.frontmatter, "summary") ||
      getFrontmatterString(document.frontmatter, "excerpt") ||
      "松笠研究所の財務情報と公開方針をまとめています。",
    body: document.body,
    effectiveDate: getFrontmatterString(document.frontmatter, "effectiveDate", updatedDate),
    updatedDate,
    disclosureItems: getFrontmatterLabeledBlocks(document.frontmatter, "disclosureItems"),
    disclosureTable: getFrontmatterLabeledBlocks(document.frontmatter, "disclosureTable"),
    policyItems: getFrontmatterLabeledBlocks(document.frontmatter, "policyItems"),
    contactText: getFrontmatterString(document.frontmatter, "contactText"),
    isLocalPress: true,
  };
}

export async function getPublishedLocalFinancePageContent() {
  const document = await getPublishedFinancePage();
  return document ? localFinanceToPageContent(document) : null;
}
