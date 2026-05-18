import { isPublishedDocument, readMarkdownDocument } from "@/lib/content";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { FinancePageContent, LabeledTextBlock } from "@/lib/types";

export function getFinancePage() {
  return readMarkdownDocument("finance/index.md");
}

export async function getPublishedFinancePage() {
  const document = await getFinancePage();
  return isPublishedDocument(document) ? document : null;
}

function getString(document: LocalMarkdownDocument, key: string, fallback = "") {
  const value = document.frontmatter[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function getLabeledBlocks(document: LocalMarkdownDocument, key: string): LabeledTextBlock[] {
  const value = document.frontmatter[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const entry = item as Record<string, unknown>;
    const title = typeof entry.title === "string" ? entry.title : "";
    const body = typeof entry.body === "string" ? entry.body : "";

    return title || body ? [{ title, body }] : [];
  });
}

export function localFinanceToPageContent(document: LocalMarkdownDocument): FinancePageContent {
  const updatedDate = getString(document, "updatedAt") || new Date().toISOString();

  return {
    id: "local-finance",
    slug: "finance",
    title: getString(document, "title", "財務情報の公開"),
    summary:
      getString(document, "summary") ||
      getString(document, "excerpt") ||
      "松笠研究所の財務情報と公開方針をまとめています。",
    body: document.body,
    effectiveDate: getString(document, "effectiveDate", updatedDate),
    updatedDate,
    disclosureItems: getLabeledBlocks(document, "disclosureItems"),
    disclosureTable: getLabeledBlocks(document, "disclosureTable"),
    policyItems: getLabeledBlocks(document, "policyItems"),
    contactText: getString(document, "contactText"),
    isLocalPress: true,
  };
}

export async function getPublishedLocalFinancePageContent() {
  const document = await getPublishedFinancePage();
  return document ? localFinanceToPageContent(document) : null;
}
