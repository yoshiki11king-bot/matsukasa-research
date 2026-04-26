type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-4">
      {eyebrow ? (
        <div className="flex items-center gap-3">
          <p className="shrink-0 text-[0.72rem] font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">
            {eyebrow}
          </p>
          <span className="ui-accent-rule h-px flex-1" />
        </div>
      ) : null}
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-primary)] sm:text-[2.1rem]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-[1.02rem] leading-8 text-[color:var(--color-text)]">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
