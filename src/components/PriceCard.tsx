import { sentenceCase } from "change-case";
import React from "react";

import { useAppStateContext } from "../context";
import type { useWebSocket } from "../hooks/useWebSocket";
import type { AllDataSourcesType, Nullish, AllAllowedSymbols } from "../types";
import { getColorForDataSource, isNullOrUndefined } from "../util";

type PriceCardProps = Pick<ReturnType<typeof useWebSocket>, "status"> & {
  dataSource: AllDataSourcesType;
  symbol: AllAllowedSymbols;
};

const formatChange = (
  change: Nullish<number>,
  changePercent: Nullish<number>,
): string => {
  if (isNullOrUndefined(change) || isNullOrUndefined(changePercent)) {
    return "N/A";
  }
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
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

export function PriceCard({ dataSource, symbol, status }: PriceCardProps) {
  /** context */
  const state = useAppStateContext();
  const metrics = state[dataSource].latest?.[symbol];

  return (
    <div className="price-card">
      <h3 style={{ color: getColorForDataSource(dataSource) }}>
        <span className="status-indicator"></span>
        {sentenceCase(dataSource)}: {symbol.toUpperCase()}
      </h3>
      {metrics && (
        <>
          <div className="price-value">{formatPrice(metrics.price)}</div>
          <div className={`price-change ${getChangeClass(metrics.change)}`}>
            {formatChange(metrics.change, metrics.changePercent)}
          </div>
        </>
      )}
      <div>{status}</div>
    </div>
  );
}

export default PriceCard;
