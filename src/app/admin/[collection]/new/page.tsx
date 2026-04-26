import { notFound } from "next/navigation";
import { AdminContentForm } from "@/components/admin-content-form";
import { AdminShell } from "@/components/admin-shell";
import { cmsStatus, isAdminCollectionKey } from "@/lib/microcms";
import { collectionLabel } from "@/lib/post-helpers";
import { requireAdmin } from "@/lib/admin-session";

type AdminNewEntityPageProps = {
  params: Promise<{
    collection: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminNewEntityPage({
  params,
  searchParams,
}: AdminNewEntityPageProps) {
  await requireAdmin();

  const { collection } = await params;
  if (!isAdminCollectionKey(collection)) {
    notFound();
  }

  const resolvedSearchParams = (await searchParams) ?? {};

  return (
    <AdminShell
      title={`新規${collectionLabel(collection)}`}
      description={`${collectionLabel(collection)}の作成、下書き保存、公開ができます。`}
    >
      <AdminContentForm
        collection={collection}
        action={`/admin/actions/${collection}/create`}
        error={resolvedSearchParams.error}
        configured={cmsStatus.configured}
      />
    </AdminShell>
  );
}
