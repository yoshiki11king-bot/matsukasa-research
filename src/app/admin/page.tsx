import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { FlashMessage } from "@/components/flash-message";
import { cmsStatus, getAdminCollection, getEntityTitle } from "@/lib/microcms";
import { formatDate, formatShortDate } from "@/lib/formatters";
import { collectionLabel, statusLabel, statusTone } from "@/lib/post-helpers";
import { requireAdmin } from "@/lib/admin-session";
import type { AdminCollectionKey, AdminEntity, AdminReport } from "@/lib/types";

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

const messageMap: Record<string, string> = {
  created: "作成しました。",
  updated: "更新しました。",
  deleted: "削除しました。",
  published: "公開しました。",
  drafted: "下書きに戻しました。",
};

const errorMap: Record<string, string> = {
  config: "microCMS の環境変数が不足しています。",
  missing: "必要な入力が足りませんでした。",
  request: "microCMS へのリクエストに失敗しました。API キー権限を確認してください。",
  notfound: "対象のコンテンツが見つかりませんでした。",
};

function getPublicPath(collection: AdminCollectionKey, entity: AdminEntity) {
  switch (collection) {
    case "posts":
      return `/posts/${entity.slug}`;
    case "researchers":
      return `/researchers/${entity.slug}`;
    case "methodologies":
      return `/methodologies/${entity.slug}`;
    case "reports":
      return `/reports/${entity.slug}`;
    case "director":
      return "/director";
    case "finance":
      return "/finance";
    case "financialStatements":
      return "/finance";
  }
}

function getEntityTimingLabel(collection: AdminCollectionKey, entity: AdminEntity) {
  if (collection === "director") {
    return `反映 ${formatShortDate((entity as AdminEntity & { effectiveDate?: string }).effectiveDate)}`;
  }

  if (collection === "finance") {
    return `反映 ${formatShortDate((entity as AdminEntity & { effectiveDate?: string }).effectiveDate)}`;
  }

  if (collection === "financialStatements") {
    return `公開 ${formatShortDate((entity as AdminEntity & { publishedDate?: string }).publishedDate)}`;
  }

  return `更新 ${formatShortDate(entity.updatedAt)}`;
}

function getEntityLocationLabel(collection: AdminCollectionKey, entity: AdminEntity) {
  if (collection === "director") {
    return "/director";
  }

  if (collection === "finance" || collection === "financialStatements") {
    return "/finance";
  }

  return `/${collection}/${entity.slug}`;
}

function isFinancialReport(item: AdminReport) {
  const text = `${item.reportType} ${item.title}`.toLowerCase();
  return text.includes("決算") || text.includes("財務");
}

function isPublished(entity: AdminEntity) {
  return entity.status.includes("PUBLISH") || entity.status.includes("PUBLISH_AND_DRAFT");
}

function isDraftLike(entity: AdminEntity) {
  return entity.status.includes("DRAFT") || entity.status.includes("PUBLISH_AND_DRAFT");
}

function getLatestUpdatedAt(items: AdminEntity[]) {
  const latest = items
    .map((item) => item.updatedAt)
    .filter(Boolean)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return latest ? formatDate(latest) : "未更新";
}

function getCollectionHealth(items: AdminEntity[]) {
  return {
    total: items.length,
    published: items.filter(isPublished).length,
    draft: items.filter(isDraftLike).length,
    latest: getLatestUpdatedAt(items),
  };
}

function flattenCollections(collections: Array<[AdminCollectionKey, AdminEntity[]]>) {
  return collections.flatMap(([collection, items]) => items.map((item) => ({ collection, item })));
}

