import { capitalCase } from "change-case";
import React from "react";

import { PriceCard } from "./components/PriceCard";
import { PriceChart } from "./components/PriceChart";
import { SourceSelector } from "./components/SourceSelector";
import {
  API_TOKEN_INFOWAY,
  API_TOKEN_PRIME_API,
  API_TOKEN_PYTH_LAZER,
} from "./constants";
import { useAppStateContext } from "./context";
import { useDataStream } from "./hooks/useDataStream";
import { DATA_SOURCES_CRYPTO } from "./types";
import {
  getColorForDataSource,
  isAllowedCryptoSymbol,
  isAllowedEquitySymbol,
  isAllowedForexSymbol,
  isAllowedSymbol,
} from "./util";

export function App() {
  /** context */
  const { selectedSource } = useAppStateContext();

  /** local variables */
  const isCryptoSource = isAllowedCryptoSymbol(selectedSource);
  const isForexSource = isAllowedForexSymbol(selectedSource);
  const isEquitySource = isAllowedEquitySymbol(selectedSource);

  /** hooks */
  const { status: binanceStatus } = useDataStream({
    dataSource: "binance",
    enabled: isCryptoSource,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: bybitStatus } = useDataStream({
    dataSource: "bybit",
    enabled: isCryptoSource,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: coinbaseStatus } = useDataStream({
    dataSource: "coinbase",
    enabled: isCryptoSource,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: okxStatus } = useDataStream({
    dataSource: "okx",
    enabled: isCryptoSource,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: pythStatus } = useDataStream({
    dataSource: "pyth",
    enabled: isAllowedSymbol(selectedSource),
    symbol: selectedSource,
  });

  const { status: pythLazerStatus } = useDataStream({
    dataSource: "pyth_lazer",
    enabled: isAllowedSymbol(selectedSource) && Boolean(API_TOKEN_PYTH_LAZER),
    symbol: selectedSource,
  });

  const { status: primeApiStatus } = useDataStream({
    dataSource: "prime_api",
    enabled:
      isAllowedForexSymbol(selectedSource) && Boolean(API_TOKEN_PRIME_API),
    symbol: selectedSource,
  });

  const { status: infowayStatus } = useDataStream({
    dataSource: "infoway_io",
    enabled:
      (isAllowedForexSymbol(selectedSource) ||
        isAllowedEquitySymbol(selectedSource)) &&
      Boolean(API_TOKEN_INFOWAY),
    symbol: selectedSource,
  });

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
        {isCryptoSource && (
          <>
            <PriceCard dataSource="binance" status={binanceStatus} />
            <PriceCard dataSource="bybit" status={bybitStatus} />
            <PriceCard dataSource="coinbase" status={coinbaseStatus} />
            <PriceCard dataSource="okx" status={okxStatus} />
          </>
        )}
        {(isForexSource || isEquitySource) && (
          <PriceCard dataSource="infoway_io" status={infowayStatus} />
        )}
        {isForexSource && (
          <>
            <PriceCard dataSource="prime_api" status={primeApiStatus} />
          </>
        )}
        <PriceCard dataSource="pyth" status={pythStatus} />
        <PriceCard dataSource="pyth_lazer" status={pythLazerStatus} />
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
            {isAllowedCryptoSymbol(selectedSource) &&
              DATA_SOURCES_CRYPTO.map((source) => (
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
