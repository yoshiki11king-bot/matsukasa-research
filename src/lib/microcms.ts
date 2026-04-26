import "server-only";

import {
  demoDirectorPages,
  demoFinancePages,
  demoFinancialStatements,
  demoMethodologies,
  demoPosts,
  demoReports,
  demoResearchers,
  demoTopics,
} from "@/lib/demo-content";
import { normalizeHeadingLevel } from "@/lib/content-blocks";
import { parseD3ChartBlock } from "@/lib/d3-chart";
import type {
  AdminCollectionKey,
  AdminDirectorPage,
  AdminEntity,
  AdminFinancePage,
  AdminFinancialStatement,
  AdminMethodology,
  AdminPost,
  AdminReport,
  AdminResearcher,
  BlogImage,
  BlogPost,
  ContentBlock,
  ContentMeta,
  DirectorPageContent,
  FinancePageContent,
  FinancialStatement,
  FigureAttachment,
  InstituteTopic,
  LabeledTextBlock,
  MethodologyEntry,
  ResearchReport,
  ResearcherProfile,
  SourceLink,
  PostsPage,
  PostStatus,
} from "@/lib/types";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

const endpointMap = {
  posts: process.env.MICROCMS_POSTS_ENDPOINT ?? process.env.MICROCMS_ENDPOINT ?? "posts",
  researchers: process.env.MICROCMS_RESEARCHERS_ENDPOINT ?? "researchers",
  methodologies: process.env.MICROCMS_METHODOLOGIES_ENDPOINT ?? "methodologies",
  reports: process.env.MICROCMS_REPORTS_ENDPOINT ?? "reports",
  director: process.env.MICROCMS_DIRECTOR_ENDPOINT ?? "director",
  finance: process.env.MICROCMS_FINANCE_ENDPOINT ?? "finance",
  financialStatements:
    process.env.MICROCMS_FINANCIAL_STATEMENTS_ENDPOINT ?? "financial-statements",
} satisfies Record<AdminCollectionKey, string>;

const publicTagMap = {
  posts: "posts",
  researchers: "researchers",
  methodologies: "methodologies",
  reports: "reports",
  director: "director",
  finance: "finance",
  financialStatements: "financial-statements",
} satisfies Record<AdminCollectionKey, string>;

const optionalCollections = new Set<AdminCollectionKey>([
  "director",
  "finance",
  "financialStatements",
]);

class MicroCMSRequestError extends Error {
  status: number;
  path: string;

  constructor(status: number, path: string, detail?: string) {
    super(detail || `microCMS request failed with ${status}`);
    this.name = "MicroCMSRequestError";
    this.status = status;
    this.path = path;
  }
}

type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

type MicroCMSManagementMeta = ContentMeta & {
  id: string;
};

type MicroCMSImage = BlogImage | string | null | undefined;

type MicroCMSPost = {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  format?: string;
  category?: string;
  region?: string;
  publishedDate?: string;
  authorName?: string;
  coverImage?: MicroCMSImage;
  coverImageUrl?: string;
  topicsText?: string | string[];
  researcherSlugsText?: string | string[];
  methodologySlugsText?: string | string[];
  methodologySummary?: string;
  sourceBasis?: string;
  updatedNote?: string;
  sourceLinksText?: string | string[];
  keyFindingsText?: string | string[];
  keyFindings?: string | string[];
  body?: string;
  contentBlocks?: MicroCMSPostBlock[];
  createdAt?: string;
  updatedAt?: string;
};

type MicroCMSPostBlock =
  | {
      fieldId: "block_heading";
      text?: string;
      level?: string | string[];
    }
  | {
      fieldId: "block_paragraph";
      body?: string;
    }
  | {
      fieldId: "block_image";
      image?: MicroCMSImage;
      caption?: string;
      alt?: string;
      sourceText?: string;
    }
  | {
      fieldId: "block_link";
      title?: string;
      url?: string;
      description?: string;
    }
  | {
      fieldId?: string;
      [key: string]: unknown;
    };

type MicroCMSResearcher = {
  id: string;
  slug?: string;
  name?: string;
  role?: string;
  team?: string;
  summary?: string;
  bio?: string;
  portraitImage?: MicroCMSImage;
  portraitImageUrl?: string;
  focusTopicsText?: string | string[];
  methodologySlugsText?: string | string[];
  updatedDate?: string;
  email?: string;
  sourceBasis?: string;
  createdAt?: string;
  updatedAt?: string;
};

