import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { formatMetaDate, metaString } from "@/components/content/renderer-utils";
import type { LocalChartsBySlug, LocalMarkdownDocument } from "@/lib/content/types";

type MethodologyRendererProps = {
  document: LocalMarkdownDocument;
  charts?: LocalChartsBySlug;
};

export function MethodologyRenderer({ document, charts }: MethodologyRendererProps) {
  const title = metaString(document.frontmatter, "title", "無題の方法論");
  const summary = metaString(document.frontmatter, "summary");
  const publishedAt = formatMetaDate(metaString(document.frontmatter, "publishedAt"));

  return (
    <article className="mx-auto w-full max-w-4xl space-y-10 bg-white px-5 py-10 sm:px-8 lg:px-0">
      <header className="space-y-5 border-b border-[color:var(--color-border)] pb-8">
        <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">
          <span>METHODOLOGY</span>
          {publishedAt ? <span>{publishedAt}</span> : null}
        </div>
        <h1 className="font-editorial text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-primary)] md:text-5xl">
          {title}
        </h1>
        {summary ? <p className="text-lg leading-9 text-[color:var(--color-secondary-ink)]">{summary}</p> : null}
      </header>
      <MarkdownRenderer body={document.body} charts={charts} />
    </article>
  );
}
