import {
  buildCollectionPayload,
  createItem,
  ensureAdmin,
  getAdminEditPath,
  getAdminNewPath,
  isPayloadError,
  resolveAdminError,
  redirectWithResult,
  refreshCollectionPaths,
  resolveCollection,
} from "../../content-helpers";

type CreateRouteProps = {
  params: Promise<{
    collection: string;
  }>;
};

export async function POST(request: Request, { params }: CreateRouteProps) {
  await ensureAdmin();

  const { collection: rawCollection } = await params;
  const collection = resolveCollection(rawCollection);

  if (!collection) {
    return redirectWithResult(request, "/admin", { error: "notfound" });
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "draft") === "publish" ? "publish" : "draft";
  const payload = await buildCollectionPayload(collection, formData);

  if (isPayloadError(payload)) {
    return redirectWithResult(request, getAdminNewPath(collection), { error: payload.error });
  }

  try {
    const id = await createItem(collection, payload, intent === "draft");
    refreshCollectionPaths(collection, payload.slug);
    return redirectWithResult(request, getAdminEditPath(collection, id), {
      message: intent === "publish" ? "published" : "created",
    });
  } catch (error) {
    console.error("Failed to create item", error);
    return redirectWithResult(request, getAdminNewPath(collection), { error: resolveAdminError(error) });
  }
}
