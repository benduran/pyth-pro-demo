import type { PropsWithChildren } from "react";
import { createContext, use, useCallback, useMemo, useState } from "react";

import type {
  AllAllowedSymbols,
  AllAndLatestDataState,
  AllDataSourcesType,
  CurrentPricesState,
  LatestMetric,
  Nullish,
  PriceData,
} from "../types";
import {
  DATA_SOURCES_CRYPTO,
  DATA_SOURCES_EQUITY,
  DATA_SOURCES_FOREX,
  DATA_SOURCES_FUTURES,
  DATA_SOURCES_TREASURY,
} from "../types";
import {
  isAllowedCryptoSymbol,
  isAllowedEquitySymbol,
  isAllowedForexSymbol,
  isAllowedFutureSymbol,
  isAllowedSymbol,
  isAllowedTreasurySymbol,
} from "../util";

export type AppStateContextVal = CurrentPricesState & {
  addDataPoint: (
    dataSource: AllDataSourcesType,
    symbol: AllAllowedSymbols,
    dataPoint: PriceData,
  ) => void;

  dataSourcesInUse: AllDataSourcesType[];

  handleSelectSource: (source: AllAllowedSymbols) => void;
};

const context = createContext<Nullish<AppStateContextVal>>(null);

const emptyDataSourceResults: AllAndLatestDataState = { latest: {} };

const initialState: CurrentPricesState = {
  binance: emptyDataSourceResults,
  bybit: emptyDataSourceResults,
  coinbase: emptyDataSourceResults,
  infoway_io: emptyDataSourceResults,
  okx: emptyDataSourceResults,
  prime_api: emptyDataSourceResults,
  pyth: emptyDataSourceResults,
  pyth_pro: emptyDataSourceResults,
  selectedSource: null,
  twelve_data: emptyDataSourceResults,
  yahoo: emptyDataSourceResults,
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

  const handleSelectSource = useCallback((source: AllAllowedSymbols) => {
    setAppState({
      // blast away all state, because we don't need the old
      // data to be munged with the new data
      ...initialState,
      selectedSource: isAllowedSymbol(source) ? source : undefined,
    });
  }, []);

  /** memos */
  const dataSourcesInUse = useMemo(() => {
    let out: AllDataSourcesType[] = [];
    if (isAllowedCryptoSymbol(appState.selectedSource)) {
      out = [...DATA_SOURCES_CRYPTO];
    } else if (isAllowedForexSymbol(appState.selectedSource)) {
      out = [...DATA_SOURCES_FOREX];
    } else if (isAllowedEquitySymbol(appState.selectedSource)) {
      out = [...DATA_SOURCES_EQUITY];
    } else if (isAllowedTreasurySymbol(appState.selectedSource)) {
      out = [...DATA_SOURCES_TREASURY];
    } else if (isAllowedFutureSymbol(appState.selectedSource)) {
      out = [...DATA_SOURCES_FUTURES];
    }
    return out.sort();
  }, [appState.selectedSource]);

  /** provider val */
  const providerVal = useMemo<AppStateContextVal>(
    () => ({
      ...appState,
      addDataPoint,
      dataSourcesInUse,
      handleSelectSource,
    }),
    [appState, dataSourcesInUse, handleSelectSource],
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
