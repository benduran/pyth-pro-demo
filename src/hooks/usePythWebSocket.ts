/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useCallback, useEffect, useRef } from "react";

import type { PriceData } from "../types";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";

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
const WS_URL = "wss://hermes.pyth.network/ws";

export const usePythWebSocket = (
  onPriceUpdate: (data: PriceData) => void,
  onStatusChange: (status: "connected" | "disconnected" | "connecting") => void,
) => {
  /** refs */
  const onStatusChangeRef = useRef(onStatusChange);

  /** callbacks */
  const onMessage = useCallback<UseWebSocketOpts["onMessage"]>((_, e) => {
    const data = JSON.parse(e.data) as Partial<
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

      // Check if this is the BTC/USD feed
      if (priceFeed.id === BTC_USD_PRICE_FEED_ID && priceFeed.price) {
        // Convert price with exponent: price * 10^expo
        const price =
          Number.parseFloat(priceFeed.price.price) *
          Math.pow(10, priceFeed.price.expo);

        onPriceUpdate({
          price: price,
          timestamp: Date.now(),
          source: "pyth",
        });
      }
    }
  }, []);
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      const subscribeMessage = {
        type: "subscribe",
        ids: [BTC_USD_PRICE_FEED_ID],
      };
      socket.json(subscribeMessage);
    },
    [],
  );

  const { close, reconnect, status } = useWebSocket(WS_URL, {
    onMessage,
    onOpen,
  });

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
