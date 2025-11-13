import { useEffect, useRef, useCallback } from 'react';
import { PriceData } from '../types';

interface PythPriceUpdateMessage {
    type: string;
    price_feed: {
        id: string;
        price: {
            price: string;
            conf: string;
            expo: number;
            publish_time: number;
        };
        ema_price: {
            price: string;
            conf: string;
            expo: number;
            publish_time: number;
        };
    };
}

// BTC/USD price feed ID from Pyth Network (without 0x prefix for subscription)
const BTC_USD_PRICE_FEED_ID = 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43';

export const usePythWebSocket = (
    onPriceUpdate: (data: PriceData) => void,
    onStatusChange: (status: 'connected' | 'disconnected' | 'connecting') => void
) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectedRef = useRef(false);
    const isConnectingRef = useRef(false);

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
            // Using Pyth's WebSocket endpoint for price streaming
            wsRef.current = new WebSocket('wss://hermes.pyth.network/ws');

            wsRef.current.onopen = () => {
                console.log('Pyth WebSocket connected');
                isConnectingRef.current = false;

                // Subscribe to BTC/USD price feed
                const subscribeMessage = {
                    type: 'subscribe',
                    ids: [BTC_USD_PRICE_FEED_ID]
                };

                wsRef.current?.send(JSON.stringify(subscribeMessage));
                isConnectedRef.current = true;
                onStatusChange('connected');

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Handle subscription confirmation
                    if (data.result === 'success') {
                        console.log('Pyth subscription confirmed');
                        return;
                    }

                    // Handle price updates
                    if (data.type === 'price_update' && data.price_feed) {
                        const priceUpdateData = data as PythPriceUpdateMessage;
                        const priceFeed = priceUpdateData.price_feed;

                        // Check if this is the BTC/USD feed
                        if (priceFeed.id === BTC_USD_PRICE_FEED_ID && priceFeed.price) {
                            // Convert price with exponent: price * 10^expo
                            const price = parseFloat(priceFeed.price.price) * Math.pow(10, priceFeed.price.expo);

                            //console.log('Pyth BTC price:', price);

                            onPriceUpdate({
                                price: price,
                                timestamp: Date.now(),
                                source: 'pyth'
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error parsing Pyth message:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('Pyth WebSocket disconnected');
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');

                // Disable automatic reconnection for now to prevent loops
                // reconnectTimeoutRef.current = setTimeout(() => {
                //   connect();
                // }, 5000);
            };

            wsRef.current.onerror = (error) => {
                console.error('Pyth WebSocket error:', error);
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');
            };

        } catch (error) {
            console.error('Error creating Pyth WebSocket:', error);
            isConnectingRef.current = false;
            isConnectedRef.current = false;
            onStatusChange('disconnected');

            // Disable automatic retry for now to prevent loops
            // reconnectTimeoutRef.current = setTimeout(() => {
            //   connect();
            // }, 5000);
        }
    }, [onPriceUpdate, onStatusChange]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
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
