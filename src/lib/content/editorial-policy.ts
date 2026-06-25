import { isPublishedDocument, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterSourceLinks,
  getFrontmatterString,
} from "@/lib/content/frontmatter-helpers";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { EditorialPolicyContent } from "@/lib/types";

export function getEditorialPolicyPage() {
  return readMarkdownDocument("editorial-policy/index.md");
}

export async function getPublishedEditorialPolicyPage() {
  const document = await getEditorialPolicyPage();
  return isPublishedDocument(document) ? document : null;
}

export function localEditorialPolicyToContent(document: LocalMarkdownDocument): EditorialPolicyContent {
  const updatedDate = getFrontmatterString(document.frontmatter, "updatedAt") || new Date().toISOString();

  return {
    id: "local-editorial-policy",
    slug: "editorial-policy",
    title: getFrontmatterString(document.frontmatter, "title", "編集方針"),
    summary:
      getFrontmatterString(document.frontmatter, "summary") ||
      getFrontmatterString(document.frontmatter, "excerpt"),
    body: document.body,
    updatedDate,
    sourceLinks: getFrontmatterSourceLinks(document.frontmatter),
    isLocalPress: true,
  };
}

export async function getPublishedLocalEditorialPolicyContent() {
  const document = await getPublishedEditorialPolicyPage();
  return document ? localEditorialPolicyToContent(document) : null;
}