type MicroCMSMethodology = {
  id: string;
  slug?: string;
  title?: string;
  summary?: string;
  updatedDate?: string;
  reviewer?: string;
  focusTopicsText?: string | string[];
  goodForText?: string | string[];
  limitsText?: string | string[];
  sourceBasis?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
};

type MicroCMSReport = {
  id: string;
  slug?: string;
  title?: string;
  summary?: string;
  publishedDate?: string;
  updatedDate?: string;
  reportType?: string;
  region?: string;
  topicNamesText?: string | string[];
  researcherSlugsText?: string | string[];
  methodologySlugsText?: string | string[];
  coverImage?: MicroCMSImage;
  coverImageUrl?: string;
  pdfUrl?: string;
  figuresText?: string | string[];
  sourceLinksText?: string | string[];
  sourceBasis?: string;
  body?: string;
  contentBlocks?: MicroCMSPostBlock[];
  createdAt?: string;
  updatedAt?: string;
};

type MicroCMSDirectorPage = {
  id: string;
  slug?: string;
  title?: string;
  summary?: string;
  body?: string;
  effectiveDate?: string;
  updatedDate?: string;
  roleCardsText?: string | string[];
  stanceTitle?: string;
  stanceDescription?: string;
  stanceCardsText?: string | string[];
  relatedSummary?: string;
  createdAt?: string;
  updatedAt?: string;
};

type MicroCMSFinancePage = {
  id: string;
  slug?: string;
  title?: string;
  summary?: string;
  body?: string;
  effectiveDate?: string;
  updatedDate?: string;
  disclosureItemsText?: string | string[];
  disclosureTableText?: string | string[];
  policyItemsText?: string | string[];
  contactText?: string;
  createdAt?: string;
  updatedAt?: string;
};

type MicroCMSFinancialStatement = {
  id: string;
  slug?: string;
  title?: string;
  fiscalYear?: string;
  summary?: string;
  publishedDate?: string;
  updatedDate?: string;
  pdfUrl?: string;
  highlightsText?: string | string[];
  sourceBasis?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CollectionResponseMap = {
  posts: BlogPost;
  researchers: ResearcherProfile;
  methodologies: MethodologyEntry;
  reports: ResearchReport;
  director: DirectorPageContent;
  finance: FinancePageContent;
  financialStatements: FinancialStatement;
};

type CollectionRawMap = {
  posts: MicroCMSPost;
  researchers: MicroCMSResearcher;
  methodologies: MicroCMSMethodology;
  reports: MicroCMSReport;
  director: MicroCMSDirectorPage;
  finance: MicroCMSFinancePage;
  financialStatements: MicroCMSFinancialStatement;
};

type PostListParams = {
  page?: number;
  limit?: number;
  q?: string;
  topics?: string[];
};

function buildApiUrl(path: string, management = false) {
  if (!serviceDomain) {
    throw new Error("MICROCMS_SERVICE_DOMAIN is not configured.");
  }

  const host = management
    ? `https://${serviceDomain}.microcms-management.io/api/v1`
    : `https://${serviceDomain}.microcms.io/api/v1`;

  return `${host}${path}`;
}

function toSearchParams(params?: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

async function microcmsFetch<T>(
  path: string,
  options?: {
    management?: boolean;
    method?: string;
    searchParams?: Record<string, string | number | undefined>;
    body?: BodyInit | null;
    contentType?: string | null;
    cache?: RequestCache;
    nextConfig?: NextFetchRequestConfig;
  },
) {
  if (!serviceDomain || !apiKey) {
    throw new Error("microCMS is not configured.");
  }

  const search = toSearchParams(options?.searchParams);
  const url = `${buildApiUrl(path, options?.management)}${search ? `?${search}` : ""}`;
  const headers = new Headers({
    "X-MICROCMS-API-KEY": apiKey,
  });

  if (options?.contentType) {
    headers.set("Content-Type", options.contentType);
  }

  const response = await fetch(url, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body ?? undefined,
    cache: options?.cache,
    next: options?.nextConfig,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new MicroCMSRequestError(response.status, path, detail);
  }

  if (response.status === 202 || response.status === 204) {
    return "Accepted" as T;
  }

  return (await response.json()) as T;
}

function isOptionalCollection(collection: AdminCollectionKey) {
  return optionalCollections.has(collection);
}

function shouldFallbackToDemoContent(collection: AdminCollectionKey, error: unknown) {
  return (
    isOptionalCollection(collection) &&
    error instanceof MicroCMSRequestError &&
    (error.status === 400 || error.status === 404)
  );
}

function shouldFallbackToDemoManagement(collection: AdminCollectionKey, error: unknown) {
  return (
    isOptionalCollection(collection) &&
    error instanceof MicroCMSRequestError &&
    (error.status === 400 || error.status === 404 || error.status === 500)
  );
}

function parseTextList(value?: string | string[]) {
  const raw = Array.isArray(value) ? value.join("\n") : value ?? "";

  return raw
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSourceLinks(value?: string | string[]) {
  return parseTextList(value).map((line) => {
    const [label, url] = line.split("|").map((item) => item.trim());
    return {
      label,
      url: url || undefined,
    } satisfies SourceLink;
  });
}

function parseFigureAttachments(value?: string | string[]) {
  return parseTextList(value).map((line, index) => {
    const [title, url] = line.split("|").map((item) => item.trim());
    return {
      title: url ? title : `図表 ${index + 1}`,
      url: url || title,
    } satisfies FigureAttachment;
  });
}

function parseLabeledBlocks(value?: string | string[]) {
  const raw = Array.isArray(value) ? value.join("\n") : value ?? "";

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, body] = line.split("|").map((item) => item.trim());
      return {
        title: title || "未設定",
        body: body || "",
      } satisfies LabeledTextBlock;
    });
}

