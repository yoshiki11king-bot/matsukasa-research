import type { Frontmatter } from "@/lib/content/frontmatter";

export const LOCAL_PRESS_CONTENT_TYPES = [
  "articles",
  "reports",
  "methodologies",
  "researchers",
  "director",
  "finance",
  "financial-statements",
  "short-readings",
  "charts",
] as const;

export type LocalPressContentType = (typeof LOCAL_PRESS_CONTENT_TYPES)[number];

export const LOCAL_PRESS_TYPE_LABELS: Record<LocalPressContentType, string> = {
  articles: "記事",
  reports: "報告書",
  methodologies: "方法論",
  researchers: "研究員",
  director: "所長ページ",
  finance: "財務ページ",
  "financial-statements": "決算資料",
  "short-readings": "ショートリーディング",
  charts: "図表",
};

export const LOCAL_PRESS_TYPE_NOTES: Record<LocalPressContentType, string> = {
  articles: "通常記事、短い分析、告知をブログ感覚で書きます。",
  reports: "調査報告、要点、方法論、出典を含む長めの研究報告です。",
  methodologies: "調査設計、公開基準、分析上の注意をまとめます。",
  researchers: "研究員プロフィールをJSONとして保存します。",
  director: "所長ページの固定本文をMarkdownで管理します。",
  finance: "財務情報ページの固定本文をMarkdownで管理します。",
  "financial-statements": "年度ごとの決算資料をMarkdownで保存します。",
  "short-readings": "短く読める論点整理やショートメモです。",
  charts: "本文へ埋め込む図表データをJSONで保存します。",
};

export const LOCAL_PRESS_STORAGE_KEY = "matsukasa-local-press-draft-v1";
export const LOCAL_PRESS_CHART_STORAGE_KEY = "matsukasa-local-press-chart-draft-v1";

export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function isLocalPressEnabled() {
  return process.env.ENABLE_LOCAL_PRESS === "true";
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isValidSlug(value: string) {
  return SLUG_PATTERN.test(value) && !value.includes("..") && !value.includes("/") && !value.includes(".");
}

export function getDefaultBody(type: LocalPressContentType) {
  if (type === "reports") {
    return [
      "## はじめに",
      "",
      "ここに調査の背景を書きます。",
      "",
      ":::finding",
      "ここに主な発見を書く",
      ":::",
      "",
      ":::methodology",
      "ここに方法論上の注意を書く",
      ":::",
    ].join("\n");
  }

  if (type === "methodologies") {
    return ["## 方法の概要", "", "ここに調査方法や公開基準を書きます。"].join("\n");
  }

  if (type === "short-readings") {
    return ["## 要点", "", "短く読める論点整理を書きます。"].join("\n");
  }

  return "";
}

export function getDefaultFrontmatter(type: LocalPressContentType): Frontmatter {
  const now = new Date().toISOString();

  if (type === "reports") {
    return {
      type: "report",
      title: "",
      slug: "",
      subtitle: "",
      summary: "",
      excerpt: "",
      status: "draft",
      publishedAt: "",
      eyecatchUrl: "",
      topics: [] as string[],
      authors: [] as string[],
      category: "",
      region: "",
      keyFindings: [] as string[],
      methodologySlug: "",
      researcherSlugs: [] as string[],
      sourceNote: "",
      methodologySummary: "",
      referenceLinks: [] as string[],
      layout: "report",
    };
  }

  if (type === "methodologies") {
    return {
      type: "methodology",
      title: "",
      slug: "",
      summary: "",
      status: "draft",
      publishedAt: "",
      relatedReports: [] as string[],
      sourceNote: "",
      layout: "methodology",
    };
  }

  if (type === "short-readings") {
    return {
      type: "short-reading",
      title: "",
      slug: "",
      excerpt: "",
      status: "draft",
      publishedAt: "",
      topics: [] as string[],
      authors: [] as string[],
      readingTime: "",
      layout: "short",
    };
  }

  if (type === "finance") {
    return {
      type: "finance",
      title: "財務情報の公開",
      slug: "finance",
      status: "draft",
      updatedAt: now,
      layout: "finance",
    };
  }

  if (type === "director") {
    return {
      type: "director",
      title: "所長ページ",
      slug: "director",
      status: "draft",
      updatedAt: now,
      layout: "director",
    };
  }

  if (type === "financial-statements") {
    return {
      type: "financial-statement",
      title: "",
      slug: "",
      year: new Date().getFullYear(),
      status: "draft",
      publishedAt: "",
      layout: "financial-statement",
    };
  }

  return {
    type: "article",
    title: "",
    slug: "",
    excerpt: "",
    status: "draft",
    publishedAt: "",
    eyecatchUrl: "",
    topics: [] as string[],
    authors: [] as string[],
    category: "",
    region: "",
    layout: "standard",
  };
}

export function getContentTypeFromQuery(value: string | null | undefined): LocalPressContentType {
  if (value && LOCAL_PRESS_CONTENT_TYPES.includes(value as LocalPressContentType)) {
    return value as LocalPressContentType;
  }

  return "articles";
}
