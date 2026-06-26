import "server-only";

import type { LocalChart, LocalChartsBySlug } from "@/lib/content/types";
import { sortByPublishedDate, sortFinancialStatements } from "@/lib/content-source/normalize";
import { getTopicSlug } from "@/lib/topic-pages";
import type {
  BlogImage,
  BlogPost,
  Citation,
  CorrectionEntry,
  DatasetEntry,
  DirectorPageContent,
  EditorialPolicyContent,
  FinancePageContent,
  FinancialStatement,
  FundingPageContent,
  InstituteTopic,
  LabeledTextBlock,
  MethodologyEntry,
  ResearchReport,
  ResearcherProfile,
  ShortReadingEntry,
  SourceLink,
} from "@/lib/types";
import type {
  ContentSource,
  ContentSourceHealth,
  ListResponse,
  PostsPageParams,
  SourceOptions,
} from "./types";

export type WordPressRawAsset = {
  url?: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
};

export type WordPressRawTopic = {
  slug: string;
  name: string;
  description?: string;
};

export type WordPressRawSourceLink = {
  label?: string;
  title?: string;
  text?: string;
  url?: string;
};

export type WordPressRawCitation = {
  label?: string;
  text?: string;
  url?: string;
};

export type WordPressRawLabeledTextBlock = {
  label?: string;
  title?: string;
  body?: string;
  text?: string;
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
  body?: string;
  eyecatch?: WordPressRawAsset | null;
  pdfUrl?: string;
  fileUrl?: string;
  fileFormat?: string;
  topics?: WordPressRawTopic[];
  regions?: WordPressRawTopic[];
  formats?: WordPressRawTopic[];
  citation?: WordPressRawCitation | string;
  sourceNote?: string;
  methodologyNote?: string;
  revisionNote?: string;
  fiscalYear?: string;
  readingTime?: string;
  role?: string;
  team?: string;
  email?: string;
  relatedMethodology?: string[];
  relatedDataset?: string[];
  relatedCharts?: string[];
  relatedReports?: string[];
  researcherSlugs?: string[];
  methodologySlugs?: string[];
  keyFindings?: string[];
  highlights?: string[];
  sources?: WordPressRawSourceLink[];
  chartData?: WordPressRawChartDatum[];
};

export type WordPressRawPost = WordPressRawContentItem & {
  authorName?: string;
  category?: string;
  format?: string;
  region?: string;
  sourceLinks?: WordPressRawSourceLink[];
};

export type WordPressRawReport = WordPressRawContentItem & {
  reportType?: string;
  region?: string;
  figures?: WordPressRawAsset[];
  sourceLinks?: WordPressRawSourceLink[];
  methodologySummary?: string;
};

export type WordPressRawMethodology = WordPressRawContentItem & {
  reviewer?: string;
  focusTopics?: string[];
  goodFor?: string[];
  limits?: string[];
  sourceBasis?: string;
};

export type WordPressRawResearcher = WordPressRawContentItem & {
  name?: string;
  bio?: string;
  portrait?: WordPressRawAsset | null;
  focusTopics?: string[];
  methodologySlugs?: string[];
  sourceBasis?: string;
};

export type WordPressRawChartDatum = Record<string, string | number | boolean | null>;

export type WordPressRawChart = WordPressRawContentItem & {
  chartType?: string;
  data?: WordPressRawChartDatum[];
};

export type WordPressRawShortReading = WordPressRawContentItem & {
  authors?: string[];
};

export type WordPressRawDataset = WordPressRawContentItem & {
  relatedReportSlugs?: string[];
  relatedChartSlugs?: string[];
};

export type WordPressRawCorrection = WordPressRawContentItem & {
  targetType?: string;
  targetSlug?: string;
};

export type WordPressRawDirectorPage = WordPressRawContentItem & {
  effectiveDate?: string;
  roleCards?: WordPressRawLabeledTextBlock[];
  stanceTitle?: string;
  stanceDescription?: string;
  stanceCards?: WordPressRawLabeledTextBlock[];
  relatedSummary?: string;
};

export type WordPressRawFinancePage = WordPressRawContentItem & {
  effectiveDate?: string;
  disclosureItems?: WordPressRawLabeledTextBlock[];
  disclosureTable?: WordPressRawLabeledTextBlock[];
  policyItems?: WordPressRawLabeledTextBlock[];
  contactText?: string;
};

export type WordPressRawFinancialStatement = WordPressRawContentItem;

export type WordPressRawEditorialPolicy = WordPressRawContentItem;

