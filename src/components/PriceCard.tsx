import React from "react";

import type { Nullish } from "../types";

type PriceCardProps = {
  exchangeName: string;
  price: Nullish<number>;
  change: Nullish<number>;
  changePercent: Nullish<number>;
  status: "connected" | "disconnected" | "connecting";
};

const formatChange = (
  change: Nullish<number>,
  changePercent: Nullish<number>,
): string => {
  if (typeof change !== "number" || typeof changePercent !== "number")
    return "N/A";
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
};

const getStatusText = (status: string): string => {
  switch (status) {
    case "connected": {
      return "Connected";
    }
    case "connecting": {
      return "Connecting...";
    }
    default: {
      return "Disconnected";
    }
  }
};

const formatPrice = (price: Nullish<number>): string => {
  if (typeof price !== "number") return "N/A";
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getChangeClass = (change: Nullish<number>): string => {
  if (typeof change !== "number") return "price-neutral";
  if (change > 0) return "price-positive";
  if (change < 0) return "price-negative";
  return "price-neutral";
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case "connected": {
      return "status-connected";
    }
    case "connecting": {
      return "status-connecting";
    }
    default: {
      return "status-disconnected";
    }
  }
};

const PriceCard: React.FC<PriceCardProps> = ({
  exchangeName,
  price,
  change,
  changePercent,
  status,
}) => {
  return (
    <div className="price-card">
      <h3>
        <span className={`status-indicator ${getStatusClass(status)}`}></span>
        {exchangeName}
      </h3>
      <div className="price-value">{formatPrice(price)}</div>
      <div className={`price-change ${getChangeClass(change)}`}>
        {formatChange(change, changePercent)}
      </div>
      <div
        className="status-text"
        style={{
          fontSize: "0.8rem",
          marginTop: "0.5rem",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        {getStatusText(status)}
      </div>
    </div>
  );
};

export default PriceCard;
