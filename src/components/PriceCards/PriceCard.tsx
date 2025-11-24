import { capitalCase } from "change-case";
import cx from "clsx";
import { Card } from "primereact/card";

import classes from "./PriceCards.module.css";
import { PriceCardUtils } from "./priceCardUtils";
import type { useWebSocket } from "../../hooks/useWebSocket";
import type {
  AllAllowedSymbols,
  AllDataSourcesType,
  CurrentPriceMetrics,
  Nullish,
} from "../../types";
import { getColorForDataSource, isNullOrUndefined } from "../../util";

type PriceCardProps = {
  currentPriceMetrics: Nullish<CurrentPriceMetrics>;
  dataSource: AllDataSourcesType;
  selectedSource: Nullish<AllAllowedSymbols>;
  socketStatus: Nullish<ReturnType<typeof useWebSocket>["status"]>;
};

export function PriceCard({
  currentPriceMetrics,
  dataSource,
  selectedSource,
  socketStatus,
}: PriceCardProps) {
  if (isNullOrUndefined(selectedSource)) return null;

  /** local variables */
  const formattedSourceType = selectedSource.toUpperCase();
  return (
    <Card
      className={classes.priceCard}
      key={dataSource}
      subTitle={
        <div className={classes.priceCardSubtitle}>
          <span>{formattedSourceType}</span>
          {socketStatus && <span>{capitalCase(socketStatus)}</span>}
        </div>
      }
      title={
        <span style={{ color: getColorForDataSource(dataSource) }}>
          {capitalCase(dataSource)}
        </span>
      }
    >
      {socketStatus === "connected" && (
        <>
          <div className={classes.priceCardPrice}>
            {PriceCardUtils.formatPrice(currentPriceMetrics?.price)}
          </div>
          <div
            className={
              isNullOrUndefined(currentPriceMetrics?.change)
                ? ""
                : cx(
                    currentPriceMetrics.change < 0
                      ? classes.priceDropping
                      : currentPriceMetrics.change > 0
                        ? classes.priceIncreasing
                        : null,
                  )
            }
          >
            {PriceCardUtils.formatChange(
              currentPriceMetrics?.change,
              currentPriceMetrics?.changePercent,
            )}
          </div>
        </>
      )}
    </Card>
  );
}
