import { Toolbar } from "primereact/toolbar";

import classes from "./Header.module.css";
import { SourceSelectorV2 } from "../SourceSelectorV2";
import { ThemeSwitcher } from "../ThemeSwitchers";

export function Header() {
  return (
    <Toolbar
      className={classes.root}
      center={
        <>
          <SourceSelectorV2 />
        </>
      }
      end={
        <>
          <ThemeSwitcher />
        </>
      }
      start={<>Pyth - Realtime feed comparison tool</>}
    />
  );
}
