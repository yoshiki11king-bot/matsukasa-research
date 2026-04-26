import Image from "next/image";
import Link from "next/link";
import type { ResearcherProfile } from "@/lib/types";

type ResearcherCardProps = {
  researcher: ResearcherProfile;
};

export function ResearcherCard({ researcher }: ResearcherCardProps) {
  return (
    <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
      <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-start">
        {researcher.portraitImage ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]">
            <Image
              src={researcher.portraitImage.url}
              alt={researcher.portraitImage.alt || researcher.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-[color:var(--color-muted)]">{researcher.role}</p>
            <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-primary)]">
              <Link href={`/researchers/${researcher.slug}`} className="transition hover:text-[color:var(--color-accent-ink)]">
                {researcher.name}
              </Link>
            </h2>
            <p className="text-sm text-[color:var(--color-muted)]">{researcher.team}</p>
          </div>
          <p className="text-[0.98rem] leading-8 text-[color:var(--color-text)]">{researcher.summary}</p>
          <div className="flex flex-wrap gap-2 text-xs text-[color:var(--color-muted)]">
            {researcher.focusTopics.map((topic) => (
              <span key={topic} className="rounded-md bg-[color:var(--color-surface-muted)] px-2.5 py-1 text-[color:var(--color-text)]">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
