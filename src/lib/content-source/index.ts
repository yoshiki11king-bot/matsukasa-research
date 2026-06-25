import "server-only";

import { localPressContentSource } from "./local-press-adapter";
import { microcmsContentSource } from "./microcms-adapter";
import { wordpressContentSource } from "./wordpress-adapter";
import type { ContentSource, ContentSourceName } from "./types";

export const DEFAULT_CONTENT_SOURCE: ContentSourceName = "microcms";

export const availableContentSources = {
  microcms: microcmsContentSource,
  local: localPressContentSource,
  wordpress: wordpressContentSource,
} as const satisfies Record<ContentSourceName, ContentSource>;

export function isContentSourceName(value: string): value is ContentSourceName {
  return value in availableContentSources;
}

export function parseContentSourceName(value?: string | null): ContentSourceName {
  if (!value) {
    return DEFAULT_CONTENT_SOURCE;
  }

  return isContentSourceName(value) ? value : DEFAULT_CONTENT_SOURCE;
}

export function getContentSourceNameFromEnv(): ContentSourceName {
  return parseContentSourceName(process.env.CONTENT_SOURCE);
}

export function selectContentSource(
  sourceName: ContentSourceName = DEFAULT_CONTENT_SOURCE,
): ContentSource {
  return availableContentSources[sourceName];
}

export const contentSource: ContentSource = selectContentSource(
  getContentSourceNameFromEnv(),
);

export type {
  ContentSource,
  ContentSourceHealth,
  ContentSourceName,
  ListResponse,
  PostsPageParams,
  PublishedStatus,
  SidebarSnapshot,
  SourceOptions,
} from "./types";
