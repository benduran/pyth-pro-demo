import { useCallback } from "react";

import type { AllowedCryptoSymbolsType } from "../types";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useAppStateContext } from "../context";
import { isNullOrUndefined } from "../util";

type BybitOrderBookData = {
  topic: string;
  type: string;
  ts: number;
  data: {
    s: string; // symbol
    b?: [string, string][]; // bids [price, size]
    a?: [string, string][]; // asks [price, size]
    u: number; // update id
    seq: number; // sequence number
  };
};

export function useBybitWebSocket() {
  /** context */
  const { addDataPoint } = useAppStateContext();

  /** callbacks */
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      const subscribeMessage = {
        op: "subscribe",
        args: ["orderbook.1.BTCUSDT"],
      };
      socket.json(subscribeMessage);
    },
    [],
  );
  const onMessage = useCallback((usdtToUsdRate: number, socketData: string) => {
    const data = JSON.parse(socketData) as Partial<
      BybitOrderBookData & {
        topic: `orderbook.1.${AllowedCryptoSymbolsType}`;
        type: string;
      }
    >;

    // Handle orderbook updates
    if (
      ((data.topic === "orderbook.1.BTCUSDT" ||
        data.topic === "orderbook.1.ETHUSDT") &&
        data.type === "snapshot") ||
      data.type === "delta"
    ) {
      const symbol = data.topic?.split(".").pop();
      if (!symbol) return;

      const orderBookData = data as BybitOrderBookData;
      const bookData = orderBookData.data;

      if (bookData.b?.length && bookData.a?.length) {
        // Get best bid and ask (first elements in the arrays)
        const bestBid = Number.parseFloat(bookData.b[0]?.[0] ?? "");
        const bestAsk = Number.parseFloat(bookData.a[0]?.[0] ?? "");
        const midPriceUSDT = (bestBid + bestAsk) / 2;

        // Convert USDT to USD using the fetched rate
        if (!isNullOrUndefined(usdtToUsdRate)) {
          const midPriceUSD = midPriceUSDT * usdtToUsdRate;

          addDataPoint("bybit", symbol as AllowedCryptoSymbolsType, {
            price: midPriceUSD,
            timestamp: Date.now(),
          });
        }
      }
    }
  }, []);

  return { onMessage, onOpen };
}
