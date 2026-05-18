"use client";

/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type BlockKind = "heading1" | "heading2" | "heading3" | "paragraph" | "quote" | "note" | "list" | "image" | "divider" | "columns" | "raw";

type DropPosition = "before" | "after" | "left" | "right";
type ColumnWidths = [number, number];

type EditorBlock = {
  id: string;
  kind: BlockKind;
  text: string;
  widths?: ColumnWidths;
};

type BlockEditorProps = {
  body: string;
  onChange: (body: string) => void;
  onOpenChart: (insertEmbed: (slug: string) => void) => void;
};

const blockKinds: Array<{ kind: BlockKind; label: string; placeholder: string }> = [
  { kind: "heading1", label: "大見出し", placeholder: "大見出し" },
  { kind: "heading2", label: "中見出し", placeholder: "中見出し" },
  { kind: "heading3", label: "小見出し", placeholder: "小見出し" },
  { kind: "paragraph", label: "一般文", placeholder: "AIはスペース、コマンドは半角「/」または全角「；」を入力" },
  { kind: "quote", label: "引用", placeholder: "引用文" },
  { kind: "note", label: "注釈", placeholder: "注釈を書く" },
  { kind: "list", label: "箇条書き", placeholder: "項目\n項目" },
  { kind: "image", label: "写真", placeholder: "画像説明\n/local-press/uploads/image.jpg" },
  { kind: "divider", label: "横線", placeholder: "" },
  { kind: "columns", label: "縦区切り", placeholder: "左側の文\n---column---\n右側の文" },
  { kind: "raw", label: "特殊", placeholder: "Markdown / chart / note" },
];

function makeId() {
  return `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneBlocks(blocks: EditorBlock[]) {
  return blocks.map((block) => ({ ...block, widths: block.widths ? ([...block.widths] as ColumnWidths) : undefined }));
}

function normalizeBlockText(text: string) {
  return text.replace(/\n{3,}/g, "\n\n").trimEnd();
}

function splitMarkdownChunks(markdown: string) {
  const chunks: string[] = [];
  const current: string[] = [];
  let inFence = false;

  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const trimmed = line.trim();
    const isFenceStart = /^:::(chart|columns|finding|methodology|note)\b/.test(trimmed);

    if (isFenceStart && !inFence) {
      if (current.join("\n").trim()) {
        chunks.push(current.join("\n").trim());
        current.length = 0;
      }
      inFence = true;
      current.push(line);
      continue;
    }

    if (inFence) {
      current.push(line);
      if (trimmed === ":::") {
        chunks.push(current.join("\n").trim());
        current.length = 0;
        inFence = false;
      }
      continue;
    }

    if (!trimmed) {
      if (current.join("\n").trim()) {
        chunks.push(current.join("\n").trim());
        current.length = 0;
      }
      continue;
    }

    current.push(line);
  }

  if (current.join("\n").trim()) {
    chunks.push(current.join("\n").trim());
  }

  return chunks;
}

function markdownToBlocks(markdown: string): EditorBlock[] {
  const trimmed = markdown.trim();

  if (!trimmed) {
    return [{ id: makeId(), kind: "paragraph", text: "" }];
  }

  return splitMarkdownChunks(trimmed)
    .map((chunk) => {
      if (chunk.startsWith("# ")) {
        return { id: makeId(), kind: "heading1", text: chunk.replace(/^#\s+/, "") };
      }

      if (chunk.startsWith("## ")) {
        return { id: makeId(), kind: "heading2", text: chunk.replace(/^##\s+/, "") };
      }

      if (chunk.startsWith("### ")) {
        return { id: makeId(), kind: "heading3", text: chunk.replace(/^###\s+/, "") };
      }

      if (chunk.split("\n").every((line) => line.startsWith("> "))) {
        return { id: makeId(), kind: "quote", text: chunk.replace(/^>\s?/gm, "") };
      }

      const noteMatch = chunk.match(/^:::note\n([\s\S]*)\n:::$/);
      if (noteMatch) {
        return { id: makeId(), kind: "note", text: noteMatch[1] };
      }

      if (chunk.split("\n").every((line) => /^[-*]\s+/.test(line))) {
        return { id: makeId(), kind: "list", text: chunk.replace(/^[-*]\s+/gm, "") };
      }

      const imageMatch = chunk.match(/^!\[(.*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        return { id: makeId(), kind: "image", text: `${imageMatch[1]}\n${imageMatch[2]}` };
      }

      if (/^---+$/.test(chunk)) {
        return { id: makeId(), kind: "divider", text: "" };
      }

      const columnsMatch = chunk.match(/^:::columns(?:\s+widths="([\d.]+),([\d.]+)")?\n([\s\S]*)\n:::$/);
      if (columnsMatch) {
        const left = Number(columnsMatch[1]);
        const right = Number(columnsMatch[2]);
        const total = left + right;
        return {
          id: makeId(),
          kind: "columns",
          text: columnsMatch[3],
          widths: Number.isFinite(total) && total > 0 ? ([left / total, right / total] as ColumnWidths) : [0.5, 0.5],
        };
      }

      if (chunk.includes(":::") || chunk.startsWith("```") || chunk.startsWith("![") || chunk.startsWith("---")) {
        return { id: makeId(), kind: "raw", text: chunk };
      }

      return { id: makeId(), kind: "paragraph", text: chunk };
    });
}

