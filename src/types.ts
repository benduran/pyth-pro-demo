export interface PriceData {
    price: number;
    timestamp: number;
    source: 'binance' | 'coinbase' | 'pyth' | 'pythlazer' | 'okx' | 'bybit';
}

export interface PricePoint {
    timestamp: number;
    binance?: number;
    coinbase?: number;
    pyth?: number;
    pythlazer?: number;
    okx?: number;
    bybit?: number;
}

export interface ExchangeStatus {
    binance: 'connected' | 'disconnected' | 'connecting';
    coinbase: 'connected' | 'disconnected' | 'connecting';
    pyth: 'connected' | 'disconnected' | 'connecting';
    pythlazer: 'connected' | 'disconnected' | 'connecting';
    okx: 'connected' | 'disconnected' | 'connecting';
    bybit: 'connected' | 'disconnected' | 'connecting';
}

export interface CurrentPrices {
    binance: {
        price: number;
        change: number;
        changePercent: number;
    } | null;
    coinbase: {
        price: number;
        change: number;
        changePercent: number;
    } | null;
    pyth: {
        price: number;
        change: number;
        changePercent: number;
    } | null;
    pythlazer: {
        price: number;
        change: number;
        changePercent: number;
    } | null;
    okx: {
        price: number;
        change: number;
        changePercent: number;
    } | null;
    bybit: {
        price: number;
        change: number;
        changePercent: number;
    } | null;
}
