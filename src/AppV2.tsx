import classes from "./AppV2.module.css";
import { Header } from "./components/Header";
import { PriceCards } from "./components/PriceCards";
import { PriceChart } from "./components/PriceChart";
import { useAppStateContext } from "./context";

export function AppV2() {
  /** context */
  const { dataSourcesInUse } = useAppStateContext();

  return (
    <div className={classes.root}>
      <Header />
      <main>
        <aside>
          <PriceCards />
        </aside>
        <article>
          <PriceChart key={dataSourcesInUse.join(", ")} />
        </article>
      </main>
    </div>
  );
}
