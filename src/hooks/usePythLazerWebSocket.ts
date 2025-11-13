import { useEffect, useRef, useCallback } from 'react';
import { PriceData } from '../types';

interface PythLazerStreamUpdate {
    type: string;
    subscriptionId: number;
    parsed: {
        timestampUs: string;
        priceFeeds: Array<{
            priceFeedId: number;
            price: string;
        }>;
    };
}

// Pyth Lazer configuration
const PYTH_LAZER_ENDPOINT = 'wss://pyth-lazer.dourolabs.app/v1/stream';
const PYTH_LAZER_AUTH_TOKEN = import.meta.env.VITE_PYTH_LAZER_AUTH_TOKEN;
const BTC_PRICE_FEED_ID = 1;

export const usePythLazerWebSocket = (
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
            // Create WebSocket connection with auth token
            const wsUrl = `${PYTH_LAZER_ENDPOINT}?ACCESS_TOKEN=${PYTH_LAZER_AUTH_TOKEN}`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('Pyth Lazer WebSocket connected');
                isConnectingRef.current = false;
                isConnectedRef.current = true;
                onStatusChange('connected');

                // Subscribe to BTC price feed
                const subscribeMessage = {
                    subscriptionId: 1,
                    type: 'subscribe',
                    priceFeedIds: [BTC_PRICE_FEED_ID],
                    properties: ['price'],
                    chains: [],
                    channel: 'real_time'
                };

                console.log('Pyth Lazer: Sending subscription message:', subscribeMessage);
                wsRef.current?.send(JSON.stringify(subscribeMessage));

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // console.log('Pyth Lazer: Received message:', data.type, data);

                    // Handle stream updates
                    if (data.type === 'streamUpdated' && data.subscriptionId === 1) {
                        const updateData = data as PythLazerStreamUpdate;

                        if (updateData.parsed?.priceFeeds?.length > 0) {
                            const priceFeed = updateData.parsed.priceFeeds[0];

                            if (priceFeed.priceFeedId === BTC_PRICE_FEED_ID) {
                                // Pyth Lazer price has 8 decimal places precision, convert to dollars
                                const priceRaw = parseFloat(priceFeed.price);
                                const priceInDollars = priceRaw / 100000000; // Divide by 10^

                                //console.log(`Pyth Lazer BTC price: ${priceInDollars} (raw: ${priceFeed.price})`);

                                onPriceUpdate({
                                    price: priceInDollars,
                                    timestamp: Date.now(),
                                    source: 'pythlazer'
                                });
                            }
                        }
                    }
                    // Handle subscription confirmations or other messages
                    else if (data.type === 'subscribed') {
                        console.log('Pyth Lazer: Subscription confirmed:', data);
                    }
                    else if (data.type === 'error') {
                        console.error('Pyth Lazer: Error:', data);
                    }
                } catch (error) {
                    console.error('Error parsing Pyth Lazer message:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('Pyth Lazer WebSocket disconnected');
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');

                // Disable automatic reconnection for now to prevent loops
                // reconnectTimeoutRef.current = setTimeout(() => {
                //   connect();
                // }, 5000);
            };

            wsRef.current.onerror = (error) => {
                console.error('Pyth Lazer WebSocket error:', error);
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');
            };

        } catch (error) {
            console.error('Error creating Pyth Lazer WebSocket:', error);
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
