import Link from "next/link";

const homeEntryLinks = [
  {
    href: "/articles",
    title: "記事",
  },
  {
    href: "/reports",
    title: "報告書",
  },
  {
    href: "/methodologies",
    title: "方法論",
  },
  {
    href: "/researchers",
    title: "研究員",
  },
] as const;

export function HomeEntryLinks() {
  return (
    <section className="ui-tech-panel rounded-[2rem] border border-[rgba(249,115,22,0.14)] bg-[rgba(255,255,255,0.9)] px-6 py-7 shadow-[var(--shadow-soft)]">
      <div className="space-y-3 border-b border-[color:var(--color-border)] pb-5">
        <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">ENTRY</p>
        <h2 className="text-[1.9rem] font-semibold tracking-tight text-[color:var(--color-primary)]">
          よく使う入口
        </h2>
      </div>
      <div className="mt-6 grid gap-3">
        {homeEntryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="ui-signal-link rounded-[1.2rem] border border-[color:var(--color-border)] bg-[rgba(248,250,252,0.78)] px-5 py-4 text-sm font-semibold text-[color:var(--color-primary)] transition hover:border-[rgba(249,115,22,0.28)] hover:bg-[color:var(--color-surface)]"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
