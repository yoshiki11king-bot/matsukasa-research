"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BlockEditor } from "@/components/local-press/BlockEditor";
import { QuickChartComposer } from "@/components/local-press/QuickChartComposer";
import { LocalDocumentRenderer } from "@/components/content/LocalDocumentRenderer";
import { ResearcherRenderer } from "@/components/content/ResearcherRenderer";
import {
  getContentTypeFromQuery,
  getDefaultBody,
  getDefaultFrontmatter,
  LOCAL_PRESS_STORAGE_KEY,
  LOCAL_PRESS_TYPE_LABELS,
  normalizeSlug,
  type LocalPressContentType,
} from "@/lib/content/config";
import type { Frontmatter } from "@/lib/content/frontmatter";
import type { LocalChart, LocalChartsBySlug, LocalMarkdownDocument, LocalResearcher } from "@/lib/content/types";

type Mode = "edit" | "preview" | "split";
type SaveState = "idle" | "saving" | "saved" | "error";

type LocalPressWriterProps = {
  initialType: LocalPressContentType;
  charts?: LocalChartsBySlug;
};

const contentTypes: LocalPressContentType[] = [
  "articles",
  "reports",
  "methodologies",
  "researchers",
  "director",
  "finance",
  "financial-statements",
  "short-readings",
];

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value: Frontmatter[string]) {
  return Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : "";
}

function makeDocument(type: LocalPressContentType, slug: string, frontmatter: Frontmatter, body: string): LocalMarkdownDocument {
  return {
    slug,
    frontmatter,
    body,
    path: `${type}/${slug}.md`,
  };
}

function makeResearcher(title: string, slug: string, frontmatter: Frontmatter, body: string): LocalResearcher {
  return {
    type: "researcher",
    name: title || "無名の研究員",
    slug,
    role: String(frontmatter.role ?? ""),
    affiliation: String(frontmatter.affiliation ?? ""),
    bio: body,
    avatarUrl: String(frontmatter.avatarUrl ?? ""),
    interests: Array.isArray(frontmatter.interests) ? frontmatter.interests.map(String) : splitList(String(frontmatter.interests ?? "")),
    links: [],
  };
}

