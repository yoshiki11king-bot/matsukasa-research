import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import type { MethodologyEntry } from "@/lib/types";

type MethodologyCardProps = {
  entry: MethodologyEntry;
};

export function MethodologyCard({ entry }: MethodologyCardProps) {
  return (
    <article className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-[color:var(--color-muted)]">更新 {formatDate(entry.updatedDate)}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--color-primary)]">
            <Link href={`/methodologies/${entry.slug}`} className="transition hover:text-[color:var(--color-accent-ink)]">
              {entry.title}
            </Link>
          </h2>
          <p className="text-[0.98rem] leading-8 text-[color:var(--color-text)]">{entry.summary}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-[color:var(--color-primary)]">向いている場面</p>
            <ul className="mt-2 space-y-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
              {entry.goodFor.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-[color:var(--color-primary)]">限界</p>
            <ul className="mt-2 space-y-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
              {entry.limits.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
