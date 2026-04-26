import type { ContentBlock, D3ChartDatum, D3ChartType } from "@/lib/types";

const CHART_BLOCK_START = ":::d3-chart";
const CHART_BLOCK_END = ":::";

type RawD3ChartPayload = {
  title?: unknown;
  description?: unknown;
  chartType?: unknown;
  xKey?: unknown;
  yKey?: unknown;
  yLabel?: unknown;
  height?: unknown;
  data?: unknown;
};

export type D3ChartConfigInput = {
  title: string;
  description?: string;
  chartType: D3ChartType;
  xKey: string;
  yKey: string;
  yLabel?: string;
  height?: number;
  data: D3ChartDatum[];
};

function isChartType(value: unknown): value is D3ChartType {
  return value === "bar" || value === "line";
}

function normalizeHeight(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 320;
  }

  return Math.min(520, Math.max(220, Math.round(value)));
}

function normalizeChartData(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const rows = value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) =>
      Object.fromEntries(
        Object.entries(item).flatMap(([key, raw]) => {
          if (typeof raw === "string" || typeof raw === "number") {
            return [[key, raw]];
          }

          return [];
        }),
      ),
    )
    .filter((item) => Object.keys(item).length > 0);

  return rows.length > 0 ? (rows as D3ChartDatum[]) : null;
}

export function normalizeD3ChartInput(input: D3ChartConfigInput) {
  const title = input.title.trim();
  const xKey = input.xKey.trim();
  const yKey = input.yKey.trim();
  const data = normalizeChartData(input.data);

  if (!title || !xKey || !yKey || !data) {
    return null;
  }

  return {
    type: "d3Chart" as const,
    title,
    description: input.description?.trim() || undefined,
    chartType: input.chartType,
    xKey,
    yKey,
    yLabel: input.yLabel?.trim() || undefined,
    height: normalizeHeight(input.height),
    data,
  } satisfies Extract<ContentBlock, { type: "d3Chart" }>;
}

export function parseD3ChartJSON(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      ok: false as const,
      error: "D3グラフのデータを入力してください。",
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as RawD3ChartPayload | D3ChartDatum[];

    if (Array.isArray(parsed)) {
      const data = normalizeChartData(parsed);

      if (!data) {
        return {
          ok: false as const,
          error: "D3グラフのデータは1件以上の配列で入力してください。",
        };
      }

      return {
        ok: true as const,
        data,
      };
    }

    return {
      ok: true as const,
      data: parsed,
    };
  } catch {
    return {
      ok: false as const,
      error: "D3グラフのデータJSONが不正です。",
    };
  }
}

export function serializeD3ChartBlock(block: Extract<ContentBlock, { type: "d3Chart" }>) {
  return [
    CHART_BLOCK_START,
    JSON.stringify(
      {
        title: block.title,
        description: block.description,
        chartType: block.chartType,
        xKey: block.xKey,
        yKey: block.yKey,
        yLabel: block.yLabel,
        height: block.height,
        data: block.data,
      },
      null,
      2,
    ),
    CHART_BLOCK_END,
  ].join("\n");
}

export function parseD3ChartBlock(value: string) {
  const trimmed = value.trim();

  if (!trimmed.startsWith(CHART_BLOCK_START) || !trimmed.endsWith(CHART_BLOCK_END)) {
    return null;
  }

  const lines = trimmed.split("\n");

  if (lines.length < 3) {
    return null;
  }

  const json = lines.slice(1, -1).join("\n");
  const parsed = parseD3ChartJSON(json);

  if (!parsed.ok) {
    return null;
  }

  const payload = Array.isArray(parsed.data)
    ? {
        title: "D3グラフ",
        chartType: "bar" as const,
        xKey: "label",
        yKey: "value",
        data: parsed.data,
      }
    : parsed.data;

  if (!payload || Array.isArray(payload)) {
    return null;
  }

  if (!isChartType(payload.chartType)) {
    return null;
  }

  const normalized = normalizeD3ChartInput({
    title: typeof payload.title === "string" ? payload.title : "",
    description: typeof payload.description === "string" ? payload.description : "",
    chartType: payload.chartType,
    xKey: typeof payload.xKey === "string" ? payload.xKey : "",
    yKey: typeof payload.yKey === "string" ? payload.yKey : "",
    yLabel: typeof payload.yLabel === "string" ? payload.yLabel : "",
    height: typeof payload.height === "number" ? payload.height : 320,
    data: normalizeChartData(payload.data) ?? [],
  });

  return normalized;
}

export function isD3ChartFenceStart(value: string) {
  return value.trim() === CHART_BLOCK_START;
}

export function isD3ChartFenceEnd(value: string) {
  return value.trim() === CHART_BLOCK_END;
}

export function formatD3ChartData(data: D3ChartDatum[]) {
  return JSON.stringify(data, null, 2);
}
