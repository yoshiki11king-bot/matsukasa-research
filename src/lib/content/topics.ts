import { demoTopics } from "@/lib/demo-content";
import { getPublishedLocalArticlePosts } from "@/lib/content/articles";
import { getPublishedLocalMethodologies } from "@/lib/content/methodologies";
import { getPublishedLocalResearchers } from "@/lib/content/researchers";
import { getPublishedLocalResearchReports } from "@/lib/content/reports";
import type { InstituteTopic } from "@/lib/types";

function addTopic(map: Map<string, string>, topic: string) {
  const name = topic.trim();

  if (!name || map.has(name)) {
    return;
  }

  map.set(name, `${name}に関する調査と解説をまとめています。`);
}

export async function getPublishedLocalTopics(): Promise<InstituteTopic[]> {
  const [posts, methodologies, researchers, reports] = await Promise.all([
    getPublishedLocalArticlePosts(),
    getPublishedLocalMethodologies(),
    getPublishedLocalResearchers(),
    getPublishedLocalResearchReports(),
  ]);
  const topicDescriptions = new Map(demoTopics.map((topic) => [topic.name, topic.description]));

  for (const topic of [
    ...posts.flatMap((post) => post.topics),
    ...methodologies.flatMap((entry) => entry.focusTopics),
    ...researchers.flatMap((researcher) => researcher.focusTopics),
    ...reports.flatMap((report) => report.topicNames),
  ]) {
    addTopic(topicDescriptions, topic);
  }

  return [...topicDescriptions.entries()]
    .map(([name, description]) => ({ name, description }))
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));
}