function CollectionSection({
  collection,
  items,
}: {
  collection: AdminCollectionKey;
  items: AdminEntity[];
}) {
  return (
    <section
      id={collection}
      className="space-y-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[color:var(--color-primary)]">{collectionLabel(collection)}</p>
          <p className="text-sm text-[color:var(--color-muted)]">{items.length} 件</p>
        </div>
        <Link
          href={`/admin/${collection}/new`}
          className="ui-button ui-button-primary h-10 px-4 text-sm"
        >
          新規作成
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)]">
          <div className="grid grid-cols-[minmax(0,1.2fr)_120px_120px_120px] gap-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)] px-4 py-3 text-sm font-medium text-[color:var(--color-muted)]">
            <p>タイトル</p>
            <p>状態</p>
            <p>更新</p>
            <p>操作</p>
          </div>
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[minmax(0,1.2fr)_120px_120px_120px] gap-4 border-b border-[color:var(--color-border)] px-4 py-4 text-sm last:border-b-0"
            >
              <div className="space-y-1">
                <p className="font-medium text-[color:var(--color-primary)]">{getEntityTitle(item, collection)}</p>
                <p className="text-[color:var(--color-muted)]">
                  {getEntityLocationLabel(collection, item)} ・ {getEntityTimingLabel(collection, item)}
                </p>
              </div>
              <div>
                <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${statusTone(item.status)}`}>
                  {statusLabel(item.status)}
                </span>
              </div>
              <p className="text-[color:var(--color-secondary-ink)]">{formatDate(item.updatedAt)}</p>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/admin/${collection}/${item.id}/edit`}
                  className="text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]"
                >
                  編集
                </Link>
                <Link
                  href={getPublicPath(collection, item)}
                  className="text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]"
                >
                  表示
                </Link>
                {item.status.includes("DRAFT") && !item.status.includes("PUBLISH") ? (
                  <form action={`/admin/actions/${collection}/${item.id}/publish`} method="post">
                    <button type="submit" className="text-left text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]">
                      公開
                    </button>
                  </form>
                ) : null}
                {item.status.includes("PUBLISH") && !item.status.includes("DRAFT") ? (
                  <form action={`/admin/actions/${collection}/${item.id}/draft`} method="post">
                    <button type="submit" className="text-left text-[color:var(--color-text)] transition hover:text-[color:var(--color-primary)]">
                      下書きへ
                    </button>
                  </form>
                ) : null}
                <form action={`/admin/actions/${collection}/${item.id}/delete`} method="post">
                  <button
                    type="submit"
                    className="text-left text-[color:#8d4b50] transition hover:text-[color:#7a3e43]"
                  >
                    削除
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[color:var(--color-border-strong)] px-4 py-8 text-sm text-[color:var(--color-secondary-ink)]">
          まだ {collectionLabel(collection)} がありません。
        </div>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
      <p className="text-sm text-[color:var(--color-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{value}</p>
      <p className="mt-2 text-xs leading-6 text-[color:var(--color-secondary-ink)]">{note}</p>
    </div>
  );
}

