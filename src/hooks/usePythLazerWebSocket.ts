import { useCallback } from "react";

import type { UseWebSocketOpts } from "./useWebSocket";
import { useAppStateContext } from "../context";
import type { AllowedCryptoSymbolsType, Nullish } from "../types";
import { isAllowedCryptoSymbol, isNullOrUndefined } from "../util";

type PythLazerStreamUpdate = {
  type: string;
  subscriptionId: number;
  parsed?: {
    timestampUs: string;
    priceFeeds?: {
      priceFeedId: number;
      price: string;
    }[];
  };
};

// Pyth Lazer configuration
// these are grabbed from https://docs.pyth.network/price-feeds/pro/price-feed-ids
const BTC_PRICE_FEED_ID = 1;
const ETH_PRICE_FEED_ID = 2;

export function usePythLazerWebSocket() {
  /** context */
  const { addDataPoint, selectedSource } = useAppStateContext();

  /** callbacks */
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      if (!selectedSource) return;
      let feedId: number | null = null;
      if (selectedSource === "BTCUSDT") feedId = BTC_PRICE_FEED_ID;
      else if (selectedSource === "ETHUSDT") feedId = ETH_PRICE_FEED_ID;

      if (isNullOrUndefined(feedId)) return;

      // Subscribe to BTC price feed
      const subscribeMessage = {
        subscriptionId: 1,
        type: "subscribe",
        priceFeedIds: [feedId],
        properties: ["price"],
        chains: [],
        channel: "real_time",
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

          let symbol: Nullish<AllowedCryptoSymbolsType> = null;
          if (priceFeed?.priceFeedId === BTC_PRICE_FEED_ID) {
            symbol = "BTCUSDT";
          } else if (priceFeed?.priceFeedId === ETH_PRICE_FEED_ID) {
            symbol = "ETHUSDT";
          }

          if (!isNullOrUndefined(priceFeed) && isAllowedCryptoSymbol(symbol)) {
            // Pyth Lazer price has 8 decimal places precision, convert to dollars
            const priceRaw = Number.parseFloat(priceFeed.price);
            const priceInDollars = priceRaw / 100_000_000; // Divide by 10^

            addDataPoint("pythlazer", symbol, {
              price: priceInDollars,
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
