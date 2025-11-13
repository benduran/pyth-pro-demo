import React from 'react';

interface PriceCardProps {
    exchangeName: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    status: 'connected' | 'disconnected' | 'connecting';
}

const PriceCard: React.FC<PriceCardProps> = ({
    exchangeName,
    price,
    change,
    changePercent,
    status
}) => {
    const formatPrice = (price: number | null): string => {
        if (price === null) return 'N/A';
        return price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatChange = (change: number | null, changePercent: number | null): string => {
        if (change === null || changePercent === null) return 'N/A';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
    };

    const getChangeClass = (change: number | null): string => {
        if (change === null) return 'price-neutral';
        if (change > 0) return 'price-positive';
        if (change < 0) return 'price-negative';
        return 'price-neutral';
    };

    const getStatusClass = (status: string): string => {
        switch (status) {
            case 'connected':
                return 'status-connected';
            case 'connecting':
                return 'status-connecting';
            default:
                return 'status-disconnected';
        }
    };

    const getStatusText = (status: string): string => {
        switch (status) {
            case 'connected':
                return 'Connected';
            case 'connecting':
                return 'Connecting...';
            default:
                return 'Disconnected';
        }
    };

    return (
        <div className="price-card">
            <h3>
                <span className={`status-indicator ${getStatusClass(status)}`}></span>
                {exchangeName}
            </h3>
            <div className="price-value">
                {formatPrice(price)}
            </div>
            <div className={`price-change ${getChangeClass(change)}`}>
                {formatChange(change, changePercent)}
            </div>
            <div className="status-text" style={{
                fontSize: '0.8rem',
                marginTop: '0.5rem',
                color: 'rgba(255, 255, 255, 0.7)'
            }}>
                {getStatusText(status)}
            </div>
        </div>
    );
};

export default PriceCard;
