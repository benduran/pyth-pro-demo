# BTC Price Monitor 🚀

A real-time Bitcoin (BTC) price monitoring application that fetches live price data from multiple exchanges and displays it in an interactive chart.

## Features

- **Real-time Price Feeds**: Connects to the following data sources:

  - **Crypto (BTC/USDT or ETH/USDT)**
    - Binance
    - Coinbase
    - Pyth Network
    - Pyth Pro
    - OKX
    - Bybit
  - **Equities (AAPL, NVDA or TSLA)**
    - [infoway.io](https://infoway.io/)
    - [twelvedata](http://twelvedata.com/) (NOTE: Trial API key only supports `AAPL`)
    - Pyth Network
    - Pyth Pro
  - **Forex (EURUSD)**
    - [infoway.io](https://infoway.io/)
    - [PrimeAPI](https://primeapi.io/)
    - Pyth Network
    - Pyth Pro
  - **Treasuries (US10Y)**
    - Pyth Network
    - Pyth Pro

- **Live Chart**: Interactive line chart showing the last 60 seconds of price data
- **Price Cards**: Display current prices with change indicators for each exchange
- **Connection Status**: Visual indicators showing WebSocket connection status
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **High-Performance**: Optimized for high-frequency updates with data aggregation

## Technologies Used

- **React 19** with TypeScript
- **Vite** for fast development and building
- **chart.js** for high-performance, canvas-based data visualization
- **WebSocket APIs** for real-time data streaming
- **Modern CSS** with responsive design

## Getting Started

### Prerequisites

- bun (version 1.3.2 as defined in `.tool-versions`)
- API tokens for external providers (see [API Tokens](#api-tokens))

### Installation

1. Clone or download this project
2. Navigate to the project directory:

   ```bash
   cd btc-demo
   ```

3. Install dependencies:

   ```bash
   bun install
   ```

4. Create a `.env` file in the project root and set the required tokens ([see below](#api-tokens)).

5. Start the development server:

   ```bash
   bun run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Local Development with mise

1. Install [mise](https://mise.jdx.dev) if you do not already have it available.
2. From the project root, run `mise install` to install the tool versions specified in `.tool-versions`.
3. Start a shell with `mise shell` (or `mise env -s bash`/`zsh`) so the managed toolchain is on your `PATH`.
4. Inside that shell, run the usual project commands such as `bun install`, `bun run dev`, or `bun run build`.

### API Tokens

Several external providers require API tokens. Add the following entries to your `.env` file (or configure them in your environment) before running the app:

```bash
VITE_API_TOKEN_PYTH_LAZER=your_pyth_lazer_token
VITE_API_TOKEN_PRIME_API=your_prime_api_token
VITE_API_TOKEN_INFOWAY=your_infoway_token
VITE_API_TOKEN_TWELVE_DATA=your_twelve_data_token
```

Tokens that are not needed for your setup can be left unset, but the corresponding feeds will remain inactive.

### Build for Production

```bash
bun build
```

## Troubleshooting

If you experience issues:

1. **WebSocket Connection Errors**: Check your internet connection and firewall settings
2. **Chart Not Updating**: Ensure WebSocket connections are established (check connection indicators)
3. **Performance Issues**: The app is optimized for high-frequency updates, but very slow devices might need to reduce update frequency

## License

This project is for demonstration purposes. Please check the terms of service of each data provider before using in production.
