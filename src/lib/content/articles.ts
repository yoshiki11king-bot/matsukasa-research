import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";

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
