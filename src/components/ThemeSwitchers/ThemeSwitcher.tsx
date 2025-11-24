import { Button } from "primereact/button";

import { useThemeContext } from "../../context";

export function ThemeSwitcher() {
  /** context */
  const { handleChangeTheme, theme } = useThemeContext();

  /** local variables */
  const tooltip = `Change site theme to ${theme === "dark" ? "light" : "dark"}`;
  return (
    <Button
      aria-label={tooltip}
      icon="pi pi-sun"
      onClick={() => {
        handleChangeTheme(theme === "dark" ? "light" : "dark");
      }}
      outlined={theme === "dark"}
      tooltip={tooltip}
      tooltipOptions={{ position: "left" }}
    />
  );
}
