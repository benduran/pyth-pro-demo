import { useEffect, useRef } from "react";

import type { Nullish } from "../types";

export function usePrevious<T>(val: T): Nullish<T> {
  /** refs */
  const prevVal = useRef<Nullish<T>>(null);

  /** effects */
  useEffect(() => {
    prevVal.current = val;
  }, [val]);

  return prevVal.current;
}
