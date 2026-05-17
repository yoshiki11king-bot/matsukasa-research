import "server-only";

import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildMarkdownDocument, parseFrontmatter, type Frontmatter } from "@/lib/content/frontmatter";
import { isValidSlug, type LocalPressContentType } from "@/lib/content/config";
import type { LocalChart, LocalMarkdownDocument, LocalResearcher } from "@/lib/content/types";

export const CONTENT_ROOT = path.join(process.cwd(), "content");

export function assertSafeSlug(slug: string) {
  if (!isValidSlug(slug)) {
    throw new Error("Invalid slug");
  }
}

export function assertInsideContentRoot(filePath: string) {
  const resolvedRoot = path.resolve(CONTENT_ROOT);
  const resolvedFile = path.resolve(filePath);

  if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("Path traversal is not allowed");
  }
}

export function getRelativeSavePath(type: LocalPressContentType, slug: string, frontmatter?: Frontmatter) {
  if (type === "director") {
    return "director/index.md";
  }

  if (type === "finance") {
    return "finance/index.md";
  }

  if (type === "financial-statements") {
    const year = String(frontmatter?.year ?? slug);
    assertSafeSlug(year);
    return `financial-statements/${year}.md`;
  }

  assertSafeSlug(slug);

  if (type === "researchers") {
    return `researchers/${slug}.json`;
  }

  if (type === "charts") {
    return `charts/${slug}.json`;
  }

  return `${type}/${slug}.md`;
}

export function getAbsoluteSavePath(type: LocalPressContentType, slug: string, frontmatter?: Frontmatter) {
  const relativePath = getRelativeSavePath(type, slug, frontmatter);
  const fullPath = path.join(CONTENT_ROOT, relativePath);
  assertInsideContentRoot(fullPath);
  return { fullPath, relativePath };
}

async function fileExists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function saveMarkdownDocument({
  type,
  slug,
  frontmatter,
  body,
  overwrite,
}: {
  type: LocalPressContentType;
  slug: string;
  frontmatter: Frontmatter;
  body: string;
  overwrite?: boolean;
}) {
  const { fullPath, relativePath } = getAbsoluteSavePath(type, slug, frontmatter);

  if (!overwrite && (await fileExists(fullPath))) {
    return { ok: false as const, status: 409, relativePath };
  }

  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buildMarkdownDocument(frontmatter, body), "utf8");
  return { ok: true as const, status: 200, relativePath };
}

export async function saveJsonDocument({
  type,
  slug,
  data,
  overwrite,
}: {
  type: "researchers" | "charts";
  slug: string;
  data: LocalResearcher | LocalChart;
  overwrite?: boolean;
}) {
  const { fullPath, relativePath } = getAbsoluteSavePath(type, slug);

  if (!overwrite && (await fileExists(fullPath))) {
    return { ok: false as const, status: 409, relativePath };
  }

  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return { ok: true as const, status: 200, relativePath };
}

export async function readMarkdownDocument(relativePath: string): Promise<LocalMarkdownDocument | null> {
  const fullPath = path.join(CONTENT_ROOT, relativePath);
  assertInsideContentRoot(fullPath);

  try {
    const source = await readFile(fullPath, "utf8");
    const parsed = parseFrontmatter(source);
    const slug = String(parsed.frontmatter.slug ?? path.basename(relativePath, ".md"));

    return {
      slug,
      frontmatter: parsed.frontmatter,
      body: parsed.body,
      path: relativePath,
    };
  } catch {
    return null;
  }
}

export async function readJsonDocument<T>(relativePath: string): Promise<T | null> {
  const fullPath = path.join(CONTENT_ROOT, relativePath);
  assertInsideContentRoot(fullPath);

  try {
    return JSON.parse(await readFile(fullPath, "utf8")) as T;
  } catch {
    return null;
  }
}

export function isPublishedDocument(document: LocalMarkdownDocument | null): document is LocalMarkdownDocument {
  return document?.frontmatter.status === "published";
}

export async function listMarkdownDocuments(folder: string) {
  const folderPath = path.join(CONTENT_ROOT, folder);
  assertInsideContentRoot(folderPath);

  try {
    const entries = await readdir(folderPath, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
    const documents = await Promise.all(files.map((entry) => readMarkdownDocument(`${folder}/${entry.name}`)));
    return documents.filter((item): item is LocalMarkdownDocument => Boolean(item));
  } catch {
    return [];
  }
}
