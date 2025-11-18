/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useCallback, useRef } from "react";

import type { PriceData } from "../types";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";

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
const PYTH_LAZER_ENDPOINT = "wss://pyth-lazer.dourolabs.app/v1/stream";
const PYTH_LAZER_AUTH_TOKEN = import.meta.env.VITE_PYTH_LAZER_AUTH_TOKEN;
const BTC_PRICE_FEED_ID = 1;

export const usePythLazerWebSocket = (
  onPriceUpdate: (data: PriceData) => void,
  onStatusChange: (status: "connected" | "disconnected" | "connecting") => void,
) => {
  /** refs */
  const onStatusChangeRef = useRef(onStatusChange);

  /** callbacks */
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      // Subscribe to BTC price feed
      const subscribeMessage = {
        subscriptionId: 1,
        type: "subscribe",
        priceFeedIds: [BTC_PRICE_FEED_ID],
        properties: ["price"],
        chains: [],
        channel: "real_time",
      };
      socket.send(subscribeMessage);
    },
    [],
  );
  const onMessage = useCallback<UseWebSocketOpts["onMessage"]>((_, e) => {
    const data = JSON.parse(e.data) as Partial<
      PythLazerStreamUpdate & { type: string }
    >;

    // Handle stream updates
    if (data.type === "streamUpdated" && data.subscriptionId === 1) {
      const updateData = data as PythLazerStreamUpdate;

      if (updateData.parsed?.priceFeeds?.length) {
        const priceFeed = updateData.parsed.priceFeeds[0];

        if (priceFeed?.priceFeedId === BTC_PRICE_FEED_ID) {
          // Pyth Lazer price has 8 decimal places precision, convert to dollars
          const priceRaw = Number.parseFloat(priceFeed.price);
          const priceInDollars = priceRaw / 100_000_000; // Divide by 10^

          onPriceUpdate({
            price: priceInDollars,
            timestamp: Date.now(),
            source: "pythlazer",
          });
        }
      }
    }
  }, []);

  const { close, reconnect, status } = useWebSocket(
    `${PYTH_LAZER_ENDPOINT}?ACCESS_TOKEN=${PYTH_LAZER_AUTH_TOKEN}`,
    {
      enabled: Boolean(PYTH_LAZER_AUTH_TOKEN),
      onMessage,
      onOpen,
    },
  );

  /** effects */
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  });

  useEffect(() => {
    switch (status) {
      case "closed": {
        onStatusChangeRef.current("disconnected");
        return;
      }
      case "connected": {
        onStatusChangeRef.current("connected");
        return;
      }
      case "connecting":
      case "reconnecting": {
        onStatusChangeRef.current("connecting");
        return;
      }
      default: {
        break;
      }
    }
  }, [status]);

  return {
    isConnected: status === "connected",
    reconnect,
    disconnect: close,
  };
};
