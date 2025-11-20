/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useCallback } from "react";

import type { UseWebSocketOpts } from "./useWebSocket";
import { useAppStateContext } from "../context";
import { isAllowedCryptoSymbol } from "../util";

type OKXBBOData = {
  arg: {
    channel: string;
    instId: "BTC-USDT" | "ETH-USDT";
  };
  data: {
    asks?: string[][]; // [price, size, liquidated_orders, number_of_orders] - only best ask
    bids?: string[][]; // [price, size, liquidated_orders, number_of_orders] - only best bid
    ts: string;
  }[];
};

export function useOKXWebSocket() {
  /** context */
  const { addDataPoint, selectedSource } = useAppStateContext();

  /** callbacks */
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      if (!isAllowedCryptoSymbol(selectedSource)) return;

      let instId = "";

      if (selectedSource === "BTCUSDT") instId = "BTC-USDT";
      else if (selectedSource === "ETHUSDT") instId = "ETH-USDT";

      if (!instId) return;

      const subscribeMessage = {
        op: "subscribe",
        args: [
          {
            channel: "bbo-tbt",
            instId,
          },
        ],
      };
      socket.json(subscribeMessage);
    },
    [selectedSource],
  );
  const onMessage = useCallback(
    (usdtToUsdRate: number, strData: string) => {
      if (!selectedSource) return;

      try {
        const data = JSON.parse(strData) as Partial<OKXBBOData>;

        // Handle best bid/offer updates
        if (
          data.arg?.channel === "bbo-tbt" &&
          (data.arg.instId === "BTC-USDT" || data.arg.instId === "ETH-USDT") &&
          data.data?.length
        ) {
          const bboData = data as OKXBBOData;
          const tickData = bboData.data[0];

          if (tickData?.bids?.length && tickData.asks?.length) {
            // Get best bid and ask (directly from bbo-tbt channel)
            const bestBid = Number.parseFloat(tickData.bids[0]?.[0] ?? "");
            const bestAsk = Number.parseFloat(tickData.asks[0]?.[0] ?? "");
            const midPriceUSDT = (bestBid + bestAsk) / 2;

            // Convert USDT to USD using the fetched rate
            const midPriceUSD = midPriceUSDT * usdtToUsdRate;

            addDataPoint("okx", selectedSource, {
              price: midPriceUSD,
              timestamp: Date.now(),
            });
          }
        }
      } catch {
        // Ignore malformed WebSocket payloads
      }
    },
    [addDataPoint, selectedSource],
  );

  return { onMessage, onOpen };
}