function blockToMarkdown(block: EditorBlock) {
  const text = normalizeBlockText(block.text);

  if (!text && block.kind !== "paragraph" && block.kind !== "divider") {
    return "";
  }

  switch (block.kind) {
    case "heading1":
      return `# ${text || "大見出し"}`;
    case "heading2":
      return `## ${text || "中見出し"}`;
    case "heading3":
      return `### ${text || "小見出し"}`;
    case "quote":
      return text
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "note":
      return `:::note\n${text || "注釈を書く"}\n:::`;
    case "list":
      return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `- ${line}`)
        .join("\n");
    case "image": {
      const [alt = "画像", src = ""] = text.split("\n");
      return src.trim() ? `![${alt.trim() || "画像"}](${src.trim()})` : "";
    }
    case "divider":
      return "---";
    case "columns":
      return `:::columns widths="${(block.widths?.[0] ?? 0.5).toFixed(2)},${(block.widths?.[1] ?? 0.5).toFixed(2)}"\n${text || "左側の文\n---column---\n右側の文"}\n:::`;
    case "raw":
      return text;
    case "paragraph":
    default:
      return text;
  }
}

function blocksToMarkdown(blocks: EditorBlock[]) {
  return blocks.map(blockToMarkdown).filter(Boolean).join("\n\n");
}

function splitColumnsText(text: string) {
  const [left = "", right = ""] = text.split(/(?:^|\n)---column---(?:\n|$)/);
  return { left, right };
}

function joinColumnsText(left: string, right: string) {
  return `${left.trimEnd()}\n---column---\n${right.trimStart()}`;
}

function clampColumnLeftWidth(value: number) {
  return Math.max(0.25, Math.min(0.75, value));
}

function getTextareaClass(kind: BlockKind) {
  const base = "w-full resize-none border-0 bg-transparent px-0 py-1 outline-none placeholder:text-slate-300";

  if (kind === "heading1") {
    return `${base} font-editorial text-4xl font-semibold leading-tight text-[color:var(--color-primary)] md:text-5xl`;
  }

  if (kind === "heading2") {
    return `${base} font-editorial text-3xl font-semibold leading-tight text-[color:var(--color-primary)]`;
  }

  if (kind === "heading3") {
    return `${base} text-2xl font-semibold leading-snug text-[color:var(--color-primary)]`;
  }

  if (kind === "quote") {
    return `${base} font-editorial text-xl leading-9 text-[color:var(--color-primary)]`;
  }

  if (kind === "raw") {
    return `${base} font-mono text-base leading-8 text-[color:var(--color-secondary-ink)]`;
  }

  return `${base} font-serif text-xl leading-10 text-[color:var(--color-text)]`;
}

