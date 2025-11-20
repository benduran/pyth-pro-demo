import { capitalCase } from "change-case";
import React from "react";

import { PriceCard } from "./components/PriceCard";
import { PriceChart } from "./components/PriceChart";
import { SourceSelector } from "./components/SourceSelector";
import { PYTH_LAZER_AUTH_TOKEN } from "./constants";
import { useAppStateContext } from "./context";
import { useDataStream } from "./hooks/useDataStream";
import { DATA_SOURCES_CRYPTO } from "./types";
import { getColorForDataSource, isAllowedCryptoSymbol } from "./util";

export function App() {
  /** context */
  const { selectedSource } = useAppStateContext();

  /** local variables */
  const isCryptoSource = isAllowedCryptoSymbol(selectedSource);

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
    enabled: isCryptoSource,
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
  });

  const { status: pythLazerStatus } = useDataStream({
    dataSource: "pyth_lazer",
    enabled: isCryptoSource && Boolean(PYTH_LAZER_AUTH_TOKEN),
    symbol: isAllowedCryptoSymbol(selectedSource) ? selectedSource : null,
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
            <PriceCard
              dataSource="binance"
              symbol={selectedSource}
              status={binanceStatus}
            />
            <PriceCard
              dataSource="bybit"
              symbol={selectedSource}
              status={bybitStatus}
            />
            <PriceCard
              dataSource="coinbase"
              symbol={selectedSource}
              status={coinbaseStatus}
            />
            <PriceCard
              dataSource="okx"
              symbol={selectedSource}
              status={okxStatus}
            />
            <PriceCard
              dataSource="pyth"
              symbol={selectedSource}
              status={pythStatus}
            />
            {PYTH_LAZER_AUTH_TOKEN && (
              <PriceCard
                dataSource="pyth_lazer"
                symbol={selectedSource}
                status={pythLazerStatus}
              />
            )}
            {!PYTH_LAZER_AUTH_TOKEN && (
              <div className="price-card">
                Please provide your PYTH Pro / Lazer access token to continue
              </div>
            )}
          </>
        )}
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
