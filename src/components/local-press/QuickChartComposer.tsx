"use client";

import { useMemo, useState } from "react";
import { ChartRenderer } from "@/components/content/ChartRenderer";
import { applyPaletteToRows, chartPalettePresets, csvToEditableRows, defaultChartRows, parseSimpleCsv, rowsToCsv, type EditableChartRow } from "@/components/local-press/chart-builder-tools";
import { normalizeSlug } from "@/lib/content/config";
import type { LocalChart, LocalChartType } from "@/lib/content/types";
import type { D3ChartDatum } from "@/lib/types";

type QuickChartComposerProps = {
  onClose: () => void;
  onInsert: (chart: LocalChart) => void;
};

const simpleChartTypes: Array<{ value: LocalChartType; label: string }> = [
  { value: "bar", label: "棒" },
  { value: "line", label: "折線" },
  { value: "pie", label: "円" },
  { value: "band", label: "帯" },
  { value: "horizontalBar", label: "横棒" },
  { value: "donut", label: "ドーナツ" },
  { value: "stacked-bar", label: "100%積み上げ棒" },
  { value: "radar", label: "レーダー" },
  { value: "histogram", label: "ヒストグラム" },
  { value: "boxplot", label: "箱ひげ" },
  { value: "bubble", label: "バブル" },
  { value: "scatter", label: "散布" },
  { value: "statMap", label: "統計地図" },
  { value: "lorenz", label: "ローレンツ" },
  { value: "pictogram", label: "絵グラフ" },
  { value: "stackedArea", label: "積み上げ面" },
];

const sampleCsv = rowsToCsv(defaultChartRows);

function makeChart({
  title,
  slug,
  chartType,
  description,
  sourceNote,
  methodologyNote,
  abstract,
  footnote,
  xKey,
  yKey,
  xLabel,
  yLabel,
  colorKey,
  nameKey,
  showLegend,
  showGrid,
  showDataLabels,
  data,
}: {
  title: string;
  slug: string;
  chartType: LocalChartType;
  description: string;
  sourceNote: string;
  methodologyNote: string;
  abstract: string;
  footnote: string;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  colorKey: string;
  nameKey: string;
  showLegend: boolean;
  showGrid: boolean;
  showDataLabels: boolean;
  data: D3ChartDatum[];
}): LocalChart {
  const now = new Date().toISOString();

  return {
    type: "chart",
    title: title || "無題の図表",
    slug,
    chartType,
    description,
    data,
    sourceNote,
    methodologyNote,
    xKey: xKey || "label",
    yKey: yKey || "value",
    xLabel,
    yLabel,
    colorKey,
    nameKey,
    showLegend,
    showGrid,
    showDataLabels,
    footnote,
    abstract,
    height: 320,
    createdAt: now,
    updatedAt: now,
  };
}

