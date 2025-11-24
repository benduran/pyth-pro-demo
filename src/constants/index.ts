export const FUNC_NOOP = () => {
  return;
};

export const MAX_DATA_POINTS = 3000;

export const MAX_DATA_AGE = 1000 * 60; // 60 seconds

export const PYTH_LAZER_ENDPOINT = "wss://pyth-lazer.dourolabs.app/v1/stream";
export const API_TOKEN_PYTH_LAZER = import.meta.env.VITE_API_TOKEN_PYTH_LAZER;

export const API_TOKEN_PRIME_API = import.meta.env.VITE_API_TOKEN_PRIME_API;
export const API_TOKEN_INFOWAY = import.meta.env.VITE_API_TOKEN_INFOWAY;
export const API_TOKEN_TWELVE_DATA = import.meta.env.VITE_API_TOKEN_TWELVE_DATA;
