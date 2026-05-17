import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { metaString } from "@/components/content/renderer-utils";
import type { LocalChartsBySlug, LocalMarkdownDocument } from "@/lib/content/types";

type FinanceRendererProps = {
  document: LocalMarkdownDocument;
  charts?: LocalChartsBySlug;
};

export function FinanceRenderer({ document, charts }: FinanceRendererProps) {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-10 bg-white px-5 py-10 sm:px-8 lg:px-0">
      <header className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">FINANCE</p>
        <h1 className="font-editorial text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
          {metaString(document.frontmatter, "title", "財務情報の公開")}
        </h1>
      </header>
      <MarkdownRenderer body={document.body} charts={charts} />
    </article>
  );
}
