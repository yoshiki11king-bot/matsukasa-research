import type {
  BlogPost,
  CorrectionEntry,
  DatasetEntry,
  DirectorPageContent,
  EditorialPolicyContent,
  FinancePageContent,
  FinancialStatement,
  FundingPageContent,
  InstituteTopic,
  MethodologyEntry,
  PostsPage,
  ResearchReport,
  ResearcherProfile,
  ShortReadingEntry,
} from "@/lib/types";
import type { LocalChart, LocalChartsBySlug } from "@/lib/content/types";

export type ContentSourceName = "microcms" | "local" | "wordpress";

export type PublishedStatus = "draft" | "published" | "all";

export type ListResponse<T> = {
  contents: T[];
  totalCount: number;
  limit: number;
  offset: number;
};

export type SourceOptions = {
  limit?: number;
  offset?: number;
  query?: string;
  topics?: string[];
  status?: PublishedStatus;
  revalidateSeconds?: number;
  signal?: AbortSignal;
};

export type PostsPageParams = {
  page?: number;
  limit?: number;
  q?: string;
  topics?: string[];
};

export type ContentSourceHealth = {
  name: ContentSourceName;
  configured: boolean;
  fallbackEnabled?: boolean;
};

export type SidebarSnapshot = {
  featuredResearchers: ResearcherProfile[];
  featuredMethodologies: MethodologyEntry[];
  featuredReports: ResearchReport[];
};

export interface ContentSource {
  readonly name: ContentSourceName;

  getPostsPage(params?: PostsPageParams, options?: SourceOptions): Promise<PostsPage>;
  getAllPostSlugs(options?: SourceOptions): Promise<string[]>;
  getPostBySlug(slug: string, options?: SourceOptions): Promise<BlogPost | null>;
  getPostsByResearcher(slug: string, options?: SourceOptions): Promise<BlogPost[]>;
  getPostsByMethodology(slug: string, options?: SourceOptions): Promise<BlogPost[]>;

  getReports(options?: SourceOptions): Promise<ResearchReport[]>;
  getReportBySlug(slug: string, options?: SourceOptions): Promise<ResearchReport | null>;
  getReportsByResearcher(slug: string, options?: SourceOptions): Promise<ResearchReport[]>;
  getReportsByMethodology(slug: string, options?: SourceOptions): Promise<ResearchReport[]>;

  getResearchers(options?: SourceOptions): Promise<ResearcherProfile[]>;
  getResearcherBySlug?(slug: string, options?: SourceOptions): Promise<ResearcherProfile | null>;

  getMethodologies(options?: SourceOptions): Promise<MethodologyEntry[]>;
  getMethodologyBySlug?(slug: string, options?: SourceOptions): Promise<MethodologyEntry | null>;

  getTopics?(options?: SourceOptions): Promise<InstituteTopic[]>;

  getCurrentDirectorPage(options?: SourceOptions): Promise<DirectorPageContent | null>;

  getFinancialStatements(options?: SourceOptions): Promise<FinancialStatement[]>;
  getFinancialStatementByYear?(year: string, options?: SourceOptions): Promise<FinancialStatement | null>;

  getCurrentFinancePage(options?: SourceOptions): Promise<FinancePageContent | null>;

  getCharts?(options?: SourceOptions): Promise<LocalChart[]>;
  getChartBySlug?(slug: string, options?: SourceOptions): Promise<LocalChart | null>;
  getChartsBySlug?(options?: SourceOptions): Promise<LocalChartsBySlug>;

  getDatasets?(options?: SourceOptions): Promise<DatasetEntry[]>;
  getDatasetBySlug?(slug: string, options?: SourceOptions): Promise<DatasetEntry | null>;

  getShortReadings?(options?: SourceOptions): Promise<ShortReadingEntry[]>;
  getShortReadingBySlug?(slug: string, options?: SourceOptions): Promise<ShortReadingEntry | null>;

  getCorrections?(options?: SourceOptions): Promise<CorrectionEntry[]>;
  getCorrectionBySlug?(slug: string, options?: SourceOptions): Promise<CorrectionEntry | null>;
  getEditorialPolicy?(options?: SourceOptions): Promise<EditorialPolicyContent | null>;
  getFundingPage?(options?: SourceOptions): Promise<FundingPageContent | null>;

  getSidebarSnapshot(options?: SourceOptions): Promise<SidebarSnapshot>;

  getHealth?(): ContentSourceHealth;
}
