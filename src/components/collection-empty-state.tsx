import Link from "next/link";

type CollectionEmptyStateProps = {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
};

export function CollectionEmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: CollectionEmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-soft)] px-6 py-10">
      <div className="max-w-2xl space-y-3">
        <p className="text-base font-semibold text-[color:var(--color-primary)]">{title}</p>
        <p className="text-[0.96rem] leading-8 text-[color:var(--color-secondary-ink)]">{body}</p>
        {actionHref && actionLabel ? (
          <div className="pt-1">
            <Link href={actionHref} className="ui-button ui-button-secondary h-11 px-5 text-sm">
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
