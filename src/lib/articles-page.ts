import type { BlogPost } from "@/lib/types";

export function parseSelectedTopics(value?: string | string[]) {
  const raw = Array.isArray(value) ? value.join(",") : value ?? "";

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildArticlesHref(query: string, selectedTopics: string[], nextPage?: number) {
  const search = new URLSearchParams();

  if (query) {
    search.set("q", query);
  }

  if (selectedTopics.length > 0) {
    search.set("topics", selectedTopics.join(","));
  }

  if (nextPage && nextPage > 1) {
    search.set("page", String(nextPage));
  }

  const params = search.toString();
  return params ? `/articles?${params}` : "/articles";
}

export function buildTopicToggleHref(query: string, selectedTopics: string[], topic: string) {
  const nextTopics = selectedTopics.includes(topic)
    ? selectedTopics.filter((item) => item !== topic)
    : [...selectedTopics, topic];

  return buildArticlesHref(query, nextTopics);
}

export function getPopularityScore(post: BlogPost) {
  const ageInDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(post.publishedDate).getTime()) / (1000 * 60 * 60 * 24)),
  );
  const freshnessScore = Math.max(0, 45 - ageInDays);
  const depthScore =
    post.keyFindings.length * 8 +
    post.sourceLinks.length * 6 +
    post.contentBlocks.length * 3 +
    post.topics.length * 3 +
    post.methodologySlugs.length * 4 +
    post.researcherSlugs.length * 3 +
    (post.coverImage ? 4 : 0);

  return freshnessScore + depthScore;
}
