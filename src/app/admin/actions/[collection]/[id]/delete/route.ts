import {
  deleteItem,
  ensureAdmin,
  getEntityOrNull,
  resolveAdminError,
  redirectWithResult,
  refreshCollectionPaths,
  resolveCollection,
} from "../../../content-helpers";

type DeleteRouteProps = {
  params: Promise<{
    collection: string;
    id: string;
  }>;
};

export async function POST(request: Request, { params }: DeleteRouteProps) {
  await ensureAdmin();
  const { collection: rawCollection, id } = await params;
  const collection = resolveCollection(rawCollection);

  if (!collection) {
    return redirectWithResult(request, "/admin", { error: "notfound" });
  }

  const entity = await getEntityOrNull(collection, id);

  if (!entity) {
    return redirectWithResult(request, "/admin", { error: "notfound" });
  }

  try {
    await deleteItem(collection, id);
    refreshCollectionPaths(collection, entity.slug);
    return redirectWithResult(request, "/admin", { message: "deleted" });
  } catch (error) {
    console.error("Failed to delete item", error);
    return redirectWithResult(request, "/admin", { error: resolveAdminError(error) });
  }
}
