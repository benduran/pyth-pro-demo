import { useCallback } from "react";

import type { AllAllowedSymbols, AllDataSourcesType, Nullish } from "../types";
import { useBinanceWebSocket } from "./useBinanceWebSocket";
import { useFetchUsdtToUsdRate } from "./useFetchUsdtToUsdRate";
import type { UseWebSocketOpts } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";
import { isAllowedForexSymbol, isNullOrUndefined } from "../util";
import { useBybitWebSocket } from "./useBybitWebSocket";
import { useCoinbaseWebSocket } from "./useCoinbaseWebSocket";
import { useInfowayWebSocket } from "./useInfowayWebSocket";
import { useOKXWebSocket } from "./useOKXWebSocket";
import { usePythWebSocket } from "./usePythWebSocket";
import {
  API_TOKEN_INFOWAY,
  API_TOKEN_PYTH_LAZER,
  PYTH_LAZER_ENDPOINT,
} from "../constants";
import { usePrimeApiWebSocket } from "./usePrimeApiWebSocket";
import { usePythLazerWebSocket } from "./usePythLazerWebSocket";

function getUrlForSymbolAndDataSource(
  dataSource: AllDataSourcesType,
  symbol: Nullish<AllAllowedSymbols>,
) {
  if (!symbol) return null;

  switch (dataSource) {
    case "infoway_io": {
      return `wss://data.infoway.io/ws?business=${
        isAllowedForexSymbol(symbol) ? "common" : "stock"
      }&apikey=${API_TOKEN_INFOWAY}`;
    }
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
    case "prime_api": {
      return "wss://euc2.primeapi.io/";
    }
    case "pyth": {
      return `wss://hermes.pyth.network/ws?__cachebust=${symbol.toLowerCase()}`;
    }
    case "pyth_lazer": {
      return `${PYTH_LAZER_ENDPOINT}?ACCESS_TOKEN=${API_TOKEN_PYTH_LAZER}&__cachebust=${symbol.toLowerCase()}`;
    }
    default: {
      break;
    }
  }

  return null;
}

type UseDataStreamOpts = {
  dataSource: AllDataSourcesType;
  enabled?: boolean;
  symbol: Nullish<AllAllowedSymbols>;
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
  const { onMessage: primeApiOnMessage, onOpen: primeApiOnOpen } =
    usePrimeApiWebSocket();
  const { onMessage: infowayOnMessage, onOpen: infowayOnOpen } =
    useInfowayWebSocket();

  /** callbacks */
  const onMessage = useCallback<UseWebSocketOpts["onMessage"]>(
    (s, e) => {
      if (isNullOrUndefined(usdtToUsdRate)) return;
      const strData = String(e.data);

      switch (dataSource) {
        case "binance": {
          binanceOnMessage(s, usdtToUsdRate, strData);
          break;
        }
        case "bybit": {
          bybitOnMessage(s, usdtToUsdRate, strData);
          break;
        }
        case "coinbase": {
          coinbaseOnMessage(s, usdtToUsdRate, strData);
          break;
        }
        case "infoway_io": {
          infowayOnMessage(s, usdtToUsdRate, strData);
          break;
        }
        case "okx": {
          okxOnMessage(s, usdtToUsdRate, strData);
          break;
        }
        case "prime_api": {
          primeApiOnMessage(s, usdtToUsdRate, strData);
          break;
        }
        case "pyth": {
          pythOnMessage(s, usdtToUsdRate, strData);
          break;
        }
        case "pyth_lazer": {
          pythLazerOnMessage(s, usdtToUsdRate, strData);
          break;
        }
        default: {
          break;
        }
      }
    },
    [
      binanceOnMessage,
      bybitOnMessage,
      dataSource,
      infowayOnMessage,
      okxOnMessage,
      primeApiOnMessage,
      pythOnMessage,
      pythLazerOnMessage,
      symbol,
      usdtToUsdRate,
    ],
  );

  const onOpen = useCallback<NonNullable<UseWebSocketOpts["onOpen"]>>(
    (...args) => {
      console.info("");

      switch (dataSource) {
        case "bybit": {
          bybitOnOpen?.(...args);
          break;
        }
        case "coinbase": {
          coinbaseOnOpen?.(...args);
          break;
        }
        case "infoway_io": {
          infowayOnOpen?.(...args);
          break;
        }
        case "okx": {
          okxOnOpen?.(...args);
          break;
        }
        case "prime_api": {
          primeApiOnOpen?.(...args);
          break;
        }
        case "pyth": {
          pythOnOpen?.(...args);
          break;
        }
        case "pyth_lazer": {
          pythLazerOnOpen?.(...args);
          break;
        }
        default: {
          break;
        }
      }
    },
    [
      bybitOnOpen,
      coinbaseOnOpen,
      dataSource,
      infowayOnOpen,
      okxOnOpen,
      primeApiOnOpen,
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
