import Link from "next/link";
import { SearchIcon } from "@/components/search-icon";
import { buildTopicToggleHref } from "@/lib/articles-page";
import type { InstituteTopic } from "@/lib/types";

type ArticleSearchPanelProps = {
  query: string;
  selectedTopics: string[];
  allTopics: InstituteTopic[];
};

export function ArticleSearchPanel({ query, selectedTopics, allTopics }: ArticleSearchPanelProps) {
  return (
    <section className="space-y-5 rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-6 shadow-[var(--shadow-soft)] lg:px-7 lg:py-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">SEARCH</p>
          <span className="h-px flex-1 bg-[color:var(--color-border)]" />
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="text-[1.9rem] font-semibold tracking-tight text-[color:var(--color-primary)] lg:text-[2.3rem]">
            記事を探す
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            キーワードとトピックで整理して、読みたい記事にそのまま進めます。
          </p>
        </div>
      </div>

      <form action="/articles" className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_64px]">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="記事名、本文、地域、研究員名で検索"
          className="h-14 rounded-[1rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-5 text-base text-[color:var(--color-text)] outline-none transition focus:border-[color:var(--color-accent)] focus:bg-[color:var(--color-surface)]"
        />
        {selectedTopics.map((topic) => (
          <input key={topic} type="hidden" name="topics" value={topic} />
        ))}
        <button type="submit" className="ui-button ui-button-primary h-14 w-full rounded-[1rem]" aria-label="記事を検索">
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {allTopics.map((topic) => {
            const active = selectedTopics.includes(topic.name);

            return (
              <Link
                key={topic.name}
                href={buildTopicToggleHref(query, selectedTopics, topic.name)}
                className={`inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-[rgba(255,229,213,0.96)] bg-[linear-gradient(180deg,#fb923c_0%,#ea580c_100%)] text-white shadow-[0_12px_22px_rgba(249,115,22,0.18)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] text-[color:var(--color-text)] hover:border-[color:var(--color-border-stronger)] hover:text-[color:var(--color-primary)]"
                }`}
              >
                {topic.name}
              </Link>
            );
          })}
        </div>

        {query || selectedTopics.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--color-secondary-ink)]">
            <span>絞り込み中</span>
            {query ? (
              <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-3 py-1 text-[color:var(--color-primary)]">
                {query}
              </span>
            ) : null}
            {selectedTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-3 py-1 text-[color:var(--color-primary)]"
              >
                {topic}
              </span>
            ))}
            <Link
              href="/articles"
              className="font-medium text-[color:var(--color-accent-ink)] transition hover:text-[color:var(--color-primary)]"
            >
              条件を外す
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
