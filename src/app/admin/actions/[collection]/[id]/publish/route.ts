import {
  ensureAdmin,
  getEntityOrNull,
  resolveAdminError,
  publishItem,
  redirectWithResult,
  refreshCollectionPaths,
  resolveCollection,
} from "../../../content-helpers";

type PublishRouteProps = {
  params: Promise<{
    collection: string;
    id: string;
  }>;
};

export async function POST(request: Request, { params }: PublishRouteProps) {
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
    await publishItem(collection, id);
    refreshCollectionPaths(collection, entity.slug);
    return redirectWithResult(request, "/admin", { message: "published" });
  } catch (error) {
    console.error("Failed to publish item", error);
    return redirectWithResult(request, "/admin", { error: resolveAdminError(error) });
  }
}
