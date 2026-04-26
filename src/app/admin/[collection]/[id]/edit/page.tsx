import { notFound } from "next/navigation";
import { FlashMessage } from "@/components/flash-message";
import { AdminContentForm } from "@/components/admin-content-form";
import { AdminShell } from "@/components/admin-shell";
import { cmsStatus, getAdminEntity, isAdminCollectionKey } from "@/lib/microcms";
import { collectionLabel } from "@/lib/post-helpers";
import { requireAdmin } from "@/lib/admin-session";

type AdminEditEntityPageProps = {
  params: Promise<{
    collection: string;
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

const messageMap: Record<string, string> = {
  created: "作成しました。",
  updated: "更新しました。",
  published: "公開しました。",
};

const errorMap: Record<string, string> = {
  config: "microCMS の環境変数が不足しています。",
  missing: "必要な入力が足りませんでした。",
  request: "保存時に microCMS へのリクエストで失敗しました。",
  notfound: "対象のコンテンツが見つかりませんでした。",
};

export default async function AdminEditEntityPage({
  params,
  searchParams,
}: AdminEditEntityPageProps) {
  await requireAdmin();

  const { collection, id } = await params;

  if (!isAdminCollectionKey(collection)) {
    notFound();
  }

  const entity = await getAdminEntity(collection, id);

  if (!entity) {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const message = resolvedSearchParams.message ? messageMap[resolvedSearchParams.message] : null;
  const error = resolvedSearchParams.error ? errorMap[resolvedSearchParams.error] : undefined;

  return (
    <AdminShell
      title={`${collectionLabel(collection)}を編集`}
      description="編集内容は公開面にも反映されます。"
    >
      {message ? <FlashMessage tone="success" message={message} /> : null}
      {error ? <FlashMessage tone="error" message={error} /> : null}
      <AdminContentForm
        collection={collection}
        action={`/admin/actions/${collection}/${entity.id}/update`}
        entity={entity}
        error={error}
        configured={cmsStatus.configured}
      />
    </AdminShell>
  );
}
