import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import type { ResearchReport } from "@/lib/types";

type ReportCardProps = {
  report: ResearchReport;
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <article className="border-b border-[color:var(--color-border)] py-7 transition duration-200 hover:border-[color:var(--color-border-stronger)]">
      <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
        {report.coverImage ? (
          <Link
            href={`/reports/${report.slug}`}
            className="relative order-2 block aspect-[4/3] overflow-hidden bg-[color:var(--color-surface-muted)] md:order-1"
          >
            <Image
              src={report.coverImage.url}
              alt={report.coverImage.alt || report.title}
              fill
              sizes="220px"
              className="object-cover"
            />
          </Link>
        ) : null}
        <div className="order-1 space-y-3 md:order-2">
          <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
            <span className="font-semibold text-[color:var(--color-primary)]">
              {report.reportType}
            </span>
            <span>|</span>
            <time dateTime={report.publishedDate}>{formatDate(report.publishedDate)}</time>
            <span>|</span>
            <span>{report.region}</span>
          </div>
          <div className="space-y-2">
            <h2 className="font-editorial text-[1.75rem] font-semibold leading-10 tracking-tight text-[color:var(--color-primary)]">
              <Link href={`/reports/${report.slug}`} className="transition hover:text-[color:var(--color-accent-ink)]">
                {report.title}
              </Link>
            </h2>
            <p className="text-[0.98rem] leading-8 text-[color:var(--color-secondary-ink)]">{report.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted)]">
            {report.topicNames.map((topic) => (
              <span key={topic} className="border border-[color:var(--color-border)] px-2.5 py-1 text-[color:var(--color-text)]">
                {topic}
              </span>
            ))}
            {report.pdfUrl ? (
              <a
                href={report.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="border border-[color:var(--color-border)] px-2.5 py-1 text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]"
              >
                PDF
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
