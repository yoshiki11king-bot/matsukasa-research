"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type StatusArea = "content" | "chart" | "upload" | "source" | "config" | "other";

type GitChange = {
  status: string;
  path: string;
  area: StatusArea;
};

type LocalPressStatus = {
  success: boolean;
  error?: string;
  checkedAt?: string;
  localPressEnabled?: boolean;
  nodeVersion?: string;
  repository?: string;
  branch?: string;
  isDefaultBranch?: boolean;
  remote?: string;
  ahead?: number;
  behind?: number;
  hasChanges?: boolean;
  changeCount?: number;
  contentChanges?: number;
  chartChanges?: number;
  uploadChanges?: number;
  changes?: GitChange[];
  shortStatus?: string;
};

const areaLabels: Record<StatusArea, string> = {
  content: "原稿",
  chart: "図表",
  upload: "画像",
  source: "サイト",
  config: "設定",
  other: "その他",
};

function StatusPill({ tone, children }: { tone: "ok" | "warn" | "muted"; children: ReactNode }) {
  const className =
    tone === "ok"
      ? "border-[#b9dec7] bg-[#f2fbf5] text-[#1d6040]"
      : tone === "warn"
        ? "border-[#f0d8a6] bg-[#fff8e6] text-[#8a5a00]"
        : "border-[color:var(--color-border)] bg-white text-[color:var(--color-secondary-ink)]";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function formatCheckedAt(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function LocalPressCollaborationStatus() {
  const [status, setStatus] = useState<LocalPressStatus | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    setLoading(true);
    try {
      const response = await fetch("/api/local-press/status", { cache: "no-store" });
      const payload = (await response.json()) as LocalPressStatus;
      setStatus(payload);
    } catch {
      setStatus({ success: false, error: "共同編集チェックを読み込めませんでした。" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  const recommendations = useMemo(() => {
    if (!status?.success) {
      return ["ENABLE_LOCAL_PRESS=true で起動すると、branchと差分をここで確認できます。"];
    }

    const items: string[] = [];

    if (status.isDefaultBranch) {
      items.push("新規投稿は main ではなく、GitHub Desktopでbranchを作ってから保存します。");
    }

    if ((status.behind ?? 0) > 0) {
      items.push("remoteより遅れています。保存前にGitHub DesktopでPullしてください。");
    }

    if (status.hasChanges) {
      items.push("保存した原稿や画像がGit差分として見えています。GitHub Desktopで内容を確認してください。");
    } else {
      items.push("現在Git差分はありません。ローカル保存後にここへ原稿ファイルが出れば正常です。");
    }

    if ((status.contentChanges ?? 0) > 0 || (status.chartChanges ?? 0) > 0 || (status.uploadChanges ?? 0) > 0) {
      items.push("原稿、図表、画像は同じcommitに入れると本番で欠けにくくなります。");
    }

    return items;
  }, [status]);

  const changes = status?.changes ?? [];

  return (
    <section className="rounded-lg border border-[color:var(--color-border)] bg-white px-5 py-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">COLLABORATION CHECK</p>
          <h2 className="mt-2 text-lg font-semibold text-[color:var(--color-primary)]">共同編集チェック</h2>
        </div>
        <button
          type="button"
          onClick={() => void loadStatus()}
          className="h-9 rounded-md border border-[color:var(--color-border)] bg-white px-3 text-xs font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-surface-subtle)]"
        >
          {loading ? "確認中" : "再確認"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill tone={status?.success ? "ok" : "warn"}>{status?.success ? "Local Press有効" : "未確認"}</StatusPill>
        <StatusPill tone={status?.isDefaultBranch ? "warn" : "ok"}>branch: {status?.branch ?? "-"}</StatusPill>
        <StatusPill tone={status?.hasChanges ? "warn" : "muted"}>差分: {status?.changeCount ?? 0}</StatusPill>
        <StatusPill tone={(status?.behind ?? 0) > 0 ? "warn" : "muted"}>behind: {status?.behind ?? 0}</StatusPill>
      </div>

      {status?.error ? (
        <p className="mt-4 rounded-md border border-[#f0d8a6] bg-[#fff8e6] px-3 py-2 text-sm leading-7 text-[#8a5a00]">{status.error}</p>
      ) : null}

      <div className="mt-4 space-y-2 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
        {recommendations.map((item) => (
          <p key={item}>・{item}</p>
        ))}
      </div>

      {changes.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-md border border-[color:var(--color-border)]">
          {changes.slice(0, 8).map((change) => (
            <div key={`${change.status}-${change.path}`} className="grid grid-cols-[56px_72px_minmax(0,1fr)] gap-2 border-b border-[color:var(--color-border)] px-3 py-2 text-xs last:border-b-0">
              <span className="font-semibold text-[color:var(--color-primary)]">{change.status}</span>
              <span className="text-[color:var(--color-muted)]">{areaLabels[change.area]}</span>
              <code className="truncate text-[color:var(--color-secondary-ink)]">{change.path}</code>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 border-t border-[color:var(--color-border)] pt-3 text-xs leading-6 text-[color:var(--color-muted)]">
        <p>remote: {status?.remote || "-"}</p>
        <p>確認時刻: {formatCheckedAt(status?.checkedAt) || "-"}</p>
      </div>
    </section>
  );
}
