import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  contentBlocksToBody,
  contentBlocksToMicroCMSPayload,
  normalizeHeadingLevel,
} from "@/lib/content-blocks";
import { normalizeD3ChartInput, parseD3ChartJSON } from "@/lib/d3-chart";
import {
  changeCollectionStatus,
  createCollectionItem,
  deleteCollectionItem,
  getAdminEntity,
  getPublicTag,
  isAdminCollectionKey,
  updateCollectionItem,
  uploadAsset,
} from "@/lib/microcms";
import { requireAdmin } from "@/lib/admin-session";
import { slugify } from "@/lib/post-helpers";
import type { AdminCollectionKey, ContentBlock } from "@/lib/types";

type CollectionPayload = {
  slug?: string;
  [key: string]: unknown;
};

type PayloadError = {
  error: string;
};

export async function ensureAdmin() {
  await requireAdmin();
}

export function resolveCollection(value: string): AdminCollectionKey | null {
  return isAdminCollectionKey(value) ? value : null;
}

export function redirectWithResult(request: Request, path: string, params: Record<string, string>) {
  const url = new URL(path, request.url);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url, 303);
}

export function isPayloadError(payload: CollectionPayload | PayloadError): payload is PayloadError {
  return typeof (payload as PayloadError).error === "string";
}

export function resolveAdminError(error: unknown) {
  if (error instanceof Error && error.message.includes("not configured")) {
    return "config";
  }

  return "request";
}

function parseText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function parseFile(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : null;
}

function parseEntryText(value?: FormDataEntryValue) {
  return typeof value === "string" ? value.trim() : "";
}

function parseEntryFile(value?: FormDataEntryValue) {
  return value instanceof File && value.size > 0 ? value : null;
}

async function resolveSingleAsset(
  formData: FormData,
  fileField: string,
  existingField: string,
  removeField: string,
) {
  let value = parseText(formData.get(existingField)) || undefined;
  const remove = formData.get(removeField) === "1";
  const file = parseFile(formData.get(fileField));

  if (file) {
    value = await uploadAsset(file);
  } else if (remove) {
    value = "";
  }

  return value;
}

async function resolveFigureText(formData: FormData) {
  const existing = parseText(formData.get("figuresText"));
  const files = formData.getAll("figureFiles").filter((item): item is File => item instanceof File && item.size > 0);

  if (files.length === 0) {
    return existing;
  }

  const uploaded = await Promise.all(files.map((file) => uploadAsset(file)));
  const currentLines = existing
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  uploaded.forEach((url, index) => {
    currentLines.push(`図表 ${currentLines.length + index + 1} | ${url}`);
  });

  return currentLines.join("\n");
}

async function resolveBodyWithInlineImages(
  formData: FormData,
  bodyField: string,
  fileField = "inlineImageFiles",
) {
  const body = parseText(formData.get(bodyField));
  const files = formData.getAll(fileField).filter((item): item is File => item instanceof File && item.size > 0);

  if (files.length === 0) {
    return body;
  }

  const uploaded = await Promise.all(files.map((file) => uploadAsset(file)));
  const snippets = uploaded.map((url, index) => `![画像 ${index + 1}](${url})`);

  return [body, ...snippets].filter(Boolean).join("\n\n");
}

