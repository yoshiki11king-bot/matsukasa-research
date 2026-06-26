import type { MetadataRoute } from "next";
import { contentSource } from "@/lib/content-source";
import { getSiteUrl } from "@/lib/site";
import { getTopicHref } from "@/lib/topic-pages";

export const revalidate = 86400;

function toSitemapDate(value?: string) {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const cacheOptions = { revalidateSeconds: revalidate };
  const [postsPage, postSlugs, researchers, methodologies, reports, financialStatements, topics, charts, datasets] =
    await Promise.all([
      contentSource.getPostsPage({ page: 1, limit: 100 }, cacheOptions),
      contentSource.getAllPostSlugs(cacheOptions),
      contentSource.getResearchers(cacheOptions),
      contentSource.getMethodologies(cacheOptions),
      contentSource.getReports(cacheOptions),
      contentSource.getFinancialStatements(cacheOptions),
      contentSource.getTopics ? contentSource.getTopics(cacheOptions) : [],
      contentSource.getCharts ? contentSource.getCharts(cacheOptions) : [],
      contentSource.getDatasets ? contentSource.getDatasets(cacheOptions) : [],
    ]);

  const latestPostDate = postsPage.contents
    .map((post) => post.updatedAt ?? post.publishedDate)
    .filter(Boolean)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];
  const latestResearcherDate = researchers
    .map((researcher) => researcher.updatedDate)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];
  const latestMethodologyDate = methodologies
    .map((entry) => entry.updatedDate)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];
  const latestReportDate = reports
    .map((report) => report.updatedDate)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return [
    {
      url: siteUrl,
      lastModified: latestPostDate ? new Date(latestPostDate) : new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/articles`,
      lastModified: latestPostDate ? new Date(latestPostDate) : new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/researchers`,
      lastModified: latestResearcherDate ? new Date(latestResearcherDate) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/methodologies`,
      lastModified: latestMethodologyDate ? new Date(latestMethodologyDate) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/reports`,
      lastModified: latestReportDate ? new Date(latestReportDate) : new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...["/about", "/about/charter", "/tools-datasets", "/projects/rudbeckia", "/director", "/finance", "/careers", "/donate"].map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...postSlugs.map((slug) => ({
      url: `${siteUrl}/posts/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...researchers.map((researcher) => ({
      url: `${siteUrl}/researchers/${researcher.slug}`,
      lastModified: new Date(researcher.updatedDate),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...methodologies.map((entry) => ({
      url: `${siteUrl}/methodologies/${entry.slug}`,
      lastModified: new Date(entry.updatedDate),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...reports.map((report) => ({
      url: `${siteUrl}/reports/${report.slug}`,
      lastModified: new Date(report.updatedDate),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...financialStatements.map((statement) => ({
      url: `${siteUrl}/financial-statements/${statement.slug}`,
      lastModified: toSitemapDate(statement.updatedDate),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...charts.map((chart) => ({
      url: `${siteUrl}/charts/${chart.slug}`,
      lastModified: toSitemapDate(chart.updatedAt || chart.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...datasets.map((dataset) => ({
      url: `${siteUrl}/datasets/${dataset.slug}`,
      lastModified: toSitemapDate(dataset.updatedDate || dataset.publishedDate),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...topics.map((topic) => ({
      url: `${siteUrl}${getTopicHref(topic.name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
