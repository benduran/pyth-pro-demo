import type { ArrayValues } from "type-fest";

export type Nullish<T> = T | null | undefined;

export const ALLOWED_CRYPTO_SYMBOLS = ["BTCUSDT", "ETHUSDT"] as const;
export const ALLOWED_EQUITY_SYMBOLS = ["TSLA"] as const;

// BTCUSD (we already have this and other exchanges from the initial demo Ali built)
// TSLA
// EURUSD
// US10Y
// ES (s&p500 future)

export const DATA_SOURCES_CRYPTO = [
  "binance",
  "bybit",
  "coinbase",
  "okx",
  "pyth",
  "pythlazer",
] as const;

export const DATA_SOURCES_EQUITY = ["pyth", "pythlazer"] as const;

export type AllowedCryptoSymbolsType = ArrayValues<
  typeof ALLOWED_CRYPTO_SYMBOLS
>;

export type AllowedEquitySymbolsType = ArrayValues<
  typeof ALLOWED_EQUITY_SYMBOLS
>;

export type AllAllowedSymbols =
  | AllowedCryptoSymbolsType
  | AllowedEquitySymbolsType;

export type DataSourcesCryptoType = ArrayValues<typeof DATA_SOURCES_CRYPTO>;

export type DataSourcesEquityType = ArrayValues<typeof DATA_SOURCES_EQUITY>;

export type AllDataSourcesType = DataSourcesCryptoType | DataSourcesEquityType;

export type PriceData = {
  price: number;
  timestamp: number;
};

export type CurrentPriceMetrics = {
  change: Nullish<number>;
  changePercent: Nullish<number>;
  price: Nullish<number>;
  timestamp: number;
};

export type LatestMetric = Partial<
  Record<AllAllowedSymbols, CurrentPriceMetrics>
>;

export type AllAndLatestDataState = {
  all: Partial<Record<AllAllowedSymbols, CurrentPriceMetrics[]>>;
  latest: Nullish<LatestMetric>;
};

export type CurrentPricesState = Record<
  AllDataSourcesType,
  AllAndLatestDataState
> & {
  selectedSource: Nullish<AllAllowedSymbols>;
};

const SOURCE_SELECTOR_OPTS = [
  ...ALLOWED_CRYPTO_SYMBOLS.map((symbol) => ({
    label: symbol,
    group: "crypto",
    value: symbol,
  })),
  ...ALLOWED_EQUITY_SYMBOLS.map((symbol) => ({
    label: symbol,
    group: "equities",
    value: symbol,
  })),
];

export const GROUPED_SOURCE_SELECTOR_OPTS = Object.groupBy(
  SOURCE_SELECTOR_OPTS,
  (opt) => opt.group,
);