async function resolveContentBlocks(formData: FormData): Promise<ContentBlock[]> {
  const entries = new Map<number, Record<string, FormDataEntryValue>>();

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^contentBlocks\[(\d+)\]\[(.+)\]$/);

    if (!match) {
      continue;
    }

    const index = Number(match[1]);
    const field = match[2];
    const current = entries.get(index) ?? {};
    current[field] = value;
    entries.set(index, current);
  }

  const blocks: ContentBlock[] = [];

  for (const index of [...entries.keys()].sort((left, right) => left - right)) {
    const entry = entries.get(index);

    if (!entry) {
      continue;
    }

    const fieldId = parseEntryText(entry.fieldId);

    if (fieldId === "block_heading") {
      const text = parseEntryText(entry.text);

      if (!text) {
        continue;
      }

      blocks.push({
        type: "heading",
        text,
        level: normalizeHeadingLevel(parseEntryText(entry.level)),
      });
      continue;
    }

    if (fieldId === "block_paragraph") {
      const body = parseEntryText(entry.body);

      if (!body) {
        continue;
      }

      blocks.push({
        type: "paragraph",
        body,
      });
      continue;
    }

    if (fieldId === "block_image") {
      const uploadedFile = parseEntryFile(entry.imageFile);
      const imageUrl = uploadedFile ? await uploadAsset(uploadedFile) : parseEntryText(entry.imageUrl);

      if (!imageUrl) {
        continue;
      }

      const caption = parseEntryText(entry.caption);
      const alt = parseEntryText(entry.alt);
      const sourceText = parseEntryText(entry.sourceText);

      blocks.push({
        type: "image",
        image: {
          url: imageUrl,
          alt,
        },
        caption: caption || undefined,
        alt: alt || undefined,
        sourceText: sourceText || undefined,
      });
      continue;
    }

    if (fieldId === "block_link") {
      const title = parseEntryText(entry.title);
      const url = parseEntryText(entry.url);
      const description = parseEntryText(entry.description);

      if (!title || !url) {
        continue;
      }

      blocks.push({
        type: "link",
        title,
        url,
        description: description || undefined,
      });
      continue;
    }

    if (fieldId === "block_d3_chart") {
      const title = parseEntryText(entry.title);
      const description = parseEntryText(entry.description);
      const chartType = parseEntryText(entry.chartType) === "line" ? "line" : "bar";
      const xKey = parseEntryText(entry.xKey);
      const yKey = parseEntryText(entry.yKey);
      const yLabel = parseEntryText(entry.yLabel);
      const height = Number(parseEntryText(entry.height)) || 320;
      const parsedData = parseD3ChartJSON(parseEntryText(entry.dataJson));

      if (!parsedData.ok) {
        throw new Error(parsedData.error);
      }

      const normalized = normalizeD3ChartInput({
        title,
        description,
        chartType,
        xKey,
        yKey,
        yLabel,
        height,
        data: Array.isArray(parsedData.data) ? parsedData.data : [],
      });

      if (!normalized) {
        throw new Error("D3グラフの設定が不足しています。");
      }

      blocks.push(normalized);
    }
  }

  return blocks;
}

