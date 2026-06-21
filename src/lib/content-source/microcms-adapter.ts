import "server-only";

import {
  cmsStatus,
  getAllPostSlugs,
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

  getFinancialStatements: () => getFinancialStatements(),
  getCurrentFinancePage: () => getCurrentFinancePage(),

  getHealth: () => ({
    name: "microcms",
    configured: cmsStatus.configured,
  }),
};
