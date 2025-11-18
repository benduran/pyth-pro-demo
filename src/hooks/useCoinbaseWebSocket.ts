/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useRef, useCallback } from "react";

import type { PriceData } from "../types";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";

type CoinbaseAdvancedTradeLevel2Message = {
  channel: string;
  client_id: string;
  timestamp: string;
  sequence_num: number;
  events: {
    type: string;
    product_id: string;
    updates?: {
      side: string; // "bid" or "offer"
      event_time: string;
      price_level: string;
      new_quantity: string;
    }[];
  }[];
};

type CoinbaseLevel2Snapshot = {
  channel: string;
  client_id: string;
  timestamp: string;
  sequence_num: number;
  events: {
    type: string;
    product_id: string;
    bids?: {
      price_level: string;
      new_quantity: string;
    }[];
    asks?: {
      price_level: string;
      new_quantity: string;
    }[];
  }[];
};

export const useCoinbaseWebSocket = (
  onPriceUpdate: (data: PriceData) => void,
  onStatusChange: (status: "connected" | "disconnected" | "connecting") => void,
) => {
  /** refs */
  const onStatusChangeRef = useRef(onStatusChange);

  // Maintain local orderbook state for best bid/ask
  const orderbookRef = useRef<{
    bids: Map<string, string>; // price -> quantity
    asks: Map<string, string>; // price -> quantity
  }>({
    bids: new Map(),
    asks: new Map(),
  });

  /** callbacks */
  // Helper function to calculate mid-price from orderbook
  const calculateMidPrice = useCallback(() => {
    const bids = orderbookRef.current.bids;
    const asks = orderbookRef.current.asks;

    if (bids.size === 0 || asks.size === 0) {
      return null;
    }

    // Get best bid (highest price)
    const bestBidPrice = Math.max(...[...bids.keys()].map(Number));
    // Get best ask (lowest price)
    const bestAskPrice = Math.min(...[...asks.keys()].map(Number));

    if (Number.isFinite(bestBidPrice) && Number.isFinite(bestAskPrice)) {
      return (bestBidPrice + bestAskPrice) / 2;
    }

    return null;
  }, []);
  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (socket) => {
      const subscribeMessage = {
        type: "subscribe",
        product_ids: ["BTC-USD"],
        channel: "level2",
      };
      socket.json(subscribeMessage);
    },
    [],
  );
  const onMessage = useCallback<UseWebSocketOpts["onMessage"]>((_, e) => {
    const data = JSON.parse(e.data) as Partial<{
      channel: string;
      events: CoinbaseAdvancedTradeLevel2Message["events"];
    }>;

    // Handle Advanced Trade level2 orderbook messages
    if (data.channel === "l2_data" && data.events) {
      for (const event of data.events) {
        if (event.product_id === "BTC-USD") {
          // Handle snapshot (initial orderbook state)
          if (event.type === "snapshot") {
            const snapshotEvent =
              event as unknown as CoinbaseLevel2Snapshot["events"][0];

            // Clear existing orderbook
            orderbookRef.current.bids.clear();
            orderbookRef.current.asks.clear();

            // Load bids
            if (snapshotEvent.bids?.length) {
              for (const bid of snapshotEvent.bids) {
                if (Number.parseFloat(bid.new_quantity) > 0) {
                  orderbookRef.current.bids.set(
                    bid.price_level,
                    bid.new_quantity,
                  );
                }
              }
            }

            // Load asks
            if (snapshotEvent.asks?.length) {
              for (const ask of snapshotEvent.asks) {
                if (Number.parseFloat(ask.new_quantity) > 0) {
                  orderbookRef.current.asks.set(
                    ask.price_level,
                    ask.new_quantity,
                  );
                }
              }
            }

            // Calculate and emit price after snapshot
            const midPrice = calculateMidPrice();
            if (midPrice !== null) {
              onPriceUpdate({
                price: midPrice,
                timestamp: Date.now(),
                source: "coinbase",
              });
            }
          }
          // Handle updates (incremental changes)
          else if (event.type === "update") {
            const updateEvent = event;

            if (updateEvent.updates?.length) {
              for (const update of updateEvent.updates) {
                const quantity = Number.parseFloat(update.new_quantity);

                if (update.side === "bid") {
                  if (quantity === 0) {
                    // Remove the price level
                    orderbookRef.current.bids.delete(update.price_level);
                  } else {
                    // Update the price level
                    orderbookRef.current.bids.set(
                      update.price_level,
                      update.new_quantity,
                    );
                  }
                } else if (update.side === "offer") {
                  if (quantity === 0) {
                    // Remove the price level
                    orderbookRef.current.asks.delete(update.price_level);
                  } else {
                    // Update the price level
                    orderbookRef.current.asks.set(
                      update.price_level,
                      update.new_quantity,
                    );
                  }
                }
              }

              // Calculate and emit price after updates
              const midPrice = calculateMidPrice();
              if (midPrice !== null) {
                onPriceUpdate({
                  price: midPrice,
                  timestamp: Date.now(),
                  source: "coinbase",
                });
              }
            }
          }
        }
      }
    }
  }, []);

  /** hooks */
  const { close, reconnect, status } = useWebSocket(
    "wss://advanced-trade-ws.coinbase.com",
    { onOpen, onMessage },
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
