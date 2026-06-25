import { isPublishedDocument, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterLabeledBlocks,
  getFrontmatterSourceLinks,
  getFrontmatterString,
} from "@/lib/content/frontmatter-helpers";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { FundingPageContent } from "@/lib/types";

export function getFundingPage() {
  return readMarkdownDocument("funding/index.md");
}

export async function getPublishedFundingPage() {
  const document = await getFundingPage();
  return isPublishedDocument(document) ? document : null;
}

export function localFundingToPageContent(document: LocalMarkdownDocument): FundingPageContent {
  const updatedDate = getFrontmatterString(document.frontmatter, "updatedAt") || new Date().toISOString();

  return {
    id: "local-funding",
    slug: "funding",
    title: getFrontmatterString(document.frontmatter, "title", "資金と支援"),
    summary:
      getFrontmatterString(document.frontmatter, "summary") ||
      getFrontmatterString(document.frontmatter, "excerpt"),
    body: document.body,
    updatedDate,
    disclosureItems: getFrontmatterLabeledBlocks(document.frontmatter, "disclosureItems"),
    sourceLinks: getFrontmatterSourceLinks(document.frontmatter),
    isLocalPress: true,
  };
}

export async function getPublishedLocalFundingPageContent() {
  const document = await getPublishedFundingPage();
  return document ? localFundingToPageContent(document) : null;
}
