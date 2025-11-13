import { useState, useCallback, useRef, useEffect } from 'react';
import { PriceData, PricePoint, CurrentPrices, ExchangeStatus } from '../types';

const CHART_DATA_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_DATA_POINTS = 3000; // Maximum points to keep (increased for real-time updates)
const THROTTLE_INTERVAL = 1; // Minimum 1ms between chart updates for performance

export const usePriceDataManager = () => {
    const [chartData, setChartData] = useState<PricePoint[]>([]);
    const [currentPrices, setCurrentPrices] = useState<CurrentPrices>({
        binance: null,
        coinbase: null,
        pyth: null,
        pythlazer: null,
        okx: null,
        bybit: null
    });
    const [exchangeStatus, setExchangeStatus] = useState<ExchangeStatus>({
        binance: 'disconnected',
        coinbase: 'disconnected',
        pyth: 'disconnected',
        pythlazer: 'disconnected',
        okx: 'disconnected',
        bybit: 'disconnected'
    });

    // Store previous prices for change calculation
    const previousPricesRef = useRef<{
        binance?: number;
        coinbase?: number;
        pyth?: number;
        pythlazer?: number;
        okx?: number;
        bybit?: number;
    }>({});

    // Last chart update timestamp for throttling
    const lastChartUpdateRef = useRef<number>(0);

    // Keep track of the latest price for each exchange
    const latestPricesRef = useRef<{
        binance?: number;
        coinbase?: number;
        pyth?: number;
        pythlazer?: number;
        okx?: number;
        bybit?: number;
    }>({});

    // Real-time chart update function with throttling
    const updateChartData = useCallback((timestamp: number, source: keyof typeof latestPricesRef.current, price: number) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastChartUpdateRef.current;

        // Throttle updates to maintain performance (minimum 50ms between updates)
        if (timeSinceLastUpdate < THROTTLE_INTERVAL) {
            return;
        }

        // Update the latest price for this source
        latestPricesRef.current[source] = price;

        // Create new data point with current prices from all sources
        const newPoint: PricePoint = {
            timestamp: timestamp,
            binance: latestPricesRef.current.binance,
            coinbase: latestPricesRef.current.coinbase,
            pyth: latestPricesRef.current.pyth,
            pythlazer: latestPricesRef.current.pythlazer,
            okx: latestPricesRef.current.okx,
            bybit: latestPricesRef.current.bybit
        };

        setChartData(prevData => {
            const newData = [...prevData, newPoint];

            // Remove old data points beyond the time window
            const cutoffTime = now - CHART_DATA_WINDOW;
            const filteredData = newData.filter(point => point.timestamp > cutoffTime);

            // Limit to maximum data points for performance
            return filteredData.slice(-MAX_DATA_POINTS);
        });

        lastChartUpdateRef.current = now;
    }, []);

    // Handle new price data
    const handlePriceUpdate = useCallback((data: PriceData) => {
        const { source, price, timestamp } = data;
        const previousPrice = previousPricesRef.current[source] || price;
        const change = price - previousPrice;
        const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

        // Update current prices
        setCurrentPrices(prev => ({
            ...prev,
            [source]: {
                price,
                change,
                changePercent
            }
        }));

        // Store current price for next comparison
        previousPricesRef.current[source] = price;

        // Update chart data immediately (with throttling)
        updateChartData(timestamp, source, price);
    }, [updateChartData]);

    // Handle exchange status changes
    const handleStatusChange = useCallback((source: keyof ExchangeStatus, status: 'connected' | 'disconnected' | 'connecting') => {
        setExchangeStatus(prev => ({
            ...prev,
            [source]: status
        }));
    }, []);

    // No longer needed - we update in real-time now

    // Clean up old data periodically
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = Date.now();
            const cutoffTime = now - CHART_DATA_WINDOW;

            setChartData(prevData =>
                prevData.filter(point => point.timestamp > cutoffTime)
            );
        }, 10000); // Clean up every 10 seconds

        return () => clearInterval(cleanup);
    }, []);

    return {
        chartData,
        currentPrices,
        exchangeStatus,
        handlePriceUpdate,
        handleStatusChange
    };
};
