import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocalPressEnabled, type LocalPressContentType } from "@/lib/content/config";
import { saveJsonDocument, saveMarkdownDocument } from "@/lib/content";
import type { Frontmatter } from "@/lib/content/frontmatter";
import type { LocalChart, LocalResearcher } from "@/lib/content/types";

export const runtime = "nodejs";

const slugSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[a-z0-9-]+$/, "slugは英小文字・数字・ハイフンのみです。")
  .refine((value) => !value.includes("..") && !value.includes("/") && !value.includes(".") && !/\s/.test(value), {
    message: "slugにスラッシュ、ドット、空白、.. は使えません。",
  });

const frontmatterSchema = z.record(z.string(), z.unknown());

const markdownTypeSchema = z.enum([
  "articles",
  "reports",
  "methodologies",
  "director",
  "finance",
  "financial-statements",
  "short-readings",
]);

const markdownSaveSchema = z.object({
  type: markdownTypeSchema,
  slug: slugSchema,
  frontmatter: frontmatterSchema,
  body: z.string(),
  overwrite: z.boolean().optional(),
});

const researcherSchema = z.object({
  type: z.literal("researcher"),
  name: z.string(),
  slug: slugSchema,
  role: z.string(),
  affiliation: z.string(),
  bio: z.string(),
  avatarUrl: z.string(),
  interests: z.array(z.string()),
  links: z.array(z.object({ label: z.string(), url: z.string() })),
});

const researcherSaveSchema = z.object({
  type: z.literal("researchers"),
  slug: slugSchema,
  researcher: researcherSchema,
  overwrite: z.boolean().optional(),
});

const chartTypeSchema = z.enum([
  "bar",
  "line",
  "pie",
  "band",
  "horizontalBar",
  "donut",
  "stacked100Bar",
  "stacked-bar",
  "radar",
  "histogram",
  "boxplot",
  "bubble",
  "scatter",
  "statMap",
  "lorenz",
  "pictogram",
  "stackedArea",
]);

const chartSchema = z.object({
  type: z.literal("chart"),
  title: z.string(),
  slug: slugSchema,
  chartType: chartTypeSchema,
  description: z.string(),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
  sourceNote: z.string(),
  methodologyNote: z.string(),
  xKey: z.string().optional(),
  yKey: z.string().optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
  colorKey: z.string().optional(),
  nameKey: z.string().optional(),
  showLegend: z.boolean().optional(),
  showGrid: z.boolean().optional(),
  showDataLabels: z.boolean().optional(),
  footnote: z.string().optional(),
  abstract: z.string().optional(),
  height: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const chartSaveSchema = z.object({
  type: z.literal("charts"),
  slug: slugSchema,
  chart: chartSchema,
  overwrite: z.boolean().optional(),
});

const saveSchema = z.discriminatedUnion("type", [markdownSaveSchema, researcherSaveSchema, chartSaveSchema]);

function normalizeMarkdownType(type: LocalPressContentType, frontmatter: Frontmatter) {
  if (type === "articles") {
    return { ...frontmatter, type: "article", layout: frontmatter.layout ?? "standard" };
  }

  if (type === "reports") {
    return { ...frontmatter, type: "report", layout: frontmatter.layout ?? "report" };
  }

  if (type === "methodologies") {
    return { ...frontmatter, type: "methodology", layout: frontmatter.layout ?? "methodology" };
  }

  if (type === "short-readings") {
    return { ...frontmatter, type: "short-reading", layout: frontmatter.layout ?? "short" };
  }

  if (type === "financial-statements") {
    return { ...frontmatter, type: "financial-statement", layout: frontmatter.layout ?? "financial-statement" };
  }

  return frontmatter;
}

export async function POST(request: Request) {
  if (!isLocalPressEnabled()) {
    return NextResponse.json({ success: false, error: "Local Press is disabled." }, { status: 403 });
  }

  let parsed: z.infer<typeof saveSchema>;

  try {
    parsed = saveSchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof z.ZodError ? z.prettifyError(error) : "入力値が不正です。";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }

  try {
    if (parsed.type === "researchers") {
      const saved = await saveJsonDocument({
        type: "researchers",
        slug: parsed.slug,
        data: parsed.researcher as LocalResearcher,
        overwrite: parsed.overwrite,
      });

      if (!saved.ok) {
        return NextResponse.json({ success: false, error: "既存ファイルがあります。上書きする場合はチェックを入れてください。", path: saved.relativePath }, { status: saved.status });
      }

      return NextResponse.json({ success: true, path: saved.relativePath });
    }

    if (parsed.type === "charts") {
      const saved = await saveJsonDocument({
        type: "charts",
        slug: parsed.slug,
        data: parsed.chart as LocalChart,
        overwrite: parsed.overwrite,
      });

      if (!saved.ok) {
        return NextResponse.json({ success: false, error: "既存ファイルがあります。上書きする場合はチェックを入れてください。", path: saved.relativePath }, { status: saved.status });
      }

      return NextResponse.json({ success: true, path: saved.relativePath });
    }

    const frontmatter = normalizeMarkdownType(parsed.type, {
      ...(parsed.frontmatter as Frontmatter),
      slug: parsed.slug,
    });
    const saved = await saveMarkdownDocument({
      type: parsed.type,
      slug: parsed.slug,
      frontmatter,
      body: parsed.body,
      overwrite: parsed.overwrite,
    });

    if (!saved.ok) {
      return NextResponse.json({ success: false, error: "既存ファイルがあります。上書きする場合はチェックを入れてください。", path: saved.relativePath }, { status: saved.status });
    }

    return NextResponse.json({ success: true, path: saved.relativePath });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存に失敗しました。";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
