"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChartRenderer } from "@/components/content/ChartRenderer";
import { applyPaletteToRows, chartPalettePresets, csvToEditableRows, defaultChartRows, parseSimpleCsv, rowsToCsv, type EditableChartRow } from "@/components/local-press/chart-builder-tools";
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

const sampleCsv = rowsToCsv(defaultChartRows);

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
  const [colorKey, setColorKey] = useState("color");
  const [nameKey, setNameKey] = useState("");
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [footnote, setFootnote] = useState("");
  const [abstract, setAbstract] = useState("");
  const [height, setHeight] = useState(340);
  const [csv, setCsv] = useState(sampleCsv);
  const [paletteId, setPaletteId] = useState(chartPalettePresets[0].id);
  const [advancedOpen, setAdvancedOpen] = useState(false);
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
        paletteId?: string;
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
        setColorKey(parsed.colorKey ?? "color");
        setNameKey(parsed.nameKey ?? "");
        setShowLegend(parsed.showLegend ?? true);
        setShowGrid(parsed.showGrid ?? true);
        setShowDataLabels(parsed.showDataLabels ?? false);
        setFootnote(parsed.footnote ?? "");
        setAbstract(parsed.abstract ?? "");
        setHeight(parsed.height ?? 340);
        setCsv(parsed.csv ?? sampleCsv);
        setPaletteId(parsed.paletteId ?? chartPalettePresets[0].id);
      });
    } catch {
      window.localStorage.removeItem(LOCAL_PRESS_CHART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        LOCAL_PRESS_CHART_STORAGE_KEY,
        JSON.stringify({ title, slug, chartType, description, sourceNote, methodologyNote, xKey, yKey, xLabel, yLabel, colorKey, nameKey, showLegend, showGrid, showDataLabels, footnote, abstract, height, csv, paletteId }),
      );
    }, 450);

    return () => window.clearTimeout(timer);
  }, [abstract, chartType, colorKey, csv, description, footnote, height, methodologyNote, nameKey, paletteId, showDataLabels, showGrid, showLegend, slug, sourceNote, title, xKey, xLabel, yKey, yLabel]);

  const resolvedSlug = slug || normalizeSlug(title) || "chart-slug";
  const data = useMemo(() => parseSimpleCsv(csv), [csv]);
  const chart = useMemo(
    () => buildChart({ title: title || "無題の図表", slug: resolvedSlug, chartType, description, sourceNote, methodologyNote, xKey, yKey, xLabel, yLabel, colorKey, nameKey, showLegend, showGrid, showDataLabels, footnote, abstract, height, data }),
    [abstract, chartType, colorKey, data, description, footnote, height, methodologyNote, nameKey, resolvedSlug, showDataLabels, showGrid, showLegend, sourceNote, title, xKey, xLabel, yKey, yLabel],
  );

  const editableRows = useMemo(() => csvToEditableRows(csv), [csv]);
  const selectedPalette = chartPalettePresets.find((palette) => palette.id === paletteId) ?? chartPalettePresets[0];

  function updateRows(nextRows: EditableChartRow[]) {
    setCsv(rowsToCsv(nextRows));
  }

  function updateRow(index: number, patch: Partial<EditableChartRow>) {
    updateRows(editableRows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    updateRows([
      ...editableRows,
      {
        label: `項目${editableRows.length + 1}`,
        value: "",
        comparison: "",
        color: selectedPalette.colors[editableRows.length % selectedPalette.colors.length],
      },
    ]);
  }

  function removeRow(index: number) {
    updateRows(editableRows.filter((_, rowIndex) => rowIndex !== index));
  }

  function applyPalette(paletteIdValue: string) {
    const palette = chartPalettePresets.find((item) => item.id === paletteIdValue) ?? chartPalettePresets[0];
    setPaletteId(palette.id);
    setColorKey("color");
    updateRows(applyPaletteToRows(editableRows, palette.colors));
  }

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

      <main className="mx-auto grid w-full max-w-[1320px] gap-6 px-5 py-8 lg:grid-cols-[460px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-5">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="グラフタイトル" className="h-12 w-full rounded-md border border-[color:var(--color-border)] px-3 text-base font-semibold" />
          <input value={slug} onChange={(event) => setSlug(normalizeSlug(event.target.value))} placeholder={resolvedSlug} className="h-10 w-full rounded-md border border-[color:var(--color-border)] px-3 text-sm" />

          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-[color:var(--color-muted)]">TYPE</p>
            <div className="grid grid-cols-2 gap-2">
              {chartTypes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setChartType(item.value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${chartType === item.value ? "border-[color:var(--color-primary)] bg-white text-[color:var(--color-primary)] shadow-sm" : "border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-secondary-ink)] hover:bg-white"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-[color:var(--color-muted)]">COLOR</p>
            <div className="grid gap-2">
              {chartPalettePresets.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => applyPalette(palette.id)}
                  className={`flex items-center justify-between gap-3 rounded-md border bg-white px-3 py-2 text-left transition ${paletteId === palette.id ? "border-[color:var(--color-primary)] shadow-sm" : "border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]"}`}
                >
                  <span className="text-sm font-semibold text-[color:var(--color-primary)]">{palette.label}</span>
                  <span className="flex gap-1">
                    {palette.colors.map((color) => (
                      <span key={color} className="size-5 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[color:var(--color-border)] bg-white p-3">
            <div className="mb-2 grid grid-cols-[1fr_76px_76px_40px] gap-2 text-xs font-semibold text-[color:var(--color-muted)]">
              <span>項目</span>
              <span>値</span>
              <span>比較</span>
              <span>色</span>
            </div>
            <div className="space-y-2">
              {editableRows.map((row, index) => (
                <div key={`${row.label}-${index}`} className="grid grid-cols-[1fr_76px_76px_40px] gap-2">
                  <input value={row.label} onChange={(event) => updateRow(index, { label: event.target.value })} className="h-9 min-w-0 rounded-md border border-[color:var(--color-border)] px-2 text-sm" />
                  <input value={row.value} onChange={(event) => updateRow(index, { value: event.target.value })} className="h-9 min-w-0 rounded-md border border-[color:var(--color-border)] px-2 text-sm" />
                  <input value={row.comparison} onChange={(event) => updateRow(index, { comparison: event.target.value })} className="h-9 min-w-0 rounded-md border border-[color:var(--color-border)] px-2 text-sm" />
                  <button type="button" onClick={() => updateRow(index, { color: selectedPalette.colors[(selectedPalette.colors.indexOf(row.color) + 1) % selectedPalette.colors.length] ?? selectedPalette.colors[0] })} onDoubleClick={() => removeRow(index)} className="h-9 rounded-md border border-[color:var(--color-border)]" style={{ backgroundColor: row.color }} aria-label="色を変更" title="クリックで色変更 / ダブルクリックで削除" />
                </div>
              ))}
            </div>
            <button type="button" onClick={addRow} className="mt-3 h-9 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] text-sm font-semibold text-[color:var(--color-primary)]">
              行を追加
            </button>
          </div>

          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="短い説明" className="min-h-16 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />

          <button type="button" onClick={() => setAdvancedOpen((current) => !current)} className="h-10 w-full rounded-md border border-[color:var(--color-border)] bg-white text-sm font-semibold text-[color:var(--color-primary)]">
            {advancedOpen ? "詳細を閉じる" : "詳細"}
          </button>

          {advancedOpen ? (
            <div className="space-y-3 rounded-lg border border-[color:var(--color-border)] bg-white p-3">
              <textarea value={abstract} onChange={(event) => setAbstract(event.target.value)} placeholder="アブストラクト" className="min-h-16 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
              <textarea value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="出典" className="min-h-14 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
              <textarea value={methodologyNote} onChange={(event) => setMethodologyNote(event.target.value)} placeholder="方法論メモ" className="min-h-14 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
              <textarea value={footnote} onChange={(event) => setFootnote(event.target.value)} placeholder="脚注" className="min-h-14 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={xKey} onChange={(event) => setXKey(event.target.value)} placeholder="Xキー" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={yKey} onChange={(event) => setYKey(event.target.value)} placeholder="Yキー / 複数は value,comparison" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={xLabel} onChange={(event) => setXLabel(event.target.value)} placeholder="X軸ラベル" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={yLabel} onChange={(event) => setYLabel(event.target.value)} placeholder="Y軸ラベル" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={colorKey} onChange={(event) => setColorKey(event.target.value)} placeholder="色キー" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={nameKey} onChange={(event) => setNameKey(event.target.value)} placeholder="名称キー" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[color:var(--color-muted)]">CSV</label>
                <textarea value={csv} onChange={(event) => setCsv(event.target.value)} className="mt-1 min-h-36 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 font-mono text-sm" />
              </div>
            </div>
          ) : null}

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
