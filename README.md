# BTC Price Monitor 🚀

A real-time Bitcoin (BTC) price monitoring application that fetches live price data from multiple exchanges and displays it in an interactive chart.

## Features

- **Real-time Price Feeds**: Connects to three major data sources:

  - **Binance** (BTC/USDT)
  - **Coinbase** (BTC-USD)
  - **Pyth Network** (BTC/USD)

- **Live Chart**: Interactive line chart showing the last 60 seconds of price data
- **Price Cards**: Display current prices with change indicators for each exchange
- **Connection Status**: Visual indicators showing WebSocket connection status
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **High-Performance**: Optimized for high-frequency updates with data aggregation

## Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Recharts** for data visualization
- **WebSocket APIs** for real-time data streaming
- **Modern CSS** with responsive design

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- pnpm or yarn
- pyth_lazer auth token (required for pyth_lazer WebSocket connection)

### Installation

1. Clone or download this project
2. Navigate to the project directory:

   ```bash
   cd btc-demo
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Create a `.env` file in the project root and add your pyth_lazer auth token:

   ```bash
   VITE_PYTH_LAZER_AUTH_TOKEN=your_auth_token_here
   ```

5. Start the development server:

   ```bash
   pnpm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
pnpm run build
```

## How It Works

### Data Sources

1. **Binance WebSocket**: Connects to `wss://stream.binance.com:9443/ws/btcusdt@ticker`
2. **Coinbase WebSocket**: Connects to `wss://ws-feed.exchange.coinbase.com`
3. **Pyth Network**: Connects to `wss://hermes.pyth.network/ws` for decentralized price feeds
4. **Pyth Pro**: Connects to `wss://pyth-lazer.dourolabs.app/v1/stream` for real-time price feeds
5. **OKX**: Connects to `wss://ws.okx.com:8443/ws/v5/public` for real-time price feeds
6. **Bybit**: Connects to `wss://stream.bybit.com/v5/public` for real-time price feeds

### Performance Optimizations

- **Data Aggregation**: High-frequency price updates are aggregated into 1-second intervals
- **Memory Management**: Chart data is limited to 60 data points (1 minute window)
- **Efficient Rendering**: Chart animations are disabled for smooth real-time updates
- **Memoization**: React components use memoization to prevent unnecessary re-renders

### Chart Features

- Shows prices from all three exchanges in different colors
- 1-minute sliding window of data
- Real-time updates without animation lag
- Responsive design for different screen sizes
- Custom tooltips with formatted price information

## WebSocket Connection Details

The application handles WebSocket connections with:

- Automatic reconnection on disconnect
- Connection status indicators
- Error handling and recovery
- Clean disconnection on component unmount

## Troubleshooting

If you experience issues:

1. **WebSocket Connection Errors**: Check your internet connection and firewall settings
2. **Chart Not Updating**: Ensure WebSocket connections are established (check connection indicators)
3. **Performance Issues**: The app is optimized for high-frequency updates, but very slow devices might need to reduce update frequency

## License

This project is for demonstration purposes. Please check the terms of service of each data provider before using in production.
