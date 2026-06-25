import type { BlogPost, FinancialStatement } from "@/lib/types";

type PublishedDateItem = {
  publishedDate: string;
};

function toTime(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function sortByPublishedDate<T extends PublishedDateItem>(items: T[]) {
  return [...items].sort((left, right) => toTime(right.publishedDate) - toTime(left.publishedDate));
}

export function sortFinancialStatements(statements: FinancialStatement[]) {
  return sortByPublishedDate(statements).sort((left, right) => {
    const leftTime = toTime(left.publishedDate);
    const rightTime = toTime(right.publishedDate);

    if (leftTime !== rightTime) {
      return 0;
    }

    return right.fiscalYear.localeCompare(left.fiscalYear);
  });
}

export function matchesPostQuery(post: BlogPost, query?: string) {
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    post.title,
    post.excerpt,
    post.category,
    post.region,
    post.authorName,
    ...post.topics,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export function matchesTopics(item: { topics: string[] }, topics?: string[]) {
  if (!topics || topics.length === 0) {
    return true;
  }

  return topics.every((topic) => item.topics.includes(topic));
}

export function paginateItems<T>(items: T[], page: number, limit: number) {
  const currentPage = Math.max(1, page);
  const pageSize = Math.max(1, limit);
  const offset = (currentPage - 1) * pageSize;

  return {
    contents: items.slice(offset, offset + pageSize),
    totalCount: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    currentPage,
    limit: pageSize,
    offset,
  };
}
