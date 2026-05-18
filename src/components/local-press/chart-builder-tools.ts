import type { D3ChartDatum } from "@/lib/types";

export type EditableChartRow = {
  label: string;
  value: string;
  comparison: string;
  color: string;
};

export type ChartPalettePreset = {
  id: string;
  label: string;
  description: string;
  colors: string[];
};

export const chartPalettePresets: ChartPalettePreset[] = [
  {
    id: "matsukasa",
    label: "松笠",
    description: "紺と橙を軸にした標準配色",
    colors: ["#0b2a55", "#f97316", "#2a7f9e", "#14532d", "#d4a017", "#8b5cf6"],
  },
  {
    id: "survey",
    label: "調査",
    description: "比較が読みやすい研究向け",
    colors: ["#2563eb", "#dc8a00", "#059669", "#7c3aed", "#db2777", "#0891b2"],
  },
  {
    id: "calm",
    label: "静か",
    description: "本文になじむ低彩度",
    colors: ["#334155", "#64748b", "#0f766e", "#52525b", "#78716c", "#475569"],
  },
  {
    id: "warm",
    label: "暖色",
    description: "支援・財務・地域系に合う",
    colors: ["#c2410c", "#f59e0b", "#b45309", "#be123c", "#a16207", "#ea580c"],
  },
  {
    id: "civic",
    label: "公共",
    description: "政策・制度比較向け",
    colors: ["#1d4ed8", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0f766e"],
  },
  {
    id: "soft",
    label: "淡色",
    description: "円・ドーナツで柔らかく見せる",
    colors: ["#93c5fd", "#fdba74", "#86efac", "#c4b5fd", "#f9a8d4", "#67e8f9"],
  },
];

export const defaultChartRows: EditableChartRow[] = [
  { label: "教育", value: "42", comparison: "34", color: chartPalettePresets[0].colors[0] },
  { label: "雇用", value: "31", comparison: "28", color: chartPalettePresets[0].colors[1] },
  { label: "メディア", value: "27", comparison: "22", color: chartPalettePresets[0].colors[2] },
];

export function sanitizeCsvCell(value: string) {
  return value.replace(/[,\r\n]/g, " ").trim();
}

export function rowsToCsv(rows: EditableChartRow[]) {
  const safeRows = rows.length > 0 ? rows : defaultChartRows;

  return [
    "label,value,comparison,color",
    ...safeRows.map((row) =>
      [row.label, row.value, row.comparison, row.color].map((cell) => sanitizeCsvCell(String(cell))).join(","),
    ),
  ].join("\n");
}

export function csvToEditableRows(source: string): EditableChartRow[] {
  const lines = source
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return defaultChartRows;
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const findIndex = (...names: string[]) => {
    const index = headers.findIndex((header) => names.includes(header));
    return index >= 0 ? index : -1;
  };
  const labelIndex = findIndex("label", "name", "topic", "category");
  const valueIndex = findIndex("value", "count", "score", "rate");
  const comparisonIndex = findIndex("comparison", "compare", "previous", "baseline");
  const colorIndex = findIndex("color", "colour", "theme");

  const rows = lines.slice(1).map((line, index) => {
    const cells = line.split(",").map((cell) => cell.trim());

    return {
      label: cells[labelIndex >= 0 ? labelIndex : 0] ?? `項目${index + 1}`,
      value: cells[valueIndex >= 0 ? valueIndex : 1] ?? "",
      comparison: cells[comparisonIndex >= 0 ? comparisonIndex : 2] ?? "",
      color: cells[colorIndex >= 0 ? colorIndex : 3] ?? chartPalettePresets[0].colors[index % chartPalettePresets[0].colors.length],
    };
  });

  return rows.length > 0 ? rows : defaultChartRows;
}

export function applyPaletteToRows(rows: EditableChartRow[], colors: string[]) {
  return rows.map((row, index) => ({ ...row, color: colors[index % colors.length] }));
}

export function parseSimpleCsv(source: string): D3ChartDatum[] {
  const lines = source
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim()).filter(Boolean);

  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    return Object.fromEntries(
      headers.map((header, index) => {
        const raw = cells[index] ?? "";
        const numeric = Number(raw.replace(/,/g, ""));
        return [header, Number.isFinite(numeric) && raw !== "" ? numeric : raw];
      }),
    ) as D3ChartDatum;
  });
}
