import { isPublishedDocument, readMarkdownDocument } from "@/lib/content";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { DirectorPageContent, LabeledTextBlock } from "@/lib/types";

export function getDirectorPage() {
  return readMarkdownDocument("director/index.md");
}

export async function getPublishedDirectorPage() {
  const document = await getDirectorPage();
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

export function localDirectorToPageContent(document: LocalMarkdownDocument): DirectorPageContent {
  const updatedDate = getString(document, "updatedAt") || new Date().toISOString();

  return {
    id: "local-director",
    slug: "director",
    title: getString(document, "title", "所長ページ"),
    summary:
      getString(document, "summary") ||
      getString(document, "excerpt") ||
      "松笠研究所の所長ページです。",
    body: document.body,
    effectiveDate: getString(document, "effectiveDate", updatedDate),
    updatedDate,
    roleCards: getLabeledBlocks(document, "roleCards"),
    stanceTitle: getString(document, "stanceTitle", "公開姿勢"),
    stanceDescription: getString(document, "stanceDescription"),
    stanceCards: getLabeledBlocks(document, "stanceCards"),
    relatedSummary: getString(document, "relatedSummary"),
    isLocalPress: true,
  };
}

export async function getPublishedLocalDirectorPageContent() {
  const document = await getPublishedDirectorPage();
  return document ? localDirectorToPageContent(document) : null;
}
