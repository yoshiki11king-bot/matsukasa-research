"use client";

import { useEffect, useId, useRef } from "react";
import * as d3 from "d3";
import type { ContentBlock } from "@/lib/types";

type D3ChartBlockProps = {
  block: Extract<ContentBlock, { type: "d3Chart" }>;
};

function toNumber(value: string | number) {
  const resolved = typeof value === "number" ? value : Number(value);
  return Number.isFinite(resolved) ? resolved : 0;
}

export function D3ChartBlock({ block }: D3ChartBlockProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartId = useId();
  const hasRenderableRows = block.data.some((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    if (!svgRef.current) {
      return;
    }

    const width = 900;
    const height = block.height ?? 320;
    const margin = { top: 28, right: 24, bottom: 52, left: 64 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const rows = block.data.filter((row) => row[block.xKey] !== undefined && row[block.yKey] !== undefined);
    const labels = rows.map((row) => String(row[block.xKey]));
    const values = rows.map((row) => toNumber(row[block.yKey]));

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    if (rows.length === 0) {
      return;
    }

    const root = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const maxValue = Math.max(...values, 0);
    const yMax = maxValue > 0 ? maxValue * 1.1 : 1;
    const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);
    const yAxis = d3.axisLeft(y).ticks(5).tickSize(-innerWidth);

    root
      .append("g")
      .call(yAxis)
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

    if (block.chartType === "bar") {
      const x = d3.scaleBand<string>().domain(labels).range([0, innerWidth]).padding(0.22);

      root
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .call((axis) => axis.select(".domain").attr("stroke", "rgba(107, 124, 133, 0.28)"))
        .call((axis) =>
          axis
            .selectAll("text")
            .attr("fill", "rgb(36, 50, 61)")
            .style("font-size", "12px"),
        );

      const bars = root
        .selectAll("rect")
        .data(rows)
        .enter()
        .append("rect")
        .attr("x", (row) => x(String(row[block.xKey])) ?? 0)
        .attr("y", innerHeight)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("rx", 6)
        .attr("fill", "rgb(42, 127, 158)");

      bars
        .transition()
        .duration(900)
        .ease(d3.easeCubicOut)
        .attr("y", (row) => y(toNumber(row[block.yKey])))
        .attr("height", (row) => innerHeight - y(toNumber(row[block.yKey])));

      root
        .selectAll("text.value-label")
        .data(rows)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", (row) => (x(String(row[block.xKey])) ?? 0) + x.bandwidth() / 2)
        .attr("y", (row) => y(toNumber(row[block.yKey])) - 8)
        .attr("text-anchor", "middle")
        .attr("fill", "rgb(15, 23, 42)")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("opacity", 0)
        .text((row) => toNumber(row[block.yKey]).toLocaleString("ja-JP"))
        .transition()
        .delay(350)
        .duration(500)
        .style("opacity", 1);
    } else {
      const x = d3.scalePoint<string>().domain(labels).range([0, innerWidth]).padding(0.32);
      const line = d3
        .line<(typeof rows)[number]>()
        .x((row) => x(String(row[block.xKey])) ?? 0)
        .y((row) => y(toNumber(row[block.yKey])))
        .curve(d3.curveMonotoneX);

      root
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .call((axis) => axis.select(".domain").attr("stroke", "rgba(107, 124, 133, 0.28)"))
        .call((axis) =>
          axis
            .selectAll("text")
            .attr("fill", "rgb(36, 50, 61)")
            .style("font-size", "12px"),
        );

      const path = root
        .append("path")
        .datum(rows)
        .attr("fill", "none")
        .attr("stroke", "rgb(42, 127, 158)")
        .attr("stroke-width", 3)
        .attr("d", line);

      const totalLength = path.node()?.getTotalLength() ?? 0;

      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1100)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);

      root
        .selectAll("circle")
        .data(rows)
        .enter()
        .append("circle")
        .attr("cx", (row) => x(String(row[block.xKey])) ?? 0)
        .attr("cy", (row) => y(toNumber(row[block.yKey])))
        .attr("r", 0)
        .attr("fill", "rgb(15, 23, 42)")
        .transition()
        .delay((_, index) => 280 + index * 80)
        .duration(420)
        .attr("r", 4.5);
    }

    if (block.yLabel) {
      svg
        .append("text")
        .attr("x", 18)
        .attr("y", 18)
        .attr("fill", "rgb(107, 124, 133)")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(block.yLabel);
    }
  }, [block]);

  return (
    <figure className="space-y-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-4">
      <div className="space-y-1">
        <figcaption className="text-base font-semibold text-[color:var(--color-primary)]">{block.title}</figcaption>
        {block.description ? (
          <p className="text-sm leading-7 text-[color:var(--color-secondary-ink)]">{block.description}</p>
        ) : null}
      </div>
      <div className="rounded-lg border border-[color:var(--color-border)] bg-white px-2 py-2">
        <svg
          ref={svgRef}
          aria-labelledby={chartId}
          role="img"
          className="h-auto w-full"
        >
          <title id={chartId}>{block.title}</title>
        </svg>
      </div>
      {!hasRenderableRows ? (
        <p className="text-xs leading-6 text-[color:var(--color-accent-ink)]">
          グラフに使う列名が見つかりません。X軸とY軸のキーを確認してください。
        </p>
      ) : null}
      <p className="text-xs leading-6 text-[color:var(--color-muted)]">
        D3.js アニメーション付きのチャートです。X軸: {block.xKey} / Y軸: {block.yKey}
      </p>
    </figure>
  );
}
