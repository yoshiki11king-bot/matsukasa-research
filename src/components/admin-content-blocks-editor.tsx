"use client";

import { useState } from "react";
import { formatD3ChartData } from "@/lib/d3-chart";
import type { ContentBlock } from "@/lib/types";

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
          画像は URL でもアップロードでも登録できます。D3 チャートは JSON データを入れると本文内でアニメーション表示されます。
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
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">チャート名</span>
                    <input
                      type="text"
                      name={`contentBlocks[${index}][title]`}
                      value={block.title}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "d3Chart" ? { ...current, title: event.target.value } : current,
                        )
                      }
                      className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">チャート種別</span>
                    <select
                      name={`contentBlocks[${index}][chartType]`}
                      value={block.chartType}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "d3Chart"
                            ? { ...current, chartType: event.target.value === "line" ? "line" : "bar" }
                            : current,
                        )
                      }
                      className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                    >
                      <option value="bar">棒グラフ</option>
                      <option value="line">折れ線グラフ</option>
                    </select>
                  </label>
                </div>

                <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
                  <span className="font-medium">補足</span>
                  <textarea
                    name={`contentBlocks[${index}][description]`}
                    rows={3}
                    value={block.description}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "d3Chart" ? { ...current, description: event.target.value } : current,
                      )
                    }
                    className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                  />
                </label>

                <div className="grid gap-4 lg:grid-cols-4">
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">Xキー</span>
                    <input
                      type="text"
                      name={`contentBlocks[${index}][xKey]`}
                      value={block.xKey}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "d3Chart" ? { ...current, xKey: event.target.value } : current,
                        )
                      }
                      className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">Yキー</span>
                    <input
                      type="text"
                      name={`contentBlocks[${index}][yKey]`}
                      value={block.yKey}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "d3Chart" ? { ...current, yKey: event.target.value } : current,
                        )
                      }
                      className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-[color:var(--color-text)]">
                    <span className="font-medium">Y軸ラベル</span>
                    <input
                      type="text"
                      name={`contentBlocks[${index}][yLabel]`}
                      value={block.yLabel}
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "d3Chart" ? { ...current, yLabel: event.target.value } : current,
                        )
                      }
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
                      onChange={(event) =>
                        updateBlock(block.id, (current) =>
                          current.type === "d3Chart"
                            ? { ...current, height: Number(event.target.value) || 320 }
                            : current,
                        )
                      }
                      className="h-11 w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                    />
                  </label>
                </div>

                <label className="block space-y-2 text-sm text-[color:var(--color-text)]">
                  <span className="font-medium">データ JSON</span>
                  <p className="text-xs leading-6 text-[color:var(--color-muted)]">
                    配列形式で入れてください。例: [{`{ "label": "20代", "value": 42 }`}, ...]
                  </p>
                  <textarea
                    name={`contentBlocks[${index}][dataJson]`}
                    rows={10}
                    value={block.dataJson}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "d3Chart" ? { ...current, dataJson: event.target.value } : current,
                      )
                    }
                    className="w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 font-mono text-sm outline-none transition focus:border-[color:var(--color-accent-ink)] focus:shadow-[0_0_0_4px_var(--color-focus-ring)]"
                  />
                </label>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
