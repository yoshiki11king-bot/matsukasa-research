import {
  buildCollectionPayload,
  ensureAdmin,
  getAdminEditPath,
  getEntityOrNull,
  isPayloadError,
  resolveAdminError,
  redirectWithResult,
  refreshCollectionPaths,
  resolveCollection,
  updateItem,
  publishItem,
} from "../../../content-helpers";

type UpdateRouteProps = {
  params: Promise<{
    collection: string;
    id: string;
  }>;
};

export async function POST(request: Request, { params }: UpdateRouteProps) {
  await ensureAdmin();

  const { collection: rawCollection, id } = await params;
  const collection = resolveCollection(rawCollection);

  if (!collection) {
    return redirectWithResult(request, "/admin", { error: "notfound" });
  }

  const currentEntity = await getEntityOrNull(collection, id);

  if (!currentEntity) {
    return redirectWithResult(request, "/admin", { error: "notfound" });
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "publish") === "draft" ? "draft" : "publish";
  const payload = await buildCollectionPayload(collection, formData);

  if (isPayloadError(payload)) {
    return redirectWithResult(request, getAdminEditPath(collection, id), { error: payload.error });
  }

  try {
    if (intent === "draft") {
      await updateItem(collection, id, payload, true);
    } else if (currentEntity.status.includes("DRAFT") && !currentEntity.status.includes("PUBLISH")) {
      await updateItem(collection, id, payload, true);
      await publishItem(collection, id);
    } else {
      await updateItem(collection, id, payload, false);
    }

    refreshCollectionPaths(collection, payload.slug ?? currentEntity.slug);
    return redirectWithResult(request, getAdminEditPath(collection, id), { message: "updated" });
  } catch (error) {
    console.error("Failed to update item", error);
    return redirectWithResult(request, getAdminEditPath(collection, id), { error: resolveAdminError(error) });
  }
}
