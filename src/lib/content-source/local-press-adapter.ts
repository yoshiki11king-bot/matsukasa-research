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
import { getPublishedLocalDirectorPageContent } from "@/lib/content/director";
import { getPublishedLocalFinancePageContent } from "@/lib/content/finance";
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
import { getPublishedLocalTopics } from "@/lib/content/topics";
import type { ContentSource, PostsPageParams } from "@/lib/content-source/types";
import type { BlogPost, FinancialStatement } from "@/lib/types";

function sortByPublishedDate<T extends { publishedDate: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const rightTime = new Date(right.publishedDate).getTime();
    const leftTime = new Date(left.publishedDate).getTime();

    return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
  });
}

function sortFinancialStatements(statements: FinancialStatement[]) {
  return sortByPublishedDate(statements).sort((left, right) => {
    const leftTime = new Date(left.publishedDate).getTime();
    const rightTime = new Date(right.publishedDate).getTime();

    if (leftTime !== rightTime) {
      return 0;
    }

    return right.fiscalYear.localeCompare(left.fiscalYear);
  });
}

function matchesQuery(post: BlogPost, query?: string) {
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    post.title,
    post.excerpt,
    post.category,
    post.region,
    post.authorName,
    ...post.topics,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function matchesTopics(post: BlogPost, topics?: string[]) {
  if (!topics || topics.length === 0) {
    return true;
  }

  return topics.every((topic) => post.topics.includes(topic));
}

async function getLocalPostsPage(params: PostsPageParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 8);
  const posts = sortByPublishedDate(await getPublishedLocalArticlePosts());
  const filtered = posts.filter((post) => matchesQuery(post, params.q) && matchesTopics(post, params.topics));
  const offset = (page - 1) * limit;

  return {
    contents: filtered.slice(offset, offset + limit),
    totalCount: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    currentPage: page,
    limit,
    offset,
  };
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

  getReports: async () => sortByPublishedDate(await getPublishedLocalResearchReports()),
  getReportBySlug: async (slug) => {
    const document = await getPublishedReportBySlug(slug);
    return document ? localReportToResearchReport(document) : null;
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

  getHealth: () => ({
    name: "local",
    configured: true,
  }),
};
