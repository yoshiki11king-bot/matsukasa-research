import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import type { ResearchReport } from "@/lib/types";

type ReportCardProps = {
  report: ResearchReport;
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <article className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-stronger)]">
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
        {report.coverImage ? (
          <Link
            href={`/reports/${report.slug}`}
            className="relative order-2 block aspect-[4/3] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] md:order-1"
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
          <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted)]">
            <span className="rounded-full bg-[color:var(--color-surface-subtle)] px-3 py-1 font-medium text-[color:var(--color-primary)]">
              {report.reportType}
            </span>
            <time dateTime={report.publishedDate}>{formatDate(report.publishedDate)}</time>
            <span>{report.region}</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-[1.35rem] font-semibold leading-9 tracking-tight text-[color:var(--color-primary)]">
              <Link href={`/reports/${report.slug}`} className="transition hover:text-[color:var(--color-accent-ink)]">
                {report.title}
              </Link>
            </h2>
            <p className="text-[0.98rem] leading-8 text-[color:var(--color-text)]">{report.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted)]">
            {report.topicNames.map((topic) => (
              <span key={topic} className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-3 py-1 text-[color:var(--color-text)]">
                {topic}
              </span>
            ))}
            {report.pdfUrl ? (
              <a
                href={report.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-soft)] px-3 py-1 text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]"
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
