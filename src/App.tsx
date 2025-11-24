import { capitalCase } from "change-case";
import React, { useMemo } from "react";

import { PriceCard } from "./components/PriceCard";
import { PriceChart } from "./components/PriceChart";
import { SourceSelector } from "./components/SourceSelector";
import {
  API_TOKEN_INFOWAY,
  API_TOKEN_PRIME_API,
  API_TOKEN_PYTH_LAZER,
  API_TOKEN_TWELVE_DATA,
} from "./constants";
import { useAppStateContext } from "./context";
import { useDataStream } from "./hooks/useDataStream";
import { useFetchUs10y } from "./hooks/useFetchUs10y";
import type { AllDataSourcesType } from "./types";
import {
  DATA_SOURCES_CRYPTO,
  DATA_SOURCES_EQUITY,
  DATA_SOURCES_FOREX,
  DATA_SOURCES_TREASURY,
} from "./types";
import {
  getColorForDataSource,
  isAllowedCryptoSymbol,
  isAllowedEquitySymbol,
  isAllowedForexSymbol,
  isAllowedSymbol,
  isAllowedTreasurySymbol,
} from "./util";

export function App() {
  /** context */
  const { selectedSource } = useAppStateContext();

  /** local variables */
  const isCryptoSource = isAllowedCryptoSymbol(selectedSource);

  /** hooks */
  const { status: binance } = useDataStream({
    dataSource: "binance",
    enabled: isCryptoSource,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: bybit } = useDataStream({
    dataSource: "bybit",
    enabled: isCryptoSource,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: coinbase } = useDataStream({
    dataSource: "coinbase",
    enabled: isCryptoSource,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: okx } = useDataStream({
    dataSource: "okx",
    enabled: isCryptoSource,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: pyth } = useDataStream({
    dataSource: "pyth",
    enabled: isAllowedSymbol(selectedSource),
    symbol: selectedSource,
  });

  const { status: pyth_lazer } = useDataStream({
    dataSource: "pyth_lazer",
    enabled: isAllowedSymbol(selectedSource) && Boolean(API_TOKEN_PYTH_LAZER),
    symbol: selectedSource,
  });

  const { status: prime_api } = useDataStream({
    dataSource: "prime_api",
    enabled:
      isAllowedForexSymbol(selectedSource) && Boolean(API_TOKEN_PRIME_API),
    symbol: selectedSource,
  });

  const { status: infoway_io } = useDataStream({
    dataSource: "infoway_io",
    enabled:
      (isAllowedForexSymbol(selectedSource) ||
        isAllowedEquitySymbol(selectedSource)) &&
      Boolean(API_TOKEN_INFOWAY),
    symbol: selectedSource,
  });

  const { status: twelve_data } = useDataStream({
    dataSource: "twelve_data",
    enabled:
      (isAllowedForexSymbol(selectedSource) ||
        isAllowedEquitySymbol(selectedSource)) &&
      Boolean(API_TOKEN_TWELVE_DATA),
    symbol: selectedSource,
  });

  useFetchUs10y();

  const dataSourcesInUse = useMemo(() => {
    let out: AllDataSourcesType[] = [];
    if (isAllowedCryptoSymbol(selectedSource)) {
      out = [...DATA_SOURCES_CRYPTO];
    } else if (isAllowedForexSymbol(selectedSource)) {
      out = [...DATA_SOURCES_FOREX];
    } else if (isAllowedEquitySymbol(selectedSource)) {
      out = [...DATA_SOURCES_EQUITY];
    } else if (isAllowedTreasurySymbol(selectedSource)) {
      out = [...DATA_SOURCES_TREASURY];
    }
    return out.sort();
  }, [selectedSource]);

  const dataSourceStatuses = useMemo<
    Record<AllDataSourcesType, ReturnType<typeof useDataStream>["status"]>
  >(
    () => ({
      binance,
      bybit,
      coinbase,
      infoway_io,
      okx,
      prime_api,
      pyth,
      pyth_lazer,
      twelve_data,
      yahoo: isAllowedTreasurySymbol(selectedSource) ? "connected" : "closed",
    }),
    [
      binance,
      bybit,
      coinbase,
      infoway_io,
      okx,
      prime_api,
      pyth,
      pyth_lazer,
      selectedSource,
      twelve_data,
    ],
  );

  return (
    <div className="app-container">
      <div className="header">
        <h1>🚀 BTC Price Monitor</h1>
        <p
          style={{
            margin: "0.5rem 0 0 0",
            color: "rgba(0, 0, 0, 0.8)",
            fontSize: "1.1rem",
          }}
        >
          Real-time Bitcoin prices from multiple exchanges
        </p>
      </div>

      <div>
        <SourceSelector />
      </div>

      <div className="price-cards">
        {dataSourcesInUse.map((dataSource) => (
          <PriceCard
            dataSource={dataSource}
            key={dataSource}
            status={dataSourceStatuses[dataSource]}
          />
        ))}
      </div>

      <PriceChart key={selectedSource} />

      <div
        style={{
          marginTop: "7rem",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "rgba(0, 0, 0, 0.6)",
        }}
      >
        <p>
          Chart shows the last 60 seconds of price data • Updates in real-time
        </p>
        {selectedSource && (
          <div className="data-sources-list">
            Data sources:
            {dataSourcesInUse.map((source) => (
              <span
                key={source}
                style={{ color: getColorForDataSource(source) }}
              >
                {capitalCase(source)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
