import { useEffect, useRef, useCallback } from 'react';
import { PriceData } from '../types';

interface BinanceOrderBookData {
    s: string; // symbol
    b: string; // best bid price
    B: string; // best bid quantity
    a: string; // best ask price
    A: string; // best ask quantity
}

export const useBinanceWebSocket = (
    onPriceUpdate: (data: PriceData) => void,
    onStatusChange: (status: 'connected' | 'disconnected' | 'connecting') => void
) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectedRef = useRef(false);
    const isConnectingRef = useRef(false);
    const usdtToUsdRateRef = useRef<number>(1); // Default to 1:1 if rate fetch fails
    const usdtRateFetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch USDT/USD rate from Pyth
    const fetchUsdtToUsdRate = useCallback(async () => {
        try {
            console.log('Binance: Fetching USDT/USD rate...');
            const response = await fetch(
                "https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
            );
            const data = await response.json();
            const price = Number(data.parsed[0].price.price) / Math.pow(10, 8);
            usdtToUsdRateRef.current = price;
            console.log(`Binance: USDT/USD rate updated: ${price}`);
        } catch (error) {
            console.error('Binance: Error fetching USDT/USD rate:', error);
            // Keep previous rate or default to 1
        }
    }, []);

    const connect = useCallback(() => {
        // Prevent multiple simultaneous connections
        if (isConnectingRef.current || isConnectedRef.current ||
            wsRef.current?.readyState === WebSocket.OPEN ||
            wsRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        // Close any existing connection first
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        isConnectingRef.current = true;
        onStatusChange('connecting');

        try {
            wsRef.current = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@bookTicker');

            wsRef.current.onopen = () => {
                console.log('Binance WebSocket connected');
                isConnectingRef.current = false;
                isConnectedRef.current = true;
                onStatusChange('connected');

                // Start fetching USDT/USD rate immediately and then every 10 seconds
                fetchUsdtToUsdRate();
                usdtRateFetchIntervalRef.current = setInterval(fetchUsdtToUsdRate, 10000);

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data: BinanceOrderBookData = JSON.parse(event.data);
                    if (data.s === 'BTCUSDT') {
                        // Calculate mid price from best bid and best ask
                        const bestBid = parseFloat(data.b);
                        const bestAsk = parseFloat(data.a);
                        const midPriceUSDT = (bestBid + bestAsk) / 2;

                        // Convert USDT to USD using the fetched rate
                        const midPriceUSD = midPriceUSDT * usdtToUsdRateRef.current;

                        // console.log(`Binance Order Book - Bid: ${bestBid}, Ask: ${bestAsk}, Mid (USDT): ${midPriceUSDT}, Mid (USD): ${midPriceUSD}, USDT/USD Rate: ${usdtToUsdRateRef.current}`);

                        onPriceUpdate({
                            price: midPriceUSD,
                            timestamp: Date.now(),
                            source: 'binance'
                        });
                    }
                } catch (error) {
                    console.error('Error parsing Binance message:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('Binance WebSocket disconnected');
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');

                // Disable automatic reconnection for now to prevent loops
                // reconnectTimeoutRef.current = setTimeout(() => {
                //   connect();
                // }, 5000);
            };

            wsRef.current.onerror = (error) => {
                console.error('Binance WebSocket error:', error);
                console.error('Binance WebSocket readyState:', wsRef.current?.readyState);
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');
            };

        } catch (error) {
            console.error('Error creating Binance WebSocket:', error);
            isConnectingRef.current = false;
            isConnectedRef.current = false;
            onStatusChange('disconnected');

            // Disable automatic retry for now to prevent loops
            // reconnectTimeoutRef.current = setTimeout(() => {
            //     connect();
            // }, 5000);
        }
    }, [onPriceUpdate, onStatusChange]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (usdtRateFetchIntervalRef.current) {
            clearInterval(usdtRateFetchIntervalRef.current);
            usdtRateFetchIntervalRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        isConnectingRef.current = false;
        isConnectedRef.current = false;
        onStatusChange('disconnected');
    }, [onStatusChange]);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, []);

    return {
        isConnected: isConnectedRef.current,
        reconnect: connect,
        disconnect
    };
};
