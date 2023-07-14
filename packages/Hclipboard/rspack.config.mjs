import { defineConfig } from '@rspack/cli';
import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const port = 1420;

const config = defineConfig({
  entry: {
    main: './src/main.tsx',
  },
  output: {},
  builtins: {
    html: [
      {
        template: './index.html',
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.png$/,
        type: 'asset',
      },
      {
        test: /\.jpg$/,
        type: 'asset',
      },
    ],
  },
  devServer: {
    port,
    host: '0.0.0.0',
    allowedHosts: 'all',
    historyApiFallback: true,
    client: {
      webSocketURL: {
        port,
        hostname: '0.0.0.0',
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  devtool: isProduction ? false : undefined,
  resolve: {
    alias: {
      '@http': resolve(process.cwd(), './src'),
    },
  },
});
export default config;
