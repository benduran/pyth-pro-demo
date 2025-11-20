import { capitalCase } from "change-case";
import React from "react";

import { useAppStateContext } from "../context";
import type { useWebSocket } from "../hooks/useWebSocket";
import type { AllDataSourcesType, Nullish, AllAllowedSymbols } from "../types";
import { getColorForDataSource, isNullOrUndefined } from "../util";

type PriceCardProps = Pick<ReturnType<typeof useWebSocket>, "status"> & {
  dataSource: AllDataSourcesType;
  symbol: Nullish<AllAllowedSymbols>;
};

const MAX_PRECISION = 6;
const MIN_PRECISION = 2;

const formatChange = (
  change: Nullish<number>,
  changePercent: Nullish<number>,
): string => {
  if (isNullOrUndefined(change) || isNullOrUndefined(changePercent)) {
    return "N/A";
  }
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(
    MAX_PRECISION,
  )} (${sign}${changePercent.toFixed(MAX_PRECISION)}%)`;
};

const formatPrice = (price: Nullish<number>): string => {
  if (typeof price !== "number") return "N/A";
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: MIN_PRECISION,
    maximumFractionDigits: MAX_PRECISION,
  });
};

const getChangeClass = (change: Nullish<number>): string => {
  if (typeof change !== "number") return "price-neutral";
  if (change > 0) return "price-positive";
  if (change < 0) return "price-negative";
  return "price-neutral";
};

export function PriceCard({ dataSource, symbol, status }: PriceCardProps) {
  /** context */
  const state = useAppStateContext();

  if (isNullOrUndefined(symbol)) return null;

  const metrics = state[dataSource].latest?.[symbol];

  return (
    <div className="price-card">
      <h3 style={{ color: getColorForDataSource(dataSource) }}>
        <span className="status-indicator"></span>
        {capitalCase(dataSource)}: {symbol.toUpperCase()}
      </h3>
      {metrics && (
        <>
          <div className="price-value">{formatPrice(metrics.price)}</div>
          <div className={`price-change ${getChangeClass(metrics.change)}`}>
            {formatChange(metrics.change, metrics.changePercent)}
          </div>
        </>
      )}
      {!metrics && status === "connected" && (
        <div className="price-value">No data received</div>
      )}
      <div>{status}</div>
    </div>
  );
}

export default PriceCard;