export type WordPressRawFundingPage = WordPressRawContentItem & {
  disclosureItems?: WordPressRawLabeledTextBlock[];
};

export type WordPressRawListResponse<T> = ListResponse<T>;

export type WordPressContentSourceHealth = ContentSourceHealth & {
  configured: boolean;
  available: boolean;
  message: string;
};

const DEFAULT_REVALIDATE_SECONDS = 60 * 60;
const WORDPRESS_REST_NAMESPACE = "/wp-json/matsukasa/v1";
const WORDPRESS_COLLECTION_PAGE_SIZE = 100;

type WordPressRequestParams = Record<string, string | undefined>;

function setSearchParamIfPresent(url: URL, key: string, value?: string) {
  const normalizedValue = value?.trim();

  if (normalizedValue) {
    url.searchParams.set(key, normalizedValue);
  }
}

function toWordPressTopicParam(topics?: string[]) {
  const slugs =
    topics
      ?.map((topic) => getTopicSlug(topic).trim())
      .filter(Boolean) ?? [];

  return slugs.length > 0 ? slugs.join(",") : undefined;
}

function applyWordPressRequestParams(url: URL, params?: WordPressRequestParams) {
  Object.entries(params ?? {}).forEach(([key, value]) => {
    setSearchParamIfPresent(url, key, value);
  });
}

function getWordPressApiBaseUrl() {
  const value = process.env.WORDPRESS_API_BASE_URL?.trim();

  if (!value) {
    throw new Error("WORDPRESS_API_BASE_URL is required when CONTENT_SOURCE=wordpress.");
  }

  const baseUrl = value.replace(/\/+$/, "");

  if (baseUrl.endsWith(WORDPRESS_REST_NAMESPACE)) {
    return baseUrl;
  }

  return `${baseUrl}${WORDPRESS_REST_NAMESPACE}`;
}

function getPublishedAt(item: WordPressRawContentItem) {
  return item.publishedAt || item.updatedAt || new Date(0).toISOString();
}

function getUpdatedAt(item: WordPressRawContentItem) {
  return item.updatedAt || item.publishedAt || new Date(0).toISOString();
}

function firstTermName(items?: WordPressRawTopic[], fallback = "") {
  return items?.[0]?.name || fallback;
}

function topicNames(items?: WordPressRawTopic[]) {
  return items?.map((topic) => topic.name).filter(Boolean) ?? [];
}

function toImage(asset: WordPressRawAsset | null | undefined): BlogImage | null {
  if (!asset?.url) {
    return null;
  }

  return {
    url: asset.url,
    alt: asset.alt,
    width: asset.width ?? undefined,
    height: asset.height ?? undefined,
  };
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toBody(item: WordPressRawContentItem) {
  return stripHtml(item.body ?? "");
}

function toSourceLinks(items?: WordPressRawSourceLink[]) {
  return (
    items
      ?.map((item): SourceLink | null => {
        const label = item.label || item.title || item.text || item.url || "";

        if (!label) {
          return null;
        }

        return {
          label,
          url: item.url,
        };
      })
      .filter((item): item is SourceLink => Boolean(item)) ?? []
  );
}

function toCitation(value: WordPressRawCitation | string | undefined): Citation | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value ? { label: "引用", text: value } : null;
  }

  if (!value.text) {
    return null;
  }

  return {
    label: value.label || "引用",
    text: value.text,
    url: value.url,
  };
}

function toTextBlocks(items?: WordPressRawLabeledTextBlock[]): LabeledTextBlock[] {
  return (
    items
      ?.map((item): LabeledTextBlock | null => {
        const title = item.title || item.label || "";
        const body = item.body || item.text || "";

        if (!title && !body) {
          return null;
        }

        return { title, body };
      })
      .filter((item): item is LabeledTextBlock => Boolean(item)) ?? []
  );
}

function asChartType(value?: string): LocalChart["chartType"] {
  const allowed = new Set<LocalChart["chartType"]>([
    "bar",
    "line",
    "pie",
    "band",
    "horizontalBar",
    "donut",
    "stacked100Bar",
    "radar",
    "histogram",
    "boxplot",
    "bubble",
    "scatter",
    "statMap",
    "lorenz",
    "pictogram",
    "stackedArea",
    "stacked-bar",
  ]);

  return value && allowed.has(value as LocalChart["chartType"]) ? (value as LocalChart["chartType"]) : "bar";
}

