/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 11:38:39
 * @FilePath: /tauri/packages/ChatGPT/rspack.config.mjs
 */
import { defineConfig } from '@rspack/cli';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const port = 1420;

const config = defineConfig({
  entry: {
    main: './src/main.tsx',
  },
  output: {
    clean: isProduction,
    publicPath: '/',
  },
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
    tsConfig: {
      configFile: resolve(__dirname, '../../tsconfig.json'),
      references: 'auto',
    },
  },
  experiments: {
    rspackFuture: {
      newResolver: true,
    },
  },
  plugins: [new MonacoWebpackPlugin()],
});
export default config;
