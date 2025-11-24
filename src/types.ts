import type Sockette from "sockette";
import type { ArrayValues } from "type-fest";

export type Nullish<T> = T | null | undefined;

export type UseDataProviderSocketHookReturnType = {
  onMessage: (
    socket: Sockette,
    usdtToUsdRate: number,
    socketData: string,
  ) => void;
  onOpen?: (
    socket: Sockette,
    ...rest: Parameters<NonNullable<WebSocket["onopen"]>>
  ) => void;
};

export const ALLOWED_FUTURE_SYMBOLS = ["ESZ2025", "ESH2026"] as const;

export const ALLOWED_CRYPTO_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
] as const;
export const ALLOWED_EQUITY_SYMBOLS = ["AAPL", "NVDA", "TSLA", "SPY"] as const;
export const ALLOWED_FOREX_SYMBOLS = ["EURUSD"] as const;
export const ALLOWED_TREASURY_SYMBOLS = [] as const;
// export const ALLOWED_TREASURY_SYMBOLS = ["US10Y"] as const;

export const DATA_SOURCES_CRYPTO = [
  "binance",
  "bybit",
  "coinbase",
  "okx",
  "pyth",
  "pyth_lazer",
] as const;

export const DATA_SOURCES_EQUITY = [
  "pyth",
  "pyth_lazer",
  "infoway_io",
  "twelve_data",
] as const;

export const DATA_SOURCES_FOREX = [
  "pyth",
  "pyth_lazer",
  "prime_api",
  "infoway_io",
] as const;

export const DATA_SOURCES_FUTURES = ["pyth", "pyth_lazer"] as const;

export const DATA_SOURCES_TREASURY = ["pyth", "pyth_lazer", "yahoo"] as const;

export const ALL_DATA_SOURCES = [
  ...new Set([
    ...DATA_SOURCES_CRYPTO,
    ...DATA_SOURCES_EQUITY,
    ...DATA_SOURCES_FOREX,
    ...DATA_SOURCES_TREASURY,
    ...DATA_SOURCES_FUTURES,
  ]),
];

export type AllowedCryptoSymbolsType = ArrayValues<
  typeof ALLOWED_CRYPTO_SYMBOLS
>;

export type AllowedEquitySymbolsType = ArrayValues<
  typeof ALLOWED_EQUITY_SYMBOLS
>;

export type AllowedFutureSymbolsType = ArrayValues<
  typeof ALLOWED_FUTURE_SYMBOLS
>;

export type AllowedForexSymbolsType = ArrayValues<typeof ALLOWED_FOREX_SYMBOLS>;

export type AllowedTreasureySymbolsType = ArrayValues<
  typeof ALLOWED_TREASURY_SYMBOLS
>;

export type AllAllowedSymbols =
  | AllowedCryptoSymbolsType
  | AllowedEquitySymbolsType
  | AllowedForexSymbolsType
  | AllowedFutureSymbolsType;

export type DataSourcesCryptoType = ArrayValues<typeof DATA_SOURCES_CRYPTO>;

export type DataSourcesEquityType = ArrayValues<typeof DATA_SOURCES_EQUITY>;

export type DataSourcesForexType = ArrayValues<typeof DATA_SOURCES_FOREX>;

export type DataSourcesTreasuryType = ArrayValues<typeof DATA_SOURCES_TREASURY>;

export type DataSourceFuturesType = ArrayValues<typeof DATA_SOURCES_FUTURES>;

export type AllDataSourcesType =
  | DataSourcesCryptoType
  | DataSourcesEquityType
  | DataSourcesForexType
  | DataSourcesTreasuryType
  | DataSourceFuturesType;

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
  latest: Nullish<LatestMetric>;
};

export type CurrentPricesState = Record<
  AllDataSourcesType,
  AllAndLatestDataState
> & {
  selectedSource: Nullish<AllAllowedSymbols>;
};

export const ALL_SYMBOLS = [
  ...new Set([
    ...ALLOWED_CRYPTO_SYMBOLS,
    ...ALLOWED_EQUITY_SYMBOLS,
    ...ALLOWED_FOREX_SYMBOLS,
    ...ALLOWED_TREASURY_SYMBOLS,
    ...ALLOWED_FUTURE_SYMBOLS,
  ]),
];

export const NO_SELECTION_VAL = "No selection" as const;

export const SOURCE_SELECTOR_OPTS = [
  {
    label: NO_SELECTION_VAL,
    value: NO_SELECTION_VAL,
    type: "None",
  },
  ...ALLOWED_CRYPTO_SYMBOLS.map((symbol) => ({
    label: symbol,
    value: symbol,
    type: "crypto",
  })),
  ...ALLOWED_EQUITY_SYMBOLS.map((symbol) => ({
    label: symbol,
    value: symbol,
    type: "equities",
  })),
  ...ALLOWED_FOREX_SYMBOLS.map((symbol) => ({
    label: symbol,
    value: symbol,
    type: "Forex",
  })),
  ...ALLOWED_TREASURY_SYMBOLS.map((symbol) => ({
    label: symbol,
    value: symbol,
    type: "treasuries",
  })),
  ...ALLOWED_FUTURE_SYMBOLS.map((symbol) => ({
    label: symbol,
    value: symbol,
    type: "futures",
  })),
];

export type SourceSelectorOptType = (typeof SOURCE_SELECTOR_OPTS)[0];

export const GROUPED_SOURCE_SELECTOR_OPTS = Object.entries(
  Object.groupBy(SOURCE_SELECTOR_OPTS, (opt) => opt.type),
).map(([groupName, opts]) => ({
  label: groupName,
  items: opts,
}));

export type GroupedSourceSelectorOptType =
  (typeof GROUPED_SOURCE_SELECTOR_OPTS)[0];
