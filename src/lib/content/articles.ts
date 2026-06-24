import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterCoverImage,
  getFrontmatterSourceLinks,
  getFrontmatterString,
  getFrontmatterStringArray,
} from "@/lib/content/frontmatter-helpers";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { BlogPost } from "@/lib/types";

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

export function localArticleToBlogPost(document: LocalMarkdownDocument): BlogPost {
  const title = getFrontmatterString(document.frontmatter, "title", "無題の記事");
  const publishedDate =
    getFrontmatterString(document.frontmatter, "publishedAt") ||
    getFrontmatterString(document.frontmatter, "updatedAt") ||
    new Date().toISOString();
  const authors = getFrontmatterStringArray(document.frontmatter, "authors");

  return {
    id: `local-${document.slug}`,
    slug: document.slug,
    title,
    excerpt: getFrontmatterString(document.frontmatter, "excerpt"),
    format: "記事",
    category: getFrontmatterString(document.frontmatter, "category", "研究ノート"),
    region: getFrontmatterString(document.frontmatter, "region", "日本"),
    publishedDate,
    authorName: authors[0] ?? "松笠研究所",
    coverImage: getFrontmatterCoverImage(document.frontmatter, "記事画像"),
    topics: getFrontmatterStringArray(document.frontmatter, "topics"),
    researcherSlugs: getFrontmatterStringArray(document.frontmatter, "researcherSlugs"),
    methodologySlugs: getFrontmatterStringArray(document.frontmatter, "methodologySlugs"),
    methodologySummary: getFrontmatterString(document.frontmatter, "methodologySummary"),
    sourceBasis: getFrontmatterString(document.frontmatter, "sourceNote", "Local Press"),
    updatedNote: getFrontmatterString(document.frontmatter, "updateNote"),
    sourceLinks: getFrontmatterSourceLinks(document.frontmatter),
    keyFindings: getFrontmatterStringArray(document.frontmatter, "keyFindings"),
    body: document.body,
    contentBlocks: [],
    createdAt: publishedDate,
    updatedAt: getFrontmatterString(document.frontmatter, "updatedAt", publishedDate),
    isLocalPress: true,
  };
}

export async function getPublishedLocalArticlePosts() {
  const documents = await getAllArticles();
  return documents.filter(isPublishedDocument).map(localArticleToBlogPost);
}
