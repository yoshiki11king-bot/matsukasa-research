import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { formatMetaDate, metaString, metaStringArray } from "@/components/content/renderer-utils";
import type { LocalChartsBySlug, LocalMarkdownDocument } from "@/lib/content/types";

type ArticleRendererProps = {
  document: LocalMarkdownDocument;
  charts?: LocalChartsBySlug;
};

export function ArticleRenderer({ document, charts }: ArticleRendererProps) {
  const title = metaString(document.frontmatter, "title", "無題の記事");
  const excerpt = metaString(document.frontmatter, "excerpt");
  const topics = metaStringArray(document.frontmatter, "topics");
  const publishedAt = formatMetaDate(metaString(document.frontmatter, "publishedAt"));

  return (
    <article className="mx-auto w-full max-w-4xl space-y-10 bg-white px-5 py-10 text-[color:var(--color-text)] sm:px-8 lg:px-0">
      <header className="space-y-5 border-b border-[color:var(--color-border)] pb-8">
        <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">
          <span>ARTICLE</span>
          {publishedAt ? <span>{publishedAt}</span> : null}
        </div>
        <h1 className="font-editorial text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-primary)] md:text-5xl">
          {title}
        </h1>
        {excerpt ? <p className="text-lg leading-9 text-[color:var(--color-secondary-ink)]">{excerpt}</p> : null}
        {topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span key={topic} className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-sm text-[color:var(--color-secondary-ink)]">
                {topic}
              </span>
            ))}
          </div>
        ) : null}
      </header>
      <MarkdownRenderer body={document.body} charts={charts} />
    </article>
  );
}
