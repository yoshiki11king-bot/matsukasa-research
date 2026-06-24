import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { MethodologyEntry } from "@/lib/types";

export function getMethodologyBySlug(slug: string) {
  return readMarkdownDocument(`methodologies/${slug}.md`);
}

export async function getPublishedMethodologyBySlug(slug: string) {
  const document = await getMethodologyBySlug(slug);
  return isPublishedDocument(document) ? document : null;
}

export function getAllMethodologies() {
  return listMarkdownDocuments("methodologies");
}

function parseTextList(value?: string | string[]) {
  const raw = Array.isArray(value) ? value.join("\n") : value ?? "";

  return raw
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function frontmatterString(document: LocalMarkdownDocument, key: string, fallback = "") {
  const value = document.frontmatter[key];
  return typeof value === "string" ? value : fallback;
}

function frontmatterStringList(document: LocalMarkdownDocument, key: string) {
  const value = document.frontmatter[key];

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return typeof value === "string" ? parseTextList(value) : [];
}

export function localMethodologyToEntry(document: LocalMarkdownDocument): MethodologyEntry {
  return {
    id: `local-${document.slug}`,
    slug: document.slug,
    title: frontmatterString(document, "title", "Untitled"),
    summary: frontmatterString(document, "summary"),
    updatedDate:
      frontmatterString(document, "updatedAt") ||
      frontmatterString(document, "publishedAt") ||
      new Date().toISOString(),
    reviewer: frontmatterString(document, "reviewer", "松笠研究所"),
    focusTopics: frontmatterStringList(document, "topics"),
    goodFor: frontmatterStringList(document, "goodFor"),
    limits: frontmatterStringList(document, "limits"),
    sourceBasis: frontmatterString(document, "sourceNote", "Local Press"),
    body: document.body,
    isDemo: false,
    isLocalPress: true,
  };
}

export async function getPublishedLocalMethodologies() {
  const documents = await getAllMethodologies();
  return documents.filter(isPublishedDocument).map(localMethodologyToEntry);
}
