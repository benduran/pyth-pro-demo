import { useCallback } from "react";

import type { UseWebSocketOpts } from "./useWebSocket";
import { useAppStateContext } from "../context";
import type { AllAllowedSymbols, Nullish } from "../types";
import { isAllowedSymbol, isNullOrUndefined } from "../util";

type PythLazerStreamUpdate = {
  type: string;
  subscriptionId: number;
  parsed?: {
    timestampUs: string;
    priceFeeds?: {
      exponent: number;
      priceFeedId: number;
      price: string;
    }[];
  };
};

const SYMBOL_TO_PRICE_FEED_MAP = new Map<
  Nullish<AllAllowedSymbols>,
  Nullish<number>
>([
  [undefined, undefined],
  [null, null],
  ["BTCUSDT", 1],
  ["ETHUSDT", 2],
  ["EURUSD", 327],
  ["TSLA", 1435],
  ["US10Y", 1527],
]);

const PRICE_FEED_TO_SYMBOL_MAP = new Map(
  SYMBOL_TO_PRICE_FEED_MAP.entries().map(([symbol, feedId]) => [
    feedId,
    symbol,
  ]),
);

const SYMBOL_TO_CHANNEL_MAP = new Map<
  Nullish<AllAllowedSymbols>,
  Nullish<"real_time" | "fixed_rate@200ms">
>([
  [undefined, undefined],
  [null, null],
  ["BTCUSDT", "real_time"],
  ["ETHUSDT", "real_time"],
  ["EURUSD", "fixed_rate@200ms"],
  ["TSLA", "real_time"],
  ["US10Y", "fixed_rate@200ms"],
]);

export function usePythLazerWebSocket() {
  /** context */
  const { addDataPoint, selectedSource } = useAppStateContext();

  /** callbacks */
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      if (!selectedSource) return;
      const feedId = SYMBOL_TO_PRICE_FEED_MAP.get(selectedSource);

      if (isNullOrUndefined(feedId)) return;

      // Subscribe to BTC price feed
      const subscribeMessage = {
        subscriptionId: 1,
        type: "subscribe",
        priceFeedIds: [feedId],
        properties: ["exponent", "price"],
        chains: [],
        channel: SYMBOL_TO_CHANNEL_MAP.get(selectedSource),
      };
      socket.json(subscribeMessage);
    },
    [selectedSource],
  );
  const onMessage = useCallback(
    (_: number, strData: string) => {
      const data = JSON.parse(strData) as Partial<
        PythLazerStreamUpdate & { type: string }
      >;

      // Handle stream updates
      if (data.type === "streamUpdated" && data.subscriptionId === 1) {
        const updateData = data as PythLazerStreamUpdate;

        if (updateData.parsed?.priceFeeds?.length) {
          const priceFeed = updateData.parsed.priceFeeds[0];

          const symbol = PRICE_FEED_TO_SYMBOL_MAP.get(priceFeed?.priceFeedId);

          if (!isNullOrUndefined(priceFeed) && isAllowedSymbol(symbol)) {
            const { exponent } = priceFeed;

            // pyth_lazer price has 8 decimal places precision, convert to dollars
            const priceRaw = Number.parseFloat(priceFeed.price);
            // const priceInDollars = priceRaw / 100_000_000; // Divide by 10^

            // Convert price with exponent: price * 10^expo
            const price = priceRaw * Math.pow(10, exponent);

            addDataPoint("pyth_lazer", symbol, {
              price: price,
              timestamp: Date.now(),
            });
          }
        }
      }
    },
    [addDataPoint, selectedSource],
  );

  return { onMessage, onOpen };
}
