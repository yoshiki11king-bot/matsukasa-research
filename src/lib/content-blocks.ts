import type { ContentBlock } from "@/lib/types";
import { serializeD3ChartBlock } from "@/lib/d3-chart";

export type MicroCMSContentBlockPayload =
  | {
      fieldId: "block_heading";
      text: string;
      level: string[];
    }
  | {
      fieldId: "block_paragraph";
      body: string;
    }
  | {
      fieldId: "block_image";
      image: string;
      caption?: string;
      alt?: string;
      sourceText?: string;
    }
  | {
      fieldId: "block_link";
      title: string;
      url: string;
      description?: string;
    };

export function normalizeHeadingLevel(value: string | string[] | undefined): 2 | 3 {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "h3" ? 3 : 2;
}

export function contentBlocksToBody(blocks: ContentBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        return `${block.level === 3 ? "###" : "##"} ${block.text}`;
      }

      if (block.type === "paragraph") {
        return block.body.trim();
      }

      if (block.type === "image") {
        return `![${block.caption || block.alt || "画像"}](${block.image.url})`;
      }

      if (block.type === "d3Chart") {
        return serializeD3ChartBlock(block);
      }

      const lines = [`${block.title}`, block.url];

      if (block.description) {
        lines.push(block.description);
      }

      return lines.join("\n");
    })
    .map((item) => item.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function contentBlocksToMicroCMSPayload(
  blocks: ContentBlock[],
): MicroCMSContentBlockPayload[] {
  return blocks.map((block) => {
    if (block.type === "heading") {
      return {
        fieldId: "block_heading",
        text: block.text,
        level: [block.level === 3 ? "h3" : "h2"],
      };
    }

    if (block.type === "paragraph") {
      return {
        fieldId: "block_paragraph",
        body: block.body,
      };
    }

    if (block.type === "image") {
      return {
        fieldId: "block_image",
        image: block.image.url,
        caption: block.caption,
        alt: block.alt,
        sourceText: block.sourceText,
      };
    }

    if (block.type === "d3Chart") {
      return {
        fieldId: "block_paragraph",
        body: serializeD3ChartBlock(block),
      };
    }

    return {
      fieldId: "block_link",
      title: block.title,
      url: block.url,
      description: block.description,
    };
  });
}
