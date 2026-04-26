import { redirect } from "next/navigation";
import { FlashMessage } from "@/components/flash-message";
import {
  adminAuthConfigured,
  getConfiguredAdminUsername,
  isAdminAuthenticated,
} from "@/lib/admin-session";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "管理者ログイン",
  description: "松笠研究所の管理画面ログインページです。",
  path: "/admin/login",
  noindex: true,
});

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "ユーザー名またはパスワードが違います。",
  missing: "ログインに必要な値が足りませんでした。",
  unavailable: "管理者認証の環境変数がまだ設定されていません。",
  blocked: "試行回数が多すぎます。少し待ってから、もう一度試してください。",
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const error = resolvedSearchParams.error ? errorMessages[resolvedSearchParams.error] : null;

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-accent-ink)]">
              Admin Login
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
              投稿管理に入ります。
            </h1>
            <p className="text-lg leading-8 text-[color:var(--color-secondary-ink)]">
              microCMS への書き込みはサーバー側で行います。管理者認証を通ってから進みます。
            </p>
          </div>

          {!adminAuthConfigured() ? (
            <FlashMessage
              tone="warning"
              message="ADMIN_PASSWORD と ADMIN_SESSION_SECRET が未設定です。.env.local を確認してください。"
            />
          ) : null}

          {error ? <FlashMessage tone="error" message={error} /> : null}

          <form action="/admin/actions/login" method="post" className="space-y-5">
            <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
              <span className="font-medium">ユーザー名</span>
              <input
                type="text"
                name="username"
                defaultValue={getConfiguredAdminUsername()}
                autoComplete="username"
                className="h-11 w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
              />
            </label>

            <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
              <span className="font-medium">パスワード</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                className="h-11 w-full rounded-md border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
              />
            </label>

            <button
              type="submit"
              className="ui-button ui-button-primary h-11 w-full px-5 text-sm"
            >
              ログイン
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