function getBlockShellClass(kind: BlockKind, dragging: boolean) {
  const base = `group relative grid grid-cols-[38px_minmax(0,1fr)] gap-2 rounded-lg border px-1 py-1 transition ${dragging ? "bg-[#e8f2ff]" : "hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-subtle)]"}`;

  if (kind === "quote") {
    return `${base} border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)]`;
  }

  if (kind === "note") {
    return `${base} border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]`;
  }

  if (kind === "columns") {
    return `${base} border-[color:var(--color-border)] bg-white`;
  }

  return `${base} border-transparent`;
}

function getDropGuideClass(position: DropPosition) {
  if (position === "before") {
    return "absolute -top-1 left-10 right-2 h-1 rounded-full bg-[#1787ff]";
  }

  if (position === "after") {
    return "absolute -bottom-1 left-10 right-2 h-1 rounded-full bg-[#1787ff]";
  }

  if (position === "left") {
    return "absolute bottom-2 left-10 top-2 w-1 rounded-full bg-[#1787ff]";
  }

  return "absolute bottom-2 right-2 top-2 w-1 rounded-full bg-[#1787ff]";
}

function getDropPosition(event: React.DragEvent<HTMLDivElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const xRatio = (event.clientX - rect.left) / rect.width;

  if (xRatio <= 0.3) {
    return "left";
  }

  if (xRatio >= 0.7) {
    return "right";
  }

  return event.clientY - rect.top < rect.height / 2 ? "before" : "after";
}

function getColumnGridStyle(widths: ColumnWidths = [0.5, 0.5]) {
  const left = clampColumnLeftWidth(widths[0]);
  return {
    "--local-column-left": `${left}fr`,
    "--local-column-right": `${1 - left}fr`,
  } as CSSProperties;
}

