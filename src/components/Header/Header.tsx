import { Toolbar } from "primereact/toolbar";

import classes from "./Header.module.css";
import { getColorForDataSource } from "../../util";
import { SourceSelectorV2 } from "../SourceSelectorV2";

export function Header() {
  return (
    <Toolbar
      className={classes.root}
      end={
        <>
          <SourceSelectorV2 />
        </>
      }
      start={
        <div className={classes.title}>
          <span style={{ color: getColorForDataSource("pyth") }}>Pyth</span>
          <span>Realtime feed comparison tool</span>
        </div>
      }
    />
  );
}
