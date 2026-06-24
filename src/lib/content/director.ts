import { isPublishedDocument, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterLabeledBlocks,
  getFrontmatterString,
} from "@/lib/content/frontmatter-helpers";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { DirectorPageContent } from "@/lib/types";

export function getDirectorPage() {
  return readMarkdownDocument("director/index.md");
}

export async function getPublishedDirectorPage() {
  const document = await getDirectorPage();
  return isPublishedDocument(document) ? document : null;
}

export function localDirectorToPageContent(document: LocalMarkdownDocument): DirectorPageContent {
  const updatedDate = getFrontmatterString(document.frontmatter, "updatedAt") || new Date().toISOString();

  return {
    id: "local-director",
    slug: "director",
    title: getFrontmatterString(document.frontmatter, "title", "所長ページ"),
    summary:
      getFrontmatterString(document.frontmatter, "summary") ||
      getFrontmatterString(document.frontmatter, "excerpt") ||
      "松笠研究所の所長ページです。",
    body: document.body,
    effectiveDate: getFrontmatterString(document.frontmatter, "effectiveDate", updatedDate),
    updatedDate,
    roleCards: getFrontmatterLabeledBlocks(document.frontmatter, "roleCards"),
    stanceTitle: getFrontmatterString(document.frontmatter, "stanceTitle", "公開姿勢"),
    stanceDescription: getFrontmatterString(document.frontmatter, "stanceDescription"),
    stanceCards: getFrontmatterLabeledBlocks(document.frontmatter, "stanceCards"),
    relatedSummary: getFrontmatterString(document.frontmatter, "relatedSummary"),
    isLocalPress: true,
  };
}

export async function getPublishedLocalDirectorPageContent() {
  const document = await getPublishedDirectorPage();
  return document ? localDirectorToPageContent(document) : null;
}
