import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { isLocalPressEnabled } from "@/lib/content/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

type GitChange = {
  status: string;
  path: string;
  area: "content" | "chart" | "upload" | "source" | "config" | "other";
};

async function runGit(args: string[]) {
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024,
    });
    return stdout.replace(/\s+$/u, "");
  } catch {
    return "";
  }
}

function sanitizeRemote(remote: string) {
  if (!remote) {
    return "";
  }

  return remote
    .replace(/^https:\/\/[^/@]+@/i, "https://")
    .replace(/^https:\/\/([^:/]+):[^/@]+@/i, "https://$1@");
}

function classifyPath(filePath: string): GitChange["area"] {
  if (filePath.startsWith("content/charts/")) {
    return "chart";
  }

  if (filePath.startsWith("content/")) {
    return "content";
  }

  if (filePath.startsWith("public/local-press/uploads/")) {
    return "upload";
  }

  if (filePath.startsWith("src/") || filePath.startsWith("scripts/") || filePath.startsWith("docs/")) {
    return "source";
  }

  if (filePath.startsWith(".") || filePath === "package.json" || filePath === "package-lock.json") {
    return "config";
  }

  return "other";
}

function parseStatusLine(line: string): GitChange | null {
  if (!line.trim()) {
    return null;
  }

  const status = line.slice(0, 2).trim() || "??";
  const rawPath = line.slice(3).trim();
  const path = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1)?.trim() ?? rawPath : rawPath;

  if (!path) {
    return null;
  }

  return {
    status,
    path,
    area: classifyPath(path),
  };
}

function parseAheadBehind(value: string) {
  const [behind, ahead] = value
    .split(/\s+/)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));

  return {
    behind: behind ?? 0,
    ahead: ahead ?? 0,
  };
}

export async function GET() {
  if (!isLocalPressEnabled()) {
    return NextResponse.json({ success: false, error: "Local Press is disabled." }, { status: 403 });
  }

  const [branch, remote, shortStatus, porcelainStatus, upstreamCounts] = await Promise.all([
    runGit(["branch", "--show-current"]),
    runGit(["remote", "get-url", "origin"]),
    runGit(["status", "-sb"]),
    runGit(["status", "--porcelain=v1", "-uall"]),
    runGit(["rev-list", "--left-right", "--count", "@{upstream}...HEAD"]),
  ]);

  const changes = porcelainStatus
    .split("\n")
    .map(parseStatusLine)
    .filter((change): change is GitChange => Boolean(change));

  const { ahead, behind } = parseAheadBehind(upstreamCounts);
  const currentBranch = branch || "(detached)";
  const isDefaultBranch = currentBranch === "main" || currentBranch === "master";
  const contentChanges = changes.filter((change) => change.area === "content").length;
  const chartChanges = changes.filter((change) => change.area === "chart").length;
  const uploadChanges = changes.filter((change) => change.area === "upload").length;

  return NextResponse.json({
    success: true,
    checkedAt: new Date().toISOString(),
    localPressEnabled: true,
    nodeVersion: process.version,
    repository: "matsukasa-research",
    branch: currentBranch,
    isDefaultBranch,
    remote: sanitizeRemote(remote),
    ahead,
    behind,
    hasChanges: changes.length > 0,
    changeCount: changes.length,
    contentChanges,
    chartChanges,
    uploadChanges,
    changes: changes.slice(0, 30),
    shortStatus,
  });
}
