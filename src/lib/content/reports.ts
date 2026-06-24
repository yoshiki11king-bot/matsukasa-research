import { isPublishedDocument, listMarkdownDocuments, readMarkdownDocument } from "@/lib/content";
import {
  getFrontmatterCoverImage,
  getFrontmatterFigureAttachments,
  getFrontmatterSourceLinks,
  getFrontmatterString,
  getFrontmatterStringArray,
} from "@/lib/content/frontmatter-helpers";
import type { LocalMarkdownDocument } from "@/lib/content/types";
import type { ResearchReport } from "@/lib/types";

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

export function localReportToResearchReport(document: LocalMarkdownDocument): ResearchReport {
  const title = getFrontmatterString(document.frontmatter, "title", "無題の報告書");
  const publishedDate =
    getFrontmatterString(document.frontmatter, "publishedAt") ||
    getFrontmatterString(document.frontmatter, "updatedAt") ||
    new Date().toISOString();
  const updatedDate = getFrontmatterString(document.frontmatter, "updatedAt", publishedDate);

  return {
    id: `local-${document.slug}`,
    slug: document.slug,
    title,
    summary:
      getFrontmatterString(document.frontmatter, "summary") ||
      getFrontmatterString(document.frontmatter, "excerpt"),
    publishedDate,
    updatedDate,
    reportType: getFrontmatterString(document.frontmatter, "reportType", "調査報告書"),
    region: getFrontmatterString(document.frontmatter, "region", "日本"),
    topicNames: getFrontmatterStringArray(document.frontmatter, "topics"),
    researcherSlugs: getFrontmatterStringArray(document.frontmatter, "researcherSlugs"),
    methodologySlugs: [getFrontmatterString(document.frontmatter, "methodologySlug")]
      .concat(getFrontmatterStringArray(document.frontmatter, "methodologySlugs"))
      .filter(Boolean),
    coverImage: getFrontmatterCoverImage(document.frontmatter, "報告書画像"),
    pdfUrl: getFrontmatterString(document.frontmatter, "pdfUrl"),
    figures: getFrontmatterFigureAttachments(document.frontmatter),
    sourceLinks: getFrontmatterSourceLinks(document.frontmatter),
    sourceBasis: getFrontmatterString(document.frontmatter, "sourceNote", "Local Press"),
    body: document.body,
    contentBlocks: [],
    isLocalPress: true,
  };
}

export async function getPublishedLocalResearchReports() {
  const documents = await getAllReports();
  return documents.filter(isPublishedDocument).map(localReportToResearchReport);
}
