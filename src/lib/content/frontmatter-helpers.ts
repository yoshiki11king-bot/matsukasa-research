import type { Frontmatter } from "@/lib/content/frontmatter";
import type { FigureAttachment, SourceLink } from "@/lib/types";

export function getFrontmatterString(frontmatter: Frontmatter, key: string, fallback = "") {
  const value = frontmatter[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

export function getFrontmatterStringArray(frontmatter: Frontmatter, key: string) {
  const value = frontmatter[key];
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export function getFrontmatterSourceLinks(frontmatter: Frontmatter): SourceLink[] {
  const value = frontmatter.referenceLinks;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item === "string") {
      return item ? [{ label: item }] : [];
    }

    if (!item || typeof item !== "object") {
      return [];
    }

    const entry = item as Record<string, unknown>;
    const label = typeof entry.label === "string" ? entry.label : "";
    const url = typeof entry.url === "string" ? entry.url : undefined;

    return label ? [{ label, url }] : [];
  });
}

export function getFrontmatterFigureAttachments(frontmatter: Frontmatter): FigureAttachment[] {
  const value = frontmatter.figures;

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const entry = item as Record<string, unknown>;
    const title = typeof entry.title === "string" ? entry.title : "";
    const url = typeof entry.url === "string" ? entry.url : "";

    return title && url ? [{ title, url }] : [];
  });
}

export function getFrontmatterCoverImage(frontmatter: Frontmatter, fallbackAlt: string) {
  const url = getFrontmatterString(frontmatter, "eyecatchUrl");

  if (!url) {
    return null;
  }

  return {
    url,
    alt: getFrontmatterString(frontmatter, "title", fallbackAlt),
  };
}
