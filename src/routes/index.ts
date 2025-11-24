import type { AllAllowedSymbols } from "../types";
import { isNullOrUndefined } from "../util";

export const uiRoutes = {
  feed: (symbol?: AllAllowedSymbols) => {
    if (isNullOrUndefined(symbol)) return "/feed/:symbol";
    return `/feed/${symbol}`;
  },
  home: () => "/",
};
