import "server-only";

import {
  cmsStatus,
  getAllPostSlugs,
  getCurrentDirectorPage,
  getCurrentFinancePage,
  getFinancialStatements,
  getMethodologies,
  getMethodologyBySlug,
  getPostBySlug,
  getPostsPage,
  getReportBySlug,
  getReports,
  getResearcherBySlug,
  getResearchers,
  getTopics,
} from "@/lib/microcms";
import {
  getAllCharts as getLocalCharts,
  getChartBySlug as getLocalChartBySlug,
  getChartsBySlug as getLocalChartsBySlug,
} from "@/lib/content/charts";
import type { ContentSource, SourceOptions } from "@/lib/content-source/types";

function toMicroCMSOptions(options?: SourceOptions) {
  if (options?.revalidateSeconds === undefined) {
    return undefined;
  }

  return {
    revalidateSeconds: options.revalidateSeconds,
  };
}

export const microcmsContentSource: ContentSource = {
  name: "microcms",

  getPostsPage: (params, options) => getPostsPage(params, toMicroCMSOptions(options)),
  getAllPostSlugs: (options) => getAllPostSlugs(toMicroCMSOptions(options)),
  getPostBySlug: (slug) => getPostBySlug(slug),

  getReports: (options) => getReports(toMicroCMSOptions(options)),
  getReportBySlug: (slug) => getReportBySlug(slug),

  getResearchers: (options) => getResearchers(toMicroCMSOptions(options)),
  getResearcherBySlug: (slug) => getResearcherBySlug(slug),

  getMethodologies: (options) => getMethodologies(toMicroCMSOptions(options)),
  getMethodologyBySlug: (slug) => getMethodologyBySlug(slug),

  getTopics: (options) => getTopics(toMicroCMSOptions(options)),

  getCurrentDirectorPage: () => getCurrentDirectorPage(),

  getFinancialStatements: () => getFinancialStatements(),
  getFinancialStatementByYear: async (year) => {
    const statements = await getFinancialStatements();
    return statements.find((statement) => statement.fiscalYear === year || statement.slug === year) ?? null;
  },
  getCurrentFinancePage: () => getCurrentFinancePage(),

  getCharts: () => getLocalCharts(),
  getChartBySlug: (slug) => getLocalChartBySlug(slug),
  getChartsBySlug: () => getLocalChartsBySlug(),

  getHealth: () => ({
    name: "microcms",
    configured: cmsStatus.configured,
  }),
};
