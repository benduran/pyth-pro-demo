import React from 'react';
import PriceChart from './components/PriceChart';
import PriceCard from './components/PriceCard';
import { usePriceDataManager } from './hooks/usePriceDataManager';
import { useBinanceWebSocket } from './hooks/useBinanceWebSocket';
import { useCoinbaseWebSocket } from './hooks/useCoinbaseWebSocket';
import { usePythWebSocket } from './hooks/usePythWebSocket';
import { usePythLazerWebSocket } from './hooks/usePythLazerWebSocket';
import { useOKXWebSocket } from './hooks/useOKXWebSocket';
import { useBybitWebSocket } from './hooks/useBybitWebSocket';

const App: React.FC = () => {
    const {
        chartData,
        currentPrices,
        exchangeStatus,
        handlePriceUpdate,
        handleStatusChange
    } = usePriceDataManager();

    // Initialize WebSocket connections
    useBinanceWebSocket(
        handlePriceUpdate,
        (status) => handleStatusChange('binance', status)
    );

    useCoinbaseWebSocket(
        handlePriceUpdate,
        (status) => handleStatusChange('coinbase', status)
    );

    usePythWebSocket(
        handlePriceUpdate,
        (status) => handleStatusChange('pyth', status)
    );

    usePythLazerWebSocket(
        handlePriceUpdate,
        (status) => handleStatusChange('pythlazer', status)
    );

    useOKXWebSocket(
        handlePriceUpdate,
        (status) => handleStatusChange('okx', status)
    );

    useBybitWebSocket(
        handlePriceUpdate,
        (status) => handleStatusChange('bybit', status)
    );

    return (
        <div className="app-container">
            <div className="header">
                <h1>🚀 BTC Price Monitor</h1>
                <p style={{
                    margin: '0.5rem 0 0 0',
                    color: 'rgba(0, 0, 0, 0.8)',
                    fontSize: '1.1rem'
                }}>
                    Real-time Bitcoin prices from multiple exchanges
                </p>
            </div>

            <div className="price-cards">
                <PriceCard
                    exchangeName="Binance"
                    price={currentPrices.binance?.price || null}
                    change={currentPrices.binance?.change || null}
                    changePercent={currentPrices.binance?.changePercent || null}
                    status={exchangeStatus.binance}
                />
                <PriceCard
                    exchangeName="Coinbase"
                    price={currentPrices.coinbase?.price || null}
                    change={currentPrices.coinbase?.change || null}
                    changePercent={currentPrices.coinbase?.changePercent || null}
                    status={exchangeStatus.coinbase}
                />
                <PriceCard
                    exchangeName="Pyth Core"
                    price={currentPrices.pyth?.price || null}
                    change={currentPrices.pyth?.change || null}
                    changePercent={currentPrices.pyth?.changePercent || null}
                    status={exchangeStatus.pyth}
                />
                <PriceCard
                    exchangeName="Pyth Pro"
                    price={currentPrices.pythlazer?.price || null}
                    change={currentPrices.pythlazer?.change || null}
                    changePercent={currentPrices.pythlazer?.changePercent || null}
                    status={exchangeStatus.pythlazer}
                />
                <PriceCard
                    exchangeName="OKX"
                    price={currentPrices.okx?.price || null}
                    change={currentPrices.okx?.change || null}
                    changePercent={currentPrices.okx?.changePercent || null}
                    status={exchangeStatus.okx}
                />
                <PriceCard
                    exchangeName="Bybit"
                    price={currentPrices.bybit?.price || null}
                    change={currentPrices.bybit?.change || null}
                    changePercent={currentPrices.bybit?.changePercent || null}
                    status={exchangeStatus.bybit}
                />
            </div>

            <PriceChart data={chartData} />

            <div style={{
                marginTop: '7rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'rgba(0, 0, 0, 0.6)'
            }}>
                <p>Chart shows the last 60 seconds of price data • Updates in real-time</p>
                <p>
                    Data sources:
                    <span style={{ color: '#1a1a1a', marginLeft: '0.5rem' }}>Binance</span>
                    <span style={{ color: '#0052ff', marginLeft: '0.5rem' }}>Coinbase</span>
                    <span style={{ color: '#9945ff', marginLeft: '0.5rem' }}>Pyth Core</span>
                    <span style={{ color: '#ff6b9d', marginLeft: '0.5rem' }}>Pyth Pro</span>
                    <span style={{ color: '#00d4aa', marginLeft: '0.5rem' }}>OKX</span>
                    <span style={{ color: '#f7931a', marginLeft: '0.5rem' }}>Bybit</span>
                </p>
            </div>
        </div>
    );
};

export default App;
