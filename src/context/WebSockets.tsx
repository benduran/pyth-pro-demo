import type { PropsWithChildren } from "react";
import { createContext, use, useMemo } from "react";

import { useDataStream } from "../hooks/useDataStream";
import type { AllDataSourcesType } from "../types";
import {
  isAllowedCryptoSymbol,
  isAllowedEquitySymbol,
  isAllowedForexSymbol,
  isAllowedSymbol,
} from "../util";
import { useAppStateContext } from "./AppState";
import {
  API_TOKEN_INFOWAY,
  API_TOKEN_PRIME_API,
  API_TOKEN_PYTH_LAZER,
  API_TOKEN_TWELVE_DATA,
} from "../constants";

type WebSocketsContextVal = {
  statuses: Partial<
    Record<AllDataSourcesType, ReturnType<typeof useDataStream>["status"]>
  >;
};

const context = createContext<WebSocketsContextVal | null>(null);

export function WebSocketsProvider({ children }: PropsWithChildren) {
  /** context */
  const { selectedSource } = useAppStateContext();

  /** local variables */
  const isEquity = isAllowedEquitySymbol(selectedSource);
  const isForex = isAllowedForexSymbol(selectedSource);
  const isGoodSymbol = isAllowedSymbol(selectedSource);
  const isCryptoSymbol = isAllowedCryptoSymbol(selectedSource);

  /** hooks */
  const { status: binance } = useDataStream({
    dataSource: "binance",
    enabled: isCryptoSymbol,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: bybit } = useDataStream({
    dataSource: "bybit",
    enabled: isCryptoSymbol,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: coinbase } = useDataStream({
    dataSource: "coinbase",
    enabled: isCryptoSymbol,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: okx } = useDataStream({
    dataSource: "okx",
    enabled: isCryptoSymbol,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: pyth } = useDataStream({
    dataSource: "pyth",
    enabled: isGoodSymbol,
    symbol: selectedSource,
  });

  const { status: pyth_pro } = useDataStream({
    dataSource: "pyth_pro",
    enabled: isGoodSymbol && Boolean(API_TOKEN_PYTH_LAZER),
    symbol: selectedSource,
  });

  const { status: prime_api } = useDataStream({
    dataSource: "prime_api",
    enabled: isForex && Boolean(API_TOKEN_PRIME_API),
    symbol: selectedSource,
  });

  const { status: infoway_io } = useDataStream({
    dataSource: "infoway_io",
    enabled: (isForex || isEquity) && Boolean(API_TOKEN_INFOWAY),
    symbol: selectedSource,
  });

  const { status: twelve_data } = useDataStream({
    dataSource: "twelve_data",
    enabled: (isForex || isEquity) && Boolean(API_TOKEN_TWELVE_DATA),
    symbol: selectedSource,
  });

  /** provider val */
  const providerVal = useMemo<WebSocketsContextVal>(
    () => ({
      statuses: {
        binance,
        bybit,
        coinbase,
        infoway_io,
        okx,
        prime_api,
        pyth,
        pyth_pro,
        twelve_data,
        yahoo: "connected",
      },
    }),
    [
      binance,
      bybit,
      coinbase,
      infoway_io,
      okx,
      prime_api,
      pyth,
      pyth_pro,
      twelve_data,
    ],
  );

  return <context.Provider value={providerVal}>{children}</context.Provider>;
}

export function useWebSocketsContext() {
  const ctx = use(context);

  if (!ctx) {
    throw new Error(
      "unable to useWebSocketsContext() because no <WebSocketsProvider /> was found in the parent tree",
    );
  }

  return ctx;
}
