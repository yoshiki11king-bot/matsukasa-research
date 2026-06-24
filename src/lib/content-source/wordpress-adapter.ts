import "server-only";

import type { ContentSource, ContentSourceHealth, ListResponse } from "./types";

export type WordPressRawAsset = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type WordPressRawTopic = {
  slug: string;
  name: string;
  description?: string;
};

export type WordPressRawContentItem = {
  id: number | string;
  slug: string;
  title: string;
  description?: string;
  excerpt?: string;
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
  eyecatch?: WordPressRawAsset | null;
  pdfUrl?: string;
  topics?: WordPressRawTopic[];
};

export type WordPressRawChartDatum = Record<string, string | number | boolean | null>;

export type WordPressRawChart = WordPressRawContentItem & {
  chartType?: string;
  data?: WordPressRawChartDatum[];
  sourceNote?: string;
  methodologyNote?: string;
};

export type WordPressRawListResponse<T> = ListResponse<T>;

export type WordPressContentSourceHealth = ContentSourceHealth & {
  available: false;
  message: string;
};

function notImplemented(methodName: string): Promise<never> {
  return Promise.reject(
    new Error(`WordPress content source adapter is not implemented yet: ${methodName}`),
  );
}

export const wordpressContentSource: ContentSource = {
  name: "wordpress",

  getPostsPage: () => notImplemented("getPostsPage"),
  getAllPostSlugs: () => notImplemented("getAllPostSlugs"),
  getPostBySlug: () => notImplemented("getPostBySlug"),

  getReports: () => notImplemented("getReports"),
  getReportBySlug: () => notImplemented("getReportBySlug"),

  getResearchers: () => notImplemented("getResearchers"),
  getResearcherBySlug: () => notImplemented("getResearcherBySlug"),

  getMethodologies: () => notImplemented("getMethodologies"),
  getMethodologyBySlug: () => notImplemented("getMethodologyBySlug"),

  getTopics: () => notImplemented("getTopics"),

  getCurrentDirectorPage: () => notImplemented("getCurrentDirectorPage"),

  getFinancialStatements: () => notImplemented("getFinancialStatements"),
  getFinancialStatementByYear: () => notImplemented("getFinancialStatementByYear"),

  getCurrentFinancePage: () => notImplemented("getCurrentFinancePage"),

  getCharts: () => notImplemented("getCharts"),
  getChartBySlug: () => notImplemented("getChartBySlug"),
  getChartsBySlug: () => notImplemented("getChartsBySlug"),

  getHealth: (): WordPressContentSourceHealth => ({
    name: "wordpress",
    configured: false,
    available: false,
    message: "WordPress adapter is not implemented yet.",
  }),
};
