import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-session";

export default async function AdminEditEntityPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="旧編集フォームは停止しました"
      description="編集は content/ 配下のローカルファイルと Local Press で行います。"
    >
      <section className="rounded-lg border border-[color:var(--color-border)] bg-white px-6 py-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-2xl font-semibold text-[color:var(--color-primary)]">microCMS編集導線は使いません</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
          既存のWeb管理フォームはmicroCMSの権限や公開Rendererと噛み合わないため、編集導線としては閉じています。Local Pressで新しいローカル原稿を作り、GitHub Desktopで差分を確認してください。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/local-press" className="ui-button ui-button-primary h-11 px-5 text-sm">Local Pressへ</Link>
          <Link href="/admin" className="ui-button ui-button-secondary h-11 px-5 text-sm">編集者ポータルへ戻る</Link>
        </div>
      </section>
    </AdminShell>
  );
}
