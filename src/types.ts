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

export const ALLOWED_CRYPTO_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
] as const;
export const ALLOWED_EQUITY_SYMBOLS = ["AAPL", "NVDA", "TSLA"] as const;
export const ALLOWED_FOREX_SYMBOLS = ["EURUSD"] as const;
export const ALLOWED_TREASURY_SYMBOLS = ["US10Y"] as const;

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

export const DATA_SOURCES_TREASURY = ["pyth", "pyth_lazer"] as const;

export const ALL_DATA_SOURCES = [
  ...new Set([
    ...DATA_SOURCES_CRYPTO,
    ...DATA_SOURCES_EQUITY,
    ...DATA_SOURCES_FOREX,
    ...DATA_SOURCES_TREASURY,
  ]),
];

export type AllowedCryptoSymbolsType = ArrayValues<
  typeof ALLOWED_CRYPTO_SYMBOLS
>;

export type AllowedEquitySymbolsType = ArrayValues<
  typeof ALLOWED_EQUITY_SYMBOLS
>;

export type AllowedForexSymbolsType = ArrayValues<typeof ALLOWED_FOREX_SYMBOLS>;

export type AllowedTreasureySymbolsType = ArrayValues<
  typeof ALLOWED_TREASURY_SYMBOLS
>;

export type AllAllowedSymbols =
  | AllowedCryptoSymbolsType
  | AllowedEquitySymbolsType
  | AllowedForexSymbolsType
  | AllowedTreasureySymbolsType;

export type DataSourcesCryptoType = ArrayValues<typeof DATA_SOURCES_CRYPTO>;

export type DataSourcesEquityType = ArrayValues<typeof DATA_SOURCES_EQUITY>;

export type DataSourcesForexType = ArrayValues<typeof DATA_SOURCES_FOREX>;

export type DataSourcesTreasuryType = ArrayValues<typeof DATA_SOURCES_TREASURY>;

export type AllDataSourcesType =
  | DataSourcesCryptoType
  | DataSourcesEquityType
  | DataSourcesForexType;

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
  ]),
];

const SOURCE_SELECTOR_OPTS = [
  ...ALLOWED_CRYPTO_SYMBOLS.map((symbol) => ({
    group: "crypto",
    label: symbol,
    value: symbol,
  })),
  ...ALLOWED_EQUITY_SYMBOLS.map((symbol) => ({
    group: "equities",
    label: symbol,
    value: symbol,
  })),
  ...ALLOWED_FOREX_SYMBOLS.map((symbol) => ({
    group: "Forex",
    label: symbol,
    value: symbol,
  })),
  ...ALLOWED_TREASURY_SYMBOLS.map((symbol) => ({
    group: "treasuries",
    label: symbol,
    value: symbol,
  })),
];

export const GROUPED_SOURCE_SELECTOR_OPTS = Object.groupBy(
  SOURCE_SELECTOR_OPTS,
  (opt) => opt.group,
);
