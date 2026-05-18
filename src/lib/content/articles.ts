import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import type { Frontmatter } from "@/lib/content/frontmatter";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { BlogPost, SourceLink } from "@/lib/types";

export function getArticleBySlug(slug: string) {
  return readMarkdownDocument(`articles/${slug}.md`);
}

export async function getPublishedArticleBySlug(slug: string) {
  const document = await getArticleBySlug(slug);
  return isPublishedDocument(document) ? document : null;
}

export function getAllArticles() {
  return listMarkdownDocuments("articles");
}

function getString(frontmatter: Frontmatter, key: string, fallback = "") {
  const value = frontmatter[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function getStringArray(frontmatter: Frontmatter, key: string) {
  const value = frontmatter[key];
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function getSourceLinks(frontmatter: Frontmatter): SourceLink[] {
  const value = frontmatter.referenceLinks;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item === "string") {
      return item ? [{ label: item }] : [];
    }

    if (!item || typeof item !== "object") {
      return [];
    }

    const entry = item as Record<string, unknown>;
    const label = typeof entry.label === "string" ? entry.label : "";
    const url = typeof entry.url === "string" ? entry.url : undefined;

    return label ? [{ label, url }] : [];
  });
}

function getCoverImage(frontmatter: Frontmatter) {
  const url = getString(frontmatter, "eyecatchUrl");

  if (!url) {
    return null;
  }

  return {
    url,
    alt: getString(frontmatter, "title", "記事画像"),
  };
}

export function localArticleToBlogPost(document: LocalMarkdownDocument): BlogPost {
  const title = getString(document.frontmatter, "title", "無題の記事");
  const publishedDate =
    getString(document.frontmatter, "publishedAt") ||
    getString(document.frontmatter, "updatedAt") ||
    new Date().toISOString();
  const authors = getStringArray(document.frontmatter, "authors");

  return {
    id: `local-${document.slug}`,
    slug: document.slug,
    title,
    excerpt: getString(document.frontmatter, "excerpt"),
    format: "記事",
    category: getString(document.frontmatter, "category", "研究ノート"),
    region: getString(document.frontmatter, "region", "日本"),
    publishedDate,
    authorName: authors[0] ?? "松笠研究所",
    coverImage: getCoverImage(document.frontmatter),
    topics: getStringArray(document.frontmatter, "topics"),
    researcherSlugs: getStringArray(document.frontmatter, "researcherSlugs"),
    methodologySlugs: getStringArray(document.frontmatter, "methodologySlugs"),
    methodologySummary: getString(document.frontmatter, "methodologySummary"),
    sourceBasis: getString(document.frontmatter, "sourceNote", "Local Press"),
    updatedNote: getString(document.frontmatter, "updateNote"),
    sourceLinks: getSourceLinks(document.frontmatter),
    keyFindings: getStringArray(document.frontmatter, "keyFindings"),
    body: document.body,
    contentBlocks: [],
    createdAt: publishedDate,
    updatedAt: getString(document.frontmatter, "updatedAt", publishedDate),
    isLocalPress: true,
  };
}

export async function getPublishedLocalArticlePosts() {
  const documents = await getAllArticles();
  return documents.filter(isPublishedDocument).map(localArticleToBlogPost);
}
