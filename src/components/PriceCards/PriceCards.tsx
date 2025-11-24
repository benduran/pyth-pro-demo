import { PriceCard } from "./PriceCard";
import classes from "./PriceCards.module.css";
import { useAppStateContext, useWebSocketsContext } from "../../context";
import { isNullOrUndefined } from "../../util";

export function PriceCards() {
  /** context */
  const state = useAppStateContext();
  const { statuses } = useWebSocketsContext();

  if (isNullOrUndefined(state.selectedSource)) return null;

  return (
    <div className={classes.root}>
      {state.dataSourcesInUse.map((dataSource) => {
        const allMetrics = state[dataSource].latest;
        const sourceMetrics = isNullOrUndefined(state.selectedSource)
          ? null
          : allMetrics?.[state.selectedSource];
        const socketStatus = statuses[dataSource];

        return (
          <PriceCard
            currentPriceMetrics={sourceMetrics}
            dataSource={dataSource}
            selectedSource={state.selectedSource}
            socketStatus={socketStatus}
            key={dataSource}
          />
        );
      })}
    </div>
  );
}
