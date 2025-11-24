import type {
  AllAllowedSymbols,
  AllowedCryptoSymbolsType,
  AllowedEquitySymbolsType,
  AllowedFutureSymbolsType,
  AllowedForexSymbolsType,
  AllowedTreasureySymbolsType,
  DataSourcesCryptoType,
  DataSourcesEquityType,
  DataSourcesForexType,
  DataSourcesTreasuryType,
  Nullish,
} from "../types";
import {
  ALL_SYMBOLS,
  ALLOWED_CRYPTO_SYMBOLS,
  ALLOWED_EQUITY_SYMBOLS,
  ALLOWED_FUTURE_SYMBOLS,
  ALLOWED_FOREX_SYMBOLS,
  ALLOWED_TREASURY_SYMBOLS,
  DATA_SOURCES_CRYPTO,
  DATA_SOURCES_EQUITY,
  DATA_SOURCES_FOREX,
  DATA_SOURCES_TREASURY,
} from "../types";

export function isAllowedSymbol(
  symbol: Nullish<string>,
): symbol is AllAllowedSymbols {
  for (const s of ALL_SYMBOLS) {
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

export function isAllowedForexSymbol(
  symbol: Nullish<string>,
): symbol is AllowedForexSymbolsType {
  for (const s of ALLOWED_FOREX_SYMBOLS) {
    if (s === symbol) return true;
  }
  return false;
}

export function isAllowedForexDataSource(
  dataSource: Nullish<string>,
): dataSource is DataSourcesForexType {
  for (const s of DATA_SOURCES_FOREX) {
    if (s === dataSource) return true;
  }
  return false;
}

export function isAllowedTreasurySymbol(
  symbol: Nullish<string>,
): symbol is AllowedTreasureySymbolsType {
  for (const s of ALLOWED_TREASURY_SYMBOLS) {
    if (s === symbol) return true;
  }
  return false;
}

export function isAllowedTreasuryDataSource(
  dataSource: Nullish<string>,
): dataSource is DataSourcesTreasuryType {
  for (const s of DATA_SOURCES_TREASURY) {
    if (s === dataSource) return true;
  }
  return false;
}

export function isAllowedFutureSymbol(
  symbol: Nullish<string>,
): symbol is AllowedFutureSymbolsType {
  for (const s of ALLOWED_FUTURE_SYMBOLS) {
    if (s === symbol) return true;
  }

  return false;
}
