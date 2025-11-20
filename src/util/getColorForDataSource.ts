import type { DataSourcesCryptoType } from "../types";

const palette: Partial<Record<DataSourcesCryptoType, string>> = {
  binance: "red",
  bybit: "blue",
  coinbase: "green",
  okx: "orange",
  pyth: "purple",
  pyth_lazer: "teal",
};

/**
 * normalizes colors used for all data sources
 */
export function getColorForDataSource(dataSource: DataSourcesCryptoType) {
  return palette[dataSource] ?? "gray";
}
