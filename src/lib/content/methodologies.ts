import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterString,
  getFrontmatterTextList,
} from "@/lib/content/frontmatter-helpers";
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

export function localMethodologyToEntry(document: LocalMarkdownDocument): MethodologyEntry {
  return {
    id: `local-${document.slug}`,
    slug: document.slug,
    title: getFrontmatterString(document.frontmatter, "title", "Untitled"),
    summary: getFrontmatterString(document.frontmatter, "summary"),
    updatedDate:
      getFrontmatterString(document.frontmatter, "updatedAt") ||
      getFrontmatterString(document.frontmatter, "publishedAt") ||
      new Date().toISOString(),
    reviewer: getFrontmatterString(document.frontmatter, "reviewer", "松笠研究所"),
    focusTopics: getFrontmatterTextList(document.frontmatter, "topics"),
    goodFor: getFrontmatterTextList(document.frontmatter, "goodFor"),
    limits: getFrontmatterTextList(document.frontmatter, "limits"),
    sourceBasis: getFrontmatterString(document.frontmatter, "sourceNote", "Local Press"),
    body: document.body,
    isDemo: false,
    isLocalPress: true,
  };
}

export async function getPublishedLocalMethodologies() {
  const documents = await getAllMethodologies();
  return documents.filter(isPublishedDocument).map(localMethodologyToEntry);
}
