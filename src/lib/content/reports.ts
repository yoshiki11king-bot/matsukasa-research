import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import type { Frontmatter } from "@/lib/content/frontmatter";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { FigureAttachment, ResearchReport, SourceLink } from "@/lib/types";

export function getReportBySlug(slug: string) {
  return readMarkdownDocument(`reports/${slug}.md`);
}

export async function getPublishedReportBySlug(slug: string) {
  const document = await getReportBySlug(slug);
  return isPublishedDocument(document) ? document : null;
}

export function getAllReports() {
  return listMarkdownDocuments("reports");
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

function getFigureAttachments(frontmatter: Frontmatter): FigureAttachment[] {
  const value = frontmatter.figures;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const entry = item as Record<string, unknown>;
    const title = typeof entry.title === "string" ? entry.title : "";
    const url = typeof entry.url === "string" ? entry.url : "";

    return title && url ? [{ title, url }] : [];
  });
}

function getCoverImage(frontmatter: Frontmatter) {
  const url = getString(frontmatter, "eyecatchUrl");

  if (!url) {
    return null;
  }

  return {
    url,
    alt: getString(frontmatter, "title", "報告書画像"),
  };
}

export function localReportToResearchReport(document: LocalMarkdownDocument): ResearchReport {
  const title = getString(document.frontmatter, "title", "無題の報告書");
  const publishedDate =
    getString(document.frontmatter, "publishedAt") ||
    getString(document.frontmatter, "updatedAt") ||
    new Date().toISOString();
  const updatedDate = getString(document.frontmatter, "updatedAt", publishedDate);

  return {
    id: `local-${document.slug}`,
    slug: document.slug,
    title,
    summary:
      getString(document.frontmatter, "summary") ||
      getString(document.frontmatter, "excerpt"),
    publishedDate,
    updatedDate,
    reportType: getString(document.frontmatter, "reportType", "調査報告書"),
    region: getString(document.frontmatter, "region", "日本"),
    topicNames: getStringArray(document.frontmatter, "topics"),
    researcherSlugs: getStringArray(document.frontmatter, "researcherSlugs"),
    methodologySlugs: [getString(document.frontmatter, "methodologySlug")]
      .concat(getStringArray(document.frontmatter, "methodologySlugs"))
      .filter(Boolean),
    coverImage: getCoverImage(document.frontmatter),
    pdfUrl: getString(document.frontmatter, "pdfUrl"),
    figures: getFigureAttachments(document.frontmatter),
    sourceLinks: getSourceLinks(document.frontmatter),
    sourceBasis: getString(document.frontmatter, "sourceNote", "Local Press"),
    body: document.body,
    contentBlocks: [],
    isLocalPress: true,
  };
}

export async function getPublishedLocalResearchReports() {
  const documents = await getAllReports();
  return documents.filter(isPublishedDocument).map(localReportToResearchReport);
}
