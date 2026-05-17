import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocalPressEnabled, LOCAL_PRESS_TYPE_LABELS, LOCAL_PRESS_TYPE_NOTES, type LocalPressContentType } from "@/lib/content/config";

const primaryTypes: LocalPressContentType[] = ["articles", "reports", "methodologies", "short-readings"];
const secondaryTypes: LocalPressContentType[] = ["researchers", "director", "finance", "financial-statements", "charts"];

export const dynamic = "force-dynamic";

export default function LocalPressPage() {
  if (!isLocalPressEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-[color:var(--color-text)]">
      <section className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-sm font-semibold tracking-[0.18em] text-[color:var(--color-muted)]">MATSUKASA LOCAL PRESS</p>
            <h1 className="font-editorial text-5xl font-semibold leading-tight tracking-tight text-[color:var(--color-primary)]">
              研究機関版 note.com として、ローカルで書いて公開する。
            </h1>
            <p className="max-w-3xl text-lg leading-9 text-[color:var(--color-secondary-ink)]">
              ここではmicroCMSや外部APIを使わず、content/ 配下にMarkdownまたはJSONとして保存します。公開はGitHub Desktopまたはgit pushで行います。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/local-press/new" className="ui-button ui-button-primary h-12 px-6 text-sm">
              新しく書く
            </Link>
            <Link href="/local-press/tools/chart-builder" className="ui-button ui-button-secondary h-12 px-6 text-sm">
              図表を作る
            </Link>
            <Link href="/admin" className="ui-button ui-button-secondary h-12 px-6 text-sm">
              編集者ポータル
            </Link>
          </div>
          <section className="grid gap-3 md:grid-cols-2">
            {primaryTypes.map((type) => (
              <Link key={type} href={`/local-press/write?type=${type}`} className="rounded-lg border border-[color:var(--color-border)] px-5 py-5 transition hover:border-[color:var(--color-border-stronger)] hover:bg-[color:var(--color-surface-subtle)]">
                <p className="font-semibold text-[color:var(--color-primary)]">{LOCAL_PRESS_TYPE_LABELS[type]}</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">{LOCAL_PRESS_TYPE_NOTES[type]}</p>
              </Link>
            ))}
          </section>
        </div>
        <aside className="h-fit space-y-5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-5">
          <h2 className="text-lg font-semibold text-[color:var(--color-primary)]">通常フロー</h2>
          {[
            "GitHub DesktopでFetch/Pull",
            "npm run dev を起動",
            "http://localhost:3000/local-press を開く",
            "タイトルと本文を書く",
            "ライブプレビューで確認",
            "ローカル保存",
            "Commit to main",
            "Push origin",
            "Vercelが自動公開",
          ].map((item, index) => (
            <p key={item} className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
              {index + 1}. {item}
            </p>
          ))}
          <div className="border-t border-[color:var(--color-border)] pt-4">
            <p className="text-sm font-semibold text-[color:var(--color-primary)]">その他の保存対象</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {secondaryTypes.map((type) => (
                <Link key={type} href={type === "charts" ? "/local-press/tools/chart-builder" : `/local-press/write?type=${type}`} className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs">
                  {LOCAL_PRESS_TYPE_LABELS[type]}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
