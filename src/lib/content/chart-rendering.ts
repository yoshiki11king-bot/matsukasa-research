import type { LocalChart } from "@/lib/content/types";
import type { ContentBlock, D3ChartType } from "@/lib/types";

function toD3ChartType(chartType: LocalChart["chartType"]): D3ChartType {
  if (chartType === "stacked-bar") {
    return "stacked100Bar";
  }

  return chartType;
}

function inferKeys(chart: LocalChart) {
  const firstRow = chart.data[0] ?? {};
  const keys = Object.keys(firstRow);
  const xKey = chart.xKey?.trim() || keys[0] || "label";
  const shouldUseSeriesKeys = ["bar", "line", "stacked-bar", "stacked100Bar", "stackedArea"].includes(chart.chartType);
  const yKey = chart.yKey?.trim() || (keys.length > 2 && shouldUseSeriesKeys ? keys.filter((key) => key !== xKey).join(",") : keys[1]) || "value";

  return { xKey, yKey };
}

export function chartToD3Block(chart: LocalChart): Extract<ContentBlock, { type: "d3Chart" }> {
  const { xKey, yKey } = inferKeys(chart);

  return {
    type: "d3Chart",
    title: chart.title,
    description: chart.description,
    chartType: toD3ChartType(chart.chartType),
    xKey,
    yKey,
    xLabel: chart.xLabel || xKey,
    yLabel: chart.chartType === "pie" || chart.chartType === "donut" ? chart.yLabel : chart.yLabel || yKey,
    colorKey: chart.colorKey,
    nameKey: chart.nameKey,
    showLegend: chart.showLegend,
    showGrid: chart.showGrid,
    showDataLabels: chart.showDataLabels,
    footnote: chart.footnote || chart.sourceNote || chart.methodologyNote,
    abstract: chart.abstract || chart.methodologyNote,
    height: chart.height ?? 340,
    data: chart.data,
  };
}