export async function buildCollectionPayload(
  collection: AdminCollectionKey,
  formData: FormData,
): Promise<CollectionPayload | PayloadError> {
  switch (collection) {
    case "posts": {
      const title = parseText(formData.get("title"));
      const slug = parseText(formData.get("slug")) || slugify(title);
      const format = parseText(formData.get("format"));
      const category = parseText(formData.get("category"));
      const region = parseText(formData.get("region"));
      const authorName = parseText(formData.get("authorName"));
      const excerpt = parseText(formData.get("excerpt"));
      const publishedDateRaw = parseText(formData.get("publishedDate"));
      const methodologySummary = parseText(formData.get("methodologySummary"));
      const sourceBasis = parseText(formData.get("sourceBasis"));
      const updatedNote = parseText(formData.get("updatedNote"));
      const body = parseText(formData.get("body"));
      let contentBlocks: ContentBlock[];

      try {
        contentBlocks = await resolveContentBlocks(formData);
      } catch (error) {
        return { error: error instanceof Error ? error.message : "本文ブロックの設定を確認してください。" };
      }

      if (
        !title ||
        !format ||
        !category ||
        !region ||
        !authorName ||
        !excerpt ||
        !publishedDateRaw ||
        !methodologySummary ||
        !sourceBasis ||
        !updatedNote ||
        (!body && contentBlocks.length === 0)
      ) {
        return { error: "必須項目を埋めてください。" } as const;
      }

      const coverImageUrl = await resolveSingleAsset(
        formData,
        "coverImageFile",
        "existingCoverImageUrl",
        "removeCoverImage",
      );
      const resolvedBody =
        contentBlocks.length > 0
          ? contentBlocksToBody(contentBlocks)
          : await resolveBodyWithInlineImages(formData, "body");

      return {
        title,
        slug,
        format,
        category,
        region,
        authorName,
        excerpt,
        publishedDate: new Date(publishedDateRaw).toISOString(),
        methodologySummary,
        sourceBasis,
        updatedNote,
        body: resolvedBody,
        contentBlocks: contentBlocksToMicroCMSPayload(contentBlocks),
        topicsText: parseText(formData.get("topicsText")),
        researcherSlugsText: parseText(formData.get("researcherSlugsText")),
        methodologySlugsText: parseText(formData.get("methodologySlugsText")),
        keyFindingsText: parseText(formData.get("keyFindingsText")),
        sourceLinksText: parseText(formData.get("sourceLinksText")),
        coverImageUrl,
      };
    }
    case "researchers": {
      const name = parseText(formData.get("name"));
      const slug = parseText(formData.get("slug")) || slugify(name);
      const role = parseText(formData.get("role"));
      const team = parseText(formData.get("team"));
      const summary = parseText(formData.get("summary"));
      const bio = parseText(formData.get("bio"));
      const updatedDateRaw = parseText(formData.get("updatedDate"));
      const sourceBasis = parseText(formData.get("sourceBasis"));

      if (!name || !role || !team || !summary || !bio || !updatedDateRaw || !sourceBasis) {
        return { error: "必須項目を埋めてください。" } as const;
      }

      const portraitImageUrl = await resolveSingleAsset(
        formData,
        "portraitImageFile",
        "existingPortraitImageUrl",
        "removePortraitImage",
      );
      const resolvedBio = await resolveBodyWithInlineImages(formData, "bio");

      return {
        name,
        slug,
        role,
        team,
        summary,
        bio: resolvedBio,
        updatedDate: new Date(updatedDateRaw).toISOString(),
        email: parseText(formData.get("email")),
        focusTopicsText: parseText(formData.get("focusTopicsText")),
        methodologySlugsText: parseText(formData.get("methodologySlugsText")),
        sourceBasis,
        portraitImageUrl,
      };
    }
    case "methodologies": {
      const title = parseText(formData.get("title"));
      const slug = parseText(formData.get("slug")) || slugify(title);
      const summary = parseText(formData.get("summary"));
      const updatedDateRaw = parseText(formData.get("updatedDate"));
      const reviewer = parseText(formData.get("reviewer"));
      const sourceBasis = parseText(formData.get("sourceBasis"));
      const body = parseText(formData.get("body"));

      if (!title || !summary || !updatedDateRaw || !reviewer || !sourceBasis || !body) {
        return { error: "必須項目を埋めてください。" } as const;
      }

      const resolvedBody = await resolveBodyWithInlineImages(formData, "body");

      return {
        title,
        slug,
        summary,
        updatedDate: new Date(updatedDateRaw).toISOString(),
        reviewer,
        focusTopicsText: parseText(formData.get("focusTopicsText")),
        goodForText: parseText(formData.get("goodForText")),
        limitsText: parseText(formData.get("limitsText")),
        sourceBasis,
        body: resolvedBody,
      };
    }
    case "reports": {
      const title = parseText(formData.get("title"));
      const slug = parseText(formData.get("slug")) || slugify(title);
      const summary = parseText(formData.get("summary"));
      const publishedDateRaw = parseText(formData.get("publishedDate"));
      const updatedDateRaw = parseText(formData.get("updatedDate"));
      const reportType = parseText(formData.get("reportType"));
      const region = parseText(formData.get("region"));
      const sourceBasis = parseText(formData.get("sourceBasis"));
      const body = parseText(formData.get("body"));
      let contentBlocks: ContentBlock[];

      try {
        contentBlocks = await resolveContentBlocks(formData);
      } catch (error) {
        return { error: error instanceof Error ? error.message : "本文ブロックの設定を確認してください。" };
      }

      if (
        !title ||
        !summary ||
        !publishedDateRaw ||
        !updatedDateRaw ||
        !reportType ||
        !region ||
        !sourceBasis ||
        (!body && contentBlocks.length === 0)
      ) {
        return { error: "必須項目を埋めてください。" } as const;
      }

      const coverImageUrl = await resolveSingleAsset(
        formData,
        "coverImageFile",
        "existingCoverImageUrl",
        "removeCoverImage",
      );
      const pdfUrl = await resolveSingleAsset(formData, "pdfFile", "existingPdfUrl", "removePdf");
      const figuresText = await resolveFigureText(formData);
      const resolvedBody =
        contentBlocks.length > 0
          ? contentBlocksToBody(contentBlocks)
          : await resolveBodyWithInlineImages(formData, "body");

      return {
        title,
        slug,
        summary,
        publishedDate: new Date(publishedDateRaw).toISOString(),
        updatedDate: new Date(updatedDateRaw).toISOString(),
        reportType,
        region,
        topicNamesText: parseText(formData.get("topicNamesText")),
        researcherSlugsText: parseText(formData.get("researcherSlugsText")),
        methodologySlugsText: parseText(formData.get("methodologySlugsText")),
        sourceLinksText: parseText(formData.get("sourceLinksText")),
        sourceBasis,
        body: resolvedBody,
        contentBlocks: contentBlocksToMicroCMSPayload(contentBlocks),
        coverImageUrl,
        pdfUrl,
        figuresText,
      };
    }
    case "director": {
      const title = parseText(formData.get("title"));
      const slug = parseText(formData.get("slug")) || "director";
      const summary = parseText(formData.get("summary"));
      const body = parseText(formData.get("body"));
      const effectiveDateRaw = parseText(formData.get("effectiveDate"));
      const updatedDateRaw = parseText(formData.get("updatedDate"));
      const stanceTitle = parseText(formData.get("stanceTitle"));
      const stanceDescription = parseText(formData.get("stanceDescription"));
      const relatedSummary = parseText(formData.get("relatedSummary"));

      if (
        !title ||
        !summary ||
        !body ||
        !effectiveDateRaw ||
        !updatedDateRaw ||
        !stanceTitle ||
        !stanceDescription ||
        !relatedSummary
      ) {
        return { error: "必須項目を埋めてください。" } as const;
      }

      const resolvedBody = await resolveBodyWithInlineImages(formData, "body");

      return {
        title,
        slug,
        summary,
        body: resolvedBody,
        effectiveDate: new Date(effectiveDateRaw).toISOString(),
        updatedDate: new Date(updatedDateRaw).toISOString(),
        roleCardsText: parseText(formData.get("roleCardsText")),
        stanceTitle,
        stanceDescription,
        stanceCardsText: parseText(formData.get("stanceCardsText")),
        relatedSummary,
      };
    }
    case "finance": {
      const title = parseText(formData.get("title"));
      const slug = parseText(formData.get("slug")) || "finance";
      const summary = parseText(formData.get("summary"));
      const body = parseText(formData.get("body"));
      const effectiveDateRaw = parseText(formData.get("effectiveDate"));
      const updatedDateRaw = parseText(formData.get("updatedDate"));
      const contactText = parseText(formData.get("contactText"));

      if (!title || !summary || !body || !effectiveDateRaw || !updatedDateRaw || !contactText) {
        return { error: "必須項目を埋めてください。" } as const;
      }

      const resolvedBody = await resolveBodyWithInlineImages(formData, "body");

      return {
        title,
        slug,
        summary,
        body: resolvedBody,
        effectiveDate: new Date(effectiveDateRaw).toISOString(),
        updatedDate: new Date(updatedDateRaw).toISOString(),
        disclosureItemsText: parseText(formData.get("disclosureItemsText")),
        disclosureTableText: parseText(formData.get("disclosureTableText")),
        policyItemsText: parseText(formData.get("policyItemsText")),
        contactText,
      };
    }
    case "financialStatements": {
      const title = parseText(formData.get("title"));
      const slug = parseText(formData.get("slug")) || slugify(title);
      const fiscalYear = parseText(formData.get("fiscalYear"));
      const summary = parseText(formData.get("summary"));
      const publishedDateRaw = parseText(formData.get("publishedDate"));
      const updatedDateRaw = parseText(formData.get("updatedDate"));
      const sourceBasis = parseText(formData.get("sourceBasis"));
      const body = parseText(formData.get("body"));

      if (
        !title ||
        !fiscalYear ||
        !summary ||
        !publishedDateRaw ||
        !updatedDateRaw ||
        !sourceBasis ||
        !body
      ) {
        return { error: "必須項目を埋めてください。" } as const;
      }

      const pdfUrl = await resolveSingleAsset(formData, "pdfFile", "existingPdfUrl", "removePdf");
      const resolvedBody = await resolveBodyWithInlineImages(formData, "body");

      return {
        title,
        slug,
        fiscalYear,
        summary,
        publishedDate: new Date(publishedDateRaw).toISOString(),
        updatedDate: new Date(updatedDateRaw).toISOString(),
        pdfUrl,
        highlightsText: parseText(formData.get("highlightsText")),
        sourceBasis,
        body: resolvedBody,
      };
    }
  }
}