export function QuickChartComposer({ onClose, onInsert }: QuickChartComposerProps) {
  const [title, setTitle] = useState("新しい図表");
  const [slug, setSlug] = useState("new-chart");
  const [chartType, setChartType] = useState<LocalChartType>("bar");
  const [description, setDescription] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [methodologyNote, setMethodologyNote] = useState("");
  const [abstract, setAbstract] = useState("");
  const [footnote, setFootnote] = useState("");
  const [xKey, setXKey] = useState("label");
  const [yKey, setYKey] = useState("value");
  const [xLabel, setXLabel] = useState("");
  const [yLabel, setYLabel] = useState("");
  const [colorKey, setColorKey] = useState("color");
  const [nameKey, setNameKey] = useState("");
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [csv, setCsv] = useState(sampleCsv);
  const [paletteId, setPaletteId] = useState(chartPalettePresets[0].id);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resolvedSlug = normalizeSlug(slug || title) || "new-chart";
  const data = useMemo(() => parseSimpleCsv(csv), [csv]);
  const editableRows = useMemo(() => csvToEditableRows(csv), [csv]);
  const selectedPalette = chartPalettePresets.find((palette) => palette.id === paletteId) ?? chartPalettePresets[0];
  const chart = useMemo(
    () =>
      makeChart({
        title,
        slug: resolvedSlug,
        chartType,
        description,
        sourceNote,
        methodologyNote,
        abstract,
        footnote,
        xKey,
        yKey,
        xLabel,
        yLabel,
        colorKey,
        nameKey,
        showLegend,
        showGrid,
        showDataLabels,
        data,
      }),
    [abstract, chartType, colorKey, data, description, footnote, methodologyNote, nameKey, resolvedSlug, showDataLabels, showGrid, showLegend, sourceNote, title, xKey, xLabel, yKey, yLabel],
  );

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

  async function handleSaveAndInsert() {
    setMessage("");
    setError("");

    const response = await fetch("/api/local-press/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "charts", slug: resolvedSlug, overwrite, chart }),
    });
    const result = (await response.json()) as { success?: boolean; error?: string };

    if (!response.ok || !result.success) {
      setError(result.error ?? "図表の保存に失敗しました。");
      return;
    }

    setMessage(`保存して本文に挿入しました: ${resolvedSlug}`);
    onInsert(chart);
  }

  return (
    <div className="absolute inset-0 z-20 overflow-auto bg-white/95 p-4 backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] pb-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">QUICK CHART</p>
          <h3 className="text-xl font-semibold text-[color:var(--color-primary)]">図表を作って本文へ入れる</h3>
        </div>
        <button type="button" onClick={onClose} className="ui-button ui-button-secondary h-9 px-3 text-sm">
          閉じる
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
        <section className="space-y-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="図表タイトル" className="h-11 w-full rounded-md border border-[color:var(--color-border)] px-3 text-sm font-semibold" />
          <input value={slug} onChange={(event) => setSlug(normalizeSlug(event.target.value))} placeholder="chart-slug" className="h-10 w-full rounded-md border border-[color:var(--color-border)] px-3 text-sm" />

          <div className="grid grid-cols-4 gap-2">
            {simpleChartTypes.slice(0, 8).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setChartType(item.value)}
                className={`h-9 rounded-md border text-xs font-semibold ${chartType === item.value ? "border-[color:var(--color-primary)] bg-white text-[color:var(--color-primary)]" : "border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-secondary-ink)]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {chartPalettePresets.map((palette) => (
              <button
                key={palette.id}
                type="button"
                onClick={() => applyPalette(palette.id)}
                className={`flex items-center gap-1 rounded-full border bg-white px-2 py-1 ${paletteId === palette.id ? "border-[color:var(--color-primary)]" : "border-[color:var(--color-border)]"}`}
                title={palette.label}
              >
                {palette.colors.slice(0, 4).map((color) => (
                  <span key={color} className="size-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                ))}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-[color:var(--color-border)] bg-white p-3">
            <div className="space-y-2">
              {editableRows.map((row, index) => (
                <div key={`${row.label}-${index}`} className="grid grid-cols-[1fr_70px_34px] gap-2">
                  <input value={row.label} onChange={(event) => updateRow(index, { label: event.target.value })} className="h-9 min-w-0 rounded-md border border-[color:var(--color-border)] px-2 text-sm" />
                  <input value={row.value} onChange={(event) => updateRow(index, { value: event.target.value })} className="h-9 min-w-0 rounded-md border border-[color:var(--color-border)] px-2 text-sm" />
                  <button type="button" onClick={() => updateRow(index, { color: selectedPalette.colors[(selectedPalette.colors.indexOf(row.color) + 1) % selectedPalette.colors.length] ?? selectedPalette.colors[0] })} onDoubleClick={() => removeRow(index)} className="h-9 rounded-md border border-[color:var(--color-border)]" style={{ backgroundColor: row.color }} aria-label="色を変更" />
                </div>
              ))}
            </div>
            <button type="button" onClick={addRow} className="mt-2 h-9 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] text-sm font-semibold">
              行を追加
            </button>
          </div>

          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="短い説明" className="min-h-14 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />

          <div>
            <button type="button" onClick={() => setAdvancedOpen((current) => !current)} className="h-9 w-full rounded-md border border-[color:var(--color-border)] bg-white text-sm font-semibold">
              {advancedOpen ? "詳細を閉じる" : "詳細"}
            </button>
          </div>

          {advancedOpen ? (
            <div className="space-y-2 rounded-lg border border-[color:var(--color-border)] bg-white p-3">
              <div className="grid grid-cols-2 gap-2">
                <input value={xKey} onChange={(event) => setXKey(event.target.value)} placeholder="Xキー" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={yKey} onChange={(event) => setYKey(event.target.value)} placeholder="Yキー / 複数は a,b,c" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={xLabel} onChange={(event) => setXLabel(event.target.value)} placeholder="X軸ラベル" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={yLabel} onChange={(event) => setYLabel(event.target.value)} placeholder="Y軸ラベル" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={colorKey} onChange={(event) => setColorKey(event.target.value)} placeholder="色キー" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
                <input value={nameKey} onChange={(event) => setNameKey(event.target.value)} placeholder="名称キー" className="h-10 rounded-md border border-[color:var(--color-border)] px-3 text-sm" />
              </div>
              <textarea value={csv} onChange={(event) => setCsv(event.target.value)} className="min-h-28 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 font-mono text-sm" />
              <textarea value={abstract} onChange={(event) => setAbstract(event.target.value)} placeholder="アブストラクト" className="min-h-12 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
              <textarea value={sourceNote} onChange={(event) => setSourceNote(event.target.value)} placeholder="出典・基準" className="min-h-12 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
              <textarea value={methodologyNote} onChange={(event) => setMethodologyNote(event.target.value)} placeholder="方法論メモ" className="min-h-12 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
              <textarea value={footnote} onChange={(event) => setFootnote(event.target.value)} placeholder="脚注" className="min-h-12 w-full rounded-md border border-[color:var(--color-border)] px-3 py-2 text-sm" />
            </div>
          ) : null}
          <div className="grid grid-cols-3 gap-2 text-xs text-[color:var(--color-secondary-ink)]">
            <label className="flex items-center gap-2 rounded-md border border-[color:var(--color-border)] bg-white px-2 py-2">
              <input type="checkbox" checked={showLegend} onChange={(event) => setShowLegend(event.target.checked)} />
              凡例
            </label>
            <label className="flex items-center gap-2 rounded-md border border-[color:var(--color-border)] bg-white px-2 py-2">
              <input type="checkbox" checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} />
              目盛り線
            </label>
            <label className="flex items-center gap-2 rounded-md border border-[color:var(--color-border)] bg-white px-2 py-2">
              <input type="checkbox" checked={showDataLabels} onChange={(event) => setShowDataLabels(event.target.checked)} />
              データラベル
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={overwrite} onChange={(event) => setOverwrite(event.target.checked)} />
            同じslugがあれば上書きする
          </label>
          <button type="button" onClick={handleSaveAndInsert} className="ui-button ui-button-primary h-11 w-full px-4 text-sm">
            保存して本文に挿入
          </button>
          {message ? <p className="rounded-md bg-white px-3 py-2 text-sm text-[color:var(--color-primary)]">{message}</p> : null}
          {error ? <p className="rounded-md bg-[#fff4f4] px-3 py-2 text-sm text-[#8d4b50]">{error}</p> : null}
        </section>

        <section className="min-w-0">
          <ChartRenderer chart={chart} />
          <pre className="mt-3 overflow-x-auto rounded-md border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm">{`:::chart slug="${resolvedSlug}"
:::`}</pre>
        </section>
      </div>
    </div>
  );
}
