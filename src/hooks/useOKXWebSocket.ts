import { useEffect, useRef, useCallback } from 'react';
import { PriceData } from '../types';

interface OKXBBOData {
    arg: {
        channel: string;
        instId: string;
    };
    data: Array<{
        asks: string[][]; // [price, size, liquidated_orders, number_of_orders] - only best ask
        bids: string[][]; // [price, size, liquidated_orders, number_of_orders] - only best bid
        ts: string;
    }>;
}

export const useOKXWebSocket = (
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
            console.log('OKX: Fetching USDT/USD rate...');
            const response = await fetch(
                "https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
            );
            const data = await response.json();
            const price = Number(data.parsed[0].price.price) / Math.pow(10, 8);
            usdtToUsdRateRef.current = price;
            console.log(`OKX: USDT/USD rate updated: ${price}`);
        } catch (error) {
            console.error('OKX: Error fetching USDT/USD rate:', error);
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
            // OKX WebSocket endpoint
            wsRef.current = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');

            wsRef.current.onopen = () => {
                console.log('OKX WebSocket connected');
                isConnectingRef.current = false;
                isConnectedRef.current = true;
                onStatusChange('connected');

                // Start fetching USDT/USD rate immediately and then every 10 seconds
                fetchUsdtToUsdRate();
                usdtRateFetchIntervalRef.current = setInterval(fetchUsdtToUsdRate, 10000);

                // Subscribe to BTC-USDT best bid/offer (bbo-tbt)
                const subscribeMessage = {
                    op: 'subscribe',
                    args: [
                        {
                            channel: 'bbo-tbt',
                            instId: 'BTC-USDT'
                        }
                    ]
                };

                console.log('OKX: Sending subscription message:', subscribeMessage);
                wsRef.current?.send(JSON.stringify(subscribeMessage));

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // console.log('OKX: Received message:', data);

                    // Handle best bid/offer updates
                    if (data.arg?.channel === 'bbo-tbt' && data.arg?.instId === 'BTC-USDT' && data.data?.length > 0) {
                        const bboData = data as OKXBBOData;
                        const tickData = bboData.data[0];

                        if (tickData.bids?.length > 0 && tickData.asks?.length > 0) {
                            // Get best bid and ask (directly from bbo-tbt channel)
                            const bestBid = parseFloat(tickData.bids[0][0]);
                            const bestAsk = parseFloat(tickData.asks[0][0]);
                            const midPriceUSDT = (bestBid + bestAsk) / 2;

                            // Convert USDT to USD using the fetched rate
                            const midPriceUSD = midPriceUSDT * usdtToUsdRateRef.current;

                            console.log(`OKX BBO - Bid: ${bestBid}, Ask: ${bestAsk}, Mid (USDT): ${midPriceUSDT}, Mid (USD): ${midPriceUSD}, USDT/USD Rate: ${usdtToUsdRateRef.current}`);

                            onPriceUpdate({
                                price: midPriceUSD,
                                timestamp: Date.now(),
                                source: 'okx'
                            });
                        }
                    }
                    // Handle subscription confirmations
                    else if (data.event === 'subscribe') {
                        console.log('OKX: Subscription confirmed:', data);
                    }
                    // Handle errors
                    else if (data.event === 'error') {
                        console.error('OKX: Subscription error:', data);
                    }
                } catch (error) {
                    console.error('Error parsing OKX message:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('OKX WebSocket disconnected');
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');

                // Disable automatic reconnection for now to prevent loops
                // reconnectTimeoutRef.current = setTimeout(() => {
                //   connect();
                // }, 5000);
            };

            wsRef.current.onerror = (error) => {
                console.error('OKX WebSocket error:', error);
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');
            };

        } catch (error) {
            console.error('Error creating OKX WebSocket:', error);
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
