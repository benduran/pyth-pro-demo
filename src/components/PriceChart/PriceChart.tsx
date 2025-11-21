import { capitalCase } from "change-case";
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import classes from "./PriceChart.module.css";
import { MAX_DATA_AGE, MAX_DATA_POINTS } from "../../constants";
import { useAppStateContext } from "../../context";
import type { Nullish } from "../../types";
import { ALL_DATA_SOURCES } from "../../types";
import {
  getColorForDataSource,
  isAllowedSymbol,
  isNullOrUndefined,
} from "../../util";

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
);

type ChartJSPoint = { x: number; y: number };

export function PriceChart() {
  /** context */
  const state = useAppStateContext();

  /** refs */
  const chartjsRef = useRef<Chart>(undefined);

  /** state */
  const [chartRef, setChartRef] = useState<Nullish<HTMLCanvasElement>>(null);

  /** effects */
  useEffect(() => {
    if (!chartRef) return;

    const c = new Chart(chartRef, {
      type: "line",
      data: { datasets: [] },
      options: {
        animation: false,
        elements: {
          point: { radius: 0 },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: false,
            type: "linear", // push numeric timestamps or indices
            grid: { display: true },
            ticks: { display: false },
          },
          y: { type: "linear", beginAtZero: false, grid: { display: true } },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              generateLabels: (chart) => {
                // Start with the default labels
                const original =
                  Chart.defaults.plugins.legend.labels.generateLabels(chart);

                // Map them to whatever text you want
                return original.map((label) => ({
                  ...label,
                  text: capitalCase(label.text),
                }));
              },
              usePointStyle: true,
            },
          },
          tooltip: { enabled: false },
        },
      },
    });

    chartjsRef.current = c;
  }, [chartRef]);

  useEffect(() => {
    if (!chartjsRef.current || !state.selectedSource) return;
    const { current: c } = chartjsRef;

    for (const dataSource of ALL_DATA_SOURCES) {
      const latest = state[dataSource].latest;
      const symbolMetrics = latest?.[state.selectedSource];
      if (
        isNullOrUndefined(symbolMetrics) ||
        isNullOrUndefined(symbolMetrics.price)
      ) {
        continue;
      }

      let ds = c.data.datasets.find((d) => d.label === dataSource);
      if (!ds) {
        ds = {
          data: [],
          borderColor: getColorForDataSource(dataSource),
          label: dataSource,
          pointBorderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0.2,
        };
        c.data.datasets.push(ds);
      }

      const lastDataPoint = ds.data.at(-1) as Nullish<ChartJSPoint>;
      const latestMetricIsFresh =
        !lastDataPoint || lastDataPoint.x !== symbolMetrics.timestamp;

      if (!latestMetricIsFresh) return;

      ds.data.push({ x: symbolMetrics.timestamp, y: symbolMetrics.price });

      const end = symbolMetrics.timestamp;
      const start = end - MAX_DATA_AGE;

      ds.data = (ds.data as ChartJSPoint[])
        .filter((d) => d.x >= start && d.x <= end)
        .slice(-MAX_DATA_POINTS);

      // .sort() mutates the original array
      c.data.datasets.sort(
        (a, b) => a.label?.localeCompare(b.label ?? "") ?? 0,
      );
    }

    c.update();
  });

  useLayoutEffect(() => {
    return () => {
      chartjsRef.current?.destroy();
    };
  }, []);

  if (!isAllowedSymbol(state.selectedSource)) return null;

  return (
    <div className={classes.priceChartRoot}>
      <canvas ref={setChartRef} />
    </div>
  );
}
