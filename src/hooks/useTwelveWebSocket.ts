import { useCallback, useEffect, useRef } from "react";
import type Sockette from "sockette";

import { useAppStateContext } from "../context";
import type {
  AllAllowedSymbols,
  Nullish,
  UseDataProviderSocketHookReturnType,
} from "../types";
import { isAllowedSymbol } from "../util";

type TwelveSubscriptionParams = {
  symbols: AllAllowedSymbols;
};

type TwelveRequest =
  | {
      action: "heartbeat";
    }
  | {
      action: "subscribe";
      params: TwelveSubscriptionParams;
    };

type TwelveSubscriptionFailure = {
  symbol: AllAllowedSymbols;
};

type TwelveResponse =
  | {
      event: "subscribe-status";
      fails: TwelveSubscriptionFailure[];
      status: "ok";
      success: TwelveSubscriptionInfo[];
    }
  | {
      currency: string;
      day_volume: number;
      exchange: string;
      event: "price";
      mic_code: string;
      price: number;
      symbol: string;
      type: string;
      timestamp: number;
    };

type TwelveSubscriptionInfo = {
  exchange: string;

  symbol: string;

  type: string;
};

export function useTwelveWebSocket(): UseDataProviderSocketHookReturnType {
  /** context */
  const { addDataPoint, selectedSource } = useAppStateContext();

  /** refs */
  const heartbeatRef = useRef<Nullish<NodeJS.Timeout>>(undefined);

  /** callbacks */
  const onMessage = useCallback<
    UseDataProviderSocketHookReturnType["onMessage"]
  >(
    (_, __, strData) => {
      const parsed = JSON.parse(strData) as TwelveResponse;
      if (parsed.event !== "price" || !isAllowedSymbol(selectedSource)) return;

      addDataPoint("twelve_data", selectedSource, {
        price: parsed.price,
        timestamp: Date.now(),
      });
    },
    [addDataPoint, selectedSource],
  );

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
  }, []);

  const startHeartbeat = useCallback(
    (s: Sockette) => {
      clearHeartbeat();
      heartbeatRef.current = setTimeout(() => {
        s.json({ action: "heartbeat" } satisfies TwelveRequest);
      }, 1000 * 10);
    },
    [clearHeartbeat],
  );

  const onOpen = useCallback<
    NonNullable<UseDataProviderSocketHookReturnType["onOpen"]>
  >(
    (s) => {
      startHeartbeat(s);
      if (!isAllowedSymbol(selectedSource)) return;

      s.json({
        action: "subscribe",
        params: { symbols: selectedSource },
      } satisfies TwelveRequest);
    },
    [selectedSource, startHeartbeat],
  );

  /** effects */
  useEffect(() => {
    return () => {
      clearHeartbeat();
    };
  }, [clearHeartbeat]);

  return { onMessage, onOpen };
}
