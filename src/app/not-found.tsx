import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-20 lg:px-10">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-accent-ink)]">404</p>
        <h1 className="text-4xl font-semibold tracking-tight text-[color:var(--color-primary)]">
          その記事は見つかりませんでした。
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-[color:var(--color-secondary-ink)]">
          URL が変わったか、記事がまだ公開されていない可能性があります。
        </p>
        <div>
          <Link
            href="/"
            className="ui-button ui-button-primary h-11 px-5 text-sm"
          >
            ホームに戻る
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