export function BlockEditor({ body, onChange, onOpenChart }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => markdownToBlocks(body));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: DropPosition } | null>(null);
  const [menuState, setMenuState] = useState<{ id: string; mode: "add" | "turn" } | null>(null);
  const [historyState, setHistoryState] = useState({ undo: 0, redo: 0 });
  const externalBodyRef = useRef(body);
  const undoStackRef = useRef<EditorBlock[][]>([]);
  const redoStackRef = useRef<EditorBlock[][]>([]);
  const uploadInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const textAreaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    if (body === externalBodyRef.current) {
      return;
    }

    window.requestAnimationFrame(() => {
      externalBodyRef.current = body;
      setBlocks(markdownToBlocks(body));
      undoStackRef.current = [];
      redoStackRef.current = [];
      setHistoryState({ undo: 0, redo: 0 });
    });
  }, [body]);

  const blockMarkdown = useMemo(() => blocksToMarkdown(blocks), [blocks]);

  useEffect(() => {
    if (blockMarkdown !== externalBodyRef.current) {
      externalBodyRef.current = blockMarkdown;
      onChange(blockMarkdown);
    }
  }, [blockMarkdown, onChange]);

  function updateBlocks(updater: (current: EditorBlock[]) => EditorBlock[], options: { history?: boolean } = { history: true }) {
    setBlocks((current) => {
      const next = updater(current);

      if (options.history !== false && next !== current) {
        undoStackRef.current = [...undoStackRef.current.slice(-49), cloneBlocks(current)];
        redoStackRef.current = [];
        setHistoryState({ undo: undoStackRef.current.length, redo: redoStackRef.current.length });
      }

      return next;
    });
  }

  function undo() {
    const previous = undoStackRef.current.at(-1);

    if (!previous) {
      return;
    }

    undoStackRef.current = undoStackRef.current.slice(0, -1);
    setBlocks((current) => {
      redoStackRef.current = [...redoStackRef.current.slice(-49), cloneBlocks(current)];
      return cloneBlocks(previous);
    });
    setMenuState(null);
    setHistoryState({ undo: undoStackRef.current.length, redo: redoStackRef.current.length + 1 });
  }

  function redo() {
    const next = redoStackRef.current.at(-1);

    if (!next) {
      return;
    }

    redoStackRef.current = redoStackRef.current.slice(0, -1);
    setBlocks((current) => {
      undoStackRef.current = [...undoStackRef.current.slice(-49), cloneBlocks(current)];
      return cloneBlocks(next);
    });
    setMenuState(null);
    setHistoryState({ undo: undoStackRef.current.length + 1, redo: redoStackRef.current.length });
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") {
        return;
      }

      event.preventDefault();

      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  function focusBlock(id: string) {
    window.requestAnimationFrame(() => {
      textAreaRefs.current[id]?.focus();
    });
  }

  function addBlock(kind: BlockKind = "paragraph", afterId?: string, text = "") {
    const nextBlock: EditorBlock = { id: makeId(), kind, text, widths: kind === "columns" ? [0.5, 0.5] : undefined };

    updateBlocks((current) => {
      if (!afterId) {
        return [...current, nextBlock];
      }

      const index = current.findIndex((block) => block.id === afterId);
      if (index < 0) {
        return [...current, nextBlock];
      }

      return [...current.slice(0, index + 1), nextBlock, ...current.slice(index + 1)];
    });
    setMenuState(null);
    focusBlock(nextBlock.id);
    return nextBlock.id;
  }

  function insertRawAfter(value: string, afterId?: string) {
    addBlock("raw", afterId, value.trim());
  }

  async function uploadImage(file: File, afterId?: string) {
    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch("/api/local-press/upload", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as { success?: boolean; url?: string; error?: string };

    if (!response.ok || !result.success || !result.url) {
      window.alert(result.error ?? "画像のアップロードに失敗しました。");
      return;
    }

    addBlock("image", afterId, `${file.name}\n${result.url}`);
  }

  function moveBlock(id: string, direction: -1 | 1) {
    updateBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  function changeBlockKind(id: string, kind: BlockKind) {
    updateBlocks((current) => current.map((item) => (item.id === id ? { ...item, kind } : item)));
    setMenuState(null);
  }

  function removeBlock(id: string) {
    updateBlocks((current) => {
      if (current.length === 1) {
        return [{ ...current[0], kind: "paragraph", text: "" }];
      }

      return current.filter((item) => item.id !== id);
    });
    setMenuState(null);
  }

  function makeColumnGroup(source: EditorBlock, target: EditorBlock, position: "left" | "right") {
    const sourceMarkdown = blockToMarkdown(source);
    const targetMarkdown = blockToMarkdown(target);
    const left = position === "left" ? sourceMarkdown : targetMarkdown;
    const right = position === "left" ? targetMarkdown : sourceMarkdown;
    return {
      id: makeId(),
      kind: "columns" as const,
      text: joinColumnsText(left, right),
      widths: [0.5, 0.5] as ColumnWidths,
    };
  }

  function convertBlockToColumns(id: string, side: "left" | "right") {
    updateBlocks((current) =>
      current.map((block) => {
        if (block.id !== id) {
          return block;
        }

        const markdown = blockToMarkdown(block);
        return {
          id: block.id,
          kind: "columns",
          text: side === "left" ? joinColumnsText("", markdown) : joinColumnsText(markdown, ""),
          widths: [0.5, 0.5],
        };
      }),
    );
    setMenuState(null);
  }

  function unwrapColumns(id: string) {
    updateBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);

      if (index < 0) {
        return current;
      }

      const block = current[index];

      if (block.kind !== "columns") {
        return current;
      }

      const { left, right } = splitColumnsText(block.text);
      const nextBlocks = [...markdownToBlocks(left), ...markdownToBlocks(right)].filter((item) => item.text.trim() || item.kind === "divider");
      const replacement = nextBlocks.length > 0 ? nextBlocks : [{ id: makeId(), kind: "paragraph" as const, text: "" }];
      return [...current.slice(0, index), ...replacement, ...current.slice(index + 1)];
    });
    setMenuState(null);
  }

  function swapColumns(id: string) {
    updateBlocks((current) =>
      current.map((block) => {
        if (block.id !== id || block.kind !== "columns") {
          return block;
        }

        const { left, right } = splitColumnsText(block.text);
        const widths = block.widths ?? [0.5, 0.5];
        return {
          ...block,
          text: joinColumnsText(right, left),
          widths: [widths[1], widths[0]],
        };
      }),
    );
    setMenuState(null);
  }

  function splitWithNeighbor(id: string, direction: -1 | 1) {
    updateBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const neighborIndex = index + direction;

      if (index < 0 || neighborIndex < 0 || neighborIndex >= current.length) {
        return current;
      }

      const block = current[index];
      const neighbor = current[neighborIndex];
      const columnGroup = direction > 0 ? makeColumnGroup(neighbor, block, "right") : makeColumnGroup(neighbor, block, "left");
      const ids = new Set([block.id, neighbor.id]);
      const insertionIndex = Math.min(index, neighborIndex);
      const next = current.filter((item) => !ids.has(item.id));
      next.splice(insertionIndex, 0, columnGroup);
      return next;
    });
    setMenuState(null);
  }

  function updateColumnWidth(id: string, leftWidth: number) {
    const clamped = clampColumnLeftWidth(leftWidth);
    updateBlocks(
      (current) =>
        current.map((block) =>
          block.id === id
            ? {
                ...block,
                widths: [clamped, 1 - clamped],
              }
            : block,
        ),
      { history: false },
    );
  }

  function startColumnResize(event: React.PointerEvent<HTMLDivElement>, block: EditorBlock) {
    event.preventDefault();
    const container = event.currentTarget.parentElement;
    const beforeResize = cloneBlocks(blocks);

    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();

    function handlePointerMove(pointerEvent: PointerEvent) {
      const leftWidth = clampColumnLeftWidth((pointerEvent.clientX - rect.left) / rect.width);
      updateColumnWidth(block.id, leftWidth);
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      undoStackRef.current = [...undoStackRef.current.slice(-49), beforeResize];
      redoStackRef.current = [];
      setHistoryState({ undo: undoStackRef.current.length, redo: 0 });
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function applySlashCommand(block: EditorBlock) {
    const command = block.text.trim().toLowerCase().replace(/^；/, "/").replace(/^;/, "/");
    const commandMap: Record<string, BlockKind> = {
      "/h1": "heading1",
      "/title": "heading1",
      "/h2": "heading2",
      "/heading": "heading2",
      "/h3": "heading3",
      "/p": "paragraph",
      "/text": "paragraph",
      "/quote": "quote",
      "/note": "note",
      "/list": "list",
      "/image": "image",
      "/divider": "divider",
      "/line": "divider",
      "/columns": "columns",
    };

    if (command === "/chart") {
      onOpenChart((slug) => insertRawAfter(`:::chart slug="${slug}"\n:::`, block.id));
      updateBlocks((current) => current.map((item) => (item.id === block.id ? { ...item, text: "" } : item)));
      return true;
    }

    const kind = commandMap[command];

    if (!kind) {
      return false;
    }

    updateBlocks((current) =>
      current.map((item) =>
        item.id === block.id
          ? {
              ...item,
              kind,
              text: "",
              widths: kind === "columns" ? [0.5, 0.5] : undefined,
            }
          : item,
      ),
    );
    setMenuState(null);
    focusBlock(block.id);
    return true;
  }

  function dropBlock() {
    if (!draggingId || !dropTarget || draggingId === dropTarget.id) {
      setDraggingId(null);
      setDropTarget(null);
      return;
    }

    updateBlocks((current) => {
      const sourceIndex = current.findIndex((block) => block.id === draggingId);
      const targetIndex = current.findIndex((block) => block.id === dropTarget.id);

      if (sourceIndex < 0 || targetIndex < 0) {
        return current;
      }

      const source = current[sourceIndex];
      const target = current[targetIndex];

      if ((dropTarget.position === "left" || dropTarget.position === "right") && target.kind !== "columns") {
        const columnGroup = makeColumnGroup(source, target, dropTarget.position);
        const withoutSource = current.filter((block) => block.id !== source.id);
        return withoutSource.map((block) => (block.id === target.id ? columnGroup : block));
      }

      const next = [...current];
      const [item] = next.splice(sourceIndex, 1);
      const adjustedTargetIndex = next.findIndex((block) => block.id === dropTarget.id);
      const insertIndex = dropTarget.position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex;
      next.splice(Math.max(0, insertIndex), 0, item);
      return next;
    });
    setDraggingId(null);
    setDropTarget(null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>, block: EditorBlock) {
    if ((event.key === "/" || event.key === "；" || event.key === ";") && !block.text.trim()) {
      setMenuState({ id: block.id, mode: "add" });
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && /^[/；;]/.test(block.text.trim())) {
      if (applySlashCommand(block)) {
        event.preventDefault();
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey && block.kind !== "raw" && block.kind !== "columns") {
      event.preventDefault();
      addBlock("paragraph", block.id);
      return;
    }

    if (event.key === "Backspace" && !block.text && blocks.length > 1) {
      event.preventDefault();
      const index = blocks.findIndex((item) => item.id === block.id);
      const previous = index > 0 ? blocks[index - 1] : null;
      removeBlock(block.id);
      if (previous) {
        focusBlock(previous.id);
      }
    }
  }

  function renderBlockMenu(block: EditorBlock) {
    if (menuState?.id !== block.id) {
      return null;
    }

    const isAddMode = menuState.mode === "add";

    return (
      <div className="absolute left-10 top-10 z-20 w-72 rounded-lg border border-[color:var(--color-border)] bg-white p-2 shadow-[var(--shadow-soft)]">
        <p className="px-2 pb-2 text-xs font-semibold tracking-[0.14em] text-[color:var(--color-muted)]">{isAddMode ? "ADD BLOCK" : "TURN INTO"}</p>
        <div className="grid grid-cols-2 gap-1">
          {blockKinds.map((item) => (
            <button key={item.kind} type="button" onClick={() => (isAddMode ? addBlock(item.kind, block.id) : changeBlockKind(block.id, item.kind))} className="rounded-md px-2 py-2 text-left text-sm text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)]">
              {item.label}
            </button>
          ))}
          <button type="button" onClick={() => insertRawAfter(":::finding\nここに主な発見を書く\n:::", block.id)} className="rounded-md px-2 py-2 text-left text-sm text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)]">
            主な発見
          </button>
          <button type="button" onClick={() => onOpenChart((slug) => insertRawAfter(`:::chart slug="${slug}"\n:::`, block.id))} className="rounded-md px-2 py-2 text-left text-sm font-semibold text-[color:var(--color-accent)] transition hover:bg-[color:var(--color-accent-soft)]">
            グラフ
          </button>
        </div>
        <div className="mt-2 border-t border-[color:var(--color-border)] pt-2">
          {block.kind === "columns" ? (
            <>
              <button type="button" onClick={() => swapColumns(block.id)} className="w-full rounded-md px-2 py-2 text-left text-sm text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)]">
                左右を入れ替える
              </button>
              <button type="button" onClick={() => unwrapColumns(block.id)} className="w-full rounded-md px-2 py-2 text-left text-sm text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)]">
                通常ブロックへ戻す
              </button>
            </>
          ) : null}
          <button type="button" onClick={() => convertBlockToColumns(block.id, "right")} className="w-full rounded-md px-2 py-2 text-left text-sm text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)]">
            左に空欄を作る
          </button>
          <button type="button" onClick={() => convertBlockToColumns(block.id, "left")} className="w-full rounded-md px-2 py-2 text-left text-sm text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)]">
            右に空欄を作る
          </button>
          <button type="button" onClick={() => splitWithNeighbor(block.id, -1)} className="w-full rounded-md px-2 py-2 text-left text-sm text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)]">
            上のブロックと2カラム
          </button>
          <button type="button" onClick={() => splitWithNeighbor(block.id, 1)} className="w-full rounded-md px-2 py-2 text-left text-sm text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)]">
            下のブロックと2カラム
          </button>
          <button type="button" onClick={() => uploadInputRefs.current[block.id]?.click()} className="w-full rounded-md px-2 py-2 text-left text-sm font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-surface-subtle)]">
            写真を挿入
          </button>
          <button type="button" onClick={() => removeBlock(block.id)} className="w-full rounded-md px-2 py-2 text-left text-sm text-[#8d4b50] transition hover:bg-[#fff4f4]">
            ブロックを削除
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="fixed bottom-5 right-5 z-20 flex flex-wrap items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-white/90 px-2 py-2 text-xs opacity-20 shadow-[var(--shadow-soft)] backdrop-blur transition hover:opacity-100 focus-within:opacity-100">
        <button type="button" onClick={undo} disabled={historyState.undo === 0} className="rounded-md border border-[color:var(--color-border)] bg-white px-2.5 py-1.5 font-medium text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)] disabled:opacity-35">
          Undo
        </button>
        <button type="button" onClick={redo} disabled={historyState.redo === 0} className="rounded-md border border-[color:var(--color-border)] bg-white px-2.5 py-1.5 font-medium text-[color:var(--color-secondary-ink)] transition hover:bg-[color:var(--color-surface-subtle)] disabled:opacity-35">
          Redo
        </button>
        <span className="sr-only">history {historyState.undo}:{historyState.redo}</span>
      </div>
      {blocks.map((block, index) => {
        const kindMeta = blockKinds.find((item) => item.kind === block.kind) ?? blockKinds[3];
        const guidePosition = dropTarget?.id === block.id ? dropTarget.position : null;

        return (
          <div
            key={block.id}
            onDragOver={(event) => {
              event.preventDefault();
              if (draggingId && draggingId !== block.id) {
                setDropTarget({ id: block.id, position: getDropPosition(event) });
              }
            }}
            onDragLeave={() => setDropTarget((current) => (current?.id === block.id ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              dropBlock();
            }}
            className={getBlockShellClass(block.kind, draggingId === block.id)}
          >
            {guidePosition ? <div className={getDropGuideClass(guidePosition)} /> : null}
            <div className="relative flex flex-col items-center gap-1 pt-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
              <button type="button" onClick={() => setMenuState((current) => (current?.id === block.id && current.mode === "add" ? null : { id: block.id, mode: "add" }))} className="grid size-8 place-items-center rounded-md text-xl text-[color:var(--color-muted)] transition hover:bg-white hover:text-[color:var(--color-primary)]" aria-label="ブロックを追加">
                +
              </button>
              <button
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  setDraggingId(block.id);
                  setDropTarget(null);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDropTarget(null);
                }}
                className="grid size-8 cursor-grab place-items-center rounded-md text-lg leading-none text-[color:var(--color-muted)] transition hover:bg-white hover:text-[color:var(--color-primary)] active:cursor-grabbing"
                title="ドラッグして移動する"
                aria-label="ドラッグして移動する"
              >
                ⋮⋮
              </button>
              <button type="button" onClick={() => moveBlock(block.id, -1)} disabled={index === 0} className="grid size-7 place-items-center rounded-md text-xs text-[color:var(--color-muted)] transition hover:bg-white disabled:opacity-25" aria-label="上へ移動">
                ↑
              </button>
              <button type="button" onClick={() => moveBlock(block.id, 1)} disabled={index === blocks.length - 1} className="grid size-7 place-items-center rounded-md text-xs text-[color:var(--color-muted)] transition hover:bg-white disabled:opacity-25" aria-label="下へ移動">
                ↓
              </button>
              {renderBlockMenu(block)}
              <input
                ref={(node) => {
                  uploadInputRefs.current[block.id] = node;
                }}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) {
                    void uploadImage(file, block.id);
                  }
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button type="button" onClick={() => setMenuState((current) => (current?.id === block.id && current.mode === "turn" ? null : { id: block.id, mode: "turn" }))} className="rounded-full border border-[color:var(--color-border)] bg-white px-2 py-1 text-xs font-medium text-[color:var(--color-muted)] transition hover:text-[color:var(--color-primary)]">
                  {kindMeta.label}
                </button>
              </div>
              {block.kind === "divider" ? (
                <button type="button" onClick={() => setMenuState({ id: block.id, mode: "turn" })} className="w-full py-4" aria-label="横線ブロック">
                  <div className="border-t border-[color:var(--color-border-strong)]" />
                </button>
              ) : block.kind === "image" ? (
                <div className="space-y-3">
                  {block.text.split("\n")[1] ? (
                    <img src={block.text.split("\n")[1]} alt={block.text.split("\n")[0] || "画像"} className="max-h-72 w-full rounded-lg border border-[color:var(--color-border)] object-contain" />
                  ) : null}
                  <textarea
                    ref={(node) => {
                      textAreaRefs.current[block.id] = node;
                    }}
                    value={block.text}
                    onChange={(event) => updateBlocks((current) => current.map((item) => (item.id === block.id ? { ...item, text: event.target.value } : item)))}
                    onKeyDown={(event) => handleKeyDown(event, block)}
                    placeholder={kindMeta.placeholder}
                    rows={2}
                    className={getTextareaClass(block.kind)}
                  />
                </div>
              ) : block.kind === "columns" ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-2">
                    <span className="text-xs font-semibold text-[color:var(--color-muted)]">列幅</span>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      step="5"
                      value={Math.round((block.widths?.[0] ?? 0.5) * 100)}
                      onChange={(event) => updateColumnWidth(block.id, Number(event.target.value) / 100)}
                      className="min-w-44 flex-1 accent-[color:var(--color-accent)]"
                    />
                    <span className="text-xs tabular-nums text-[color:var(--color-muted)]">{Math.round((block.widths?.[0] ?? 0.5) * 100)} / {Math.round((block.widths?.[1] ?? 0.5) * 100)}</span>
                    <button type="button" onClick={() => updateColumnWidth(block.id, 0.5)} className="rounded-md border border-[color:var(--color-border)] bg-white px-2 py-1 text-xs font-medium">
                      50:50
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[minmax(0,var(--local-column-left))_1px_minmax(0,var(--local-column-right))]" style={getColumnGridStyle(block.widths)}>
                    <textarea
                      ref={(node) => {
                        textAreaRefs.current[`${block.id}:left`] = node;
                      }}
                      value={splitColumnsText(block.text).left}
                      onChange={(event) =>
                        updateBlocks((current) =>
                          current.map((item) => {
                            if (item.id !== block.id) {
                              return item;
                            }

                            return { ...item, text: joinColumnsText(event.target.value, splitColumnsText(item.text).right) };
                          }),
                        )
                      }
                      placeholder="左側の文"
                      rows={Math.max(4, splitColumnsText(block.text).left.split("\n").length)}
                      className={getTextareaClass("paragraph")}
                    />
                    <div
                      className="hidden cursor-col-resize rounded-full bg-[color:var(--color-border-strong)] transition hover:bg-[#1787ff] md:block"
                      role="separator"
                      aria-label="カラム幅を調整"
                      onPointerDown={(event) => startColumnResize(event, block)}
                    />
                    <textarea
                      ref={(node) => {
                        textAreaRefs.current[`${block.id}:right`] = node;
                      }}
                      value={splitColumnsText(block.text).right}
                      onChange={(event) =>
                        updateBlocks((current) =>
                          current.map((item) => {
                            if (item.id !== block.id) {
                              return item;
                            }

                            return { ...item, text: joinColumnsText(splitColumnsText(item.text).left, event.target.value) };
                          }),
                        )
                      }
                      placeholder="右側の文"
                      rows={Math.max(4, splitColumnsText(block.text).right.split("\n").length)}
                      className={getTextareaClass("paragraph")}
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  ref={(node) => {
                    textAreaRefs.current[block.id] = node;
                  }}
                  value={block.text}
                  onChange={(event) => updateBlocks((current) => current.map((item) => (item.id === block.id ? { ...item, text: event.target.value } : item)))}
                  onKeyDown={(event) => handleKeyDown(event, block)}
                  placeholder={kindMeta.placeholder}
                  rows={Math.max(1, block.text.split("\n").length)}
                  className={getTextareaClass(block.kind)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