export async function getEntityOrNull(collection: AdminCollectionKey, id: string) {
  try {
    return await getAdminEntity(collection, id);
  } catch (error) {
    console.error("Failed to load admin entity", error);
    return null;
  }
}

export function getAdminEditPath(collection: AdminCollectionKey, id: string) {
  return `/admin/${collection}/${id}/edit`;
}

export function getAdminNewPath(collection: AdminCollectionKey) {
  return `/admin/${collection}/new`;
}

export function getAdminCollectionPath(collection: AdminCollectionKey) {
  return `/admin#${collection}`;
}

export function getPublicPath(collection: AdminCollectionKey, slug: string) {
  switch (collection) {
    case "posts":
      return `/posts/${slug}`;
    case "researchers":
      return `/researchers/${slug}`;
    case "methodologies":
      return `/methodologies/${slug}`;
    case "reports":
      return `/reports/${slug}`;
    case "director":
      return "/director";
    case "finance":
      return "/finance";
    case "financialStatements":
      return "/finance";
  }
}

function getCollectionIndexPath(collection: AdminCollectionKey) {
  switch (collection) {
    case "posts":
      return "/";
    case "researchers":
      return "/researchers";
    case "methodologies":
      return "/methodologies";
    case "reports":
      return "/reports";
    case "director":
      return "/director";
    case "finance":
      return "/finance";
    case "financialStatements":
      return "/finance";
  }
}

export function refreshCollectionPaths(collection: AdminCollectionKey, slug?: string) {
  revalidateTag(getPublicTag(collection), "max");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(getCollectionIndexPath(collection));
  revalidatePath("/director");
  revalidatePath("/finance");

  if (slug) {
    revalidatePath(getPublicPath(collection, slug));
  }
}

export async function createItem(
  collection: AdminCollectionKey,
  payload: Record<string, unknown>,
  draft: boolean,
) {
  return createCollectionItem(collection, payload, draft);
}

export async function updateItem(
  collection: AdminCollectionKey,
  id: string,
  payload: Record<string, unknown>,
  draft: boolean,
) {
  return updateCollectionItem(collection, id, payload, draft);
}

export async function publishItem(collection: AdminCollectionKey, id: string) {
  return changeCollectionStatus(collection, id, "PUBLISH");
}

export async function draftItem(collection: AdminCollectionKey, id: string) {
  return changeCollectionStatus(collection, id, "DRAFT");
}

export async function deleteItem(collection: AdminCollectionKey, id: string) {
  return deleteCollectionItem(collection, id);
}
