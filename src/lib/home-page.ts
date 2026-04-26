import type { BlogPost } from "@/lib/types";

type LegacyArticlesSearchParams = {
  page?: string;
  q?: string;
  topics?: string | string[];
};

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getTokyoDateSeed() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function buildLegacyArticlesSearch(searchParams: LegacyArticlesSearchParams) {
  const search = new URLSearchParams();

  if (searchParams.page) {
    search.set("page", searchParams.page);
  }

  if (searchParams.q?.trim()) {
    search.set("q", searchParams.q.trim());
  }

  if (searchParams.topics) {
    const rawTopics = Array.isArray(searchParams.topics) ? searchParams.topics.join(",") : searchParams.topics;

    if (rawTopics.trim()) {
      search.set("topics", rawTopics);
    }
  }

  return search.toString();
}

export function pickFeaturedPosts(posts: BlogPost[], count: number) {
  const recentPool = posts.slice(0, Math.max(count, 12));
  const seed = getTokyoDateSeed();

  return [...recentPool]
    .sort((left, right) => hashString(`${seed}:${left.id}`) - hashString(`${seed}:${right.id}`))
    .slice(0, Math.min(count, recentPool.length));
}
