import { ArticleRenderer } from "@/components/content/ArticleRenderer";
import { DirectorRenderer } from "@/components/content/DirectorRenderer";
import { FinanceRenderer } from "@/components/content/FinanceRenderer";
import { FinancialStatementRenderer } from "@/components/content/FinancialStatementRenderer";
import { MethodologyRenderer } from "@/components/content/MethodologyRenderer";
import { ReportRenderer } from "@/components/content/ReportRenderer";
import { ShortReadingRenderer } from "@/components/content/ShortReadingRenderer";
import type { LocalPressContentType } from "@/lib/content/config";
import type { LocalChartsBySlug, LocalMarkdownDocument } from "@/lib/content/types";

type LocalDocumentRendererProps = {
  type: LocalPressContentType;
  document: LocalMarkdownDocument;
  charts?: LocalChartsBySlug;
};

export function LocalDocumentRenderer({ type, document, charts }: LocalDocumentRendererProps) {
  if (type === "reports") {
    return <ReportRenderer document={document} charts={charts} />;
  }

  if (type === "methodologies") {
    return <MethodologyRenderer document={document} charts={charts} />;
  }

  if (type === "short-readings") {
    return <ShortReadingRenderer document={document} charts={charts} />;
  }

  if (type === "director") {
    return <DirectorRenderer document={document} charts={charts} />;
  }

  if (type === "finance") {
    return <FinanceRenderer document={document} charts={charts} />;
  }

  if (type === "financial-statements") {
    return <FinancialStatementRenderer document={document} charts={charts} />;
  }

  return <ArticleRenderer document={document} charts={charts} />;
}
