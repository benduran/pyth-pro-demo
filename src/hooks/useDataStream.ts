import { useCallback } from "react";

import type {
  AllowedCryptoSymbolsType,
  DataSourcesCryptoType,
  Nullish,
} from "../types";
import { useBinanceWebSocket } from "./useBinanceWebSocket";
import { useFetchUsdtToUsdRate } from "./useFetchUsdtToUsdRate";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";
import { isNullOrUndefined } from "../util";
import { useBybitWebSocket } from "./useBybitWebSocket";
import { useCoinbaseWebSocket } from "./useCoinbaseWebSocket";
import { useOKXWebSocket } from "./useOKXWebSocket";
import { usePythLazerWebSocket } from "./usePythLazerWebSocket";
import { usePythWebSocket } from "./usePythWebSocket";
import { PYTH_LAZER_AUTH_TOKEN, PYTH_LAZER_ENDPOINT } from "../constants";

function getUrlForSymbolAndDataSource(
  dataSource: DataSourcesCryptoType,
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
          return `wss://stream.bybit.com/v5/public/spot?__cachebust=${symbol.toLowerCase()}`;
        }
        case "coinbase": {
          return `wss://advanced-trade-ws.coinbase.com?__cachebust=${symbol.toLowerCase()}`;
        }
        case "okx": {
          return `wss://ws.okx.com:8443/ws/v5/public?__cachebust=${symbol.toLowerCase()}`;
        }
        case "pyth": {
          return `wss://hermes.pyth.network/ws?__cachebust=${symbol.toLowerCase()}`;
        }
        case "pythlazer": {
          return `${PYTH_LAZER_ENDPOINT}?ACCESS_TOKEN=${PYTH_LAZER_AUTH_TOKEN}&__cachebust=${symbol.toLowerCase()}`;
        }
      }
    }
  }
}

type UseDataStreamOpts = {
  dataSource: DataSourcesCryptoType;
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
  const { onMessage: coinbaseOnMessage, onOpen: coinbaseOnOpen } =
    useCoinbaseWebSocket();
  const { onMessage: okxOnMessage, onOpen: okxOnOpen } = useOKXWebSocket();
  const { onMessage: pythOnMessage, onOpen: pythOnOpen } = usePythWebSocket();
  const { onMessage: pythLazerOnMessage, onOpen: pythLazerOnOpen } =
    usePythLazerWebSocket();

  /** callbacks */
  const onMessage = useCallback<UseWebSocketOpts["onMessage"]>(
    (_, e) => {
      if (isNullOrUndefined(usdtToUsdRate)) return;
      const strData = String(e.data);

      switch (symbol) {
        case "BTCUSDT":
        case "ETHUSDT": {
          switch (dataSource) {
            case "binance": {
              binanceOnMessage(usdtToUsdRate, strData);
              break;
            }
            case "bybit": {
              bybitOnMessage(usdtToUsdRate, strData);
              break;
            }
            case "coinbase": {
              coinbaseOnMessage(usdtToUsdRate, strData);
              break;
            }
            case "okx": {
              okxOnMessage(usdtToUsdRate, strData);
              break;
            }
            case "pyth": {
              pythOnMessage(usdtToUsdRate, strData);
              break;
            }
            case "pythlazer": {
              pythLazerOnMessage(usdtToUsdRate, strData);
              break;
            }
          }
        }
      }
    },
    [
      binanceOnMessage,
      bybitOnMessage,
      okxOnMessage,
      pythOnMessage,
      pythLazerOnMessage,
      symbol,
      usdtToUsdRate,
    ],
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
            case "coinbase": {
              coinbaseOnOpen(...args);
              break;
            }
            case "okx": {
              okxOnOpen(...args);
              break;
            }
            case "pyth": {
              pythOnOpen(...args);
              break;
            }
            case "pythlazer": {
              pythLazerOnOpen(...args);
              break;
            }
            default: {
              break;
            }
          }
        }
      }
    },
    [
      bybitOnOpen,
      coinbaseOnOpen,
      okxOnOpen,
      pythOnOpen,
      pythLazerOnOpen,
      symbol,
    ],
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