function toChartData(data?: WordPressRawChartDatum[]) {
  return (
    data
      ?.map((datum) =>
        Object.fromEntries(
          Object.entries(datum).filter((entry): entry is [string, string | number] => {
            const value = entry[1];
            return typeof value === "string" || typeof value === "number";
          }),
        ),
      )
      .filter((datum) => Object.keys(datum).length > 0) ?? []
  );
}

function toTargetType(value?: string): CorrectionEntry["targetType"] {
  const allowed: CorrectionEntry["targetType"][] = ["post", "report", "methodology", "dataset", "chart", "page"];
  return allowed.includes(value as CorrectionEntry["targetType"]) ? (value as CorrectionEntry["targetType"]) : "post";
}

function toPost(item: WordPressRawPost): BlogPost {
  const publishedDate = getPublishedAt(item);

  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt || item.description || "",
    format: item.format || firstTermName(item.formats, "記事"),
    category: item.category || firstTermName(item.formats, "研究ノート"),
    region: item.region || firstTermName(item.regions, "日本"),
    publishedDate,
    authorName: item.authorName || "松笠研究所",
    coverImage: toImage(item.eyecatch),
    topics: topicNames(item.topics),
    researcherSlugs: item.researcherSlugs ?? [],
    methodologySlugs: item.methodologySlugs ?? item.relatedMethodology ?? [],
    methodologySummary: item.methodologyNote ?? "",
    sourceBasis: item.sourceNote ?? "WordPress",
    updatedNote: item.revisionNote ?? "",
    sourceLinks: toSourceLinks(item.sourceLinks ?? item.sources),
    keyFindings: item.keyFindings ?? [],
    body: toBody(item),
    contentBlocks: [],
    createdAt: publishedDate,
    updatedAt: getUpdatedAt(item),
  };
}

function toReport(item: WordPressRawReport): ResearchReport {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    summary: item.description || item.excerpt || "",
    publishedDate: getPublishedAt(item),
    updatedDate: getUpdatedAt(item),
    reportType: item.reportType || firstTermName(item.formats, "調査報告書"),
    region: item.region || firstTermName(item.regions, "日本"),
    topicNames: topicNames(item.topics),
    researcherSlugs: item.researcherSlugs ?? [],
    methodologySlugs: item.methodologySlugs ?? item.relatedMethodology ?? [],
    coverImage: toImage(item.eyecatch),
    pdfUrl: item.pdfUrl,
    figures:
      item.figures?.flatMap((figure, index) =>
        figure.url ? [{ title: figure.alt || `図表 ${index + 1}`, url: figure.url }] : [],
      ) ?? [],
    sourceLinks: toSourceLinks(item.sourceLinks ?? item.sources),
    sourceBasis: item.sourceNote ?? "WordPress",
    body: toBody(item),
    contentBlocks: [],
  };
}

function toMethodology(item: WordPressRawMethodology): MethodologyEntry {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    summary: item.description || item.excerpt || "",
    updatedDate: getUpdatedAt(item),
    reviewer: item.reviewer || "松笠研究所",
    focusTopics: item.focusTopics ?? topicNames(item.topics),
    goodFor: item.goodFor ?? [],
    limits: item.limits ?? [],
    sourceBasis: item.sourceBasis || item.sourceNote || "WordPress",
    body: toBody(item),
  };
}

function toResearcher(item: WordPressRawResearcher): ResearcherProfile {
  return {
    id: String(item.id),
    slug: item.slug,
    name: item.name || item.title,
    role: item.role || "",
    team: item.team || "",
    summary: item.description || item.excerpt || "",
    bio: item.bio || toBody(item),
    portraitImage: toImage(item.portrait ?? item.eyecatch),
    focusTopics: item.focusTopics ?? topicNames(item.topics),
    methodologySlugs: item.methodologySlugs ?? [],
    updatedDate: getUpdatedAt(item),
    email: item.email,
    sourceBasis: item.sourceBasis || item.sourceNote || "WordPress",
  };
}

function toTopic(item: WordPressRawTopic): InstituteTopic {
  return {
    name: item.name,
    description: item.description ?? "",
  };
}

function toDirectorPage(item: WordPressRawDirectorPage): DirectorPageContent {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    summary: item.description || item.excerpt || "",
    body: toBody(item),
    effectiveDate: item.effectiveDate || getPublishedAt(item),
    updatedDate: getUpdatedAt(item),
    roleCards: toTextBlocks(item.roleCards),
    stanceTitle: item.stanceTitle ?? "",
    stanceDescription: item.stanceDescription ?? "",
    stanceCards: toTextBlocks(item.stanceCards),
    relatedSummary: item.relatedSummary ?? "",
  };
}

