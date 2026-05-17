"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChartRenderer } from "@/components/content/ChartRenderer";
import { LOCAL_PRESS_CHART_STORAGE_KEY, normalizeSlug } from "@/lib/content/config";
import type { LocalChart, LocalChartType } from "@/lib/content/types";
import type { D3ChartDatum } from "@/lib/types";

const chartTypes: Array<{ value: LocalChartType; label: string }> = [
  { value: "bar", label: "棒グラフ" },
  { value: "line", label: "折線グラフ" },
  { value: "pie", label: "円グラフ" },
  { value: "band", label: "帯グラフ" },
  { value: "horizontalBar", label: "横棒グラフ" },
  { value: "donut", label: "ドーナツグラフ" },
  { value: "stacked100Bar", label: "100%積み上げ棒グラフ" },
  { value: "radar", label: "レーダーマップ" },
  { value: "histogram", label: "ヒストグラム" },
  { value: "boxplot", label: "箱ひげ図" },
  { value: "bubble", label: "バブルチャート" },
  { value: "scatter", label: "散布図" },
  { value: "statMap", label: "統計地図" },
  { value: "lorenz", label: "ローレンツ曲線" },
  { value: "pictogram", label: "絵グラフ" },
  { value: "stackedArea", label: "積み上げ面グラフ" },
];

const sampleCsv = `label,value,comparison,color
教育,42,34,#2a7f9e
雇用,31,28,#f4941e
メディア,27,22,#14532d`;

function parseCsv(source: string): D3ChartDatum[] {
  const lines = source
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim()).filter(Boolean);

  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    return Object.fromEntries(
      headers.map((header, index) => {
        const raw = cells[index] ?? "";
        const numeric = Number(raw.replace(/,/g, ""));
        return [header, Number.isFinite(numeric) && raw !== "" ? numeric : raw];
      }),
    ) as D3ChartDatum;
  });
}

function buildChart({
  title,
  slug,
  chartType,
  description,
  sourceNote,
  methodologyNote,
  xKey,
  yKey,
  xLabel,
  yLabel,
  colorKey,
  nameKey,
  showLegend,
  showGrid,
  showDataLabels,
  footnote,
  abstract,
  height,
  data,
}: {
  title: string;
  slug: string;
  chartType: LocalChartType;
  description: string;
  sourceNote: string;
  methodologyNote: string;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  colorKey: string;
  nameKey: string;
  showLegend: boolean;
  showGrid: boolean;
  showDataLabels: boolean;
  footnote: string;
  abstract: string;
  height: number;
  data: D3ChartDatum[];
}): LocalChart {
  const now = new Date().toISOString();

  return {
    type: "chart",
    title,
    slug,
    chartType,
    description,
    data,
    sourceNote,
    methodologyNote,
    xKey: xKey || undefined,
    yKey: yKey || undefined,
    xLabel: xLabel || undefined,
    yLabel: yLabel || undefined,
    colorKey: colorKey || undefined,
    nameKey: nameKey || undefined,
    showLegend,
    showGrid,
    showDataLabels,
    footnote: footnote || undefined,
    abstract: abstract || undefined,
    height,
    createdAt: now,
    updatedAt: now,
  };
}

