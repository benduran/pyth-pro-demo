import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [checker({ typescript: true }), react()],
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'frances-unpuckered-unnormally.ngrok-free.app'],
  },
});
