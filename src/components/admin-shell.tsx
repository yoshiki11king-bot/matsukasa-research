import Link from "next/link";

type AdminShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[color:var(--color-background)]">
      <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1420px] flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="space-y-1">
            <Link href="/admin" className="text-lg font-semibold tracking-tight text-[color:var(--color-primary)]">
              松笠研究所 管理
            </Link>
            <p className="text-sm text-[color:var(--color-secondary-ink)]">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--color-secondary-ink)]">
            <Link href="/local-press" className="transition hover:text-[color:var(--color-primary)]">
              Local Press
            </Link>
            <Link href="/local-press/new" className="transition hover:text-[color:var(--color-primary)]">
              新しく書く
            </Link>
            <Link href="/local-press/tools/chart-builder" className="transition hover:text-[color:var(--color-primary)]">
              Chart Builder
            </Link>
            <Link
              href="/"
              className="ui-button ui-button-secondary h-10 px-4 text-sm"
            >
              公開サイト
            </Link>
            <form action="/admin/actions/logout" method="post">
              <button
                type="submit"
                className="ui-button ui-button-secondary h-10 px-4 text-sm"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1420px] flex-col gap-8 px-5 py-8 lg:px-8 lg:py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
