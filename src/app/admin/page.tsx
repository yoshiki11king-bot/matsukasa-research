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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();

  const collections: AdminCollectionKey[] = ["posts", "researchers", "methodologies", "reports", "director"];
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
  const financialReports = reports.filter((item) => isFinancialReport(item as AdminReport));

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

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[color:var(--color-muted)]">記事</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{posts.length}</p>
        </div>
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[color:var(--color-muted)]">研究員</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{researchers.length}</p>
        </div>
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[color:var(--color-muted)]">方法論</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{methodologies.length}</p>
        </div>
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[color:var(--color-muted)]">報告書</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{reports.length}</p>
        </div>
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[color:var(--color-muted)]">所長ページ</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{directorPages.length}</p>
        </div>
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[color:var(--color-muted)]">決算資料</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">{financialReports.length}</p>
        </div>
      </section>

      <div className="space-y-6">
        <CollectionSection collection="posts" items={posts} />
        <CollectionSection collection="researchers" items={researchers} />
        <CollectionSection collection="methodologies" items={methodologies} />
        <CollectionSection collection="reports" items={reports} />
        <CollectionSection collection="director" items={directorPages} />
      </div>
    </AdminShell>
  );
}