function normalizeImage(image?: MicroCMSImage, fallbackUrl?: string) {
  if (typeof image === "string") {
    return {
      url: image,
      alt: "",
    } satisfies BlogImage;
  }

  if (image?.url) {
    return {
      url: image.url,
      width: image.width,
      height: image.height,
      alt: image.alt ?? "",
    } satisfies BlogImage;
  }

  if (fallbackUrl) {
    return {
      url: fallbackUrl,
      alt: "",
    } satisfies BlogImage;
  }

  return null;
}

function normalizeContentBlocks(blocks?: MicroCMSPostBlock[]) {
  if (!Array.isArray(blocks)) {
    return [] satisfies ContentBlock[];
  }

  return blocks.reduce<ContentBlock[]>((items, block) => {
    if (block.fieldId === "block_heading") {
      const headingBlock = block as Extract<MicroCMSPostBlock, { fieldId: "block_heading" }>;
      const text = typeof headingBlock.text === "string" ? headingBlock.text.trim() : "";

      if (!text) {
        return items;
      }

      items.push({
        type: "heading",
        text,
        level: normalizeHeadingLevel(headingBlock.level),
      });
      return items;
    }

    if (block.fieldId === "block_paragraph") {
      const paragraphBlock = block as Extract<MicroCMSPostBlock, { fieldId: "block_paragraph" }>;
      const body = typeof paragraphBlock.body === "string" ? paragraphBlock.body.trim() : "";

      if (!body) {
        return items;
      }

      const d3ChartBlock = parseD3ChartBlock(body);

      if (d3ChartBlock) {
        items.push(d3ChartBlock);
        return items;
      }

      items.push({ type: "paragraph", body });
      return items;
    }

    if (block.fieldId === "block_image") {
      const imageBlock = block as Extract<MicroCMSPostBlock, { fieldId: "block_image" }>;
      const image = normalizeImage(imageBlock.image);

      if (!image) {
        return items;
      }

      const caption = typeof imageBlock.caption === "string" ? imageBlock.caption.trim() : "";
      const alt = typeof imageBlock.alt === "string" ? imageBlock.alt.trim() : "";
      const sourceText = typeof imageBlock.sourceText === "string" ? imageBlock.sourceText.trim() : "";

      items.push({
        type: "image",
        image,
        caption: caption || undefined,
        alt: alt || undefined,
        sourceText: sourceText || undefined,
      });
      return items;
    }

    if (block.fieldId === "block_link") {
      const linkBlock = block as Extract<MicroCMSPostBlock, { fieldId: "block_link" }>;
      const title = typeof linkBlock.title === "string" ? linkBlock.title.trim() : "";
      const url = typeof linkBlock.url === "string" ? linkBlock.url.trim() : "";
      const description = typeof linkBlock.description === "string" ? linkBlock.description.trim() : "";

      if (!title || !url) {
        return items;
      }

      items.push({
        type: "link",
        title,
        url,
        description: description || undefined,
      });
      return items;
    }

    return items;
  }, []);
}

