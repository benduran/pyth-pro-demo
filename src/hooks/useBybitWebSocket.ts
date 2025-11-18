import { useEffect, useRef, useCallback } from "react";

import type { PriceData } from "../types";

type BybitOrderBookData = {
  topic: string;
  type: string;
  ts: number;
  data: {
    s: string; // symbol
    b: [string, string][]; // bids [price, size]
    a: [string, string][]; // asks [price, size]
    u: number; // update id
    seq: number; // sequence number
  };
};

export const useBybitWebSocket = (
  onPriceUpdate: (data: PriceData) => void,
  onStatusChange: (status: "connected" | "disconnected" | "connecting") => void,
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const usdtToUsdRateRef = useRef<number>(1); // Default to 1:1 if rate fetch fails
  const usdtRateFetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch USDT/USD rate from Pyth
  const fetchUsdtToUsdRate = useCallback(async () => {
    try {
      const response = await fetch(
        "https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
      );
      const data = await response.json();
      const price = Number(data.parsed[0].price.price) / Math.pow(10, 8);
      usdtToUsdRateRef.current = price;
    } catch (_error) {
      // Keep previous rate or default to 1
    }
  }, []);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (
      isConnectingRef.current ||
      isConnectedRef.current ||
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    // Close any existing connection first
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = true;
    onStatusChange("connecting");

    try {
      // Bybit WebSocket endpoint for spot trading
      wsRef.current = new WebSocket("wss://stream.bybit.com/v5/public/spot");

      wsRef.current.addEventListener("open", () => {
        isConnectingRef.current = false;
        isConnectedRef.current = true;
        onStatusChange("connected");

        // Start fetching USDT/USD rate immediately and then every 10 seconds
        fetchUsdtToUsdRate();
        usdtRateFetchIntervalRef.current = setInterval(
          fetchUsdtToUsdRate,
          10_000,
        );

        // Subscribe to BTC-USDT orderbook
        const subscribeMessage = {
          op: "subscribe",
          args: ["orderbook.1.BTCUSDT"],
        };

        wsRef.current?.send(JSON.stringify(subscribeMessage));

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle orderbook updates
          if (
            (data.topic === "orderbook.1.BTCUSDT" &&
              data.type === "snapshot") ||
            data.type === "delta"
          ) {
            const orderBookData = data as BybitOrderBookData;
            const bookData = orderBookData.data;

            if (bookData.b?.length > 0 && bookData.a?.length > 0) {
              // Get best bid and ask (first elements in the arrays)
              const bestBid = Number.parseFloat(bookData.b[0][0]);
              const bestAsk = Number.parseFloat(bookData.a[0][0]);
              const midPriceUSDT = (bestBid + bestAsk) / 2;

              // Convert USDT to USD using the fetched rate
              const midPriceUSD = midPriceUSDT * usdtToUsdRateRef.current;

              onPriceUpdate({
                price: midPriceUSD,
                timestamp: Date.now(),
                source: "bybit",
              });
            }
          }
        } catch (_error) {
          // Ignore malformed WebSocket payloads
        }
      };

      wsRef.current.addEventListener("close", () => {
        isConnectingRef.current = false;
        isConnectedRef.current = false;
        onStatusChange("disconnected");

        // Disable automatic reconnection for now to prevent loops
        // reconnectTimeoutRef.current = setTimeout(() => {
        //   connect();
        // }, 5000);
      });

      wsRef.current.onerror = (_error) => {
        isConnectingRef.current = false;
        isConnectedRef.current = false;
        onStatusChange("disconnected");
      };
    } catch (_error) {
      isConnectingRef.current = false;
      isConnectedRef.current = false;
      onStatusChange("disconnected");

      // Disable automatic retry for now to prevent loops
      // reconnectTimeoutRef.current = setTimeout(() => {
      //     connect();
      // }, 5000);
    }
  }, [onPriceUpdate, onStatusChange, fetchUsdtToUsdRate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (usdtRateFetchIntervalRef.current) {
      clearInterval(usdtRateFetchIntervalRef.current);
      usdtRateFetchIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectingRef.current = false;
    isConnectedRef.current = false;
    onStatusChange("disconnected");
  }, [onStatusChange]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected: isConnectedRef.current,
    reconnect: connect,
    disconnect,
  };
};
