import type { PropsWithChildren } from "react";
import { createContext, use, useCallback, useMemo, useState } from "react";

import type {
  AllAllowedSymbols,
  AllAndLatestDataState,
  AllDataSourcesType,
  AllowedCryptoSymbolsType,
  CurrentPriceMetrics,
  CurrentPricesState,
  LatestMetric,
  Nullish,
  PriceData,
} from "../types";

export type AppStateContextVal = CurrentPricesState & {
  addDataPoint: (
    dataSource: AllDataSourcesType,
    symbol: AllAllowedSymbols,
    dataPoint: PriceData,
  ) => void;

  handleSelectSource: (source: AllowedCryptoSymbolsType) => void;
};

const context = createContext<Nullish<AppStateContextVal>>(null);

const initialState: CurrentPricesState = {
  binance: { all: {}, latest: {} },
  bybit: { all: {}, latest: {} },
  coinbase: { all: {}, latest: {} },
  okx: { all: {}, latest: {} },
  pyth: { all: {}, latest: {} },
  pythlazer: { all: {}, latest: {} },
  selectedSource: null,
};

export function AppStateProvider({ children }: PropsWithChildren) {
  /** state */
  const [appState, setAppState] = useState<CurrentPricesState>(initialState);

  /** callbacks */
  const addDataPoint = useCallback<AppStateContextVal["addDataPoint"]>(
    (dataSource, symbol, dataPoint) => {
      setAppState((prev) => {
        const previousPrice =
          prev[dataSource].latest?.[symbol]?.price ?? dataPoint.price;
        const change = dataPoint.price - previousPrice;
        const changePercent =
          previousPrice > 0 ? (change / previousPrice) * 100 : 0;

        return {
          ...prev,
          [dataSource]: {
            ...prev[dataSource],
            all: {
              ...prev[dataSource].all,
              [symbol]: [
                { ...dataPoint, change: null, changePercent: null },
              ] satisfies CurrentPriceMetrics[],
            },
            latest: {
              ...prev[dataSource].latest,
              [symbol]: {
                change,
                changePercent,
                price: dataPoint.price,
                timestamp: dataPoint.timestamp,
              },
            } satisfies LatestMetric,
          } satisfies AllAndLatestDataState,
        };
      });
    },
    [],
  );

  const handleSelectSource = useCallback((source: AllowedCryptoSymbolsType) => {
    setAppState({
      // blast away all state, because we don't need the old
      // data to be munged with the new data
      ...initialState,
      selectedSource: source,
    });
  }, []);

  /** provider val */
  const providerVal = useMemo<AppStateContextVal>(
    () => ({
      ...appState,
      addDataPoint,
      handleSelectSource,
    }),
    [appState, handleSelectSource],
  );

  return <context.Provider value={providerVal}>{children}</context.Provider>;
}

export function useAppStateContext() {
  const ctx = use(context);
  if (!ctx) {
    throw new Error(
      "unable to useAppStateContext() because no <AppStateProvider /> was found in the parent tree",
    );
  }

  return ctx;
}