export function ChartBuilder() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [chartType, setChartType] = useState<LocalChartType>("bar");
  const [description, setDescription] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [methodologyNote, setMethodologyNote] = useState("");
  const [xKey, setXKey] = useState("label");
  const [yKey, setYKey] = useState("value");
  const [xLabel, setXLabel] = useState("");
  const [yLabel, setYLabel] = useState("");
  const [colorKey, setColorKey] = useState("");
  const [nameKey, setNameKey] = useState("");
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [footnote, setFootnote] = useState("");
  const [abstract, setAbstract] = useState("");
  const [height, setHeight] = useState(340);
  const [csv, setCsv] = useState(sampleCsv);
  const [overwrite, setOverwrite] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_PRESS_CHART_STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        title?: string;
        slug?: string;
        chartType?: LocalChartType;
        description?: string;
        sourceNote?: string;
        methodologyNote?: string;
        xKey?: string;
        yKey?: string;
        xLabel?: string;
        yLabel?: string;
        colorKey?: string;
        nameKey?: string;
        showLegend?: boolean;
        showGrid?: boolean;
        showDataLabels?: boolean;
        footnote?: string;
        abstract?: string;
        height?: number;
        csv?: string;
      };
      window.requestAnimationFrame(() => {
        setTitle(parsed.title ?? "");
        setSlug(parsed.slug ?? "");
        setChartType(parsed.chartType ?? "bar");
        setDescription(parsed.description ?? "");
        setSourceNote(parsed.sourceNote ?? "");
        setMethodologyNote(parsed.methodologyNote ?? "");
        setXKey(parsed.xKey ?? "label");
        setYKey(parsed.yKey ?? "value");
        setXLabel(parsed.xLabel ?? "");
        setYLabel(parsed.yLabel ?? "");
        setColorKey(parsed.colorKey ?? "");
        setNameKey(parsed.nameKey ?? "");
        setShowLegend(parsed.showLegend ?? true);
        setShowGrid(parsed.showGrid ?? true);
        setShowDataLabels(parsed.showDataLabels ?? false);
        setFootnote(parsed.footnote ?? "");
        setAbstract(parsed.abstract ?? "");
        setHeight(parsed.height ?? 340);
        setCsv(parsed.csv ?? sampleCsv);
      });
    } catch {
      window.localStorage.removeItem(LOCAL_PRESS_CHART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        LOCAL_PRESS_CHART_STORAGE_KEY,
        JSON.stringify({ title, slug, chartType, description, sourceNote, methodologyNote, xKey, yKey, xLabel, yLabel, colorKey, nameKey, showLegend, showGrid, showDataLabels, footnote, abstract, height, csv }),
      );
    }, 450);

    return () => window.clearTimeout(timer);
  }, [abstract, chartType, colorKey, csv, description, footnote, height, methodologyNote, nameKey, showDataLabels, showGrid, showLegend, slug, sourceNote, title, xKey, xLabel, yKey, yLabel]);

  const resolvedSlug = slug || normalizeSlug(title) || "chart-slug";
  const data = useMemo(() => parseCsv(csv), [csv]);
  const chart = useMemo(
    () => buildChart({ title: title || "無題の図表", slug: resolvedSlug, chartType, description, sourceNote, methodologyNote, xKey, yKey, xLabel, yLabel, colorKey, nameKey, showLegend, showGrid, showDataLabels, footnote, abstract, height, data }),
    [abstract, chartType, colorKey, data, description, footnote, height, methodologyNote, nameKey, resolvedSlug, showDataLabels, showGrid, showLegend, sourceNote, title, xKey, xLabel, yKey, yLabel],
  );

  async function handleSave() {
    setError("");
    setMessage("");

    const response = await fetch("/api/local-press/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "charts", slug: resolvedSlug, overwrite, chart }),
    });
    const result = (await response.json()) as { success?: boolean; path?: string; error?: string };

    if (!response.ok || !result.success) {
      setError(result.error ?? "保存に失敗しました。");
      return;
    }

    setMessage(result.path ?? "");
  }

  return (
    <div className="min-h-screen bg-white text-[color:var(--color-text)]">
      <header className="border-b border-[color:var(--color-border)]">
        <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <Link href="/local-press" className="text-sm font-semibold text-[color:var(--color-muted)]">
              Matsukasa Local Press
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--color-primary)]">Chart Builder</h1>
          </div>
          <Link href="/local-press/write" className="ui-button ui-button-secondary h-10 px-4 text-sm">
            執筆画面へ
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1320px] gap-6 px-5 py-8 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-5">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="グラフタイトル" className="h-12 w-full rounded-md border border-[color:var(--color-border)] px-3 text-base font-semibold" />
          <input value={slug} onChange={(event) => setSlug(normalizeSlug(event.target.value))} placeholder={resolvedSlug} className="h-10 w-full rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
          <select value={chartType} onChange={(event) => setChartType(event.target.value as LocalChartType)} className="h-10 w-full rounded-md border border-[color:var(--color-border)] px-3 text-sm">
            {chartTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="説明" className="min-h-20 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
          <textarea value={abstract} onChange={(event) => setAbstract(event.target.value)} placeholder="アブストラクト" className="min-h-20 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
          <textarea value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="出典" className="min-h-16 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
          <textarea value={methodologyNote} onChange={(event) => setMethodologyNote(event.target.value)} placeholder="方法論メモ" className="min-h-16 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
          <textarea value={footnote} onChange={(event) => setFootnote(event.target.value)} placeholder="脚注" className="min-h-16 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={xKey} onChange={(event) => setXKey(event.target.value)} placeholder="Xキー 例: label" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
            <input value={yKey} onChange={(event) => setYKey(event.target.value)} placeholder="Yキー 例: value / value,comparison" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
            <input value={xLabel} onChange={(event) => setXLabel(event.target.value)} placeholder="X軸ラベル" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
            <input value={yLabel} onChange={(event) => setYLabel(event.target.value)} placeholder="Y軸ラベル" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
            <input value={colorKey} onChange={(event) => setColorKey(event.target.value)} placeholder="色分けキー 例: color" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
            <input value={nameKey} onChange={(event) => setNameKey(event.target.value)} placeholder="名称キー 例: label" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
          </div>
          <label className="block text-xs font-semibold text-[color:var(--color-muted)]">
            高さ: {height}px
            <input type="range" min="240" max="520" step="20" value={height} onChange={(event) => setHeight(Number(event.target.value))} className="mt-2 w-full" />
          </label>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showLegend} onChange={(event) => setShowLegend(event.target.checked)} />
              凡例
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} />
              目盛り線
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showDataLabels} onChange={(event) => setShowDataLabels(event.target.checked)} />
              データラベル
            </label>
          </div>
          <div>
            <label className="text-xs font-semibold text-[color:var(--color-muted)]">CSV貼り付け</label>
            <textarea value={csv} onChange={(event) => setCsv(event.target.value)} className="mt-1 min-h-48 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 font-mono text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} />
            既存ファイルを上書きする
          </label>
          <button type="button" onClick={handleSave} className="ui-button ui-button-primary h-11 w-full px-4 text-sm">
            図表を保存
          </button>
        </section>

        <section className="space-y-5">
          <ChartRenderer chart={chart} />
          <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-5 py-4">
            <p className="text-sm font-semibold text-[color:var(--color-primary)]">本文に貼る記法</p>
            <pre className="mt-3 overflow-x-auto rounded-md bg-white px-4 py-3 text-sm">{`:::chart slug="${resolvedSlug}"
:::`}</pre>
          </div>
          {message ? (
            <div className="rounded-lg border border-[color:var(--color-border)] px-5 py-4">
              <p className="font-semibold text-[color:var(--color-primary)]">保存されました。</p>
              <pre className="mt-3 overflow-x-auto rounded-md bg-[color:var(--color-primary)] px-4 py-3 text-sm text-white">{`git add ${message}
git commit -m "Add content: ${resolvedSlug}"
git push`}</pre>
            </div>
          ) : null}
          {error ? <p className="rounded-lg border border-[color:#f2b8b8] bg-[#fff4f4] px-4 py-3 text-sm text-[#8d4b50]">{error}</p> : null}
        </section>
      </main>
    </div>
  );
}
