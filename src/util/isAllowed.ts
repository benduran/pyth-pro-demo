import type {
  AllAllowedSymbols,
  AllowedCryptoSymbolsType,
  AllowedEquitySymbolsType,
  DataSourcesCryptoType,
  DataSourcesEquityType,
  Nullish,
} from "../types";
import {
  ALLOWED_CRYPTO_SYMBOLS,
  ALLOWED_EQUITY_SYMBOLS,
  DATA_SOURCES_CRYPTO,
  DATA_SOURCES_EQUITY,
} from "../types";

export function isAllowedSymbol(
  symbol: Nullish<string>,
): symbol is AllAllowedSymbols {
  for (const s of [...ALLOWED_CRYPTO_SYMBOLS, ...ALLOWED_EQUITY_SYMBOLS]) {
    if (s === symbol) return true;
  }

  return false;
}

export function isAllowedCryptoSymbol(
  symbol: Nullish<string>,
): symbol is AllowedCryptoSymbolsType {
  for (const s of ALLOWED_CRYPTO_SYMBOLS) {
    if (s === symbol) return true;
  }

  return false;
}

export function isAllowedCryptoDataSource(
  dataSource: Nullish<string>,
): dataSource is DataSourcesCryptoType {
  for (const s of DATA_SOURCES_CRYPTO) {
    if (s === dataSource) return true;
  }
  return false;
}

export function isAllowedEquitySymbol(
  symbol: Nullish<string>,
): symbol is AllowedEquitySymbolsType {
  for (const s of ALLOWED_EQUITY_SYMBOLS) {
    if (s === symbol) return true;
  }
  return false;
}

export function isAllowedEquityDataSource(
  dataSource: Nullish<string>,
): dataSource is DataSourcesEquityType {
  for (const s of DATA_SOURCES_EQUITY) {
    if (s === dataSource) return true;
  }
  return false;
}
