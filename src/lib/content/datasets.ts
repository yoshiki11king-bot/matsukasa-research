import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterSourceLinks,
  getFrontmatterString,
  getFrontmatterStringArray,
} from "@/lib/content/frontmatter-helpers";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { Citation, DatasetEntry } from "@/lib/types";

function getFrontmatterCitation(document: LocalMarkdownDocument): Citation | null {
  const raw = document.frontmatter.citation;

  if (!raw) {
    return null;
  }

  if (typeof raw === "string") {
    return raw ? { label: "引用", text: raw } : null;
  }

  if (typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const entry = raw as Record<string, unknown>;
  const text = typeof entry.text === "string" ? entry.text : "";

  if (!text) {
    return null;
  }

  return {
    label: typeof entry.label === "string" ? entry.label : "引用",
    text,
    url: typeof entry.url === "string" ? entry.url : undefined,
  };
}

export function getDatasetBySlug(slug: string) {
  return readMarkdownDocument(`datasets/${slug}.md`);
}

export async function getPublishedDatasetBySlug(slug: string) {
  const document = await getDatasetBySlug(slug);
  return isPublishedDocument(document) ? document : null;
}

export function getAllDatasets() {
  return listMarkdownDocuments("datasets");
}

export function localDatasetToEntry(document: LocalMarkdownDocument): DatasetEntry {
  const publishedDate =
    getFrontmatterString(document.frontmatter, "publishedAt") ||
    getFrontmatterString(document.frontmatter, "updatedAt") ||
    new Date().toISOString();

  return {
    id: `local-dataset-${document.slug}`,
    slug: document.slug,
    title: getFrontmatterString(document.frontmatter, "title", document.slug),
    description:
      getFrontmatterString(document.frontmatter, "description") ||
      getFrontmatterString(document.frontmatter, "summary") ||
      getFrontmatterString(document.frontmatter, "excerpt"),
    publishedDate,
    updatedDate: getFrontmatterString(document.frontmatter, "updatedAt", publishedDate),
    fileUrl: getFrontmatterString(document.frontmatter, "fileUrl"),
    fileFormat: getFrontmatterString(document.frontmatter, "fileFormat", "unknown"),
    topics: getFrontmatterStringArray(document.frontmatter, "topics"),
    relatedReportSlugs: getFrontmatterStringArray(document.frontmatter, "relatedReports"),
    relatedChartSlugs: getFrontmatterStringArray(document.frontmatter, "relatedCharts"),
    sourceLinks: getFrontmatterSourceLinks(document.frontmatter),
    citation: getFrontmatterCitation(document),
    isLocalPress: true,
  };
}

export async function getPublishedLocalDatasets() {
  const documents = await getAllDatasets();
  return documents.filter(isPublishedDocument).map(localDatasetToEntry);
}