function toFinancePage(item: WordPressRawFinancePage): FinancePageContent {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    summary: item.description || item.excerpt || "",
    body: toBody(item),
    effectiveDate: item.effectiveDate || getPublishedAt(item),
    updatedDate: getUpdatedAt(item),
    disclosureItems: toTextBlocks(item.disclosureItems),
    disclosureTable: toTextBlocks(item.disclosureTable),
    policyItems: toTextBlocks(item.policyItems),
    contactText: item.contactText ?? "",
  };
}

function toFinancialStatement(item: WordPressRawFinancialStatement): FinancialStatement {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    fiscalYear: item.fiscalYear || item.slug,
    summary: item.description || item.excerpt || "",
    publishedDate: getPublishedAt(item),
    updatedDate: getUpdatedAt(item),
    pdfUrl: item.pdfUrl,
    sourceBasis: item.sourceNote ?? "WordPress",
    highlights: item.highlights ?? [],
    body: toBody(item),
  };
}

function toDataset(item: WordPressRawDataset): DatasetEntry {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    description: item.description || item.excerpt || "",
    publishedDate: getPublishedAt(item),
    updatedDate: getUpdatedAt(item),
    fileUrl: item.fileUrl,
    fileFormat: item.fileFormat || "",
    topics: topicNames(item.topics),
    relatedReportSlugs: item.relatedReportSlugs ?? item.relatedReports ?? [],
    relatedChartSlugs: item.relatedChartSlugs ?? item.relatedCharts ?? [],
    sourceLinks: toSourceLinks(item.sources),
    citation: toCitation(item.citation),
  };
}

function toChart(item: WordPressRawChart): LocalChart {
  const updatedAt = getUpdatedAt(item);

  return {
    type: "chart",
    title: item.title,
    slug: item.slug,
    chartType: asChartType(item.chartType || firstTermName(item.formats)),
    description: item.description || item.excerpt || "",
    data: toChartData(item.data ?? item.chartData),
    sourceNote: item.sourceNote ?? "",
    methodologyNote: item.methodologyNote ?? "",
    createdAt: getPublishedAt(item),
    updatedAt,
  };
}

function toShortReading(item: WordPressRawShortReading): ShortReadingEntry {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt || item.description || "",
    publishedDate: getPublishedAt(item),
    updatedDate: getUpdatedAt(item),
    topicNames: topicNames(item.topics),
    authors: item.authors ?? [],
    readingTime: item.readingTime ?? "",
    body: toBody(item),
  };
}

function toCorrection(item: WordPressRawCorrection): CorrectionEntry {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    summary: item.description || item.excerpt || "",
    targetType: toTargetType(item.targetType),
    targetSlug: item.targetSlug ?? "",
    publishedDate: getPublishedAt(item),
    updatedDate: getUpdatedAt(item),
    body: toBody(item),
  };
}

function toEditorialPolicy(item: WordPressRawEditorialPolicy): EditorialPolicyContent {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    summary: item.description || item.excerpt || "",
    body: toBody(item),
    updatedDate: getUpdatedAt(item),
    sourceLinks: toSourceLinks(item.sources),
  };
}

function toFundingPage(item: WordPressRawFundingPage): FundingPageContent {
  return {
    id: String(item.id),
    slug: item.slug,
    title: item.title,
    summary: item.description || item.excerpt || "",
    body: toBody(item),
    updatedDate: getUpdatedAt(item),
    disclosureItems: toTextBlocks(item.disclosureItems),
    sourceLinks: toSourceLinks(item.sources),
  };
}

