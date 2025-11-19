import { useCallback } from "react";

import type {
  AllowedCryptoSymbolsType,
  DataSourcesCrypto,
  Nullish,
} from "../types";
import { useBinanceWebSocket } from "./useBinanceWebSocket";
import { useFetchUsdtToUsdRate } from "./useFetchUsdtToUsdRate";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";
import { isNullOrUndefined } from "../util";
import { useBybitWebSocket } from "./useBybitWebSocket";

const PYTH_LAZER_ENDPOINT = "wss://pyth-lazer.dourolabs.app/v1/stream";
const PYTH_LAZER_AUTH_TOKEN = import.meta.env.VITE_PYTH_LAZER_AUTH_TOKEN;

function getUrlForSymbolAndDataSource(
  dataSource: DataSourcesCrypto,
  symbol: Nullish<AllowedCryptoSymbolsType>,
) {
  if (!symbol) return null;

  switch (symbol) {
    case "BTCUSDT":
    case "ETHUSDT": {
      switch (dataSource) {
        case "binance": {
          return `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@bookTicker`;
        }
        case "bybit": {
          return "wss://stream.bybit.com/v5/public/spot";
        }
        case "coinbase": {
          return "wss://advanced-trade-ws.coinbase.com";
        }
        case "okx": {
          return "wss://ws.okx.com:8443/ws/v5/public";
        }
        case "pyth": {
          return "wss://hermes.pyth.network/ws";
        }
        case "pythlazer": {
          return `${PYTH_LAZER_ENDPOINT}?${PYTH_LAZER_AUTH_TOKEN}`;
        }
      }
    }
  }
}

type UseDataStreamOpts = {
  dataSource: DataSourcesCrypto;
  enabled?: boolean;
  symbol: Nullish<AllowedCryptoSymbolsType>;
};

/**
 * abstraction around setting up the streaming websocket
 * and getting price updates from various sources
 */
export function useDataStream({
  dataSource,
  enabled = true,
  symbol,
}: UseDataStreamOpts) {
  /** queries */
  const { usdtToUsdRate } = useFetchUsdtToUsdRate({ enabled });

  /** hooks */
  const { onMessage: binanceOnMessage } = useBinanceWebSocket();
  const { onMessage: bybitOnMessage, onOpen: bybitOnOpen } =
    useBybitWebSocket();

  /** callbacks */
  const onMessage = useCallback<UseWebSocketOpts["onMessage"]>(
    (_, e) => {
      const strData = String(e.data);
      switch (symbol) {
        case "BTCUSDT":
        case "ETHUSDT": {
          switch (dataSource) {
            case "binance": {
              if (!isNullOrUndefined(usdtToUsdRate)) {
                binanceOnMessage(usdtToUsdRate, strData);
              }
              break;
            }
            case "bybit": {
              if (!isNullOrUndefined(usdtToUsdRate)) {
                bybitOnMessage(usdtToUsdRate, strData);
              }
              break;
            }
          }
        }
      }
    },
    [binanceOnMessage, bybitOnMessage, symbol, usdtToUsdRate],
  );

  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (...args) => {
      switch (symbol) {
        case "BTCUSDT":
        case "ETHUSDT": {
          switch (dataSource) {
            case "bybit": {
              bybitOnOpen(...args);
              break;
            }
            default: {
              break;
            }
          }
        }
      }
    },
    [bybitOnOpen, symbol],
  );

  /** websocket */
  const url = getUrlForSymbolAndDataSource(dataSource, symbol);
  const { status } = useWebSocket(url, {
    enabled: enabled && Boolean(url),
    onMessage,
    onOpen,
  });

  return { status };
}
