import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { formatMetaDate, metaString } from "@/components/content/renderer-utils";
import type { LocalChartsBySlug, LocalMarkdownDocument } from "@/lib/content/types";
import type { ShortReadingEntry } from "@/lib/types";

type ShortReadingRendererProps = {
  document?: LocalMarkdownDocument;
  entry?: ShortReadingEntry;
  charts?: LocalChartsBySlug;
};

export function ShortReadingRenderer({ document, entry, charts }: ShortReadingRendererProps) {
  const frontmatter = document?.frontmatter ?? {};
  const title = entry?.title ?? metaString(frontmatter, "title", "無題のショートリーディング");
  const excerpt = entry?.excerpt ?? metaString(frontmatter, "excerpt");
  const publishedAt = formatMetaDate(entry?.publishedDate ?? metaString(frontmatter, "publishedAt"));
  const readingTime = entry?.readingTime ?? metaString(frontmatter, "readingTime");
  const body = entry?.body ?? document?.body ?? "";

  return (
    <article className="mx-auto w-full max-w-3xl space-y-8 bg-white px-5 py-10 sm:px-8 lg:px-0">
      <header className="space-y-4 border-b border-[color:var(--color-border)] pb-7">
        <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">
          <span>SHORT READING</span>
          {publishedAt ? <span>{publishedAt}</span> : null}
          {readingTime ? <span>{readingTime}</span> : null}
        </div>
        <h1 className="font-editorial text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-primary)]">
          {title}
        </h1>
        {excerpt ? <p className="text-lg leading-9 text-[color:var(--color-secondary-ink)]">{excerpt}</p> : null}
      </header>
      <MarkdownRenderer body={body} charts={charts} />
    </article>
  );
}