export function LocalPressWriter({ initialType, charts = {} }: LocalPressWriterProps) {
  const [type, setType] = useState<LocalPressContentType>(initialType);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState(getDefaultBody(initialType));
  const [frontmatter, setFrontmatter] = useState<Frontmatter>(getDefaultFrontmatter(initialType));
  const [localCharts, setLocalCharts] = useState<LocalChartsBySlug>(charts);
  const [mode, setMode] = useState<Mode>("edit");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [chartComposerOpen, setChartComposerOpen] = useState(false);
  const [chartInsertHandler, setChartInsertHandler] = useState<((slug: string) => void) | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setLocalCharts(charts);
  }, [charts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = getContentTypeFromQuery(params.get("type"));
    window.requestAnimationFrame(() => {
      setType(fromQuery);
      setFrontmatter(getDefaultFrontmatter(fromQuery));
      setBody(getDefaultBody(fromQuery));
    });
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_PRESS_STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        type?: LocalPressContentType;
        title?: string;
        slug?: string;
        body?: string;
        frontmatter?: Frontmatter;
      };

      window.requestAnimationFrame(() => {
        if (parsed.type) {
          setType(parsed.type);
        }
        if (typeof parsed.title === "string") {
          setTitle(parsed.title);
        }
        if (typeof parsed.slug === "string") {
          setSlug(parsed.slug);
        }
        if (typeof parsed.body === "string") {
          setBody(parsed.body);
        }
        if (parsed.frontmatter) {
          setFrontmatter(parsed.frontmatter);
        }
      });
    } catch {
      window.localStorage.removeItem(LOCAL_PRESS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        LOCAL_PRESS_STORAGE_KEY,
        JSON.stringify({ type, title, slug, body, frontmatter }),
      );
      setSaveState("saved");
    }, 450);

    return () => window.clearTimeout(timer);
  }, [type, title, slug, body, frontmatter]);

  const resolvedSlug = useMemo(() => {
    if (type === "director") {
      return "director";
    }

    if (type === "finance") {
      return "finance";
    }

    if (type === "financial-statements") {
      return normalizeSlug(String(frontmatter.year ?? (slug || new Date().getFullYear())));
    }

    return slug || normalizeSlug(title);
  }, [frontmatter.year, slug, title, type]);

  const mergedFrontmatter = useMemo(() => ({
    ...frontmatter,
    title,
    slug: resolvedSlug,
  }), [frontmatter, resolvedSlug, title]);

  const previewDocument = useMemo(
    () => makeDocument(type, resolvedSlug || "draft", mergedFrontmatter, body),
    [body, mergedFrontmatter, resolvedSlug, type],
  );

  function updateFrontmatter(key: string, value: Frontmatter[string]) {
    setFrontmatter((current) => ({ ...current, [key]: value }));
  }

  function handleTypeChange(nextType: LocalPressContentType) {
    setType(nextType);
    setTitle("");
    setSlug("");
    setBody(getDefaultBody(nextType));
    setFrontmatter(getDefaultFrontmatter(nextType));
    setSaveMessage("");
  }

  function openChartComposer(insertHandler?: (slug: string) => void) {
    setChartInsertHandler(() => insertHandler ?? null);
    setChartComposerOpen(true);
  }

  function closeChartComposer() {
    setChartComposerOpen(false);
    setChartInsertHandler(null);
  }

  function insertChart(chart: LocalChart) {
    setLocalCharts((current) => ({ ...current, [chart.slug]: chart }));
    if (chartInsertHandler) {
      chartInsertHandler(chart.slug);
    } else {
      setBody((current) => {
        const insertion = `:::chart slug="${chart.slug}"\n:::`;
        return current.trim() ? `${current.trimEnd()}\n\n${insertion}\n` : `${insertion}\n`;
      });
    }
    closeChartComposer();
  }

  async function handleSave() {
    setSaveState("saving");
    setSaveMessage("");

    const payload =
      type === "researchers"
        ? {
            type,
            slug: resolvedSlug,
            overwrite,
            researcher: makeResearcher(title, resolvedSlug, mergedFrontmatter, body),
          }
        : {
            type,
            slug: resolvedSlug,
            overwrite,
            frontmatter: mergedFrontmatter,
            body,
          };

    try {
      const response = await fetch("/api/local-press/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { success?: boolean; path?: string; error?: string };

      if (!response.ok || !result.success) {
        setSaveState("error");
        setSaveMessage(result.error ?? "保存に失敗しました。");
        return;
      }

      setSaveState("saved");
      setSaveMessage(result.path ?? "");
    } catch {
      setSaveState("error");
      setSaveMessage("保存APIへ接続できませんでした。ENABLE_LOCAL_PRESS=true を確認してください。");
    }
  }

  const editor = (
    <section className="mx-auto min-h-[calc(100vh-130px)] max-w-[1040px] space-y-5 px-4 py-10 md:py-20">
      <div className="flex flex-wrap items-center gap-2 opacity-45 transition hover:opacity-100 focus-within:opacity-100">
        <select
          value={type}
          onChange={(event) => handleTypeChange(event.target.value as LocalPressContentType)}
          className="h-9 rounded-full border border-[color:var(--color-border)] bg-white px-3 text-xs font-medium text-[color:var(--color-primary)]"
        >
          {contentTypes.map((contentType) => (
            <option key={contentType} value={contentType}>
              {LOCAL_PRESS_TYPE_LABELS[contentType]}
            </option>
          ))}
        </select>
        <p className="text-xs text-[color:var(--color-muted)]">
          {saveState === "saving" ? "保存中" : saveState === "saved" ? "保存済み" : ""}
        </p>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={type === "researchers" ? "名前" : "新規ページ"}
        className="w-full border-0 bg-transparent px-0 py-8 font-editorial text-5xl font-semibold tracking-tight text-[color:var(--color-primary)] outline-none placeholder:text-slate-200 md:text-6xl"
      />

      <BlockEditor body={body} onChange={setBody} onOpenChart={openChartComposer} />
    </section>
  );

  const preview =
    type === "researchers" ? (
      <ResearcherRenderer researcher={makeResearcher(title, resolvedSlug || "researcher", mergedFrontmatter, body)} />
    ) : (
      <LocalDocumentRenderer type={type} document={previewDocument} charts={localCharts} />
    );

  return (
    <div className="min-h-screen bg-white text-[color:var(--color-text)]">
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3 px-5 py-3">
          <Link href="/local-press" className="font-semibold tracking-tight text-[color:var(--color-primary)]">
            Matsukasa Local Press
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {(["edit", "split", "preview"] as Mode[]).map((nextMode) => (
              <button
                key={nextMode}
                type="button"
                onClick={() => setMode(nextMode)}
                className={`h-9 rounded-md px-3 text-sm font-medium ${mode === nextMode ? "bg-[color:var(--color-primary)] text-white" : "border border-[color:var(--color-border)] bg-white"}`}
              >
                {nextMode === "edit" ? "編集" : nextMode === "split" ? "分割" : "プレビュー"}
              </button>
            ))}
            <button type="button" onClick={() => setDetailsOpen((current) => !current)} className="ui-button ui-button-secondary h-9 px-3 text-sm">
              詳細設定
            </button>
            <button type="button" onClick={handleSave} className="ui-button ui-button-primary h-9 px-4 text-sm">
              ローカル保存
            </button>
          </div>
        </div>
      </header>

      <main className={`mx-auto grid w-full max-w-[1500px] gap-6 ${detailsOpen ? "px-5 py-6 xl:grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-1"}`}>
        <div className={mode === "split" ? "grid gap-6 lg:grid-cols-2" : "block"}>
          {mode !== "preview" ? <div className="min-w-0">{editor}</div> : null}
          {mode !== "edit" ? (
            <div className="relative min-w-0 overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-soft)]">
              <div className="border-b border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">
                LIVE PUBLIC PREVIEW
              </div>
              <div className="max-h-[calc(100vh-150px)] overflow-auto px-4 py-2">{preview}</div>
              {chartComposerOpen ? <QuickChartComposer onClose={closeChartComposer} onInsert={insertChart} /> : null}
            </div>
          ) : null}
          {mode === "edit" && chartComposerOpen ? (
            <div className="fixed inset-4 z-50 overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white shadow-[var(--shadow-soft)]">
              <QuickChartComposer onClose={closeChartComposer} onInsert={insertChart} />
            </div>
          ) : null}
        </div>

        <aside className={`${detailsOpen ? "block" : "hidden"} h-fit rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-4`}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[color:var(--color-muted)]">slug</label>
              <input value={slug} onChange={(event) => setSlug(normalizeSlug(event.target.value))} placeholder={resolvedSlug || "slug"} className="mt-1 h-10 w-full rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
              <p className="mt-1 text-xs text-[color:var(--color-muted)]">保存先: content/{type}/{resolvedSlug || "slug"}</p>
            </div>
            {[
              ["excerpt", "概要"],
              ["status", "状態 draft / published"],
              ["publishedAt", "公開日時"],
              ["eyecatchUrl", "カバー画像URL"],
              ["category", "カテゴリ"],
              ["region", "地域"],
              ["methodologySlug", "方法論スラッグ"],
              ["sourceNote", "出典・基準"],
              ["updateNote", "更新メモ"],
              ["role", "研究員の役割"],
              ["affiliation", "所属"],
              ["avatarUrl", "プロフィール画像URL"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-[color:var(--color-muted)]">{label}</label>
                <input value={String(frontmatter[key] ?? "")} onChange={(event) => updateFrontmatter(key, event.target.value)} className="mt-1 h-10 w-full rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
              </div>
            ))}
            {[
              ["topics", "トピック"],
              ["authors", "著者"],
              ["researcherSlugs", "研究員スラッグ"],
              ["referenceLinks", "参考リンク"],
              ["interests", "研究員の関心"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-xs font-semibold text-[color:var(--color-muted)]">{label}（カンマ区切り）</label>
                <input value={joinList(frontmatter[key])} onChange={(event) => updateFrontmatter(key, splitList(event.target.value))} className="mt-1 h-10 w-full rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
              </div>
            ))}
            {type === "financial-statements" ? (
              <div>
                <label className="text-xs font-semibold text-[color:var(--color-muted)]">年度</label>
                <input value={String(frontmatter.year ?? "")} onChange={(event) => updateFrontmatter("year", Number(event.target.value) || event.target.value)} className="mt-1 h-10 w-full rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
              </div>
            ) : null}
            {type === "reports" ? (
              <section className="rounded-lg border border-[color:var(--color-border)] bg-white">
                <button type="button" onClick={() => setReportOpen((current) => !current)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold">
                  研究報告設定
                  <span>{reportOpen ? "-" : "+"}</span>
                </button>
                {reportOpen ? (
                  <div className="space-y-3 border-t border-[color:var(--color-border)] px-4 py-4">
                    <textarea value={joinList(frontmatter.keyFindings)} onChange={(event) => updateFrontmatter("keyFindings", splitList(event.target.value))} placeholder="主な発見をカンマ区切りで入力" className="min-h-24 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
                    <textarea value={String(frontmatter.methodologySummary ?? "")} onChange={(event) => updateFrontmatter("methodologySummary", event.target.value)} placeholder="方法論要約" className="min-h-24 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
                  </div>
                ) : null}
              </section>
            ) : null}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} />
              既存ファイルを上書きする
            </label>
          </div>
        </aside>

        {saveMessage ? (
          <div className="xl:col-span-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-5">
            {saveState === "error" ? (
              <p className="font-semibold text-[color:#8d4b50]">{saveMessage}</p>
            ) : (
              <div className="space-y-4">
                <p className="font-semibold text-[color:var(--color-primary)]">保存されました。</p>
                <p className="text-sm text-[color:var(--color-secondary-ink)]">次のコマンドで公開できます。</p>
                <pre className="overflow-x-auto rounded-md bg-[color:var(--color-primary)] px-4 py-3 text-sm text-white">{`git add ${saveMessage}
git commit -m "Add content: ${resolvedSlug}"
git push`}</pre>
                <div className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
                  <p className="font-semibold text-[color:var(--color-primary)]">GitHub Desktopを使う場合:</p>
                  <p>1. GitHub Desktopを開く</p>
                  <p>2. 変更内容を確認する</p>
                  <p>3. Summaryに「Add content: {resolvedSlug}」と入力する</p>
                  <p>4. Commit to main を押す</p>
                  <p>5. Push origin を押す</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
