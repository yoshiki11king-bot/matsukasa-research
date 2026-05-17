"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LocalDocumentRenderer } from "@/components/content/LocalDocumentRenderer";
import { ResearcherRenderer } from "@/components/content/ResearcherRenderer";
import { LOCAL_PRESS_STORAGE_KEY, type LocalPressContentType } from "@/lib/content/config";
import type { Frontmatter } from "@/lib/content/frontmatter";
import type { LocalChartsBySlug, LocalMarkdownDocument, LocalResearcher } from "@/lib/content/types";

type LocalPressPreviewProps = {
  charts?: LocalChartsBySlug;
};

type StoredDraft = {
  type: LocalPressContentType;
  title: string;
  slug: string;
  body: string;
  frontmatter: Frontmatter;
};

function makeDocument(draft: StoredDraft): LocalMarkdownDocument {
  return {
    slug: draft.slug || "draft",
    frontmatter: { ...draft.frontmatter, title: draft.title, slug: draft.slug },
    body: draft.body,
    path: `${draft.type}/${draft.slug}.md`,
  };
}

function makeResearcher(draft: StoredDraft): LocalResearcher {
  return {
    type: "researcher",
    name: draft.title || "無名の研究員",
    slug: draft.slug || "researcher",
    role: String(draft.frontmatter.role ?? ""),
    affiliation: String(draft.frontmatter.affiliation ?? ""),
    bio: draft.body,
    avatarUrl: String(draft.frontmatter.avatarUrl ?? ""),
    interests: Array.isArray(draft.frontmatter.interests) ? draft.frontmatter.interests.map(String) : [],
    links: [],
  };
}

export function LocalPressPreview({ charts = {} }: LocalPressPreviewProps) {
  const [draft, setDraft] = useState<StoredDraft | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_PRESS_STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredDraft;
      window.requestAnimationFrame(() => setDraft(parsed));
    } catch {
      window.localStorage.removeItem(LOCAL_PRESS_STORAGE_KEY);
    }
  }, []);

  if (!draft) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-12">
        <p className="text-lg text-[color:var(--color-secondary-ink)]">復元できる下書きがありません。</p>
        <Link href="/local-press/write" className="ui-button ui-button-primary mt-5 h-11 px-5 text-sm">
          書き始める
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <div className="border-b border-[color:var(--color-border)] px-5 py-3 text-sm text-[color:var(--color-muted)]">
        localStorage の下書きを公開予定ページとして表示しています。
      </div>
      {draft.type === "researchers" ? (
        <ResearcherRenderer researcher={makeResearcher(draft)} />
      ) : (
        <LocalDocumentRenderer type={draft.type} document={makeDocument(draft)} charts={charts} />
      )}
    </main>
  );
}
