/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useCallback, useEffect, useRef } from "react";
import type Sockette from "sockette";
import { v4 as uuid } from "uuid";

import { useAppStateContext } from "../context";
import type {
  AllAllowedSymbols,
  Nullish,
  UseDataProviderSocketHookReturnType,
} from "../types";
import { isAllowedEquitySymbol, isAllowedSymbol } from "../util";

type TradeSubscribeReq = {
  code: 10_000;
  trace: string;
  data: {
    codes: string;
  };
};

type HeartbeatReq = {
  code: 10_010;
  trace: string;
};
// Push message for trade:
type TradePush = {
  code: 10_002;
  data: {
    s: AllAllowedSymbols;
    p: string; // price as string
    t: number;
    td: number; // trade direction: 0 = neutral, 1 = buy, 2 = sell
    v: string; // volume as string
    vw: "value" | "value-weighted";
  };
};

// Union of possible incoming message types
type InfowayMessage = TradePush;

export function useInfowayWebSocket(): UseDataProviderSocketHookReturnType {
  /** context */
  const { addDataPoint, selectedSource } = useAppStateContext();

  /** refs */
  const heartbeatRef = useRef<Nullish<NodeJS.Timeout>>(null);

  /** callbacks */
  const onMessage = useCallback<
    UseDataProviderSocketHookReturnType["onMessage"]
  >(
    (_, __, strData) => {
      if (!isAllowedSymbol(selectedSource)) return;

      const msg = JSON.parse(strData) as InfowayMessage;
      if (msg.code === 10_002) {
        const d = msg.data;
        const price = Number.parseFloat(d.p);
        addDataPoint("infoway_io", selectedSource, {
          price,
          timestamp: Date.now(),
        });
      }
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
      heartbeatRef.current = setInterval(() => {
        s.json({
          code: 10_010,
          trace: uuid(),
        } satisfies HeartbeatReq);
      }, 1000 * 10);

      if (!isAllowedSymbol(selectedSource)) return;

      s.json({
        code: 10_000,
        data: {
          codes: isAllowedEquitySymbol(selectedSource)
            ? `${selectedSource}.US`
            : selectedSource,
        },
        trace: uuid(),
      } satisfies TradeSubscribeReq);
    },
    [clearHeartbeat, selectedSource],
  );

  const onOpen = useCallback<
    NonNullable<UseDataProviderSocketHookReturnType["onOpen"]>
  >(
    (s) => {
      startHeartbeat(s);
    },
    [addDataPoint, selectedSource, startHeartbeat],
  );

  /** effects */
  useEffect(() => {
    return () => {
      clearHeartbeat();
    };
  }, [clearHeartbeat]);

  return { onMessage, onOpen };
}
