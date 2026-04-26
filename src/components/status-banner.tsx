import Link from "next/link";

type StatusBannerProps = {
  kind: "demo";
};

const bannerCopy = {
  demo: {
    title: "microCMS 未接続のため、デモ記事を表示しています。",
    body: "サービスドメインと API キーを入れると、記事、研究員、方法論、報告書が実データに切り替わります。",
  },
};

export function StatusBanner({ kind }: StatusBannerProps) {
  const copy = bannerCopy[kind];

  return (
    <div className="rounded-lg border border-[color:var(--color-accent)]/20 bg-[color:var(--color-accent-soft)] px-5 py-4 text-sm text-[color:var(--color-primary)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-semibold">{copy.title}</p>
          <p className="text-[color:var(--color-secondary-ink)]">{copy.body}</p>
        </div>
        <Link
          href="/admin"
          className="ui-button ui-button-accent h-10 px-4 text-sm"
        >
          管理画面へ
        </Link>
      </div>
    </div>
  );
}
