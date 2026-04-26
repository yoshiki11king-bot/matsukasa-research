import type { AdminCollectionKey, LabeledTextBlock, PostStatus, SourceLink } from "@/lib/types";

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function statusLabel(status: PostStatus[]) {
  if (status.includes("PUBLISH_AND_DRAFT")) {
    return "公開中 / 下書きあり";
  }

  if (status.includes("PUBLISH")) {
    return "公開中";
  }

  if (status.includes("CLOSED")) {
    return "公開終了";
  }

  return "下書き";
}

export function statusTone(status: PostStatus[]) {
  if (status.includes("PUBLISH_AND_DRAFT")) {
    return "bg-[color:var(--color-surface-subtle)] text-[color:var(--color-primary)]";
  }

  if (status.includes("PUBLISH")) {
    return "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-ink)]";
  }

  if (status.includes("CLOSED")) {
    return "bg-[color:var(--color-surface-muted)] text-[color:var(--color-secondary-ink)]";
  }

  return "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)]";
}

export function linesToTextarea(values: string[]) {
  return values.join("\n");
}

export function sourceLinksToTextarea(values: SourceLink[]) {
  return values.map((item) => `${item.label}${item.url ? ` | ${item.url}` : ""}`).join("\n");
}

export function labeledBlocksToTextarea(values: LabeledTextBlock[]) {
  return values.map((item) => `${item.title} | ${item.body}`).join("\n");
}

export function collectionLabel(collection: AdminCollectionKey) {
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
