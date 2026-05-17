import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocalPressEnabled, LOCAL_PRESS_CONTENT_TYPES, LOCAL_PRESS_TYPE_LABELS, LOCAL_PRESS_TYPE_NOTES } from "@/lib/content/config";

export const dynamic = "force-dynamic";

export default function NewLocalPressPage() {
  if (!isLocalPressEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[color:var(--color-text)]">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="space-y-3">
          <Link href="/local-press" className="text-sm font-semibold text-[color:var(--color-muted)]">Matsukasa Local Press</Link>
          <h1 className="font-editorial text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">何を書くか選ぶ</h1>
          <p className="text-base leading-8 text-[color:var(--color-secondary-ink)]">最初はタイトルと本文だけで始められます。slugや出典はあとから詳細設定で整えます。</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {LOCAL_PRESS_CONTENT_TYPES.map((type) => (
            <Link
              key={type}
              href={type === "charts" ? "/local-press/tools/chart-builder" : `/local-press/write?type=${type}`}
              className="rounded-lg border border-[color:var(--color-border)] px-5 py-5 transition hover:border-[color:var(--color-border-stronger)] hover:bg-[color:var(--color-surface-subtle)]"
            >
              <p className="text-lg font-semibold text-[color:var(--color-primary)]">{LOCAL_PRESS_TYPE_LABELS[type]}</p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">{LOCAL_PRESS_TYPE_NOTES[type]}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
