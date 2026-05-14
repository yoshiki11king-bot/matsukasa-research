"use client";

import { useEffect, useId, useRef } from "react";
import * as d3 from "d3";
import type { ContentBlock, D3ChartDatum } from "@/lib/types";

type D3ChartBlockProps = {
  block: Extract<ContentBlock, { type: "d3Chart" }>;
};

type ChartRow = D3ChartDatum;
type ChartBlock = Extract<ContentBlock, { type: "d3Chart" }>;

const PALETTE = [
  "rgb(42, 127, 158)",
  "rgb(244, 148, 30)",
  "rgb(20, 83, 45)",
  "rgb(99, 102, 241)",
  "rgb(236, 72, 153)",
  "rgb(14, 165, 233)",
  "rgb(180, 83, 9)",
  "rgb(100, 116, 139)",
];

const COLOR_PATTERN = /^(#([\da-f]{3}){1,2}|rgb\(|hsl\()/i;

function toNumber(value: string | number | undefined) {
  if (value === undefined) {
    return 0;
  }

  const resolved =
    typeof value === "number"
      ? value
      : Number(value.trim().replace(/,/g, "").replace(/%$/, ""));
  return Number.isFinite(resolved) ? resolved : 0;
}

function formatValue(value: number) {
  return value.toLocaleString("ja-JP", { maximumFractionDigits: 1 });
}

function colorWithAlpha(color: string, alpha: number) {
  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }

  if (color.startsWith("rgba(")) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${alpha})`);
  }

  return color;
}

function extentDomain(values: number[]): [number, number] {
  const min = d3.min(values) ?? 0;
  const max = d3.max(values) ?? 1;

  if (min === max) {
    return [min - 1, max + 1];
  }

  return [min, max];
}

function numericKeys(rows: ChartRow[], excluded: string[] = []) {
  const keys = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!excluded.includes(key) && rows.some((item) => Number.isFinite(toNumber(item[key])) && toNumber(item[key]) !== 0)) {
        keys.add(key);
      }
    });
  });

  return [...keys];
}

function resolveSeriesKeys(block: ChartBlock, rows: ChartRow[]) {
  const explicitKeys = block.yKey
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  if (explicitKeys.length > 1) {
    return explicitKeys;
  }

  const inferred = numericKeys(rows, [block.xKey, block.colorKey ?? "", block.nameKey ?? ""].filter(Boolean));
  return inferred.length > 1 ? inferred : [block.yKey];
}

function hasSeriesValue(keys: string[], row: ChartRow) {
  return keys.some((key) => row[key] !== undefined);
}

function labelForRow(block: ChartBlock, row: ChartRow) {
  const key = block.nameKey || block.xKey;
  return String(row[key] ?? row[block.xKey] ?? "");
}

function hasRenderableData(block: ChartBlock) {
  if (block.chartType === "bar" || block.chartType === "line") {
    const keys = resolveSeriesKeys(block, block.data);
    return block.data.some((row) => row[block.xKey] !== undefined && hasSeriesValue(keys, row));
  }

  if (block.chartType === "histogram" || block.chartType === "boxplot" || block.chartType === "lorenz") {
    return block.data.some((row) => row[block.yKey] !== undefined);
  }

  if (block.chartType === "stacked100Bar" || block.chartType === "stackedArea") {
    return block.data.some((row) => row[block.xKey] !== undefined);
  }

  return block.data.some((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);
}

function addGridAxis(
  root: d3.Selection<SVGGElement, unknown, null, undefined>,
  y: d3.ScaleLinear<number, number>,
  innerWidth: number,
) {
  root
    .append("g")
    .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth))
    .call((axis) => axis.select(".domain").remove())
    .call((axis) =>
      axis
        .selectAll("line")
        .attr("stroke", "rgba(51, 65, 85, 0.16)")
        .attr("stroke-dasharray", "4 4"),
    )
    .call((axis) =>
      axis
        .selectAll("text")
        .attr("fill", "rgb(107, 124, 133)")
        .style("font-size", "12px"),
    );
}

function addBottomAxis<Domain extends d3.AxisDomain>(
  root: d3.Selection<SVGGElement, unknown, null, undefined>,
  axis: d3.Axis<Domain>,
  innerHeight: number,
) {
  root
    .append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(axis)
    .call((selection) => selection.select(".domain").attr("stroke", "rgba(107, 124, 133, 0.28)"))
    .call((selection) =>
      selection
        .selectAll("text")
        .attr("fill", "rgb(36, 50, 61)")
        .style("font-size", "12px"),
    );
}

function addAxisLabels(
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
  block: ChartBlock,
  width: number,
  height: number,
) {
  if (block.xLabel) {
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 12)
      .attr("text-anchor", "middle")
      .attr("fill", "rgb(107, 124, 133)")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(block.xLabel);
  }

  if (block.yLabel) {
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .attr("fill", "rgb(107, 124, 133)")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(block.yLabel);
  }
}

function rowColor(block: ChartBlock, row: ChartRow, index: number, colorScale: d3.ScaleOrdinal<string, string>) {
  if (!block.colorKey) {
    return PALETTE[index % PALETTE.length];
  }

  const raw = String(row[block.colorKey] ?? "");
  return COLOR_PATTERN.test(raw) ? raw : colorScale(raw || String(index));
}

function addLegend(
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
  labels: string[],
  width: number,
) {
  const unique = [...new Set(labels)].filter(Boolean).slice(0, 10);

  if (unique.length === 0) {
    return;
  }

  const legend = svg.append("g").attr("transform", `translate(${width - 220},18)`);

  unique.forEach((label, index) => {
    const item = legend.append("g").attr("transform", `translate(0,${index * 20})`);
    item.append("rect").attr("width", 10).attr("height", 10).attr("rx", 2).attr("fill", PALETTE[index % PALETTE.length]);
    item.append("text").attr("x", 16).attr("y", 9).attr("fill", "rgb(51,65,85)").style("font-size", "11px").text(label);
  });
}

function addPointTitles<ElementType extends SVGElement>(
  selection: d3.Selection<ElementType, ChartRow, SVGGElement, unknown>,
  block: ChartBlock,
) {
  selection.append("title").text((row) => `${labelForRow(block, row)}: ${formatValue(toNumber(row[block.yKey]))}`);
}

export function D3ChartBlock({ block }: D3ChartBlockProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartId = useId();
  const hasRenderableRows = hasRenderableData(block);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    if (!svgRef.current) {
      return;
    }

    const width = 900;
    const height = block.height ?? 320;
    const margin = { top: 34, right: 34, bottom: 58, left: 72 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const rows = block.data.filter((row) => row[block.xKey] !== undefined || row[block.yKey] !== undefined);
    const colorScale = d3.scaleOrdinal<string, string>().range(PALETTE);
    const showGrid = block.showGrid !== false;
    const showLegend = block.showLegend !== false;
    const showDataLabels = block.showDataLabels === true;

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    if (!hasRenderableRows || rows.length === 0) {
      return;
    }

    const root = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    if (block.chartType === "bar") {
      const keys = resolveSeriesKeys(block, rows);
      const usableRows = rows.filter((row) => row[block.xKey] !== undefined && hasSeriesValue(keys, row));
      const labels = usableRows.map((row) => String(row[block.xKey]));
      const x0 = d3.scaleBand<string>().domain(labels).range([0, innerWidth]).padding(0.18);
      const x1 = d3.scaleBand<string>().domain(keys).range([0, x0.bandwidth()]).padding(0.12);
      const y = d3.scaleLinear().domain([0, Math.max(...usableRows.flatMap((row) => keys.map((key) => toNumber(row[key]))), 0) * 1.12 || 1]).nice().range([innerHeight, 0]);

      if (showGrid) {
        addGridAxis(root, y, innerWidth);
      }
      addBottomAxis(root, d3.axisBottom(x0), innerHeight);

      root
        .selectAll("g.group")
        .data(usableRows)
        .enter()
        .append("g")
        .attr("class", "group")
        .attr("transform", (row) => `translate(${x0(String(row[block.xKey])) ?? 0},0)`)
        .selectAll("rect")
        .data((row) => keys.map((key) => ({ key, row })))
        .enter()
        .append("rect")
        .attr("x", (datum) => x1(datum.key) ?? 0)
        .attr("y", innerHeight)
        .attr("width", x1.bandwidth())
        .attr("height", 0)
        .attr("rx", 5)
        .attr("fill", (datum, index) => (keys.length > 1 ? PALETTE[keys.indexOf(datum.key) % PALETTE.length] : rowColor(block, datum.row, index, colorScale)))
        .call((selection) => selection.append("title").text((datum) => `${datum.key}: ${formatValue(toNumber(datum.row[datum.key]))}`))
        .transition()
        .duration(850)
        .ease(d3.easeCubicOut)
        .attr("y", (datum) => y(toNumber(datum.row[datum.key])))
        .attr("height", (datum) => innerHeight - y(toNumber(datum.row[datum.key])));

      if (showDataLabels) {
        root
          .selectAll("text.bar-label")
          .data(usableRows.flatMap((row) => keys.map((key) => ({ key, row }))))
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .attr("x", (datum) => (x0(String(datum.row[block.xKey])) ?? 0) + (x1(datum.key) ?? 0) + x1.bandwidth() / 2)
          .attr("y", (datum) => y(toNumber(datum.row[datum.key])) - 7)
          .attr("text-anchor", "middle")
          .attr("fill", "rgb(36, 50, 61)")
          .style("font-size", "11px")
          .style("font-weight", "700")
          .text((datum) => formatValue(toNumber(datum.row[datum.key])));
      }

      if (showLegend && keys.length > 1) {
        addLegend(svg, keys, width);
      }
    } else if (block.chartType === "horizontalBar") {
      const usableRows = rows.filter((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);
      const labels = usableRows.map((row) => String(row[block.xKey]));
      const x = d3.scaleLinear().domain([0, Math.max(...usableRows.map((row) => toNumber(row[block.yKey])), 0) * 1.12 || 1]).nice().range([0, innerWidth]);
      const y = d3.scaleBand<string>().domain(labels).range([0, innerHeight]).padding(0.24);

      root.append("g").call(d3.axisLeft(y)).call((axis) => axis.select(".domain").remove());
      addBottomAxis(root, d3.axisBottom(x).ticks(5), innerHeight);

      const bars = root
        .selectAll<SVGRectElement, ChartRow>("rect")
        .data(usableRows)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (row) => y(String(row[block.xKey])) ?? 0)
        .attr("width", 0)
        .attr("height", y.bandwidth())
        .attr("rx", 6)
        .attr("fill", (row, index) => rowColor(block, row, index, colorScale));
      addPointTitles(bars, block);
      bars.transition().duration(850).ease(d3.easeCubicOut).attr("width", (row) => x(toNumber(row[block.yKey])));

      if (showDataLabels) {
        root
          .selectAll("text.horizontal-bar-label")
          .data(usableRows)
          .enter()
          .append("text")
          .attr("class", "horizontal-bar-label")
          .attr("x", (row) => x(toNumber(row[block.yKey])) + 8)
          .attr("y", (row) => (y(String(row[block.xKey])) ?? 0) + y.bandwidth() / 2)
          .attr("dominant-baseline", "middle")
          .attr("fill", "rgb(36, 50, 61)")
          .style("font-size", "11px")
          .style("font-weight", "700")
          .text((row) => formatValue(toNumber(row[block.yKey])));
      }
    } else if (block.chartType === "line") {
      const keys = resolveSeriesKeys(block, rows);
      const usableRows = rows.filter((row) => row[block.xKey] !== undefined && hasSeriesValue(keys, row));
      const labels = usableRows.map((row) => String(row[block.xKey]));
      const x = d3.scalePoint<string>().domain(labels).range([0, innerWidth]).padding(0.32);
      const y = d3.scaleLinear().domain([0, Math.max(...usableRows.flatMap((row) => keys.map((key) => toNumber(row[key]))), 0) * 1.12 || 1]).nice().range([innerHeight, 0]);
      const line = d3
        .line<ChartRow>()
        .x((row) => x(String(row[block.xKey])) ?? 0)
        .y((row) => y(toNumber(row[block.yKey])))
        .curve(d3.curveMonotoneX);

      if (showGrid) {
        addGridAxis(root, y, innerWidth);
      }
      addBottomAxis(root, d3.axisBottom(x), innerHeight);

      keys.forEach((key, keyIndex) => {
        const seriesRows = usableRows.map((row) => ({ ...row, [block.yKey]: row[key] }));
        const path = root.append("path").datum(seriesRows).attr("fill", "none").attr("stroke", PALETTE[keyIndex % PALETTE.length]).attr("stroke-width", 3).attr("d", line);
        const totalLength = path.node()?.getTotalLength() ?? 0;

        path.attr("stroke-dasharray", `${totalLength} ${totalLength}`).attr("stroke-dashoffset", totalLength).transition().duration(1000).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0);

        const circles = root
          .selectAll(`circle.line-${keyIndex}`)
          .data(seriesRows)
          .enter()
          .append("circle")
          .attr("class", `line-${keyIndex}`)
          .attr("cx", (row) => x(String(row[block.xKey])) ?? 0)
          .attr("cy", (row) => y(toNumber(row[block.yKey])))
          .attr("r", 0)
          .attr("fill", PALETTE[keyIndex % PALETTE.length]);

        circles.append("title").text((row) => `${key}: ${formatValue(toNumber(row[block.yKey]))}`);

        root.selectAll(`circle.line-${keyIndex}`).transition().delay((_, index) => 220 + index * 55).duration(360).attr("r", 4);

        if (showDataLabels) {
          root
            .selectAll(`text.line-label-${keyIndex}`)
            .data(seriesRows)
            .enter()
            .append("text")
            .attr("class", `line-label-${keyIndex}`)
            .attr("x", (row) => (x(String(row[block.xKey])) ?? 0) + 7)
            .attr("y", (row) => y(toNumber(row[block.yKey])) - 7)
            .attr("fill", PALETTE[keyIndex % PALETTE.length])
            .style("font-size", "11px")
            .style("font-weight", "700")
            .text((row) => formatValue(toNumber(row[block.yKey])));
        }
      });

      if (showLegend && keys.length > 1) {
        addLegend(svg, keys, width);
      }
    } else if (block.chartType === "pie" || block.chartType === "donut") {
      const usableRows = rows.filter((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);
      const radius = Math.min(innerWidth, innerHeight) / 2;
      const pieRoot = root.append("g").attr("transform", `translate(${innerWidth / 2},${innerHeight / 2})`);
      const pie = d3.pie<ChartRow>().value((row) => Math.max(0, toNumber(row[block.yKey]))).sort(null);
      const arc = d3.arc<d3.PieArcDatum<ChartRow>>().innerRadius(block.chartType === "donut" ? radius * 0.54 : 0).outerRadius(radius);
      const labelArc = d3.arc<d3.PieArcDatum<ChartRow>>().innerRadius(radius * 0.74).outerRadius(radius * 0.74);

      pieRoot
        .selectAll("path")
        .data(pie(usableRows))
        .enter()
        .append("path")
        .attr("fill", (datum, index) => rowColor(block, datum.data, index, colorScale))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("d", arc)
        .append("title")
        .text((datum) => `${labelForRow(block, datum.data)}: ${formatValue(toNumber(datum.data[block.yKey]))}`);

      pieRoot
        .selectAll("text")
        .data(pie(usableRows))
        .enter()
        .append("text")
        .attr("transform", (datum) => `translate(${labelArc.centroid(datum)})`)
        .attr("text-anchor", "middle")
        .attr("fill", "rgb(15, 23, 42)")
        .style("font-size", "12px")
        .style("font-weight", "700")
        .text((datum) =>
          showDataLabels
            ? `${labelForRow(block, datum.data)} ${formatValue(toNumber(datum.data[block.yKey]))}`
            : labelForRow(block, datum.data),
        );
    } else if (block.chartType === "band") {
      const usableRows = rows.filter((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);
      const total = d3.sum(usableRows, (row) => Math.max(0, toNumber(row[block.yKey]))) || 1;
      let current = 0;

      root
        .selectAll("rect")
        .data(usableRows)
        .enter()
        .append("rect")
        .attr("x", (row) => {
          const x = (current / total) * innerWidth;
          current += Math.max(0, toNumber(row[block.yKey]));
          return x;
        })
        .attr("y", innerHeight * 0.34)
        .attr("width", (row) => (Math.max(0, toNumber(row[block.yKey])) / total) * innerWidth)
        .attr("height", innerHeight * 0.32)
        .attr("rx", 6)
        .attr("fill", (row, index) => rowColor(block, row, index, colorScale))
        .append("title")
        .text((row) => `${labelForRow(block, row)}: ${formatValue((toNumber(row[block.yKey]) / total) * 100)}%`);

      if (showDataLabels) {
        current = 0;
        root
          .selectAll("text")
          .data(usableRows)
          .enter()
          .append("text")
          .attr("x", (row) => {
            const value = Math.max(0, toNumber(row[block.yKey]));
            const x = ((current + value / 2) / total) * innerWidth;
            current += value;
            return x;
          })
          .attr("y", innerHeight * 0.52)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .style("font-size", "12px")
          .style("font-weight", "700")
          .text((row) => `${labelForRow(block, row)} ${formatValue((toNumber(row[block.yKey]) / total) * 100)}%`);
      }
    } else if (block.chartType === "stacked100Bar") {
      const keys = resolveSeriesKeys(block, rows);
      const normalizedRows = rows.map((row) => {
        const total = d3.sum(keys, (key) => Math.max(0, toNumber(row[key]))) || 1;
        return Object.fromEntries([[block.xKey, row[block.xKey]], ...keys.map((key) => [key, (Math.max(0, toNumber(row[key])) / total) * 100])]) as ChartRow;
      });
      const labels = normalizedRows.map((row) => String(row[block.xKey]));
      const x = d3.scaleBand<string>().domain(labels).range([0, innerWidth]).padding(0.24);
      const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);
      const stacks = d3.stack<ChartRow>().keys(keys)(normalizedRows);

      if (showGrid) {
        addGridAxis(root, y, innerWidth);
      }
      addBottomAxis(root, d3.axisBottom(x), innerHeight);

      root.selectAll("g.stack").data(stacks).enter().append("g").attr("class", "stack").attr("fill", (_, index) => PALETTE[index % PALETTE.length]).selectAll("rect").data((series) => series).enter().append("rect").attr("x", (datum) => x(String(datum.data[block.xKey])) ?? 0).attr("y", (datum) => y(datum[1])).attr("height", (datum) => y(datum[0]) - y(datum[1])).attr("width", x.bandwidth()).attr("rx", 4);
      if (showLegend) {
        addLegend(svg, keys, width);
      }
    } else if (block.chartType === "stackedArea") {
      const keys = resolveSeriesKeys(block, rows);
      const labels = rows.map((row) => String(row[block.xKey]));
      const x = d3.scalePoint<string>().domain(labels).range([0, innerWidth]).padding(0.24);
      const maxTotal = Math.max(...rows.map((row) => d3.sum(keys, (key) => Math.max(0, toNumber(row[key])))), 1);
      const y = d3.scaleLinear().domain([0, maxTotal]).nice().range([innerHeight, 0]);
      const stacks = d3.stack<ChartRow>().keys(keys)(rows);
      const area = d3.area<d3.SeriesPoint<ChartRow>>().x((datum) => x(String(datum.data[block.xKey])) ?? 0).y0((datum) => y(datum[0])).y1((datum) => y(datum[1])).curve(d3.curveMonotoneX);

      if (showGrid) {
        addGridAxis(root, y, innerWidth);
      }
      addBottomAxis(root, d3.axisBottom(x), innerHeight);
      root.selectAll("path.area").data(stacks).enter().append("path").attr("class", "area").attr("fill", (_, index) => PALETTE[index % PALETTE.length]).attr("fill-opacity", 0.72).attr("stroke", "#fff").attr("stroke-width", 1.5).attr("d", area);
      if (showLegend) {
        addLegend(svg, keys, width);
      }
    } else if (block.chartType === "radar") {
      const usableRows = rows.filter((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);
      const center = { x: innerWidth / 2, y: innerHeight / 2 };
      const radius = Math.min(innerWidth, innerHeight) / 2 - 18;
      const values = usableRows.map((row) => Math.max(0, toNumber(row[block.yKey])));
      const maxValue = Math.max(...values, 1);
      const angle = (index: number) => (Math.PI * 2 * index) / usableRows.length - Math.PI / 2;
      const points = usableRows.map((row, index) => [center.x + Math.cos(angle(index)) * radius * (toNumber(row[block.yKey]) / maxValue), center.y + Math.sin(angle(index)) * radius * (toNumber(row[block.yKey]) / maxValue)] as [number, number]);

      [0.25, 0.5, 0.75, 1].forEach((ratio) => {
        root.append("circle").attr("cx", center.x).attr("cy", center.y).attr("r", radius * ratio).attr("fill", "none").attr("stroke", "rgba(51,65,85,0.14)");
      });

      usableRows.forEach((row, index) => {
        const outerX = center.x + Math.cos(angle(index)) * radius;
        const outerY = center.y + Math.sin(angle(index)) * radius;
        root.append("line").attr("x1", center.x).attr("y1", center.y).attr("x2", outerX).attr("y2", outerY).attr("stroke", "rgba(51,65,85,0.16)");
        root.append("text").attr("x", center.x + Math.cos(angle(index)) * (radius + 22)).attr("y", center.y + Math.sin(angle(index)) * (radius + 22)).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("fill", "rgb(36, 50, 61)").style("font-size", "12px").text(labelForRow(block, row));
      });

      root.append("path").attr("d", d3.line()(points)).attr("fill", "rgba(42,127,158,0.28)").attr("stroke", PALETTE[0]).attr("stroke-width", 3).attr("stroke-linejoin", "round");
    } else if (block.chartType === "histogram") {
      const values = rows.map((row) => toNumber(row[block.yKey])).filter((value) => Number.isFinite(value));
      const x = d3.scaleLinear().domain(extentDomain(values)).nice().range([0, innerWidth]);
      const bins = d3.bin().domain(x.domain() as [number, number]).thresholds(8)(values);
      const y = d3.scaleLinear().domain([0, d3.max(bins, (bin) => bin.length) || 1]).nice().range([innerHeight, 0]);

      if (showGrid) {
        addGridAxis(root, y, innerWidth);
      }
      addBottomAxis(root, d3.axisBottom(x).ticks(6), innerHeight);
      root.selectAll("rect").data(bins).enter().append("rect").attr("x", (bin) => x(bin.x0 ?? 0) + 1).attr("y", (bin) => y(bin.length)).attr("width", (bin) => Math.max(0, x(bin.x1 ?? 0) - x(bin.x0 ?? 0) - 2)).attr("height", (bin) => innerHeight - y(bin.length)).attr("rx", 5).attr("fill", PALETTE[0]);
    } else if (block.chartType === "boxplot") {
      const values = rows.map((row) => toNumber(row[block.yKey])).filter((value) => Number.isFinite(value)).sort(d3.ascending);
      const min = d3.min(values) ?? 0;
      const max = d3.max(values) ?? 1;
      const q1 = d3.quantile(values, 0.25) ?? min;
      const median = d3.quantile(values, 0.5) ?? min;
      const q3 = d3.quantile(values, 0.75) ?? max;
      const x = d3.scaleLinear().domain(extentDomain(values)).nice().range([0, innerWidth]);
      const y = innerHeight / 2;

      addBottomAxis(root, d3.axisBottom(x).ticks(6), innerHeight);
      root.append("line").attr("x1", x(min)).attr("x2", x(max)).attr("y1", y).attr("y2", y).attr("stroke", "rgb(15,23,42)").attr("stroke-width", 2);
      root.append("rect").attr("x", x(q1)).attr("y", y - 42).attr("width", Math.max(2, x(q3) - x(q1))).attr("height", 84).attr("rx", 8).attr("fill", "rgba(42,127,158,0.22)").attr("stroke", PALETTE[0]).attr("stroke-width", 2).append("title").text(`min ${formatValue(min)} / q1 ${formatValue(q1)} / median ${formatValue(median)} / q3 ${formatValue(q3)} / max ${formatValue(max)}`);
      [min, median, max].forEach((value) => {
        root.append("line").attr("x1", x(value)).attr("x2", x(value)).attr("y1", y - 50).attr("y2", y + 50).attr("stroke", "rgb(15,23,42)").attr("stroke-width", value === median ? 3 : 2);
      });
    } else if (block.chartType === "statMap") {
      const usableRows = rows.filter((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);
      const columns = Math.ceil(Math.sqrt(usableRows.length));
      const tileGap = 10;
      const tileWidth = (innerWidth - tileGap * Math.max(0, columns - 1)) / columns;
      const tileHeight = Math.min(72, (innerHeight - tileGap * Math.max(0, Math.ceil(usableRows.length / columns) - 1)) / Math.ceil(usableRows.length / columns));
      const values = usableRows.map((row) => toNumber(row[block.yKey]));
      const color = d3.scaleSequential(d3.interpolateYlGnBu).domain(extentDomain(values));

      root.selectAll("rect").data(usableRows).enter().append("rect").attr("x", (_, index) => (index % columns) * (tileWidth + tileGap)).attr("y", (_, index) => Math.floor(index / columns) * (tileHeight + tileGap)).attr("width", tileWidth).attr("height", tileHeight).attr("rx", 8).attr("fill", (row, index) => (block.colorKey ? rowColor(block, row, index, colorScale) : color(toNumber(row[block.yKey])))).attr("stroke", "rgba(15,23,42,0.14)").append("title").text((row) => `${labelForRow(block, row)}: ${formatValue(toNumber(row[block.yKey]))}`);
      root.selectAll("text.tile-label").data(usableRows).enter().append("text").attr("class", "tile-label").attr("x", (_, index) => (index % columns) * (tileWidth + tileGap) + tileWidth / 2).attr("y", (_, index) => Math.floor(index / columns) * (tileHeight + tileGap) + tileHeight / 2).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("fill", "white").style("font-size", "12px").style("font-weight", "700").text((row) => labelForRow(block, row));
    } else if (block.chartType === "lorenz") {
      const values = rows.map((row) => Math.max(0, toNumber(row[block.yKey]))).sort(d3.ascending);
      const total = d3.sum(values) || 1;
      let cumulative = 0;
      const points = [[0, 0], ...values.map((value, index) => {
        cumulative += value;
        return [(index + 1) / values.length, cumulative / total];
      })] as [number, number][];
      const x = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);
      const line = d3.line<[number, number]>().x((point) => x(point[0])).y((point) => y(point[1])).curve(d3.curveMonotoneX);

      if (showGrid) {
        addGridAxis(root, y, innerWidth);
      }
      addBottomAxis(root, d3.axisBottom(x).tickFormat((value) => `${Number(value) * 100}%`), innerHeight);
      root.append("path").datum([[0, 0], [1, 1]] as [number, number][]).attr("d", line).attr("fill", "none").attr("stroke", "rgba(100,116,139,0.72)").attr("stroke-dasharray", "5 5").attr("stroke-width", 2);
      root.append("path").datum(points).attr("d", line).attr("fill", "none").attr("stroke", PALETTE[0]).attr("stroke-width", 3);
    } else if (block.chartType === "pictogram") {
      const usableRows = rows.filter((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);
      const rowHeight = Math.max(34, innerHeight / usableRows.length);
      const iconSize = 13;

      usableRows.forEach((row, rowIndex) => {
        const count = Math.max(1, Math.min(100, Math.round(toNumber(row[block.yKey]))));
        const y = rowIndex * rowHeight;
        root.append("text").attr("x", 0).attr("y", y + 20).attr("fill", "rgb(36,50,61)").style("font-size", "12px").style("font-weight", "700").text(labelForRow(block, row));
        root.selectAll(`circle.icon-${rowIndex}`).data(d3.range(count)).enter().append("circle").attr("cx", (index) => 150 + (index % 25) * (iconSize + 3)).attr("cy", (index) => y + 14 + Math.floor(index / 25) * (iconSize + 3)).attr("r", iconSize / 2).attr("fill", rowColor(block, row, rowIndex, colorScale));
      });
    } else {
      const usableRows = rows.filter((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);
      const sizeKey = numericKeys(usableRows, [block.xKey, block.yKey, block.colorKey ?? "", block.nameKey ?? ""].filter(Boolean))[0] ?? block.yKey;
      const xValues = usableRows.map((row) => toNumber(row[block.xKey]));
      const yValues = usableRows.map((row) => toNumber(row[block.yKey]));
      const sizes = usableRows.map((row) => Math.max(1, toNumber(row[sizeKey])));
      const x = d3.scaleLinear().domain(extentDomain(xValues)).nice().range([0, innerWidth]);
      const y = d3.scaleLinear().domain(extentDomain(yValues)).nice().range([innerHeight, 0]);
      const r = d3.scaleSqrt().domain([0, d3.max(sizes) ?? 1]).range([5, 24]);

      if (showGrid) {
        addGridAxis(root, y, innerWidth);
      }
      addBottomAxis(root, d3.axisBottom(x).ticks(6), innerHeight);

      const points = root
        .selectAll<SVGCircleElement, ChartRow>("circle")
        .data(usableRows)
        .enter()
        .append("circle")
        .attr("cx", (row) => x(toNumber(row[block.xKey])))
        .attr("cy", (row) => y(toNumber(row[block.yKey])))
        .attr("r", 0)
        .attr("fill", (row, index) => {
          const color = rowColor(block, row, index, colorScale);
          return block.chartType === "bubble" ? colorWithAlpha(color, 0.48) : color;
        })
        .attr("stroke", "rgb(15,23,42)")
        .attr("stroke-width", block.chartType === "bubble" ? 1.5 : 0);
      addPointTitles(points, block);
      points.transition().duration(700).attr("r", (row) => (block.chartType === "bubble" ? r(toNumber(row[sizeKey])) : 5));

      if (showDataLabels) {
        root
          .selectAll("text.point-label")
          .data(usableRows)
          .enter()
          .append("text")
          .attr("class", "point-label")
          .attr("x", (row) => x(toNumber(row[block.xKey])) + 8)
          .attr("y", (row) => y(toNumber(row[block.yKey])) - 8)
          .attr("fill", "rgb(36, 50, 61)")
          .style("font-size", "11px")
          .style("font-weight", "700")
          .text((row) => labelForRow(block, row));
      }
    }

    addAxisLabels(svg, block, width, height);
  }, [block, hasRenderableRows]);

  return (
    <figure className="space-y-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-4">
      <div className="space-y-1">
        <figcaption className="text-base font-semibold text-[color:var(--color-primary)]">{block.title}</figcaption>
        {block.abstract ? (
          <p className="text-sm leading-7 text-[color:var(--color-text)]">{block.abstract}</p>
        ) : null}
        {block.description ? (
          <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">{block.description}</p>
        ) : null}
      </div>
      <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-2 py-2">
        <svg ref={svgRef} aria-labelledby={chartId} role="img" className="h-auto w-full">
          <title id={chartId}>{block.title}</title>
        </svg>
      </div>
      {!hasRenderableRows ? (
        <p className="text-xs leading-6 text-[color:var(--color-accent-ink)]">
          グラフに使う列名が見つかりません。キーとデータを確認してください。
        </p>
      ) : null}
      <p className="text-xs leading-6 text-[color:var(--color-muted)]">
        D3.js アニメーション付きのチャートです。Xキー: {block.xKey} / Yキー: {block.yKey}
      </p>
      {block.footnote ? (
        <p className="border-t border-[color:var(--color-border)] pt-2 text-xs leading-6 text-[color:var(--color-muted)]">
          {block.footnote}
        </p>
      ) : null}
    </figure>
  );
}
