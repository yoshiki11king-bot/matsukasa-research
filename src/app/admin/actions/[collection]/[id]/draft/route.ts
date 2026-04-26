import {
  draftItem,
  ensureAdmin,
  getEntityOrNull,
  resolveAdminError,
  redirectWithResult,
  refreshCollectionPaths,
  resolveCollection,
} from "../../../content-helpers";

type DraftRouteProps = {
  params: Promise<{
    collection: string;
    id: string;
  }>;
};

export async function POST(request: Request, { params }: DraftRouteProps) {
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
    await draftItem(collection, id);
    refreshCollectionPaths(collection, entity.slug);
    return redirectWithResult(request, "/admin", { message: "drafted" });
  } catch (error) {
    console.error("Failed to move item to draft", error);
    return redirectWithResult(request, "/admin", { error: resolveAdminError(error) });
  }
}