async function fetchWordPressJson<T>(
  path: string,
  options?: SourceOptions,
  params?: WordPressRequestParams,
): Promise<T> {
  const url = new URL(`${getWordPressApiBaseUrl()}${path}`);

  if (options?.limit !== undefined) {
    url.searchParams.set("limit", String(options.limit));
  }

  if (options?.offset !== undefined) {
    url.searchParams.set("offset", String(options.offset));
  }

  setSearchParamIfPresent(url, "q", options?.query);
  setSearchParamIfPresent(url, "topic", toWordPressTopicParam(options?.topics));
  applyWordPressRequestParams(url, params);

  const response = await fetch(url, {
    signal: options?.signal,
    next: { revalidate: options?.revalidateSeconds ?? DEFAULT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`WordPress content source request failed: ${response.status} ${url.pathname}`);
  }

  return response.json() as Promise<T>;
}

async function fetchCollection<T>(path: string, options?: SourceOptions, params?: WordPressRequestParams) {
  return fetchWordPressJson<WordPressRawListResponse<T>>(path, {
    ...options,
    limit: options?.limit ?? WORDPRESS_COLLECTION_PAGE_SIZE,
    offset: options?.offset ?? 0,
  }, params);
}

async function fetchAllCollection<T>(path: string, options?: SourceOptions, params?: WordPressRequestParams) {
  const contents: T[] = [];
  let offset = 0;
  let totalCount = 0;

  do {
    const response = await fetchCollection<T>(path, {
      ...options,
      limit: WORDPRESS_COLLECTION_PAGE_SIZE,
      offset,
    }, params);

    contents.push(...response.contents);
    totalCount = response.totalCount;

    if (response.contents.length === 0) {
      break;
    }

    offset += response.contents.length;
  } while (contents.length < totalCount);

  return contents;
}

async function fetchItem<T>(path: string, options?: SourceOptions) {
  return fetchWordPressJson<T>(path, options);
}

async function getAllPosts(options?: SourceOptions) {
  const contents = await fetchAllCollection<WordPressRawPost>("/posts", options);
  return contents.map(toPost);
}

async function getAllReports(options?: SourceOptions) {
  const contents = await fetchAllCollection<WordPressRawReport>("/reports", options);
  return contents.map(toReport);
}

async function getAllPostsByResearcher(slug: string, options?: SourceOptions) {
  const contents = await fetchAllCollection<WordPressRawPost>("/posts", options, { researcher: slug });
  return contents.map(toPost);
}

async function getAllPostsByMethodology(slug: string, options?: SourceOptions) {
  const contents = await fetchAllCollection<WordPressRawPost>("/posts", options, { methodology: slug });
  return contents.map(toPost);
}

async function getAllReportsByResearcher(slug: string, options?: SourceOptions) {
  const contents = await fetchAllCollection<WordPressRawReport>("/reports", options, { researcher: slug });
  return contents.map(toReport);
}

async function getAllReportsByMethodology(slug: string, options?: SourceOptions) {
  const contents = await fetchAllCollection<WordPressRawReport>("/reports", options, { methodology: slug });
  return contents.map(toReport);
}

async function getAllResearchers(options?: SourceOptions) {
  const contents = await fetchAllCollection<WordPressRawResearcher>("/researchers", options);
  return contents.map(toResearcher);
}

async function getAllMethodologies(options?: SourceOptions) {
  const contents = await fetchAllCollection<WordPressRawMethodology>("/methodologies", options);
  return contents.map(toMethodology);
}

export const wordpressContentSource: ContentSource = {
  name: "wordpress",

  getPostsPage: async (params: PostsPageParams = {}, options?: SourceOptions) => {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 8);
    const offset = (page - 1) * limit;
    const response = await fetchCollection<WordPressRawPost>("/posts", {
      ...options,
      limit,
      offset,
      query: params.q ?? options?.query,
      topics: params.topics ?? options?.topics,
    });
    const contents = response.contents.map(toPost);

    return {
      contents,
      totalCount: response.totalCount,
      totalPages: Math.max(1, Math.ceil(response.totalCount / limit)),
      currentPage: page,
      limit,
      offset,
    };
  },
  getAllPostSlugs: async (options) => {
    const posts = await getAllPosts(options);
    return posts.map((post) => post.slug);
  },
  getPostBySlug: async (slug, options) => {
    try {
      return toPost(await fetchItem<WordPressRawPost>(`/posts/${slug}`, options));
    } catch {
      return null;
    }
  },
  getPostsByResearcher: async (slug, options) => {
    return sortByPublishedDate(await getAllPostsByResearcher(slug, options));
  },
  getPostsByMethodology: async (slug, options) => {
    return sortByPublishedDate(await getAllPostsByMethodology(slug, options));
  },

  getReports: async (options) => sortByPublishedDate(await getAllReports(options)),
  getReportBySlug: async (slug, options) => {
    try {
      return toReport(await fetchItem<WordPressRawReport>(`/reports/${slug}`, options));
    } catch {
      return null;
    }
  },
  getReportsByResearcher: async (slug, options) => {
    return sortByPublishedDate(await getAllReportsByResearcher(slug, options));
  },
  getReportsByMethodology: async (slug, options) => {
    return sortByPublishedDate(await getAllReportsByMethodology(slug, options));
  },

  getResearchers: (options) => getAllResearchers(options),
  getResearcherBySlug: async (slug, options) => {
    try {
      return toResearcher(await fetchItem<WordPressRawResearcher>(`/researchers/${slug}`, options));
    } catch {
      return null;
    }
  },

  getMethodologies: (options) => getAllMethodologies(options),
  getMethodologyBySlug: async (slug, options) => {
    try {
      return toMethodology(await fetchItem<WordPressRawMethodology>(`/methodologies/${slug}`, options));
    } catch {
      return null;
    }
  },

  getTopics: async (options) => {
    const contents = await fetchAllCollection<WordPressRawTopic>("/topics", options);
    return contents.map(toTopic);
  },

  getCurrentDirectorPage: async (options) => {
    try {
      return toDirectorPage(await fetchItem<WordPressRawDirectorPage>("/director", options));
    } catch {
      return null;
    }
  },

  getFinancialStatements: async (options) => {
    const contents = await fetchAllCollection<WordPressRawFinancialStatement>("/financial-statements", options);
    return sortFinancialStatements(contents.map(toFinancialStatement));
  },
  getFinancialStatementByYear: async (year, options) => {
    try {
      return toFinancialStatement(await fetchItem<WordPressRawFinancialStatement>(`/financial-statements/${year}`, options));
    } catch {
      return null;
    }
  },

  getCurrentFinancePage: async (options) => {
    try {
      return toFinancePage(await fetchItem<WordPressRawFinancePage>("/finance", options));
    } catch {
      return null;
    }
  },

  getCharts: async (options) => {
    const contents = await fetchAllCollection<WordPressRawChart>("/charts", options);
    return contents.map(toChart);
  },
  getChartBySlug: async (slug, options) => {
    try {
      return toChart(await fetchItem<WordPressRawChart>(`/charts/${slug}`, options));
    } catch {
      return null;
    }
  },
  getChartsBySlug: async (options) => {
    const contents = await fetchAllCollection<WordPressRawChart>("/charts", options);
    return Object.fromEntries(contents.map((chart) => [chart.slug, toChart(chart)])) as LocalChartsBySlug;
  },

  getDatasets: async (options) => {
    const contents = await fetchAllCollection<WordPressRawDataset>("/datasets", options);
    return contents.map(toDataset);
  },
  getDatasetBySlug: async (slug, options) => {
    try {
      return toDataset(await fetchItem<WordPressRawDataset>(`/datasets/${slug}`, options));
    } catch {
      return null;
    }
  },

  getShortReadings: async (options) => {
    const contents = await fetchAllCollection<WordPressRawShortReading>("/short-readings", options);
    return contents.map(toShortReading);
  },
  getShortReadingBySlug: async (slug, options) => {
    try {
      return toShortReading(await fetchItem<WordPressRawShortReading>(`/short-readings/${slug}`, options));
    } catch {
      return null;
    }
  },

  getCorrections: async (options) => {
    try {
      const contents = await fetchAllCollection<WordPressRawCorrection>("/corrections", options);
      return contents.map(toCorrection);
    } catch {
      return [];
    }
  },
  getCorrectionBySlug: async (slug, options) => {
    try {
      return toCorrection(await fetchItem<WordPressRawCorrection>(`/corrections/${slug}`, options));
    } catch {
      return null;
    }
  },
  getEditorialPolicy: async (options) => {
    try {
      return toEditorialPolicy(await fetchItem<WordPressRawEditorialPolicy>("/editorial-policy", options));
    } catch {
      return null;
    }
  },
  getFundingPage: async (options) => {
    try {
      return toFundingPage(await fetchItem<WordPressRawFundingPage>("/funding", options));
    } catch {
      return null;
    }
  },

  getSidebarSnapshot: async (options) => {
    const [researchers, methodologies, reports] = await Promise.all([
      getAllResearchers(options),
      getAllMethodologies(options),
      getAllReports(options),
    ]);

    return {
      featuredResearchers: researchers.slice(0, 2),
      featuredMethodologies: methodologies.slice(0, 2),
      featuredReports: sortByPublishedDate(reports).slice(0, 2),
    };
  },

  getHealth: (): WordPressContentSourceHealth => {
    const configured = Boolean(process.env.WORDPRESS_API_BASE_URL?.trim());

    return {
      name: "wordpress",
      configured,
      available: configured,
      message: configured
        ? "WordPress adapter is configured."
        : "WORDPRESS_API_BASE_URL is required when CONTENT_SOURCE=wordpress.",
    };
  },
};
