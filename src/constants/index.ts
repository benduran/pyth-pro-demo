export const FUNC_NOOP = () => {
  return;
};

export const MAX_DATA_POINTS = 3000;

export const MAX_DATA_AGE = 1000 * 60; // 60 seconds

export const PYTH_LAZER_ENDPOINT = "wss://pyth-lazer.dourolabs.app/v1/stream";
export const PYTH_LAZER_AUTH_TOKEN = import.meta.env.VITE_PYTH_LAZER_AUTH_TOKEN;