function QuickActionPanel() {
  const actions = [
    { href: "/admin/posts/new", label: "記事を書く", note: "短い分析や告知" },
    { href: "/admin/reports/new", label: "報告書を作る", note: "PDF・図表つき資料" },
    { href: "/admin/methodologies/new", label: "方法論を追加", note: "調査の前提を公開" },
    { href: "/admin/researchers/new", label: "研究員を追加", note: "担当者プロフィール" },
    { href: "/admin/director/new", label: "所長ページ", note: "運営姿勢の固定ページ" },
    { href: "/admin/finance/new", label: "財務ページ", note: "公開方針の固定ページ" },
    { href: "/admin/financialStatements/new", label: "決算資料", note: "年度ごとの資料" },
  ];

  return (
    <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[color:var(--color-primary)]">作業入口</p>
          <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
            よく使う管理作業へ直接進めます。
          </p>
        </div>
        <Link href="/" className="ui-button ui-button-secondary h-10 px-4 text-sm">
          公開サイトを見る
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-4 transition hover:border-[color:var(--color-border-stronger)] hover:bg-[color:var(--color-surface-muted)]"
          >
            <p className="text-sm font-semibold text-[color:var(--color-primary)]">{action.label}</p>
            <p className="mt-2 text-xs leading-6 text-[color:var(--color-secondary-ink)]">{action.note}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AdminWorkQueue({
  collections,
}: {
  collections: Array<[AdminCollectionKey, AdminEntity[]]>;
}) {
  const allItems = flattenCollections(collections);
  const draftItems = allItems
    .filter(({ item }) => isDraftLike(item))
    .sort((left, right) => new Date(right.item.updatedAt).getTime() - new Date(left.item.updatedAt).getTime())
    .slice(0, 8);
  const recentItems = [...allItems]
    .sort((left, right) => new Date(right.item.updatedAt).getTime() - new Date(left.item.updatedAt).getTime())
    .slice(0, 8);
  const fixedPages = allItems.filter(({ collection }) =>
    collection === "director" || collection === "finance" || collection === "financialStatements"
  );

  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-semibold text-[color:var(--color-primary)]">下書きキュー</p>
        <p className="mt-1 text-xs leading-6 text-[color:var(--color-secondary-ink)]">公開前に確認するものです。</p>
        <div className="mt-4 space-y-3">
          {draftItems.length > 0 ? (
            draftItems.map(({ collection, item }) => (
              <Link
                key={`${collection}-${item.id}`}
                href={`/admin/${collection}/${item.id}/edit`}
                className="block rounded-lg border border-[color:var(--color-border)] px-4 py-3 transition hover:border-[color:var(--color-border-stronger)]"
              >
                <p className="text-sm font-medium text-[color:var(--color-primary)]">{getEntityTitle(item, collection)}</p>
                <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                  {collectionLabel(collection)} ・ {formatShortDate(item.updatedAt)}
                </p>
              </Link>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-[color:var(--color-border)] px-4 py-6 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
              いま確認待ちの下書きはありません。
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-semibold text-[color:var(--color-primary)]">最近更新</p>
        <p className="mt-1 text-xs leading-6 text-[color:var(--color-secondary-ink)]">直近で触った内容を戻りやすくします。</p>
        <div className="mt-4 space-y-3">
          {recentItems.map(({ collection, item }) => (
            <Link
              key={`${collection}-${item.id}`}
              href={`/admin/${collection}/${item.id}/edit`}
              className="block rounded-lg border border-[color:var(--color-border)] px-4 py-3 transition hover:border-[color:var(--color-border-stronger)]"
            >
              <p className="text-sm font-medium text-[color:var(--color-primary)]">{getEntityTitle(item, collection)}</p>
              <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                {collectionLabel(collection)} ・ {statusLabel(item.status)} ・ {formatShortDate(item.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-semibold text-[color:var(--color-primary)]">基盤整備メモ</p>
        <p className="mt-1 text-xs leading-6 text-[color:var(--color-secondary-ink)]">外部基盤が必要な領域を見失わないための置き場です。</p>
        <div className="mt-4 grid gap-3">
          {[
            ["閲覧データ", "Vercel Analytics か GA を決めてから月間PVを表示します。"],
            ["モニター募集", "フォーム基盤を決めてから応募一覧を接続します。"],
            ["メルマガ登録者", "配信サービス決定後に購読者管理を追加します。"],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-3">
              <p className="text-sm font-medium text-[color:var(--color-primary)]">{title}</p>
              <p className="mt-1 text-xs leading-6 text-[color:var(--color-secondary-ink)]">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
          <p className="text-xs font-semibold text-[color:var(--color-muted)]">固定ページ</p>
          <p className="mt-2 text-sm text-[color:var(--color-secondary-ink)]">{fixedPages.length} 件を管理対象にしています。</p>
        </div>
      </div>
    </section>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();

  const collections: AdminCollectionKey[] = [
    "posts",
    "reports",
    "methodologies",
    "researchers",
    "director",
    "finance",
    "financialStatements",
  ];
  const settledCollections = await Promise.allSettled(
    collections.map(async (collection) => [collection, await getAdminCollection(collection)] as const),
  );
  const collectionMap = new Map<AdminCollectionKey, AdminEntity[]>();
  let hasLoadError = false;

  for (const result of settledCollections) {
    if (result.status === "fulfilled") {
      collectionMap.set(result.value[0], result.value[1]);
    } else {
      hasLoadError = true;
      console.error("Failed to load admin collection", result.reason);
    }
  }

  const posts = collectionMap.get("posts") ?? [];
  const researchers = collectionMap.get("researchers") ?? [];
  const methodologies = collectionMap.get("methodologies") ?? [];
  const reports = collectionMap.get("reports") ?? [];
  const directorPages = collectionMap.get("director") ?? [];
  const financePages = collectionMap.get("finance") ?? [];
  const financialStatements = collectionMap.get("financialStatements") ?? [];
  const financialReports = reports.filter((item) => isFinancialReport(item as AdminReport));
  const contentGroups: Array<[AdminCollectionKey, AdminEntity[]]> = [
    ["posts", posts],
    ["reports", reports],
    ["methodologies", methodologies],
    ["researchers", researchers],
    ["director", directorPages],
    ["finance", financePages],
    ["financialStatements", financialStatements],
  ];
  const allContent = flattenCollections(contentGroups).map(({ item }) => item);
  const health = {
    all: getCollectionHealth(allContent),
    posts: getCollectionHealth(posts),
    reports: getCollectionHealth(reports),
    methodologies: getCollectionHealth(methodologies),
    researchers: getCollectionHealth(researchers),
    fixed: getCollectionHealth([...directorPages, ...financePages, ...financialStatements]),
  };

  const resolvedSearchParams = (await searchParams) ?? {};
  const message = resolvedSearchParams.message ? messageMap[resolvedSearchParams.message] : null;
  const error = resolvedSearchParams.error ? errorMap[resolvedSearchParams.error] : null;

  return (
    <AdminShell
      title="一元管理ダッシュボード"
      description="記事、研究員、方法論、報告書をここからまとめて管理します。"
    >
      {message ? <FlashMessage tone="success" message={message} /> : null}
      {error ? <FlashMessage tone="error" message={error} /> : null}
      {hasLoadError ? (
        <FlashMessage
          tone="warning"
          message="一部の管理一覧の読み込みに失敗しました。保存データは生きている可能性が高いので、編集画面から確認してください。"
        />
      ) : null}
      <FlashMessage
        tone="warning"
        message="無料プラン運用中のため、財務情報ページは固定ページです。決算資料は「報告書」で作成し、種類を「決算資料」にしてください。"
      />

      {!cmsStatus.configured ? (
        <FlashMessage
          tone="warning"
          message="microCMS 側のサービスドメインと API キーがまだ入っていません。接続後に実データへ切り替わります。"
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="総コンテンツ" value={health.all.total} note={`公開 ${health.all.published} / 下書き ${health.all.draft}`} />
        <MetricCard label="記事" value={health.posts.total} note={`最終更新 ${health.posts.latest}`} />
        <MetricCard label="報告書" value={health.reports.total} note={`決算系 ${financialReports.length} 件`} />
        <MetricCard label="方法論・研究員" value={health.methodologies.total + health.researchers.total} note={`方法論 ${health.methodologies.total} / 研究員 ${health.researchers.total}`} />
        <MetricCard label="固定ページ" value={health.fixed.total} note={`所長 ${directorPages.length} / 財務 ${financePages.length} / 決算 ${financialStatements.length}`} />
      </section>

      <QuickActionPanel />
      <AdminWorkQueue collections={contentGroups} />

      <div className="space-y-6">
        {contentGroups.map(([collection, items]) => (
          <CollectionSection key={collection} collection={collection} items={items} />
        ))}
      </div>
    </AdminShell>
  );
}
