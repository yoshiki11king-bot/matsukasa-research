import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocalPressEnabled } from "@/lib/content/config";

export const dynamic = "force-dynamic";

export default function LocalPressToolsPage() {
  if (!isLocalPressEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-5 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Link href="/local-press" className="text-sm font-semibold text-[color:var(--color-muted)]">Matsukasa Local Press</Link>
        <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">ツール</h1>
        <Link href="/local-press/tools/chart-builder" className="block rounded-lg border border-[color:var(--color-border)] px-5 py-5 transition hover:bg-[color:var(--color-surface-subtle)]">
          <p className="font-semibold text-[color:var(--color-primary)]">Chart Builder</p>
          <p className="mt-2 text-sm text-[color:var(--color-secondary-ink)]">CSVから図表JSONを作り、本文へ貼る埋め込み記法を発行します。</p>
        </Link>
      </div>
    </main>
  );
}
