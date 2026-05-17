import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { formatMetaDate, metaString } from "@/components/content/renderer-utils";
import type { LocalChartsBySlug, LocalMarkdownDocument } from "@/lib/content/types";

type FinancialStatementRendererProps = {
  document: LocalMarkdownDocument;
  charts?: LocalChartsBySlug;
};

export function FinancialStatementRenderer({ document, charts }: FinancialStatementRendererProps) {
  const year = metaString(document.frontmatter, "year");
  const publishedAt = formatMetaDate(metaString(document.frontmatter, "publishedAt"));

  return (
    <article className="mx-auto w-full max-w-4xl space-y-10 bg-white px-5 py-10 sm:px-8 lg:px-0">
      <header className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
        <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">
          <span>FINANCIAL STATEMENT</span>
          {year ? <span>{year}</span> : null}
          {publishedAt ? <span>{publishedAt}</span> : null}
        </div>
        <h1 className="font-editorial text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
          {metaString(document.frontmatter, "title", "決算資料")}
        </h1>
      </header>
      <MarkdownRenderer body={document.body} charts={charts} />
    </article>
  );
}