function normalizePost(post: MicroCMSPost): BlogPost {
  return {
    id: post.id,
    slug: post.slug ?? post.id,
    title: post.title ?? "Untitled",
    excerpt: post.excerpt ?? "",
    format: post.format ?? "調査報告",
    category: post.category ?? "研究ノート",
    region: post.region ?? "全国",
    publishedDate: post.publishedDate ?? post.createdAt ?? new Date().toISOString(),
    authorName: post.authorName ?? "松笠研究所",
    coverImage: normalizeImage(post.coverImage, post.coverImageUrl),
    topics: parseTextList(post.topicsText),
    researcherSlugs: parseTextList(post.researcherSlugsText),
    methodologySlugs: parseTextList(post.methodologySlugsText),
    methodologySummary: post.methodologySummary ?? "",
    sourceBasis: post.sourceBasis ?? "",
    updatedNote: post.updatedNote ?? "",
    sourceLinks: parseSourceLinks(post.sourceLinksText),
    keyFindings: parseTextList(post.keyFindings ?? post.keyFindingsText),
    body: post.body ?? "",
    contentBlocks: normalizeContentBlocks(post.contentBlocks),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function normalizeResearcher(researcher: MicroCMSResearcher): ResearcherProfile {
  return {
    id: researcher.id,
    slug: researcher.slug ?? researcher.id,
    name: researcher.name ?? "No Name",
    role: researcher.role ?? "研究員",
    team: researcher.team ?? "研究ユニット",
    summary: researcher.summary ?? "",
    bio: researcher.bio ?? "",
    portraitImage: normalizeImage(researcher.portraitImage, researcher.portraitImageUrl),
    focusTopics: parseTextList(researcher.focusTopicsText),
    methodologySlugs: parseTextList(researcher.methodologySlugsText),
    updatedDate: researcher.updatedDate ?? researcher.updatedAt ?? new Date().toISOString(),
    email: researcher.email ?? "",
    sourceBasis: researcher.sourceBasis ?? "",
    isDemo: false,
  };
}

function normalizeMethodology(methodology: MicroCMSMethodology): MethodologyEntry {
  return {
    id: methodology.id,
    slug: methodology.slug ?? methodology.id,
    title: methodology.title ?? "Untitled",
    summary: methodology.summary ?? "",
    updatedDate: methodology.updatedDate ?? methodology.updatedAt ?? new Date().toISOString(),
    reviewer: methodology.reviewer ?? "松笠研究所",
    focusTopics: parseTextList(methodology.focusTopicsText),
    goodFor: parseTextList(methodology.goodForText),
    limits: parseTextList(methodology.limitsText),
    sourceBasis: methodology.sourceBasis ?? "",
    body: methodology.body ?? "",
    isDemo: false,
  };
}

function normalizeReport(report: MicroCMSReport): ResearchReport {
  return {
    id: report.id,
    slug: report.slug ?? report.id,
    title: report.title ?? "Untitled",
    summary: report.summary ?? "",
    publishedDate: report.publishedDate ?? report.createdAt ?? new Date().toISOString(),
    updatedDate: report.updatedDate ?? report.updatedAt ?? new Date().toISOString(),
    reportType: report.reportType ?? "調査報告書",
    region: report.region ?? "全国",
    topicNames: parseTextList(report.topicNamesText),
    researcherSlugs: parseTextList(report.researcherSlugsText),
    methodologySlugs: parseTextList(report.methodologySlugsText),
    coverImage: normalizeImage(report.coverImage, report.coverImageUrl),
    pdfUrl: report.pdfUrl ?? "",
    figures: parseFigureAttachments(report.figuresText),
    sourceLinks: parseSourceLinks(report.sourceLinksText),
    sourceBasis: report.sourceBasis ?? "",
    body: report.body ?? "",
    contentBlocks: normalizeContentBlocks(report.contentBlocks),
    isDemo: false,
  };
}

function normalizeDirectorPage(page: MicroCMSDirectorPage): DirectorPageContent {
  return {
    id: page.id,
    slug: page.slug ?? "director",
    title: page.title ?? "所長から",
    summary: page.summary ?? "",
    body: page.body ?? "",
    effectiveDate: page.effectiveDate ?? page.createdAt ?? new Date().toISOString(),
    updatedDate: page.updatedDate ?? page.updatedAt ?? new Date().toISOString(),
    roleCards: parseLabeledBlocks(page.roleCardsText),
    stanceTitle: page.stanceTitle ?? "判断の速さより、公開の筋を重視します",
    stanceDescription: page.stanceDescription ?? "",
    stanceCards: parseLabeledBlocks(page.stanceCardsText),
    relatedSummary: page.relatedSummary ?? "",
    isDemo: false,
  };
}

function normalizeFinancePage(page: MicroCMSFinancePage): FinancePageContent {
  return {
    id: page.id,
    slug: page.slug ?? "finance",
    title: page.title ?? "財務情報の公開",
    summary: page.summary ?? "",
    body: page.body ?? "",
    effectiveDate: page.effectiveDate ?? page.createdAt ?? new Date().toISOString(),
    updatedDate: page.updatedDate ?? page.updatedAt ?? new Date().toISOString(),
    disclosureItems: parseLabeledBlocks(page.disclosureItemsText),
    disclosureTable: parseLabeledBlocks(page.disclosureTableText),
    policyItems: parseLabeledBlocks(page.policyItemsText),
    contactText: page.contactText ?? "",
    isDemo: false,
  };
}

function normalizeFinancialStatement(statement: MicroCMSFinancialStatement): FinancialStatement {
  return {
    id: statement.id,
    slug: statement.slug ?? statement.id,
    title: statement.title ?? "決算資料",
    fiscalYear: statement.fiscalYear ?? "未設定",
    summary: statement.summary ?? "",
    publishedDate: statement.publishedDate ?? statement.createdAt ?? new Date().toISOString(),
    updatedDate: statement.updatedDate ?? statement.updatedAt ?? new Date().toISOString(),
    pdfUrl: statement.pdfUrl ?? "",
    sourceBasis: statement.sourceBasis ?? "",
    highlights: parseTextList(statement.highlightsText),
    body: statement.body ?? "",
    isDemo: false,
  };
}

function normalizeByCollection<K extends AdminCollectionKey>(
  collection: K,
  item: CollectionRawMap[K],
): CollectionResponseMap[K] {
  switch (collection) {
    case "posts":
      return normalizePost(item as MicroCMSPost) as CollectionResponseMap[K];
    case "researchers":
      return normalizeResearcher(item as MicroCMSResearcher) as CollectionResponseMap[K];
    case "methodologies":
      return normalizeMethodology(item as MicroCMSMethodology) as CollectionResponseMap[K];
    case "reports":
      return normalizeReport(item as MicroCMSReport) as CollectionResponseMap[K];
    case "director":
      return normalizeDirectorPage(item as MicroCMSDirectorPage) as CollectionResponseMap[K];
    case "finance":
      return normalizeFinancePage(item as MicroCMSFinancePage) as CollectionResponseMap[K];
    case "financialStatements":
      return normalizeFinancialStatement(item as MicroCMSFinancialStatement) as CollectionResponseMap[K];
  }
}

function getDemoCollection<K extends AdminCollectionKey>(collection: K): CollectionResponseMap[K][] {
  switch (collection) {
    case "posts":
      return demoPosts as CollectionResponseMap[K][];
    case "researchers":
      return demoResearchers as CollectionResponseMap[K][];
    case "methodologies":
      return demoMethodologies as CollectionResponseMap[K][];
    case "reports":
      return demoReports as CollectionResponseMap[K][];
    case "director":
      return demoDirectorPages as CollectionResponseMap[K][];
    case "finance":
      return demoFinancePages as CollectionResponseMap[K][];
    case "financialStatements":
      return demoFinancialStatements as CollectionResponseMap[K][];
  }
}

function withDemoMeta<T extends { publishedDate?: string; updatedDate?: string }>(item: T): T & ContentMeta {
  const stamp = item.updatedDate ?? item.publishedDate ?? new Date().toISOString();
  return {
    ...item,
    createdAt: stamp,
    updatedAt: stamp,
    publishedAt: stamp,
    revisedAt: stamp,
    closedAt: null,
    draftKey: null,
    status: ["PUBLISH"] satisfies PostStatus[],
  };
}

async function getAllCollectionItems<K extends AdminCollectionKey>(collection: K) {
  if (!serviceDomain || !apiKey) {
    return getDemoCollection(collection);
  }

  try {
    const contents: CollectionResponseMap[K][] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await microcmsFetch<MicroCMSListResponse<CollectionRawMap[K]>>(
        `/${endpointMap[collection]}`,
        {
          searchParams: {
            limit,
            offset,
            orders:
              collection === "researchers"
                ? "-updatedDate,-createdAt"
                : collection === "methodologies"
                  ? "-updatedDate,-createdAt"
                  : collection === "director" || collection === "finance"
                    ? "-effectiveDate,-updatedDate,-createdAt"
                    : collection === "financialStatements"
                      ? "-publishedDate,-updatedDate,-createdAt"
                      : "-publishedDate,-createdAt",
          },
          cache: "force-cache",
          nextConfig: { revalidate: 300, tags: [publicTagMap[collection]] },
        },
      );

      contents.push(...response.contents.map((item) => normalizeByCollection(collection, item)));
      offset += response.limit;

      if (offset >= response.totalCount) {
        break;
      }
    }

    return contents;
  } catch (error) {
    if (shouldFallbackToDemoContent(collection, error)) {
      return getDemoCollection(collection);
    }

    throw error;
  }
}

function pickActiveVersion<T extends { effectiveDate: string }>(items: T[]) {
  if (items.length === 0) {
    return null;
  }

  const now = Date.now();
  const sorted = [...items].sort(
    (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime(),
  );

  return sorted.find((item) => new Date(item.effectiveDate).getTime() <= now) ?? sorted[0];
}

function matchQuery(post: BlogPost, query?: string) {
  const normalized = query?.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    post.title,
    post.excerpt,
    post.body,
    post.authorName,
    post.category,
    post.region,
    post.topics.join(" "),
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function matchTopics(post: BlogPost, topics?: string[]) {
  if (!topics || topics.length === 0) {
    return true;
  }

  return topics.every((topic) => post.topics.includes(topic));
}

export const cmsStatus = {
  configured: Boolean(serviceDomain && apiKey),
};

export async function getPostsPage(params: PostListParams = {}): Promise<PostsPage> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 8;
  const allPosts = await getAllCollectionItems("posts");
  const filtered = allPosts.filter((post) => matchQuery(post, params.q) && matchTopics(post, params.topics));
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

export async function getAllPostSlugs() {
  const posts = await getAllCollectionItems("posts");
  return posts.map((post) => post.slug);
}

export async function getPostBySlug(slug: string) {
  const posts = await getAllCollectionItems("posts");
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostsByResearcher(slug: string) {
  const posts = await getAllCollectionItems("posts");
  return posts.filter((post) => post.researcherSlugs.includes(slug));
}

export async function getPostsByMethodology(slug: string) {
  const posts = await getAllCollectionItems("posts");
  return posts.filter((post) => post.methodologySlugs.includes(slug));
}

export async function getResearchers() {
  return getAllCollectionItems("researchers");
}

export async function getResearcherBySlug(slug: string) {
  const researchers = await getAllCollectionItems("researchers");
  return researchers.find((researcher) => researcher.slug === slug) ?? null;
}

export async function getMethodologies() {
  return getAllCollectionItems("methodologies");
}

export async function getMethodologyBySlug(slug: string) {
  const methodologies = await getAllCollectionItems("methodologies");
  return methodologies.find((entry) => entry.slug === slug) ?? null;
}

export async function getReports() {
  return getAllCollectionItems("reports");
}

export async function getReportBySlug(slug: string) {
  const reports = await getAllCollectionItems("reports");
  return reports.find((report) => report.slug === slug) ?? null;
}

export async function getReportsByResearcher(slug: string) {
  const reports = await getAllCollectionItems("reports");
  return reports.filter((report) => report.researcherSlugs.includes(slug));
}

export async function getReportsByMethodology(slug: string) {
  const reports = await getAllCollectionItems("reports");
  return reports.filter((report) => report.methodologySlugs.includes(slug));
}

export async function getDirectorPages() {
  return getAllCollectionItems("director");
}

export async function getCurrentDirectorPage() {
  const pages = await getDirectorPages();
  return pickActiveVersion(pages) ?? demoDirectorPages[0] ?? null;
}

export async function getFinancePages() {
  return getAllCollectionItems("finance");
}

export async function getCurrentFinancePage() {
  const pages = await getFinancePages();
  return pickActiveVersion(pages);
}

export async function getFinancialStatements() {
  return getAllCollectionItems("financialStatements");
}

export async function getTopics() {
  const [posts, researchers, methodologies, reports] = await Promise.all([
    getAllCollectionItems("posts"),
    getAllCollectionItems("researchers"),
    getAllCollectionItems("methodologies"),
    getAllCollectionItems("reports"),
  ]);

  const map = new Map(demoTopics.map((topic) => [topic.name, topic.description]));

  for (const topic of [
    ...posts.flatMap((post) => post.topics),
    ...researchers.flatMap((researcher) => researcher.focusTopics),
    ...methodologies.flatMap((entry) => entry.focusTopics),
    ...reports.flatMap((report) => report.topicNames),
  ]) {
    if (!map.has(topic)) {
      map.set(topic, `${topic}に関する調査と解説をまとめています。`);
    }
  }

  return [...map.entries()]
    .map(([name, description]) => ({ name, description } satisfies InstituteTopic))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

export async function getSidebarSnapshot() {
  const [researchers, methodologies, reports] = await Promise.all([
    getResearchers(),
    getMethodologies(),
    getReports(),
  ]);

  return {
    featuredResearchers: researchers.slice(0, 2),
    featuredMethodologies: methodologies.slice(0, 2),
    featuredReports: reports.slice(0, 2),
  };
}

async function getManagementMetas(collection: AdminCollectionKey) {
  return microcmsFetch<MicroCMSListResponse<MicroCMSManagementMeta>>(
    `/contents/${endpointMap[collection]}`,
    {
      management: true,
      searchParams: {
        limit: 100,
      },
      cache: "no-store",
    },
  );
}

async function getContentById<K extends AdminCollectionKey>(
  collection: K,
  id: string,
  draftKey?: string | null,
) {
  const response = await microcmsFetch<CollectionRawMap[K]>(`/${endpointMap[collection]}/${id}`, {
    searchParams: {
      draftKey: draftKey ?? undefined,
    },
    cache: "no-store",
  });

  return normalizeByCollection(collection, response);
}

export async function getAdminCollection<K extends AdminCollectionKey>(collection: K) {
  if (!serviceDomain || !apiKey) {
    return getDemoCollection(collection).map((item) => withDemoMeta(item)) as Array<
      CollectionResponseMap[K] & ContentMeta
    >;
  }

  try {
    const metaResponse = await getManagementMetas(collection);
    const metas = [...metaResponse.contents].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    const draftMetas = metas.filter((meta) => meta.draftKey);
    const liveIds = metas.filter((meta) => !meta.draftKey).map((meta) => meta.id);
    const liveMap = new Map<string, CollectionResponseMap[K]>();

    if (liveIds.length > 0) {
      const contentResponse = await microcmsFetch<MicroCMSListResponse<CollectionRawMap[K]>>(
        `/${endpointMap[collection]}`,
        {
          searchParams: {
            ids: liveIds.join(","),
            limit: liveIds.length,
          },
          cache: "no-store",
        },
      );

      for (const content of contentResponse.contents) {
        liveMap.set(content.id, normalizeByCollection(collection, content));
      }
    }

    const draftItems = await Promise.all(
      draftMetas.map(async (meta) => {
        try {
          const content = await getContentById(collection, meta.id, meta.draftKey);
          return [meta.id, content] as const;
        } catch (error) {
          console.error("Failed to load draft content", error);
          return [meta.id, null] as const;
        }
      }),
    );

    for (const [id, content] of draftItems) {
      if (content) {
        liveMap.set(id, content);
      }
    }

    return metas.flatMap((meta) => {
      const content = liveMap.get(meta.id);

      if (!content) {
        return [];
      }

      return [
        {
          ...content,
          ...meta,
        } as CollectionResponseMap[K] & ContentMeta,
      ];
    });
  } catch (error) {
    if (shouldFallbackToDemoManagement(collection, error)) {
      return getDemoCollection(collection).map((item) => withDemoMeta(item)) as Array<
        CollectionResponseMap[K] & ContentMeta
      >;
    }

    throw error;
  }
}

export async function getAdminEntity<K extends AdminCollectionKey>(collection: K, id: string) {
  if (!serviceDomain || !apiKey) {
    const item = getDemoCollection(collection).find((entry) => entry.id === id || entry.slug === id);
    return item ? (withDemoMeta(item) as CollectionResponseMap[K] & ContentMeta) : null;
  }

  try {
    const meta = await microcmsFetch<MicroCMSManagementMeta>(`/contents/${endpointMap[collection]}/${id}`, {
      management: true,
      cache: "no-store",
    });
    const content = await getContentById(collection, id, meta.draftKey);

    return {
      ...content,
      ...meta,
    } as CollectionResponseMap[K] & ContentMeta;
  } catch (error) {
    if (shouldFallbackToDemoManagement(collection, error)) {
      const item = getDemoCollection(collection).find((entry) => entry.id === id || entry.slug === id);
      return item ? (withDemoMeta(item) as CollectionResponseMap[K] & ContentMeta) : null;
    }

    throw error;
  }
}

export async function createCollectionItem(
  collection: AdminCollectionKey,
  payload: Record<string, unknown>,
  saveAsDraft: boolean,
) {
  const response = await microcmsFetch<{ id: string }>(`/${endpointMap[collection]}`, {
    method: "POST",
    searchParams: {
      status: saveAsDraft ? "draft" : undefined,
    },
    body: JSON.stringify(payload),
    contentType: "application/json",
    cache: "no-store",
  });

  return response.id;
}

export async function updateCollectionItem(
  collection: AdminCollectionKey,
  id: string,
  payload: Record<string, unknown>,
  saveAsDraft: boolean,
) {
  const response = await microcmsFetch<{ id: string }>(`/${endpointMap[collection]}/${id}`, {
    method: "PATCH",
    searchParams: {
      status: saveAsDraft ? "draft" : undefined,
    },
    body: JSON.stringify(payload),
    contentType: "application/json",
    cache: "no-store",
  });

  return response.id;
}

export async function changeCollectionStatus(
  collection: AdminCollectionKey,
  id: string,
  status: "PUBLISH" | "DRAFT",
) {
  await microcmsFetch(`/contents/${endpointMap[collection]}/${id}/status`, {
    management: true,
    method: "PATCH",
    body: JSON.stringify({ status: [status] }),
    contentType: "application/json",
    cache: "no-store",
  });
}

export async function deleteCollectionItem(collection: AdminCollectionKey, id: string) {
  await microcmsFetch<string>(`/${endpointMap[collection]}/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });
}

export async function uploadAsset(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await microcmsFetch<{ url: string }>("/media", {
    management: true,
    method: "POST",
    body: formData,
    contentType: null,
    cache: "no-store",
  });

  return response.url;
}

export function getCollectionLabel(collection: AdminCollectionKey) {
  switch (collection) {
    case "posts":
      return "記事";
    case "researchers":
      return "研究員";
    case "methodologies":
      return "方法論";
    case "reports":
      return "報告書";
    case "director":
      return "所長ページ";
    case "finance":
      return "財務ページ";
    case "financialStatements":
      return "決算資料";
  }
}

export function isAdminCollectionKey(value: string): value is AdminCollectionKey {
  return value in endpointMap;
}

export function getPublicTag(collection: AdminCollectionKey) {
  return publicTagMap[collection];
}

export function getEntityTitle(entity: AdminEntity, collection: AdminCollectionKey) {
  switch (collection) {
    case "researchers":
      return (entity as AdminResearcher).name;
    case "methodologies":
      return (entity as AdminMethodology).title;
    case "reports":
      return (entity as AdminReport).title;
    case "director":
      return (entity as AdminDirectorPage).title;
    case "finance":
      return (entity as AdminFinancePage).title;
    case "financialStatements":
      return (entity as AdminFinancialStatement).title;
    case "posts":
    default:
      return (entity as AdminPost).title;
  }
}
