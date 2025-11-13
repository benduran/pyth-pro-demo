import { useEffect, useRef, useCallback } from 'react';
import { PriceData } from '../types';

interface BybitOrderBookData {
    topic: string;
    type: string;
    ts: number;
    data: {
        s: string; // symbol
        b: Array<[string, string]>; // bids [price, size]
        a: Array<[string, string]>; // asks [price, size]
        u: number; // update id
        seq: number; // sequence number
    };
}

export const useBybitWebSocket = (
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
            console.log('Bybit: Fetching USDT/USD rate...');
            const response = await fetch(
                "https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
            );
            const data = await response.json();
            const price = Number(data.parsed[0].price.price) / Math.pow(10, 8);
            usdtToUsdRateRef.current = price;
            console.log(`Bybit: USDT/USD rate updated: ${price}`);
        } catch (error) {
            console.error('Bybit: Error fetching USDT/USD rate:', error);
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
            // Bybit WebSocket endpoint for spot trading
            wsRef.current = new WebSocket('wss://stream.bybit.com/v5/public/spot');

            wsRef.current.onopen = () => {
                console.log('Bybit WebSocket connected');
                isConnectingRef.current = false;
                isConnectedRef.current = true;
                onStatusChange('connected');

                // Start fetching USDT/USD rate immediately and then every 10 seconds
                fetchUsdtToUsdRate();
                usdtRateFetchIntervalRef.current = setInterval(fetchUsdtToUsdRate, 10000);

                // Subscribe to BTC-USDT orderbook
                const subscribeMessage = {
                    op: 'subscribe',
                    args: ['orderbook.1.BTCUSDT']
                };

                console.log('Bybit: Sending subscription message:', subscribeMessage);
                wsRef.current?.send(JSON.stringify(subscribeMessage));

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // console.log('Bybit: Received message:', data);

                    // Handle orderbook updates
                    if (data.topic === 'orderbook.1.BTCUSDT' && data.type === 'snapshot' || data.type === 'delta') {
                        const orderBookData = data as BybitOrderBookData;
                        const bookData = orderBookData.data;

                        if (bookData.b?.length > 0 && bookData.a?.length > 0) {
                            // Get best bid and ask (first elements in the arrays)
                            const bestBid = parseFloat(bookData.b[0][0]);
                            const bestAsk = parseFloat(bookData.a[0][0]);
                            const midPriceUSDT = (bestBid + bestAsk) / 2;

                            // Convert USDT to USD using the fetched rate
                            const midPriceUSD = midPriceUSDT * usdtToUsdRateRef.current;

                            // console.log(`Bybit Order Book - Bid: ${bestBid}, Ask: ${bestAsk}, Mid (USDT): ${midPriceUSDT}, Mid (USD): ${midPriceUSD}, USDT/USD Rate: ${usdtToUsdRateRef.current}`);

                            onPriceUpdate({
                                price: midPriceUSD,
                                timestamp: Date.now(),
                                source: 'bybit'
                            });
                        }
                    }
                    // Handle subscription confirmations
                    else if (data.success === true) {
                        console.log('Bybit: Subscription confirmed:', data);
                    }
                    // Handle errors
                    else if (data.success === false) {
                        console.error('Bybit: Subscription error:', data);
                    }
                } catch (error) {
                    console.error('Error parsing Bybit message:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('Bybit WebSocket disconnected');
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');

                // Disable automatic reconnection for now to prevent loops
                // reconnectTimeoutRef.current = setTimeout(() => {
                //   connect();
                // }, 5000);
            };

            wsRef.current.onerror = (error) => {
                console.error('Bybit WebSocket error:', error);
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');
            };

        } catch (error) {
            console.error('Error creating Bybit WebSocket:', error);
            isConnectingRef.current = false;
            isConnectedRef.current = false;
            onStatusChange('disconnected');

            // Disable automatic retry for now to prevent loops
            // reconnectTimeoutRef.current = setTimeout(() => {
            //     connect();
            // }, 5000);
        }
    }, [onPriceUpdate, onStatusChange, fetchUsdtToUsdRate]);

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
