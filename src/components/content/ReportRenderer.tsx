import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { formatMetaDate, metaString, metaStringArray } from "@/components/content/renderer-utils";
import type { LocalChartsBySlug, LocalMarkdownDocument } from "@/lib/content/types";

type ReportRendererProps = {
  document: LocalMarkdownDocument;
  charts?: LocalChartsBySlug;
};

export function ReportRenderer({ document, charts }: ReportRendererProps) {
  const title = metaString(document.frontmatter, "title", "無題の報告書");
  const summary = metaString(document.frontmatter, "summary") || metaString(document.frontmatter, "excerpt");
  const keyFindings = metaStringArray(document.frontmatter, "keyFindings");
  const publishedAt = formatMetaDate(metaString(document.frontmatter, "publishedAt"));
  const methodologySummary = metaString(document.frontmatter, "methodologySummary");
  const sourceNote = metaString(document.frontmatter, "sourceNote");

  return (
    <article className="mx-auto w-full max-w-5xl space-y-10 bg-white px-5 py-10 text-[color:var(--color-text)] sm:px-8 lg:px-0">
      <header className="space-y-6 border-b border-[color:var(--color-border)] pb-8">
        <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">
          <span>REPORT</span>
          {publishedAt ? <span>{publishedAt}</span> : null}
        </div>
        <h1 className="font-editorial text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-primary)] md:text-6xl">
          {title}
        </h1>
        {summary ? <p className="max-w-3xl text-xl leading-9 text-[color:var(--color-secondary-ink)]">{summary}</p> : null}
      </header>

      {keyFindings.length > 0 ? (
        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">KEY FINDINGS</p>
          <ul className="mt-4 space-y-3 text-base leading-8 text-[color:var(--color-primary)]">
            {keyFindings.map((finding) => (
              <li key={finding} className="border-l-4 border-[color:var(--color-accent)] pl-4">
                {finding}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <MarkdownRenderer body={document.body} charts={charts} />

      {methodologySummary || sourceNote ? (
        <footer className="space-y-4 border-t border-[color:var(--color-border)] pt-6 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
          {methodologySummary ? <p>方法論要約: {methodologySummary}</p> : null}
          {sourceNote ? <p>出典・基準: {sourceNote}</p> : null}
        </footer>
      ) : null}
    </article>
  );
}
