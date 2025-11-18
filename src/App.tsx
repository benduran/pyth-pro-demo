import React from "react";

import PriceCard from "./components/PriceCard";
import PriceChart from "./components/PriceChart";
import { useBinanceWebSocket } from "./hooks/useBinanceWebSocket";
import { useBybitWebSocket } from "./hooks/useBybitWebSocket";
import { useCoinbaseWebSocket } from "./hooks/useCoinbaseWebSocket";
import { useOKXWebSocket } from "./hooks/useOKXWebSocket";
import { usePriceDataManager } from "./hooks/usePriceDataManager";
import { usePythLazerWebSocket } from "./hooks/usePythLazerWebSocket";
import { usePythWebSocket } from "./hooks/usePythWebSocket";

const App: React.FC = () => {
  const {
    chartData,
    currentPrices,
    exchangeStatus,
    handlePriceUpdate,
    handleStatusChange,
  } = usePriceDataManager();

  // Initialize WebSocket connections
  useBinanceWebSocket(handlePriceUpdate, (status) => {
    handleStatusChange("binance", status);
  });

  useCoinbaseWebSocket(handlePriceUpdate, (status) => {
    handleStatusChange("coinbase", status);
  });

  usePythWebSocket(handlePriceUpdate, (status) => {
    handleStatusChange("pyth", status);
  });

  usePythLazerWebSocket(handlePriceUpdate, (status) => {
    handleStatusChange("pythlazer", status);
  });

  useOKXWebSocket(handlePriceUpdate, (status) => {
    handleStatusChange("okx", status);
  });

  useBybitWebSocket(handlePriceUpdate, (status) => {
    handleStatusChange("bybit", status);
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

      <div className="price-cards">
        <PriceCard
          exchangeName="Binance"
          price={currentPrices.binance?.price}
          change={currentPrices.binance?.change}
          changePercent={currentPrices.binance?.changePercent}
          status={exchangeStatus.binance}
        />
        <PriceCard
          exchangeName="Coinbase"
          price={currentPrices.coinbase?.price}
          change={currentPrices.coinbase?.change}
          changePercent={currentPrices.coinbase?.changePercent}
          status={exchangeStatus.coinbase}
        />
        <PriceCard
          exchangeName="Pyth Core"
          price={currentPrices.pyth?.price}
          change={currentPrices.pyth?.change}
          changePercent={currentPrices.pyth?.changePercent}
          status={exchangeStatus.pyth}
        />
        <PriceCard
          exchangeName="Pyth Pro"
          price={currentPrices.pythlazer?.price}
          change={currentPrices.pythlazer?.change}
          changePercent={currentPrices.pythlazer?.changePercent}
          status={exchangeStatus.pythlazer}
        />
        <PriceCard
          exchangeName="OKX"
          price={currentPrices.okx?.price}
          change={currentPrices.okx?.change}
          changePercent={currentPrices.okx?.changePercent}
          status={exchangeStatus.okx}
        />
        <PriceCard
          exchangeName="Bybit"
          price={currentPrices.bybit?.price}
          change={currentPrices.bybit?.change}
          changePercent={currentPrices.bybit?.changePercent}
          status={exchangeStatus.bybit}
        />
      </div>

      <PriceChart data={chartData} />

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
        <p>
          Data sources:
          <span style={{ color: "#1a1a1a", marginLeft: "0.5rem" }}>
            Binance
          </span>
          <span style={{ color: "#0052ff", marginLeft: "0.5rem" }}>
            Coinbase
          </span>
          <span style={{ color: "#9945ff", marginLeft: "0.5rem" }}>
            Pyth Core
          </span>
          <span style={{ color: "#ff6b9d", marginLeft: "0.5rem" }}>
            Pyth Pro
          </span>
          <span style={{ color: "#00d4aa", marginLeft: "0.5rem" }}>OKX</span>
          <span style={{ color: "#f7931a", marginLeft: "0.5rem" }}>Bybit</span>
        </p>
      </div>
    </div>
  );
};

export default App;
