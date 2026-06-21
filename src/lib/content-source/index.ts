import "server-only";

import { localPressContentSource } from "./local-press-adapter";
import { microcmsContentSource } from "./microcms-adapter";
import { wordpressContentSource } from "./wordpress-adapter";
import type { ContentSource, ContentSourceName } from "./types";

export type AvailableContentSourceName = Exclude<ContentSourceName, "hybrid" | "local-press"> | "local";
export const DEFAULT_CONTENT_SOURCE: AvailableContentSourceName = "microcms";

export const contentSource: ContentSource = microcmsContentSource;

export const availableContentSources = {
  microcms: microcmsContentSource,
  local: localPressContentSource,
  wordpress: wordpressContentSource,
} as const satisfies Record<AvailableContentSourceName, ContentSource>;

export function selectContentSource(
  sourceName: AvailableContentSourceName = DEFAULT_CONTENT_SOURCE,
): ContentSource {
  return availableContentSources[sourceName];
}

export type {
  ContentSource,
  ContentSourceHealth,
  ContentSourceName,
  ListResponse,
  PostsPageParams,
  PublishedStatus,
  SourceOptions,
} from "./types";
