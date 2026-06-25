import "server-only";

import {
  getPublishedArticleBySlug,
  getPublishedLocalArticlePosts,
  localArticleToBlogPost,
} from "@/lib/content/articles";
import {
  getPublishedFinancialStatementByYear,
  getPublishedLocalFinancialStatements,
  localFinancialStatementToContent,
} from "@/lib/content/financial-statements";
import {
  getAllCharts as getLocalCharts,
  getChartBySlug as getLocalChartBySlug,
  getChartsBySlug as getLocalChartsBySlug,
} from "@/lib/content/charts";
import {
  getPublishedCorrectionBySlug,
  getPublishedLocalCorrections,
  localCorrectionToEntry,
} from "@/lib/content/corrections";
import {
  getPublishedDatasetBySlug,
  getPublishedLocalDatasets,
  localDatasetToEntry,
} from "@/lib/content/datasets";
import { getPublishedLocalDirectorPageContent } from "@/lib/content/director";
import { getPublishedLocalEditorialPolicyContent } from "@/lib/content/editorial-policy";
import { getPublishedLocalFinancePageContent } from "@/lib/content/finance";
import { getPublishedLocalFundingPageContent } from "@/lib/content/funding";
import {
  getPublishedLocalMethodologies,
  getPublishedMethodologyBySlug,
  localMethodologyToEntry,
} from "@/lib/content/methodologies";
import {
  getPublishedLocalResearchers,
  getResearcherBySlug as getLocalResearcherBySlug,
  localResearcherToProfile,
} from "@/lib/content/researchers";
import {
  getPublishedLocalResearchReports,
  getPublishedReportBySlug,
  localReportToResearchReport,
} from "@/lib/content/reports";
import {
  getPublishedLocalShortReadings,
  getPublishedShortReadingBySlug,
  localShortReadingToEntry,
} from "@/lib/content/short-readings";
import { getPublishedLocalTopics } from "@/lib/content/topics";
import {
  matchesPostQuery,
  matchesTopics,
  paginateItems,
  sortByPublishedDate,
  sortFinancialStatements,
} from "@/lib/content-source/normalize";
import type { ContentSource, PostsPageParams } from "@/lib/content-source/types";

async function getLocalPostsPage(params: PostsPageParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 8);
  const posts = sortByPublishedDate(await getPublishedLocalArticlePosts());
  const filtered = posts.filter((post) => matchesPostQuery(post, params.q) && matchesTopics(post, params.topics));

  return paginateItems(filtered, page, limit);
}

export const localPressContentSource: ContentSource = {
  name: "local",

  getPostsPage: (params) => getLocalPostsPage(params),
  getAllPostSlugs: async () => {
    const posts = await getPublishedLocalArticlePosts();
    return posts.map((post) => post.slug);
  },
  getPostBySlug: async (slug) => {
    const document = await getPublishedArticleBySlug(slug);
    return document ? localArticleToBlogPost(document) : null;
  },
  getPostsByResearcher: async (slug) => {
    const posts = await getPublishedLocalArticlePosts();
    return sortByPublishedDate(posts.filter((post) => post.researcherSlugs.includes(slug)));
  },
  getPostsByMethodology: async (slug) => {
    const posts = await getPublishedLocalArticlePosts();
    return sortByPublishedDate(posts.filter((post) => post.methodologySlugs.includes(slug)));
  },

  getReports: async () => sortByPublishedDate(await getPublishedLocalResearchReports()),
  getReportBySlug: async (slug) => {
    const document = await getPublishedReportBySlug(slug);
    return document ? localReportToResearchReport(document) : null;
  },
  getReportsByResearcher: async (slug) => {
    const reports = await getPublishedLocalResearchReports();
    return sortByPublishedDate(reports.filter((report) => report.researcherSlugs.includes(slug)));
  },
  getReportsByMethodology: async (slug) => {
    const reports = await getPublishedLocalResearchReports();
    return sortByPublishedDate(reports.filter((report) => report.methodologySlugs.includes(slug)));
  },

  getResearchers: () => getPublishedLocalResearchers(),
  getResearcherBySlug: async (slug) => {
    const researcher = await getLocalResearcherBySlug(slug);
    return researcher ? localResearcherToProfile(researcher) : null;
  },

  getMethodologies: () => getPublishedLocalMethodologies(),
  getMethodologyBySlug: async (slug) => {
    const document = await getPublishedMethodologyBySlug(slug);
    return document ? localMethodologyToEntry(document) : null;
  },

  getTopics: () => getPublishedLocalTopics(),

  getCurrentDirectorPage: () => getPublishedLocalDirectorPageContent(),

  getFinancialStatements: async () => sortFinancialStatements(await getPublishedLocalFinancialStatements()),
  getFinancialStatementByYear: async (year) => {
    const document = await getPublishedFinancialStatementByYear(year);
    return document ? localFinancialStatementToContent(document) : null;
  },

  getCurrentFinancePage: () => getPublishedLocalFinancePageContent(),

  getCharts: () => getLocalCharts(),
  getChartBySlug: (slug) => getLocalChartBySlug(slug),
  getChartsBySlug: () => getLocalChartsBySlug(),

  getDatasets: () => getPublishedLocalDatasets(),
  getDatasetBySlug: async (slug) => {
    const document = await getPublishedDatasetBySlug(slug);
    return document ? localDatasetToEntry(document) : null;
  },

  getShortReadings: () => getPublishedLocalShortReadings(),
  getShortReadingBySlug: async (slug) => {
    const document = await getPublishedShortReadingBySlug(slug);
    return document ? localShortReadingToEntry(document) : null;
  },

  getCorrections: () => getPublishedLocalCorrections(),
  getCorrectionBySlug: async (slug) => {
    const document = await getPublishedCorrectionBySlug(slug);
    return document ? localCorrectionToEntry(document) : null;
  },
  getEditorialPolicy: () => getPublishedLocalEditorialPolicyContent(),
  getFundingPage: () => getPublishedLocalFundingPageContent(),

  getSidebarSnapshot: async () => {
    const [researchers, methodologies, reports] = await Promise.all([
      getPublishedLocalResearchers(),
      getPublishedLocalMethodologies(),
      getPublishedLocalResearchReports(),
    ]);

    return {
      featuredResearchers: researchers.slice(0, 2),
      featuredMethodologies: methodologies.slice(0, 2),
      featuredReports: sortByPublishedDate(reports).slice(0, 2),
    };
  },

  getHealth: () => ({
    name: "local",
    configured: true,
  }),
};
