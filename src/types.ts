export type PriceData = {
  price: number;
  timestamp: number;
  source: "binance" | "coinbase" | "pyth" | "pythlazer" | "okx" | "bybit";
};

export type PricePoint = {
  timestamp: number;
  binance?: Nullish<number>;
  coinbase?: Nullish<number>;
  pyth?: Nullish<number>;
  pythlazer?: Nullish<number>;
  okx?: Nullish<number>;
  bybit?: Nullish<number>;
};

export type ExchangeStatus = {
  binance: "connected" | "disconnected" | "connecting";
  coinbase: "connected" | "disconnected" | "connecting";
  pyth: "connected" | "disconnected" | "connecting";
  pythlazer: "connected" | "disconnected" | "connecting";
  okx: "connected" | "disconnected" | "connecting";
  bybit: "connected" | "disconnected" | "connecting";
};

export type CurrentPrices = {
  binance: {
    price: number;
    change: number;
    changePercent: number;
  } | null;
  coinbase: {
    price: number;
    change: number;
    changePercent: number;
  } | null;
  pyth: {
    price: number;
    change: number;
    changePercent: number;
  } | null;
  pythlazer: {
    price: number;
    change: number;
    changePercent: number;
  } | null;
  okx: {
    price: number;
    change: number;
    changePercent: number;
  } | null;
  bybit: {
    price: number;
    change: number;
    changePercent: number;
  } | null;
};

export type Nullish<T> = T | null | undefined;
