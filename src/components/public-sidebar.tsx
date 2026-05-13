import Link from "next/link";
import type { MethodologyEntry, ResearchReport, ResearcherProfile } from "@/lib/types";
import { formatDate } from "@/lib/formatters";

type PublicSidebarProps = {
  researchers: ResearcherProfile[];
  methodologies: MethodologyEntry[];
  reports: ResearchReport[];
};

type SidebarSectionProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

function SidebarSection({ eyebrow, title, children }: SidebarSectionProps) {
  return (
    <section className="space-y-4 border-t border-[color:var(--color-border)] pt-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">{eyebrow}</p>
        <p className="font-editorial text-xl font-semibold text-[color:var(--color-primary)]">{title}</p>
      </div>
      {children}
    </section>
  );
}

export function PublicSidebar({ researchers, methodologies, reports }: PublicSidebarProps) {
  const latestReport = reports[0];

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      {researchers.length > 0 ? (
        <SidebarSection eyebrow="RESEARCHERS" title="研究員">
          <div className="space-y-3">
            {researchers.map((researcher) => (
              <div key={researcher.id} className="space-y-1 border-b border-[color:var(--color-border)] pb-3">
                <Link
                  href={`/researchers/${researcher.slug}`}
                  className="text-sm font-medium text-[color:var(--color-primary)] transition hover:text-[color:var(--color-accent-ink)]"
                >
                  {researcher.name}
                </Link>
                <p className="text-xs leading-6 text-[color:var(--color-muted)]">{researcher.role}</p>
              </div>
            ))}
          </div>
        </SidebarSection>
      ) : null}

      {methodologies.length > 0 ? (
        <SidebarSection eyebrow="METHODOLOGY" title="方法論">
          <div className="space-y-3">
            {methodologies.map((entry) => (
              <div key={entry.id} className="space-y-1 border-b border-[color:var(--color-border)] pb-3">
                <Link
                  href={`/methodologies/${entry.slug}`}
                  className="text-sm font-medium text-[color:var(--color-primary)] transition hover:text-[color:var(--color-accent-ink)]"
                >
                  {entry.title}
                </Link>
                <p className="text-xs leading-6 text-[color:var(--color-muted)]">{entry.summary}</p>
              </div>
            ))}
          </div>
        </SidebarSection>
      ) : null}

      {latestReport ? (
        <SidebarSection eyebrow="REPORT" title="最新の報告書">
          <div className="space-y-2 border-b border-[color:var(--color-border)] pb-3">
            <Link
              href={`/reports/${latestReport.slug}`}
              className="text-sm font-medium text-[color:var(--color-primary)] transition hover:text-[color:var(--color-accent-ink)]"
            >
              {latestReport.title}
            </Link>
            <p className="text-xs text-[color:var(--color-muted)]">{formatDate(latestReport.publishedDate)}</p>
            <p className="text-xs leading-6 text-[color:var(--color-muted)]">{latestReport.summary}</p>
          </div>
        </SidebarSection>
      ) : null}

      <section className="space-y-3 border-t border-[color:var(--color-border)] pt-5">
        <div className="space-y-2">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">SUPPORT</p>
          <p className="font-editorial text-xl font-semibold text-[color:var(--color-primary)]">継続支援</p>
        </div>
        <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
          無料公開を続けるための支援先をまとめています。
        </p>
        <Link
          href="/donate"
          className="ui-button ui-button-primary h-10 px-4 text-sm"
        >
          寄付について
        </Link>
      </section>
    </aside>
  );
}
