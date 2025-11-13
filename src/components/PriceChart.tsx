import React, { useMemo, memo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PricePoint } from '../types';

interface PriceChartProps {
    data: PricePoint[];
}

const PriceChart: React.FC<PriceChartProps> = memo(({ data }) => {
    // State for tracking which lines are visible
    const [visibleLines, setVisibleLines] = useState({
        binance: true,
        coinbase: true,
        pyth: true,
        pythlazer: true,
        okx: true,
        bybit: true
    });

    // Handle legend click to toggle line visibility
    const handleLegendClick = (dataKey: string) => {
        console.log(`Toggling ${dataKey}:`, visibleLines[dataKey as keyof typeof visibleLines], '→', !visibleLines[dataKey as keyof typeof visibleLines]);
        setVisibleLines(prev => ({
            ...prev,
            [dataKey]: !prev[dataKey as keyof typeof prev]
        }));
    };


    // Memoize chart data to prevent unnecessary re-renders
    const chartData = useMemo(() => {
        return data.map(point => ({
            ...point,
            time: new Date(point.timestamp).toLocaleTimeString('en-US', {
                hour12: false,
                minute: '2-digit',
                second: '2-digit'
            })
        }));
    }, [data]);

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) {
            return null;
        }

        return (
            <div className="custom-tooltip">
                <p className="tooltip-time">{`Time: ${label}`}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                        {`${entry.name}: $${entry.value?.toFixed(2) || 'N/A'}`}
                    </p>
                ))}
            </div>
        );
    };

    // Calculate Y-axis domain for better scaling - only consider visible lines
    const yAxisDomain = useMemo(() => {
        const allPrices: number[] = [];

        data.forEach(point => {
            if (point.binance && visibleLines.binance) allPrices.push(point.binance);
            if (point.coinbase && visibleLines.coinbase) allPrices.push(point.coinbase);
            if (point.pyth && visibleLines.pyth) allPrices.push(point.pyth);
            if (point.pythlazer && visibleLines.pythlazer) allPrices.push(point.pythlazer);
            if (point.okx && visibleLines.okx) allPrices.push(point.okx);
            if (point.bybit && visibleLines.bybit) allPrices.push(point.bybit);
        });

        if (allPrices.length === 0) return ['auto', 'auto'];

        const min = Math.min(...allPrices);
        const max = Math.max(...allPrices);
        const padding = (max - min) * 0.02; // 2% padding

        return [min - padding, max + padding];
    }, [data, visibleLines]);

    return (
        <div className="chart-container">
            <h3>Real-time BTC Price (Live Updates)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0, 0, 0, 0.1)"
                    />
                    <XAxis
                        dataKey="time"
                        stroke="rgba(0, 0, 0, 0.7)"
                        fontSize={12}
                        interval="preserveStartEnd"
                        minTickGap={20}
                    />
                    <YAxis
                        stroke="rgba(0, 0, 0, 0.7)"
                        fontSize={12}
                        domain={yAxisDomain}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                            borderRadius: '8px',
                            color: 'black',
                            fontSize: '12px'
                        }}
                    />
                    <Legend content={() => null} />
                    {visibleLines.binance && (
                        <Line
                            type="monotone"
                            dataKey="binance"
                            stroke="#1a1a1a"
                            strokeWidth={2}
                            dot={false}
                            name="Binance"
                            connectNulls={false}
                            isAnimationActive={false}
                        />
                    )}
                    {visibleLines.coinbase && (
                        <Line
                            type="monotone"
                            dataKey="coinbase"
                            stroke="#0052ff"
                            strokeWidth={2}
                            dot={false}
                            name="Coinbase"
                            connectNulls={false}
                            isAnimationActive={false}
                        />
                    )}
                    {visibleLines.pyth && (
                        <Line
                            type="monotone"
                            dataKey="pyth"
                            stroke="#9945ff"
                            strokeWidth={2}
                            dot={false}
                            name="Pyth Core"
                            connectNulls={false}
                            isAnimationActive={false}
                        />
                    )}
                    {visibleLines.pythlazer && (
                        <Line
                            type="monotone"
                            dataKey="pythlazer"
                            stroke="#ff6b9d"
                            strokeWidth={2}
                            dot={false}
                            name="Pyth Pro"
                            connectNulls={false}
                            isAnimationActive={false}
                        />
                    )}
                    {visibleLines.okx && (
                        <Line
                            type="monotone"
                            dataKey="okx"
                            stroke="#00d4aa"
                            strokeWidth={2}
                            dot={false}
                            name="OKX"
                            connectNulls={false}
                            isAnimationActive={false}
                        />
                    )}
                    {visibleLines.bybit && (
                        <Line
                            type="monotone"
                            dataKey="bybit"
                            stroke="#f7931a"
                            strokeWidth={2}
                            dot={false}
                            name="Bybit"
                            connectNulls={false}
                            isAnimationActive={false}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>

            {/* Custom Interactive Legend */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '15px',
                marginTop: '15px',
                marginBottom: '20px',
                paddingBottom: '10px'
            }}>
                {[
                    { dataKey: 'binance', name: 'Binance', color: '#1a1a1a' },
                    { dataKey: 'coinbase', name: 'Coinbase', color: '#0052ff' },
                    { dataKey: 'pyth', name: 'Pyth Core', color: '#9945ff' },
                    { dataKey: 'pythlazer', name: 'Pyth Pro', color: '#ff6b9d' },
                    { dataKey: 'okx', name: 'OKX', color: '#00d4aa' },
                    { dataKey: 'bybit', name: 'Bybit', color: '#f7931a' }
                ].map((item) => (
                    <div
                        key={item.dataKey}
                        onClick={() => {
                            console.log(`Toggling ${item.dataKey}`);
                            handleLegendClick(item.dataKey);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            opacity: visibleLines[item.dataKey as keyof typeof visibleLines] ? 1 : 0.4,
                            transition: 'all 0.2s ease',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: visibleLines[item.dataKey as keyof typeof visibleLines]
                                ? 'rgba(0, 0, 0, 0.05)'
                                : 'rgba(0, 0, 0, 0.02)',
                            textDecoration: visibleLines[item.dataKey as keyof typeof visibleLines]
                                ? 'none'
                                : 'line-through'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <div
                            style={{
                                width: '12px',
                                height: '2px',
                                backgroundColor: item.color,
                                marginRight: '6px',
                                opacity: visibleLines[item.dataKey as keyof typeof visibleLines] ? 1 : 0.3
                            }}
                        />
                        <span style={{
                            fontSize: '14px',
                            color: 'black',
                            fontWeight: visibleLines[item.dataKey as keyof typeof visibleLines] ? 'normal' : '300'
                        }}>
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>

            <style>{`
        .custom-tooltip {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 12px;
          color: black;
          font-size: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .tooltip-time {
          font-weight: bold;
          margin-bottom: 8px;
          color: #000000;
        }

        .recharts-legend-item {
          cursor: pointer !important;
          transition: all 0.2s ease;
          user-select: none;
        }

        .recharts-legend-item:hover {
          opacity: 0.7 !important;
          transform: scale(1.05);
        }

        .recharts-legend-item:active {
          transform: scale(0.95);
        }
      `}</style>
        </div>
    );
});

export default PriceChart;
