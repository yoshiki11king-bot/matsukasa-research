/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { D3ChartBlock } from "@/components/d3-chart-block";
import {
  isD3ChartFenceEnd,
  isD3ChartFenceStart,
  parseD3ChartBlock,
} from "@/lib/d3-chart";
import type { ContentBlock } from "@/lib/types";

type PostBodyProps = {
  body: string;
  blocks?: ContentBlock[];
};

function renderLineBreaks(text: string) {
  return text.split("\n").map((line, index, array) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < array.length - 1 ? <br /> : null}
    </span>
  ));
}

type RichTextBodyProps = {
  body: string;
  className?: string;
  tone?: "default" | "compact";
};

type BodyBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; caption: string }
  | { type: "d3Chart"; block: Extract<ContentBlock, { type: "d3Chart" }> }
  | { type: "paragraph"; lines: string[] };

function parseBody(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let d3Lines: string[] | null = null;

  function flushParagraph() {
    const items = paragraphLines.map((line) => line.trimEnd()).filter(Boolean);

    if (items.length > 0) {
      blocks.push({ type: "paragraph", lines: items });
    }

    paragraphLines = [];
  }

  function flushList() {
    const items = listItems.map((item) => item.trim()).filter(Boolean);

    if (items.length > 0) {
      blocks.push({ type: "list", items });
    }

    listItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (d3Lines) {
      d3Lines.push(line);

      if (isD3ChartFenceEnd(trimmed)) {
        const d3ChartBlock = parseD3ChartBlock(d3Lines.join("\n"));

        if (d3ChartBlock) {
          blocks.push({ type: "d3Chart", block: d3ChartBlock });
        }

        d3Lines = null;
      }

      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (isD3ChartFenceStart(trimmed)) {
      flushParagraph();
      flushList();
      d3Lines = [line];
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length >= 3 ? 3 : 2,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);

    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1].trim());
      continue;
    }

    const imageMatch = trimmed.match(/^!\[(.*)\]\((https?:\/\/[^\s)]+)\)$/);

    if (imageMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "image",
        caption: imageMatch[1].trim(),
        src: imageMatch[2].trim(),
      });
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function getTextClasses(tone: "default" | "compact") {
  if (tone === "compact") {
    return {
      heading2: "text-lg font-semibold tracking-tight text-[color:var(--color-primary)]",
      heading3: "text-base font-semibold tracking-tight text-[color:var(--color-primary)]",
      paragraph: "text-sm leading-7 text-[color:var(--color-text)]",
      list: "space-y-2 pl-5 text-sm leading-7 text-[color:var(--color-text)]",
      caption: "text-xs leading-6 text-[color:var(--color-muted)]",
      wrapper: "space-y-4",
    };
  }

  return {
    heading2: "text-2xl font-semibold tracking-tight text-[color:var(--color-primary)]",
    heading3: "text-xl font-semibold tracking-tight text-[color:var(--color-primary)]",
    paragraph: "text-[1.02rem] leading-9 text-[color:var(--color-text)]",
    list: "space-y-2 pl-6 text-[1.02rem] leading-9 text-[color:var(--color-text)]",
    caption: "text-sm leading-7 text-[color:var(--color-muted)]",
    wrapper: "space-y-6",
  };
}

function joinClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function RichTextBody({
  body,
  className,
  tone = "default",
}: RichTextBodyProps) {
  const blocks = parseBody(body);
  const classes = getTextClasses(tone);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className={joinClasses(classes.wrapper, className)}>
      {blocks.map((block, index) => {
        let content: ReactNode;

        if (block.type === "heading") {
          content =
            block.level === 2 ? (
              <h2 className={classes.heading2}>{block.text}</h2>
            ) : (
              <h3 className={classes.heading3}>{block.text}</h3>
            );
        } else if (block.type === "list") {
          content = (
            <ul className={classes.list}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        } else if (block.type === "image") {
          content = (
            <figure className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)]">
                <img
                  src={block.src}
                  alt={block.caption}
                  loading="lazy"
                  className="h-auto w-full object-contain"
                />
              </div>
              {block.caption ? <figcaption className={classes.caption}>{block.caption}</figcaption> : null}
            </figure>
          );
        } else if (block.type === "d3Chart") {
          content = <D3ChartBlock block={block.block} />;
        } else {
          content = <p className={classes.paragraph}>{renderLineBreaks(block.lines.join("\n"))}</p>;
        }

        return <div key={`${block.type}-${index}`}>{content}</div>;
      })}
    </div>
  );
}

function renderContentBlocks(blocks: ContentBlock[], tone: "default" | "compact") {
  const classes = getTextClasses(tone);

  return (
    <div className={classes.wrapper}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return block.level === 2 ? (
            <h2 key={`content-block-${index}`} className={classes.heading2}>
              {block.text}
            </h2>
          ) : (
            <h3 key={`content-block-${index}`} className={classes.heading3}>
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={`content-block-${index}`} className={classes.paragraph}>
              {renderLineBreaks(block.body)}
            </p>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={`content-block-${index}`} className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)]">
                <img
                  src={block.image.url}
                  alt={block.alt || block.caption || block.image.alt || ""}
                  loading="lazy"
                  className="h-auto w-full object-contain"
                />
              </div>
              {block.caption ? <figcaption className={classes.caption}>{block.caption}</figcaption> : null}
              {block.sourceText ? <p className={classes.caption}>出典: {block.sourceText}</p> : null}
            </figure>
          );
        }

        if (block.type === "d3Chart") {
          return <D3ChartBlock key={`content-block-${index}`} block={block} />;
        }

        return (
          <div
            key={`content-block-${index}`}
            className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-4"
          >
            <a
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="text-base font-semibold text-[color:var(--color-primary)] transition hover:text-[color:var(--color-accent-ink)]"
            >
              {block.title}
            </a>
            {block.description ? <p className="mt-2 text-sm leading-7 text-[color:var(--color-text)]">{block.description}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export function PostBody({ body, blocks }: PostBodyProps) {
  if (blocks && blocks.length > 0) {
    return renderContentBlocks(blocks, "default");
  }

  return <RichTextBody body={body} />;
}
