import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { metaString } from "@/components/content/renderer-utils";
import type { LocalChartsBySlug, LocalMarkdownDocument } from "@/lib/content/types";

type DirectorRendererProps = {
  document: LocalMarkdownDocument;
  charts?: LocalChartsBySlug;
};

export function DirectorRenderer({ document, charts }: DirectorRendererProps) {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-10 bg-white px-5 py-10 sm:px-8 lg:px-0">
      <header className="space-y-4 border-b border-[color:var(--color-border)] pb-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">DIRECTOR</p>
        <h1 className="font-editorial text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
          {metaString(document.frontmatter, "title", "所長ページ")}
        </h1>
      </header>
      <MarkdownRenderer body={document.body} charts={charts} />
    </article>
  );
}
