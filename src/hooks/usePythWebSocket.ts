import { useCallback } from "react";

import type { UseWebSocketOpts } from "./useWebSocket";
import { useAppStateContext } from "../context";
import type { AllowedCryptoSymbolsType } from "../types";
import { isAllowedCryptoSymbol, isNullOrUndefined } from "../util";

type PythPriceUpdateMessage = {
  type: string;
  price_feed: {
    id: string;
    price?: {
      price: string;
      conf: string;
      expo: number;
      publish_time: number;
    };
    ema_price: {
      price: string;
      conf: string;
      expo: number;
      publish_time: number;
    };
  };
};

// BTC/USD price feed ID from Pyth Network (without 0x prefix for subscription)
const BTC_USD_PRICE_FEED_ID =
  "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
const ETH_USD_PRICE_FEED_ID =
  "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

export function usePythWebSocket() {
  /** context */
  const { addDataPoint, selectedSource } = useAppStateContext();

  /** callbacks */
  const onMessage = useCallback(
    (_: number, strData: string) => {
      const data = JSON.parse(strData) as Partial<
        PythPriceUpdateMessage & { result: string }
      >;

      // Handle subscription confirmation
      if (data.result === "success") {
        return;
      }

      // Handle price updates
      if (data.type === "price_update" && data.price_feed) {
        const priceUpdateData = data as PythPriceUpdateMessage;
        const priceFeed = priceUpdateData.price_feed;

        let symbol: AllowedCryptoSymbolsType | null = null;
        if (priceFeed.id === BTC_USD_PRICE_FEED_ID) symbol = "BTCUSDT";
        else if (priceFeed.id === ETH_USD_PRICE_FEED_ID) symbol = "ETHUSDT";

        // Check if this is the BTC/USD feed
        if (
          isAllowedCryptoSymbol(symbol) &&
          !isNullOrUndefined(priceFeed.price)
        ) {
          // Convert price with exponent: price * 10^expo
          const price =
            Number.parseFloat(priceFeed.price.price) *
            Math.pow(10, priceFeed.price.expo);

          addDataPoint("pyth", symbol, {
            price: price,
            timestamp: Date.now(),
          });
        }
      }
    },
    [addDataPoint, selectedSource],
  );
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      let feedId = "";
      if (selectedSource === "BTCUSDT") feedId = BTC_USD_PRICE_FEED_ID;
      else if (selectedSource === "ETHUSDT") feedId = ETH_USD_PRICE_FEED_ID;

      if (!feedId) return;

      const subscribeMessage = {
        type: "subscribe",
        ids: [feedId],
      };
      socket.json(subscribeMessage);
    },
    [selectedSource],
  );

  return { onMessage, onOpen };
}
