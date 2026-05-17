import type { Frontmatter } from "@/lib/content/frontmatter";

export function metaString(frontmatter: Frontmatter, key: string, fallback = "") {
  const value = frontmatter[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

export function metaStringArray(frontmatter: Frontmatter, key: string) {
  const value = frontmatter[key];
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export function formatMetaDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}
