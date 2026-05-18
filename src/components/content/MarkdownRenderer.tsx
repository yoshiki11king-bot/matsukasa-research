/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { ChartRenderer } from "@/components/content/ChartRenderer";
import type { LocalChartsBySlug } from "@/lib/content/types";

type MarkdownRendererProps = {
  body: string;
  charts?: LocalChartsBySlug;
};

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "image"; alt: string; src: string }
  | { type: "link"; label: string; url: string }
  | { type: "divider" }
  | { type: "columns"; columns: string[]; widths: [number, number] }
  | { type: "code"; code: string }
  | { type: "callout"; kind: "finding" | "methodology" | "note"; body: string }
  | { type: "chart"; slug: string };

function flushParagraph(blocks: MarkdownBlock[], lines: string[]) {
  const next = lines.map((line) => line.trimEnd()).filter(Boolean);

  if (next.length > 0) {
    blocks.push({ type: "paragraph", lines: next });
  }

  return [];
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    nodes.push(
      <a
        key={`${match[2]}-${match.index}`}
        href={match[3]}
        className="underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-4"
        target="_blank"
        rel="noreferrer"
      >
        {match[2]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderLines(lines: string[]) {
  return lines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {renderInline(line)}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

function parseFenceStart(value: string) {
  const chartMatch = value.match(/^:::chart\s+slug="([a-z0-9-]+)"\s*$/);

  if (chartMatch) {
    return { type: "chart" as const, slug: chartMatch[1] };
  }

  const calloutMatch = value.match(/^:::(finding|methodology|note)\s*$/);

  if (calloutMatch) {
    return { type: "callout" as const, kind: calloutMatch[1] as "finding" | "methodology" | "note" };
  }

  const columnsMatch = value.match(/^:::columns(?:\s+widths="([\d.]+),([\d.]+)")?\s*$/);

  if (columnsMatch) {
    const left = Number(columnsMatch[1]);
    const right = Number(columnsMatch[2]);
    const total = left + right;
    return {
      type: "columns" as const,
      widths: Number.isFinite(total) && total > 0 ? ([left / total, right / total] as [number, number]) : ([0.5, 0.5] as [number, number]),
    };
  }

  return null;
}

function parseMarkdown(body: string) {
  const blocks: MarkdownBlock[] = [];
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let orderedListItems: string[] = [];
  let quoteLines: string[] = [];
  let codeLines: string[] | null = null;
  let callout: { kind: "finding" | "methodology" | "note"; lines: string[] } | null = null;
  let columns: { lines: string[]; widths: [number, number] } | null = null;
  let skipClosingFenceAfterChart = false;

  function flushLists() {
    if (listItems.length > 0) {
      blocks.push({ type: "list", ordered: false, items: listItems });
      listItems = [];
    }

    if (orderedListItems.length > 0) {
      blocks.push({ type: "list", ordered: true, items: orderedListItems });
      orderedListItems = [];
    }
  }

  function flushQuote() {
    if (quoteLines.length > 0) {
      blocks.push({ type: "quote", lines: quoteLines });
      quoteLines = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (skipClosingFenceAfterChart) {
      skipClosingFenceAfterChart = false;

      if (trimmed === ":::") {
        continue;
      }
    }

    if (codeLines) {
      if (trimmed === "```") {
        blocks.push({ type: "code", code: codeLines.join("\n") });
        codeLines = null;
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (callout) {
      if (trimmed === ":::") {
        blocks.push({ type: "callout", kind: callout.kind, body: callout.lines.join("\n").trim() });
        callout = null;
      } else {
        callout.lines.push(line);
      }
      continue;
    }

    if (columns) {
      if (trimmed === ":::") {
        blocks.push({ type: "columns", columns: columns.lines.join("\n").split(/(?:^|\n)---column---(?:\n|$)/), widths: columns.widths });
        columns = null;
      } else {
        columns.lines.push(line);
      }
      continue;
    }

    if (!trimmed) {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      flushQuote();
      continue;
    }

    const fence = parseFenceStart(trimmed);

    if (fence?.type === "chart") {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      flushQuote();
      blocks.push({ type: "chart", slug: fence.slug });
      skipClosingFenceAfterChart = true;
      continue;
    }

    if (fence?.type === "callout") {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      flushQuote();
      callout = { kind: fence.kind, lines: [] };
      continue;
    }

    if (fence?.type === "columns") {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      flushQuote();
      columns = { lines: [], widths: fence.widths };
      continue;
    }

    if (trimmed === "```") {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      flushQuote();
      codeLines = [];
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      flushQuote();
      blocks.push({ type: "divider" });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      flushQuote();
      blocks.push({ type: "heading", level: headingMatch[1].length as 1 | 2 | 3, text: headingMatch[2].trim() });
      continue;
    }

    const imageMatch = trimmed.match(/^!\[(.*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)$/);

    if (imageMatch) {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      flushQuote();
      blocks.push({ type: "image", alt: imageMatch[1], src: imageMatch[2] });
      continue;
    }

    const linkMatch = trimmed.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)$/);

    if (linkMatch) {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      flushQuote();
      blocks.push({ type: "link", label: linkMatch[1], url: linkMatch[2] });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);

    if (unorderedMatch) {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushQuote();
      orderedListItems = [];
      listItems.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (orderedMatch) {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushQuote();
      listItems = [];
      orderedListItems.push(orderedMatch[1]);
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s?(.+)$/);

    if (quoteMatch) {
      paragraphLines = flushParagraph(blocks, paragraphLines);
      flushLists();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    flushLists();
    flushQuote();
    paragraphLines.push(line);
  }

  flushParagraph(blocks, paragraphLines);
  flushLists();
  flushQuote();

  return blocks;
}

function getCalloutClasses(kind: "finding" | "methodology" | "note") {
  if (kind === "finding") {
    return "border-l-4 border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]";
  }

  if (kind === "methodology") {
    return "border-l-4 border-[color:var(--color-primary)] bg-[color:var(--color-surface-subtle)]";
  }

  return "border-l-4 border-[color:var(--color-border-stronger)] bg-white";
}

function getCalloutLabel(kind: "finding" | "methodology" | "note") {
  if (kind === "finding") {
    return "主な発見";
  }

  if (kind === "methodology") {
    return "方法論メモ";
  }

  return "注釈";
}

export function MarkdownRenderer({ body, charts = {} }: MarkdownRendererProps) {
  const blocks = parseMarkdown(body);

  if (blocks.length === 0) {
    return (
      <p className="text-base leading-8 text-[color:var(--color-muted)]">
        本文はまだありません。左側のエディタに書くと、ここに公開予定ページとして表示されます。
      </p>
    );
  }

  return (
    <div className="space-y-7">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h1 key={index} className="font-editorial text-4xl font-semibold tracking-tight text-[color:var(--color-primary)] md:text-5xl">
                {block.text}
              </h1>
            );
          }

          return block.level === 2 ? (
            <h2 key={index} className="font-editorial text-3xl font-semibold tracking-tight text-[color:var(--color-primary)]">
              {block.text}
            </h2>
          ) : (
            <h3 key={index} className="font-editorial text-2xl font-semibold tracking-tight text-[color:var(--color-primary)]">
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={index} className="text-[1.04rem] leading-9 text-[color:var(--color-text)]">
              {renderLines(block.lines)}
            </p>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={index} className="border-l-4 border-[color:var(--color-primary)] pl-5 font-editorial text-xl leading-9 text-[color:var(--color-primary)]">
              {renderLines(block.lines)}
            </blockquote>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={index} className={`space-y-2 pl-6 text-base leading-8 text-[color:var(--color-text)] ${block.ordered ? "list-decimal" : "list-disc"}`}>
              {block.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </ListTag>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={index} className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)]">
                <img src={block.src} alt={block.alt} className="h-auto w-full object-contain" />
              </div>
              {block.alt ? <figcaption className="text-sm text-[color:var(--color-muted)]">{block.alt}</figcaption> : null}
            </figure>
          );
        }

        if (block.type === "link") {
          return (
            <a key={index} href={block.url} className="block rounded-lg border border-[color:var(--color-border)] px-4 py-3 text-[color:var(--color-primary)] transition hover:border-[color:var(--color-border-stronger)]" target="_blank" rel="noreferrer">
              {block.label}
            </a>
          );
        }

        if (block.type === "divider") {
          return <hr key={index} className="border-[color:var(--color-border)]" />;
        }

        if (block.type === "columns") {
          const left = Math.max(0.25, Math.min(0.75, block.widths[0]));
          const right = Math.max(0.25, Math.min(0.75, block.widths[1]));
          return (
            <div
              key={index}
              className="grid gap-6 md:grid-cols-[minmax(0,var(--local-column-left))_1px_minmax(0,var(--local-column-right))]"
              style={{
                "--local-column-left": `${left}fr`,
                "--local-column-right": `${right}fr`,
              } as CSSProperties}
            >
              <div className="space-y-4">
                <MarkdownRenderer body={block.columns[0] ?? ""} charts={charts} />
              </div>
              <div className="hidden bg-[color:var(--color-border)] md:block" />
              <div className="space-y-4">
                <MarkdownRenderer body={block.columns[1] ?? ""} charts={charts} />
              </div>
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <pre key={index} className="overflow-x-auto rounded-lg bg-[color:var(--color-primary)] px-4 py-4 text-sm leading-7 text-white">
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === "callout") {
          return (
            <aside key={index} className={`rounded-lg px-5 py-4 ${getCalloutClasses(block.kind)}`}>
              <p className="text-xs font-semibold tracking-[0.16em] text-[color:var(--color-muted)]">{getCalloutLabel(block.kind)}</p>
              <p className="mt-2 text-base leading-8 text-[color:var(--color-text)]">{renderLines(block.body.split("\n"))}</p>
            </aside>
          );
        }

        const chart = charts[block.slug];

        if (!chart) {
          return (
            <div key={index} className="rounded-lg border border-dashed border-[color:var(--color-border-strong)] px-5 py-4 text-sm text-[color:var(--color-muted)]">
              chart: {block.slug} はまだ保存されていません。
            </div>
          );
        }

        return <ChartRenderer key={index} chart={chart} />;
      })}
    </div>
  );
}
