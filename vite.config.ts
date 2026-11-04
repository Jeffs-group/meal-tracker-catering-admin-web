import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isHttps = process.env.HTTPS === 'true' || mode === 'https';

  return {
    plugins: [
      react(),
      ...(isHttps ? [basicSsl()] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 3000,
      open: false,
    },
  };
});

