"use client";

import { useState } from "react";
import { D3ChartBlock } from "@/components/d3-chart-block";
import { formatD3ChartData, normalizeD3ChartInput, parseD3ChartJSON } from "@/lib/d3-chart";
import type { ContentBlock, D3ChartDatum } from "@/lib/types";

type EditorBlock =
  | {
      id: string;
      type: "heading";
      text: string;
      level: 2 | 3;
    }
  | {
      id: string;
      type: "paragraph";
      body: string;
    }
  | {
      id: string;
      type: "image";
      imageUrl: string;
      caption: string;
      alt: string;
      sourceText: string;
    }
  | {
      id: string;
      type: "link";
      title: string;
      url: string;
      description: string;
    }
  | {
      id: string;
      type: "d3Chart";
      title: string;
      description: string;
      chartType: "bar" | "line";
      xKey: string;
      yKey: string;
      yLabel: string;
      height: number;
      csvText: string;
      csvError: string;
      dataJson: string;
    };

type AdminContentBlocksEditorProps = {
  initialBlocks: ContentBlock[];
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toEditorBlock(block: ContentBlock): EditorBlock {
  if (block.type === "heading") {
    return {
      id: createId(),
      type: "heading",
      text: block.text,
      level: block.level,
    };
  }

  if (block.type === "paragraph") {
    return {
      id: createId(),
      type: "paragraph",
      body: block.body,
    };
  }

  if (block.type === "image") {
    return {
      id: createId(),
      type: "image",
      imageUrl: block.image.url,
      caption: block.caption ?? "",
      alt: block.alt ?? "",
      sourceText: block.sourceText ?? "",
    };
  }

  if (block.type === "d3Chart") {
    return {
      id: createId(),
      type: "d3Chart",
      title: block.title,
      description: block.description ?? "",
      chartType: block.chartType,
      xKey: block.xKey,
      yKey: block.yKey,
      yLabel: block.yLabel ?? "",
      height: block.height ?? 320,
      csvText: formatChartDataAsDelimited(block.data),
      csvError: "",
      dataJson: formatD3ChartData(block.data),
    };
  }

  return {
    id: createId(),
    type: "link",
    title: block.title,
    url: block.url,
    description: block.description ?? "",
  };
}

function createBlock(type: EditorBlock["type"]): EditorBlock {
  if (type === "heading") {
    return {
      id: createId(),
      type,
      text: "",
      level: 2,
    };
  }

  if (type === "paragraph") {
    return {
      id: createId(),
      type,
      body: "",
    };
  }

  if (type === "image") {
    return {
      id: createId(),
      type,
      imageUrl: "",
      caption: "",
      alt: "",
      sourceText: "",
    };
  }

  if (type === "d3Chart") {
    return {
      id: createId(),
      type,
      title: "新しいチャート",
      description: "",
      chartType: "bar",
      xKey: "label",
      yKey: "value",
      yLabel: "",
      height: 320,
      csvText: "label\tvalue\nA\t24\nB\t38\nC\t31",
      csvError: "",
      dataJson: formatD3ChartData([
        { label: "A", value: 24 },
        { label: "B", value: 38 },
        { label: "C", value: 31 },
      ]),
    };
  }

  return {
    id: createId(),
    type,
    title: "",
    url: "",
    description: "",
  };
}

function blockLabel(type: EditorBlock["type"]) {
  switch (type) {
    case "heading":
      return "見出し";
    case "paragraph":
      return "本文";
    case "image":
      return "画像";
    case "link":
      return "リンク";
    case "d3Chart":
      return "D3チャート";
  }
}

type D3EditorBlock = Extract<EditorBlock, { type: "d3Chart" }>;

type ParsedTable =
  | {
      ok: true;
      headers: string[];
      data: D3ChartDatum[];
    }
  | {
      ok: false;
      error: string;
    };

function detectDelimiter(value: string) {
  const firstLine = value.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const tabCount = (firstLine.match(/\t/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  return tabCount > commaCount ? "\t" : ",";
}

function parseDelimitedRows(value: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (char !== "\r") {
      field += char;
    }
  }

  row.push(field);
  rows.push(row);

  return rows.filter((item) => item.some((cell) => cell.trim()));
}

function normalizeHeader(value: string, index: number, seen: Map<string, number>) {
  const base = value.trim() || `列${index + 1}`;
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}_${count + 1}`;
}

function parseChartCell(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const numeric = trimmed.replace(/,/g, "").replace(/%$/, "");

  if (/^-?\d+(\.\d+)?$/.test(numeric)) {
    return Number(numeric);
  }

  return trimmed;
}

function parseTableText(value: string): ParsedTable {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: "CSVまたは表を貼り付けてください。",
    };
  }

  const rows = parseDelimitedRows(trimmed, detectDelimiter(trimmed));

  if (rows.length < 2) {
    return {
      ok: false,
      error: "1行目に列名、2行目以降にデータを入れてください。",
    };
  }

  const seen = new Map<string, number>();
  const headers = rows[0].map((cell, index) => normalizeHeader(cell, index, seen));
  const data = rows.slice(1).flatMap((row) => {
    const item = Object.fromEntries(
      headers.map((header, index) => [header, parseChartCell(row[index] ?? "")]),
    ) as D3ChartDatum;

    return Object.values(item).some((cell) => cell !== "") ? [item] : [];
  });

  if (data.length === 0) {
    return {
      ok: false,
      error: "データ行が見つかりません。",
    };
  }

  return {
    ok: true,
    headers,
    data,
  };
}

function collectColumns(data: D3ChartDatum[]) {
  const columns: string[] = [];

  for (const row of data) {
    for (const key of Object.keys(row)) {
      if (!columns.includes(key)) {
        columns.push(key);
      }
    }
  }

  return columns;
}

function isNumericColumn(data: D3ChartDatum[], key: string) {
  return data.some((row) => typeof row[key] === "number");
}

function inferChartKeys(data: D3ChartDatum[]) {
  const columns = collectColumns(data);
  const xKey = columns.find((key) => !isNumericColumn(data, key)) ?? columns[0] ?? "label";
  const yKey = columns.find((key) => key !== xKey && isNumericColumn(data, key)) ?? columns[1] ?? "value";

  return { xKey, yKey };
}

function rowsFromDataJson(value: string) {
  const parsed = parseD3ChartJSON(value);

  if (!parsed.ok) {
    return {
      ok: false as const,
      error: parsed.error,
    };
  }

  if (Array.isArray(parsed.data)) {
    return {
      ok: true as const,
      data: parsed.data,
    };
  }

  if (Array.isArray(parsed.data.data)) {
    return {
      ok: true as const,
      data: parsed.data.data,
    };
  }

  return {
    ok: false as const,
    error: "データは配列形式で入力してください。",
  };
}

function formatChartDataAsDelimited(data: D3ChartDatum[]) {
  if (data.length === 0) {
    return "";
  }

  const columns = collectColumns(data);
  const lines = data.map((row) => columns.map((column) => String(row[column] ?? "")).join("\t"));
  return [columns.join("\t"), ...lines].join("\n");
}

function buildChartPreview(block: D3EditorBlock) {
  const rows = rowsFromDataJson(block.dataJson);

  if (!rows.ok) {
    return {
      ok: false as const,
      error: rows.error,
      columns: [] as string[],
    };
  }

  const preview = normalizeD3ChartInput({
    title: block.title,
    description: block.description,
    chartType: block.chartType,
    xKey: block.xKey,
    yKey: block.yKey,
    yLabel: block.yLabel,
    height: block.height,
    data: rows.data,
  });

  if (!preview) {
    return {
      ok: false as const,
      error: "チャート名、Xキー、Yキー、データを確認してください。",
      columns: collectColumns(rows.data),
    };
  }

  return {
    ok: true as const,
    block: preview,
    columns: collectColumns(rows.data),
    rowCount: rows.data.length,
  };
}

type ChartBuilderFieldsProps = {
  block: D3EditorBlock;
  index: number;
  updateBlock: (id: string, updater: (block: EditorBlock) => EditorBlock) => void;
};

function ChartBuilderFields({ block, index, updateBlock }: ChartBuilderFieldsProps) {
  const preview = buildChartPreview(block);
  const columns = preview.columns;
  const columnListId = `chart-columns-${block.id}`;

  const setChartBlock = (updater: (block: D3EditorBlock) => D3EditorBlock) => {
    updateBlock(block.id, (current) => (current.type === "d3Chart" ? updater(current) : current));
  };

  const importTable = () => {
    const parsed = parseTableText(block.csvText);

    if (!parsed.ok) {
      setChartBlock((current) => ({ ...current, csvError: parsed.error }));
      return;
    }

    const { xKey, yKey } = inferChartKeys(parsed.data);

    setChartBlock((current) => ({
      ...current,
      xKey,
      yKey,
      csvError: "",
      dataJson: formatD3ChartData(parsed.data),
    }));
  };

  const formatJson = () => {
    const rows = rowsFromDataJson(block.dataJson);

    if (!rows.ok) {
      return;
    }

    setChartBlock((current) => ({
      ...current,
      csvText: formatChartDataAsDelimited(rows.data),
      csvError: "",
      dataJson: formatD3ChartData(rows.data),
    }));
  };

  const insertSample = () => {
    const sample = [
      { 年代: "20代", 回答率: 42 },
      { 年代: "30代", 回答率: 51 },
      { 年代: "40代", 回答率: 47 },
      { 年代: "50代", 回答率: 39 },
    ];

    setChartBlock((current) => ({
      ...current,
      title: current.title || "年代別の回答率",
      chartType: "bar",
      xKey: "年代",
      yKey: "回答率",
      yLabel: "%",
      csvText: formatChartDataAsDelimited(sample),
      csvError: "",
      dataJson: formatD3ChartData(sample),
    }));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
              Matsukasa Chart Builder
            </p>
            <h3 className="text-base font-semibold text-[color:var(--color-primary)]">表からチャートを作る</h3>
            <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
              スプレッドシートを貼り付けると、JSON とキー候補を自動で整えます。保存時は従来の D3 ブロックとして記事に入ります。
            </p>
          </div>
          <button type="button" className="ui-button ui-button-secondary h-10 px-4 text-sm" onClick={insertSample}>
            サンプルを入れる
          </button>
        </div>

        <label className="mt-4 block space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">CSV / 表を貼り付け</span>
          <textarea
            rows={6}
            value={block.csvText}
            onChange={(event) => setChartBlock((current) => ({ ...current, csvText: event.target.value, csvError: "" }))}
            placeholder={"年代\t回答率\n20代\t42\n30代\t51"}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 font-mono text-sm outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
          {block.csvError ? (
            <span className="text-xs text-[color:var(--color-accent-ink)]">{block.csvError}</span>
          ) : null}
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="ui-button ui-button-primary h-10 px-4 text-sm" onClick={importTable}>
            表をチャートに反映
          </button>
          <button type="button" className="ui-button ui-button-secondary h-10 px-4 text-sm" onClick={formatJson}>
            JSONを整形
          </button>
          {preview.ok ? (
            <span className="text-xs text-[color:var(--color-muted)]">
              {preview.rowCount}行 / 列: {columns.join("、") || "未検出"}
            </span>
          ) : (
            <span className="text-xs text-[color:var(--color-accent-ink)]">{preview.error}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">チャート名</span>
          <input
            type="text"
            name={`contentBlocks[${index}][title]`}
            value={block.title}
            onChange={(event) => setChartBlock((current) => ({ ...current, title: event.target.value }))}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">チャート種別</span>
          <select
            name={`contentBlocks[${index}][chartType]`}
            value={block.chartType}
            onChange={(event) =>
              setChartBlock((current) => ({ ...current, chartType: event.target.value === "line" ? "line" : "bar" }))
            }
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          >
            <option value="bar">棒グラフ</option>
            <option value="line">折れ線グラフ</option>
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
        <span className="font-medium">補足・注記・出典</span>
        <textarea
          name={`contentBlocks[${index}][description]`}
          rows={3}
          value={block.description}
          onChange={(event) => setChartBlock((current) => ({ ...current, description: event.target.value }))}
          placeholder="出典、調査対象、注記など"
          className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
        />
      </label>

      <datalist id={columnListId}>
        {columns.map((column) => (
          <option key={column} value={column} />
        ))}
      </datalist>

      <div className="grid gap-4 lg:grid-cols-4">
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">Xキー</span>
          <input
            type="text"
            list={columnListId}
            name={`contentBlocks[${index}][xKey]`}
            value={block.xKey}
            onChange={(event) => setChartBlock((current) => ({ ...current, xKey: event.target.value }))}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">Yキー</span>
          <input
            type="text"
            list={columnListId}
            name={`contentBlocks[${index}][yKey]`}
            value={block.yKey}
            onChange={(event) => setChartBlock((current) => ({ ...current, yKey: event.target.value }))}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">Y軸ラベル</span>
          <input
            type="text"
            name={`contentBlocks[${index}][yLabel]`}
            value={block.yLabel}
            onChange={(event) => setChartBlock((current) => ({ ...current, yLabel: event.target.value }))}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
        <label className="space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">高さ</span>
          <input
            type="number"
            name={`contentBlocks[${index}][height]`}
            min={220}
            max={520}
            value={block.height}
            onChange={(event) => setChartBlock((current) => ({ ...current, height: Number(event.target.value) || 320 }))}
            className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
          <span className="font-medium">データ JSON</span>
          <p className="text-xs leading-6 text-[color:var(--color-muted)]">
            表を反映すると自動で入ります。細かく直したい場合だけ編集してください。
          </p>
          <textarea
            name={`contentBlocks[${index}][dataJson]`}
            rows={13}
            value={block.dataJson}
            onChange={(event) => setChartBlock((current) => ({ ...current, dataJson: event.target.value }))}
            className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 font-mono text-sm outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[color:var(--color-text)]">ライブプレビュー</p>
          {preview.ok ? (
            <D3ChartBlock block={preview.block} />
          ) : (
            <div className="rounded-lg border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-5 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
              {preview.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function fieldId(type: EditorBlock["type"]) {
  switch (type) {
    case "heading":
      return "block_heading";
    case "paragraph":
      return "block_paragraph";
    case "image":
      return "block_image";
    case "link":
      return "block_link";
    case "d3Chart":
      return "block_d3_chart";
  }
}

export function AdminContentBlocksEditor({
  initialBlocks,
}: AdminContentBlocksEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => initialBlocks.map(toEditorBlock));

  const addBlock = (type: EditorBlock["type"]) => {
    setBlocks((current) => [...current, createBlock(type)]);
  };

  const updateBlock = (id: string, updater: (block: EditorBlock) => EditorBlock) => {
    setBlocks((current) => current.map((block) => (block.id === id ? updater(block) : block)));
  };

  const removeBlock = (id: string) => {
    setBlocks((current) => current.filter((block) => block.id !== id));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;

    if (target < 0 || target >= blocks.length) {
      return;
    }

    setBlocks((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  return (
    <section className="space-y-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[color:var(--color-primary)]">本文ブロック</h2>
            <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">
              記事や報告書を、見出し・本文・画像・リンクの単位で並べ替えながら作れます。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="ui-button ui-button-secondary h-10 px-4 text-sm" onClick={() => addBlock("heading")}>
              見出しを追加
            </button>
            <button type="button" className="ui-button ui-button-secondary h-10 px-4 text-sm" onClick={() => addBlock("paragraph")}>
              本文を追加
            </button>
            <button type="button" className="ui-button ui-button-secondary h-10 px-4 text-sm" onClick={() => addBlock("image")}>
              画像を追加
            </button>
            <button type="button" className="ui-button ui-button-secondary h-10 px-4 text-sm" onClick={() => addBlock("link")}>
              リンクを追加
            </button>
            <button type="button" className="ui-button ui-button-secondary h-10 px-4 text-sm" onClick={() => addBlock("d3Chart")}>
              D3を追加
            </button>
          </div>
        </div>
        <p className="text-xs leading-6 text-[color:var(--color-muted)]">
          画像は URL でもアップロードでも登録できます。チャートは表や CSV から作成し、本文内で D3 アニメーション表示できます。
        </p>
      </div>

      {blocks.length === 0 ? (
        <div className="rounded-md border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-5 text-sm leading-7 text-[color:var(--color-secondary-ink)]">
          まだ本文ブロックはありません。新規原稿はここから組み立てていけます。
        </div>
      ) : null}

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="space-y-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-4"
          >
            <input type="hidden" name={`contentBlocks[${index}][fieldId]`} value={fieldId(block.type)} />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[color:var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--color-primary)]">
                  {blockLabel(block.type)}
                </span>
                <span className="text-xs text-[color:var(--color-muted)]">{index + 1} / {blocks.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveBlock(index, -1)}
                  className="rounded-md border border-[color:var(--color-border)] px-3 py-2 text-xs text-[color:var(--color-secondary-ink)] transition hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  上へ
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 1)}
                  className="rounded-md border border-[color:var(--color-border)] px-3 py-2 text-xs text-[color:var(--color-secondary-ink)] transition hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  下へ
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="rounded-md border border-[color:var(--color-border)] px-3 py-2 text-xs text-[color:var(--color-secondary-ink)] transition hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
                >
                  削除
                </button>
              </div>
            </div>

            {block.type === "heading" ? (
              <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                  <span className="font-medium">見出しの大きさ</span>
                  <select
                    name={`contentBlocks[${index}][level]`}
                    value={block.level === 3 ? "h3" : "h2"}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "heading"
                          ? { ...current, level: event.target.value === "h3" ? 3 : 2 }
                          : current,
                      )
                    }
                    className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                  >
                    <option value="h2">大見出し</option>
                    <option value="h3">中見出し</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                  <span className="font-medium">見出し</span>
                  <input
                    type="text"
                    name={`contentBlocks[${index}][text]`}
                    value={block.text}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "heading" ? { ...current, text: event.target.value } : current,
                      )
                    }
                    className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                  />
                </label>
              </div>
            ) : null}

            {block.type === "paragraph" ? (
              <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
                <span className="font-medium">本文</span>
                <textarea
                  name={`contentBlocks[${index}][body]`}
                  rows={6}
                  value={block.body}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "paragraph" ? { ...current, body: event.target.value } : current,
                    )
                  }
                  className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                />
              </label>
            ) : null}

            {block.type === "image" ? (
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">画像 URL</span>
                    <input
                      type="url"
                      name={`contentBlocks[${index}][imageUrl]`}
                      value={block.imageUrl}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "image" ? { ...current, imageUrl: event.target.value } : current,
                        )
                      }
                      placeholder="https://..."
                      className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">画像をアップロード</span>
                    <input
                      type="file"
                      name={`contentBlocks[${index}][imageFile]`}
                      accept="image/*"
                      className="flex h-11 w-full items-center rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[color:var(--color-primary)] file:px-3 file:py-2 file:text-[color:var(--color-primary-contrast)]"
                    />
                  </label>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">キャプション</span>
                    <input
                      type="text"
                      name={`contentBlocks[${index}][caption]`}
                      value={block.caption}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "image" ? { ...current, caption: event.target.value } : current,
                        )
                      }
                      className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">代替テキスト</span>
                    <input
                      type="text"
                      name={`contentBlocks[${index}][alt]`}
                      value={block.alt}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "image" ? { ...current, alt: event.target.value } : current,
                        )
                      }
                      className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">出典</span>
                    <input
                      type="text"
                      name={`contentBlocks[${index}][sourceText]`}
                      value={block.sourceText}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "image" ? { ...current, sourceText: event.target.value } : current,
                        )
                      }
                      className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {block.type === "link" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                  <span className="font-medium">タイトル</span>
                  <input
                    type="text"
                    name={`contentBlocks[${index}][title]`}
                    value={block.title}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "link" ? { ...current, title: event.target.value } : current,
                      )
                    }
                    className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                  />
                </label>
                <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                  <span className="font-medium">URL</span>
                  <input
                    type="url"
                    name={`contentBlocks[${index}][url]`}
                    value={block.url}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "link" ? { ...current, url: event.target.value } : current,
                      )
                    }
                    placeholder="https://..."
                    className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                  />
                </label>
                <label className="space-y-2 text-sm text-[color:var(--color-text)] lg:col-span-2">
                  <span className="font-medium">補足</span>
                  <textarea
                    name={`contentBlocks[${index}][description]`}
                    rows={4}
                    value={block.description}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "link"
                          ? { ...current, description: event.target.value }
                          : current,
                      )
                    }
                    className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                  />
                </label>
              </div>
            ) : null}

            {block.type === "d3Chart" ? (
              <ChartBuilderFields block={block} index={index} updateBlock={updateBlock} />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
