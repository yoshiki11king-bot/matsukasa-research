import type { LocalResearcher } from "@/lib/content/types";

type ResearcherRendererProps = {
  researcher: LocalResearcher;
};

export function ResearcherRenderer({ researcher }: ResearcherRendererProps) {
  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 bg-white px-5 py-10 sm:px-8 lg:px-0">
      <header className="grid gap-6 border-b border-[color:var(--color-border)] pb-8 md:grid-cols-[140px_minmax(0,1fr)]">
        <div className="h-[140px] w-[140px] overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)]">
          {researcher.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={researcher.avatarUrl} alt={researcher.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">RESEARCHER</p>
          <h1 className="font-editorial text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">{researcher.name || "無名の研究員"}</h1>
          <p className="text-lg text-[color:var(--color-secondary-ink)]">{researcher.role}</p>
          {researcher.affiliation ? <p className="text-sm text-[color:var(--color-muted)]">{researcher.affiliation}</p> : null}
        </div>
      </header>
      <p className="text-[1.04rem] leading-9 text-[color:var(--color-text)]">{researcher.bio}</p>
      {researcher.interests.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {researcher.interests.map((interest) => (
            <span key={interest} className="rounded-full border border-[color:var(--color-border)] px-3 py-1 text-sm">
              {interest}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
