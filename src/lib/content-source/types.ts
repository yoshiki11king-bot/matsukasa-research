import type {
  BlogPost,
  DirectorPageContent,
  FinancePageContent,
  FinancialStatement,
  InstituteTopic,
  MethodologyEntry,
  PostsPage,
  ResearchReport,
  ResearcherProfile,
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

export interface ContentSource {
  readonly name: ContentSourceName;

  getPostsPage(params?: PostsPageParams, options?: SourceOptions): Promise<PostsPage>;
  getAllPostSlugs(options?: SourceOptions): Promise<string[]>;
  getPostBySlug(slug: string, options?: SourceOptions): Promise<BlogPost | null>;

  getReports(options?: SourceOptions): Promise<ResearchReport[]>;
  getReportBySlug(slug: string, options?: SourceOptions): Promise<ResearchReport | null>;

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

  getHealth?(): ContentSourceHealth;
}
