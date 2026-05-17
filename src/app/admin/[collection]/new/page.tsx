import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin-session";

export default async function AdminNewEntityPage() {
  await requireAdmin();

  return (
    <AdminShell
      title="旧投稿フォームは停止しました"
      description="新規作成は Matsukasa Local Press で行います。"
    >
      <section className="rounded-lg border border-[color:var(--color-border)] bg-white px-6 py-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-2xl font-semibold text-[color:var(--color-primary)]">Local Pressで作成してください</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
          この旧フォームはmicroCMS連携用だったため、投稿・編集・削除導線としては使いません。タイトルと本文中心のLocal Pressへ移動してください。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/local-press/new" className="ui-button ui-button-primary h-11 px-5 text-sm">新しく書く</Link>
          <Link href="/local-press/tools/chart-builder" className="ui-button ui-button-secondary h-11 px-5 text-sm">図表を作る</Link>
        </div>
      </section>
    </AdminShell>
  );
}
