export type BlogImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type InstituteTopic = {
  name: string;
  description: string;
};

export type SourceLink = {
  label: string;
  url?: string;
};

export type FigureAttachment = {
  title: string;
  url: string;
};

export type LabeledTextBlock = {
  title: string;
  body: string;
};

export type D3ChartType =
  | "bar"
  | "line"
  | "pie"
  | "band"
  | "horizontalBar"
  | "donut"
  | "stacked100Bar"
  | "radar"
  | "histogram"
  | "boxplot"
  | "bubble"
  | "scatter"
  | "statMap"
  | "lorenz"
  | "pictogram"
  | "stackedArea";

export type D3ChartDatum = Record<string, string | number>;

export type ContentBlock =
  | {
      type: "heading";
      text: string;
      level: 2 | 3;
    }
  | {
      type: "paragraph";
      body: string;
    }
  | {
      type: "image";
      image: BlogImage;
      caption?: string;
      alt?: string;
      sourceText?: string;
    }
  | {
      type: "link";
      title: string;
      url: string;
      description?: string;
    }
  | {
      type: "d3Chart";
      title: string;
      description?: string;
      chartType: D3ChartType;
      xKey: string;
      yKey: string;
      xLabel?: string;
      yLabel?: string;
      colorKey?: string;
      nameKey?: string;
      showLegend?: boolean;
      showGrid?: boolean;
      showDataLabels?: boolean;
      footnote?: string;
      abstract?: string;
      height?: number;
      data: D3ChartDatum[];
    };

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  format: string;
  category: string;
  region: string;
  publishedDate: string;
  authorName: string;
  coverImage: BlogImage | null;
  topics: string[];
  researcherSlugs: string[];
  methodologySlugs: string[];
  methodologySummary: string;
  sourceBasis: string;
  updatedNote: string;
  sourceLinks: SourceLink[];
  keyFindings: string[];
  body: string;
  contentBlocks: ContentBlock[];
  createdAt?: string;
  updatedAt?: string;
  isDemo?: boolean;
};

export type ResearcherProfile = {
  id: string;
  slug: string;
  name: string;
  role: string;
  team: string;
  summary: string;
  bio: string;
  portraitImage: BlogImage | null;
  focusTopics: string[];
  methodologySlugs: string[];
  updatedDate: string;
  email?: string;
  sourceBasis: string;
  isDemo?: boolean;
};

export type MethodologyEntry = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  updatedDate: string;
  reviewer: string;
  focusTopics: string[];
  goodFor: string[];
  limits: string[];
  sourceBasis: string;
  body: string;
  isDemo?: boolean;
};

export type ResearchReport = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedDate: string;
  updatedDate: string;
  reportType: string;
  region: string;
  topicNames: string[];
  researcherSlugs: string[];
  methodologySlugs: string[];
  coverImage: BlogImage | null;
  pdfUrl?: string;
  figures: FigureAttachment[];
  sourceLinks: SourceLink[];
  sourceBasis: string;
  body: string;
  contentBlocks: ContentBlock[];
  isDemo?: boolean;
};

export type DirectorPageContent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  effectiveDate: string;
  updatedDate: string;
  roleCards: LabeledTextBlock[];
  stanceTitle: string;
  stanceDescription: string;
  stanceCards: LabeledTextBlock[];
  relatedSummary: string;
  isDemo?: boolean;
};

export type FinancePageContent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  effectiveDate: string;
  updatedDate: string;
  disclosureItems: LabeledTextBlock[];
  disclosureTable: LabeledTextBlock[];
  policyItems: LabeledTextBlock[];
  contactText: string;
  isDemo?: boolean;
};

export type FinancialStatement = {
  id: string;
  slug: string;
  title: string;
  fiscalYear: string;
  summary: string;
  publishedDate: string;
  updatedDate: string;
  pdfUrl?: string;
  sourceBasis: string;
  highlights: string[];
  body: string;
  isDemo?: boolean;
};

export type PostStatus = "DRAFT" | "PUBLISH" | "CLOSED" | "PUBLISH_AND_DRAFT";

export type ContentMeta = {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  revisedAt: string | null;
  closedAt: string | null;
  draftKey: string | null;
  status: PostStatus[];
};

export type AdminPost = BlogPost & ContentMeta;
export type AdminResearcher = ResearcherProfile & ContentMeta;
export type AdminMethodology = MethodologyEntry & ContentMeta;
export type AdminReport = ResearchReport & ContentMeta;
export type AdminDirectorPage = DirectorPageContent & ContentMeta;
export type AdminFinancePage = FinancePageContent & ContentMeta;
export type AdminFinancialStatement = FinancialStatement & ContentMeta;

export type AdminEntity =
  | AdminPost
  | AdminResearcher
  | AdminMethodology
  | AdminReport
  | AdminDirectorPage
  | AdminFinancePage
  | AdminFinancialStatement;
export type AdminCollectionKey =
  | "posts"
  | "researchers"
  | "methodologies"
  | "reports"
  | "director"
  | "finance"
  | "financialStatements";

export type PostsPage = {
  contents: BlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  offset: number;
};
