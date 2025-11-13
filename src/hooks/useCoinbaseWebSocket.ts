import { useEffect, useRef, useCallback } from 'react';
import { PriceData } from '../types';

interface CoinbaseAdvancedTradeLevel2Message {
    channel: string;
    client_id: string;
    timestamp: string;
    sequence_num: number;
    events: Array<{
        type: string;
        product_id: string;
        updates: Array<{
            side: string; // "bid" or "offer"
            event_time: string;
            price_level: string;
            new_quantity: string;
        }>;
    }>;
}

interface CoinbaseLevel2Snapshot {
    channel: string;
    client_id: string;
    timestamp: string;
    sequence_num: number;
    events: Array<{
        type: string;
        product_id: string;
        bids: Array<{
            price_level: string;
            new_quantity: string;
        }>;
        asks: Array<{
            price_level: string;
            new_quantity: string;
        }>;
    }>;
}

export const useCoinbaseWebSocket = (
    onPriceUpdate: (data: PriceData) => void,
    onStatusChange: (status: 'connected' | 'disconnected' | 'connecting') => void
) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectedRef = useRef(false);
    const isConnectingRef = useRef(false);

    // Maintain local orderbook state for best bid/ask
    const orderbookRef = useRef<{
        bids: Map<string, string>; // price -> quantity
        asks: Map<string, string>; // price -> quantity
    }>({
        bids: new Map(),
        asks: new Map()
    });

    // Helper function to calculate mid-price from orderbook
    const calculateMidPrice = useCallback(() => {
        const bids = orderbookRef.current.bids;
        const asks = orderbookRef.current.asks;

        if (bids.size === 0 || asks.size === 0) {
            return null;
        }

        // Get best bid (highest price)
        const bestBidPrice = Math.max(...Array.from(bids.keys()).map(Number));
        // Get best ask (lowest price)
        const bestAskPrice = Math.min(...Array.from(asks.keys()).map(Number));

        if (isFinite(bestBidPrice) && isFinite(bestAskPrice)) {
            const midPrice = (bestBidPrice + bestAskPrice) / 2;
            // console.log(`Coinbase L2 - Best Bid: ${bestBidPrice}, Best Ask: ${bestAskPrice}, Mid: ${midPrice}`);
            return midPrice;
        }

        return null;
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
            wsRef.current = new WebSocket('wss://advanced-trade-ws.coinbase.com');

            wsRef.current.onopen = () => {
                console.log('Coinbase Advanced Trade WebSocket connected');
                isConnectingRef.current = false;

                // Subscribe to BTC-USD level2 (orderbook) using Advanced Trade API format
                const subscribeMessage = {
                    type: 'subscribe',
                    product_ids: ['BTC-USD'],
                    channel: 'level2'
                };

                console.log('Coinbase Advanced Trade: Sending subscription message:', subscribeMessage);
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
                    // console.log('Coinbase: Received message type:', data.channel, 'events:', data.events?.length);

                    // Handle Advanced Trade level2 orderbook messages
                    if (data.channel === 'l2_data' && data.events) {
                        for (const event of data.events) {
                            // console.log('Coinbase: Processing event type:', event.type, 'for product:', event.product_id);
                            if (event.product_id === 'BTC-USD') {
                                // Handle snapshot (initial orderbook state)
                                if (event.type === 'snapshot') {
                                    const snapshotEvent = event as CoinbaseLevel2Snapshot['events'][0];

                                    // Clear existing orderbook
                                    orderbookRef.current.bids.clear();
                                    orderbookRef.current.asks.clear();

                                    // Load bids
                                    if (snapshotEvent.bids) {
                                        for (const bid of snapshotEvent.bids) {
                                            if (parseFloat(bid.new_quantity) > 0) {
                                                orderbookRef.current.bids.set(bid.price_level, bid.new_quantity);
                                            }
                                        }
                                    }

                                    // Load asks
                                    if (snapshotEvent.asks) {
                                        for (const ask of snapshotEvent.asks) {
                                            if (parseFloat(ask.new_quantity) > 0) {
                                                orderbookRef.current.asks.set(ask.price_level, ask.new_quantity);
                                            }
                                        }
                                    }

                                    //console.log('Coinbase: Loaded orderbook snapshot');

                                    // Calculate and emit price after snapshot
                                    const midPrice = calculateMidPrice();
                                    if (midPrice !== null) {
                                        onPriceUpdate({
                                            price: midPrice,
                                            timestamp: Date.now(),
                                            source: 'coinbase'
                                        });
                                    }
                                }
                                // Handle updates (incremental changes)
                                else if (event.type === 'update') {
                                    const updateEvent = event as CoinbaseAdvancedTradeLevel2Message['events'][0];

                                    if (updateEvent.updates) {
                                        for (const update of updateEvent.updates) {
                                            const quantity = parseFloat(update.new_quantity);

                                            if (update.side === 'bid') {
                                                if (quantity === 0) {
                                                    // Remove the price level
                                                    orderbookRef.current.bids.delete(update.price_level);
                                                } else {
                                                    // Update the price level
                                                    orderbookRef.current.bids.set(update.price_level, update.new_quantity);
                                                }
                                            } else if (update.side === 'offer') {
                                                if (quantity === 0) {
                                                    // Remove the price level
                                                    orderbookRef.current.asks.delete(update.price_level);
                                                } else {
                                                    // Update the price level
                                                    orderbookRef.current.asks.set(update.price_level, update.new_quantity);
                                                }
                                            }
                                        }

                                        // Calculate and emit price after updates
                                        const midPrice = calculateMidPrice();
                                        if (midPrice !== null) {
                                            onPriceUpdate({
                                                price: midPrice,
                                                timestamp: Date.now(),
                                                source: 'coinbase'
                                            });
                                        } else {
                                            console.log('Coinbase: midPrice is null - bids:', orderbookRef.current.bids.size, 'asks:', orderbookRef.current.asks.size);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // Handle subscription confirmations
                    else if (data.type === 'subscriptions') {
                        console.log('Coinbase: Subscription confirmed:', data);
                    }
                    // Handle errors
                    else if (data.type === 'error') {
                        console.error('Coinbase: Subscription error:', data);
                    }
                } catch (error) {
                    console.error('Error parsing Coinbase message:', error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('Coinbase Advanced Trade WebSocket disconnected');
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');

                // Disable automatic reconnection for now to prevent loops
                // reconnectTimeoutRef.current = setTimeout(() => {
                //   connect();
                // }, 5000);
            };

            wsRef.current.onerror = (error) => {
                console.error('Coinbase Advanced Trade WebSocket error:', error);
                console.error('Coinbase Advanced Trade WebSocket readyState:', wsRef.current?.readyState);
                isConnectingRef.current = false;
                isConnectedRef.current = false;
                onStatusChange('disconnected');
            };

        } catch (error) {
            console.error('Error creating Coinbase Advanced Trade WebSocket:', error);
            isConnectingRef.current = false;
            isConnectedRef.current = false;
            onStatusChange('disconnected');

            // Disable automatic retry for now to prevent loops
            // reconnectTimeoutRef.current = setTimeout(() => {
            //   connect();
            // }, 5000);
        }
    }, [onPriceUpdate, onStatusChange, calculateMidPrice]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Clear orderbook state
        orderbookRef.current.bids.clear();
        orderbookRef.current.asks.clear();

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
