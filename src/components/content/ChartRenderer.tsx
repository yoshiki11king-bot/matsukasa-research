import { D3ChartBlock } from "@/components/d3-chart-block";
import { chartToD3Block } from "@/lib/content/chart-rendering";
import type { LocalChart } from "@/lib/content/types";

type ChartRendererProps = {
  chart: LocalChart;
};

export function ChartRenderer({ chart }: ChartRendererProps) {
  return <D3ChartBlock block={chartToD3Block(chart)} />;
}
