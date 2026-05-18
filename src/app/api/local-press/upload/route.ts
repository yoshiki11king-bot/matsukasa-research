import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isLocalPressEnabled, normalizeSlug } from "@/lib/content/config";

export const runtime = "nodejs";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "local-press", "uploads");
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

function assertInsideUploadRoot(filePath: string) {
  const resolvedRoot = path.resolve(UPLOAD_ROOT);
  const resolvedFile = path.resolve(filePath);

  if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("Path traversal is not allowed");
  }
}

export async function POST(request: Request) {
  if (!isLocalPressEnabled()) {
    return NextResponse.json({ success: false, error: "Local Press is disabled." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "画像ファイルを選んでください。" }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);

  if (!extension) {
    return NextResponse.json({ success: false, error: "PNG / JPEG / WebP / GIF のみ対応しています。" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ success: false, error: "画像は8MB以下にしてください。" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const baseName = normalizeSlug(path.basename(file.name, path.extname(file.name))) || "image";
  const filename = `${baseName}-${Date.now().toString(36)}${extension}`;
  const fullPath = path.join(UPLOAD_ROOT, filename);
  assertInsideUploadRoot(fullPath);

  await mkdir(UPLOAD_ROOT, { recursive: true });
  await writeFile(fullPath, bytes);

  return NextResponse.json({
    success: true,
    path: `public/local-press/uploads/${filename}`,
    url: `/local-press/uploads/${filename}`,
  });
}
