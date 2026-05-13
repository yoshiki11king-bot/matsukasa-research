import Link from "next/link";
import type { BlogPost, MethodologyEntry, ResearchReport } from "@/lib/types";

type HomeLatestResourcesProps = {
  latestArticle: BlogPost | null;
  latestReport: ResearchReport | null;
  latestMethodology: MethodologyEntry | null;
};

type LatestResourceCardProps = {
  eyebrow: string;
  title: string;
  summary: string;
  href: string;
  ctaLabel: string;
};

function LatestResourceCard({ eyebrow, title, summary, href, ctaLabel }: LatestResourceCardProps) {
  return (
    <article className="border-l border-[color:var(--color-border)] px-6 py-2">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">{eyebrow}</p>
      <h2 className="font-editorial mt-3 text-[1.6rem] font-semibold leading-9 tracking-tight text-[color:var(--color-primary)]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[color:var(--color-secondary-ink)]">{summary}</p>
      <div className="mt-5">
        <Link href={href} className="text-sm font-semibold uppercase tracking-[0.04em] text-[color:var(--color-primary)] underline decoration-[color:var(--color-border-stronger)] underline-offset-4 transition hover:text-[color:var(--color-accent-ink)]">
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

export function HomeLatestResources({
  latestArticle,
  latestReport,
  latestMethodology,
}: HomeLatestResourcesProps) {
  const cards = [
    latestArticle
      ? {
          eyebrow: "LATEST ARTICLE",
          title: latestArticle.title,
          summary: latestArticle.excerpt,
          href: `/posts/${latestArticle.slug}`,
          ctaLabel: "記事を読む",
        }
      : null,
    latestReport
      ? {
          eyebrow: "LATEST REPORT",
          title: latestReport.title,
          summary: latestReport.summary,
          href: `/reports/${latestReport.slug}`,
          ctaLabel: "報告書",
        }
      : null,
    latestMethodology
      ? {
          eyebrow: "LATEST METHOD",
          title: latestMethodology.title,
          summary: latestMethodology.summary,
          href: `/methodologies/${latestMethodology.slug}`,
          ctaLabel: "方法論を読む",
        }
      : null,
  ].filter((card): card is LatestResourceCardProps => Boolean(card));

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-8 border-y border-[color:var(--color-border)] py-8 xl:grid-cols-3">
      {cards.map((card) => (
        <LatestResourceCard key={card.href} {...card} />
      ))}
    </section>
  );
}
