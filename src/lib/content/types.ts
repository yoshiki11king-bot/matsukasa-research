import type { Frontmatter } from "@/lib/content/frontmatter";
import type { D3ChartDatum, D3ChartType } from "@/lib/types";

export type LocalMarkdownDocument = {
  slug: string;
  frontmatter: Frontmatter;
  body: string;
  path: string;
};

export type LocalResearcher = {
  type: "researcher";
  name: string;
  slug: string;
  role: string;
  affiliation: string;
  bio: string;
  avatarUrl: string;
  interests: string[];
  links: Array<{ label: string; url: string }>;
};

export type LocalChartType = D3ChartType | "stacked-bar";

export type LocalChart = {
  type: "chart";
  title: string;
  slug: string;
  chartType: LocalChartType;
  description: string;
  data: D3ChartDatum[];
  sourceNote: string;
  methodologyNote: string;
  xKey?: string;
  yKey?: string;
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
  createdAt: string;
  updatedAt: string;
};

export type LocalChartsBySlug = Record<string, LocalChart>;
