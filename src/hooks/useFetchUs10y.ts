import { useEffect, useRef, useState } from "react";

import { useAppStateContext } from "../context";
import type { Nullish } from "../types";
import { isAllowedTreasurySymbol } from "../util";

type UseFetchUs10yOpts = {
  /**
   * how often this data will be refetched, in milliseconds
   * @defaultValue 500
   */
  refetchInterval?: number;
};

export function useFetchUs10y(opts?: UseFetchUs10yOpts) {
  /** context */
  const { addDataPoint, selectedSource } = useAppStateContext();

  /** props */
  const { refetchInterval = 500 } = opts ?? {};

  /** state */
  const [error, setError] = useState<Nullish<Error>>(null);
  const [response, setResponse] =
    useState<Nullish<{ price: number; timestamp: number }>>(null);

  /** refs */
  const abortControllerRef = useRef<Nullish<AbortController>>(null);

  /** effects */
  useEffect(() => {
    if (!isAllowedTreasurySymbol(selectedSource)) return;

    const doFetch = () => {
      abortControllerRef.current?.abort();

      const abt = new AbortController();

      fetch("http://localhost:3001/api/us10y", {
        mode: "cors",
        signal: abt.signal,
      })
        .then((r) => r.json())
        .then((res) => {
          if ("error" in res) {
            setError(new Error(String(res.error)));
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setResponse(res);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          addDataPoint("yahoo", selectedSource, {
            ...res,
            timestamp: Date.now(),
          });
        })
        .catch(setError);

      abortControllerRef.current = abt;
    };
    doFetch();

    const int = setInterval(doFetch, refetchInterval);

    return () => {
      abortControllerRef.current?.abort();
      clearInterval(int);
    };
  }, [addDataPoint, refetchInterval, selectedSource]);

  return { error, response };
}
