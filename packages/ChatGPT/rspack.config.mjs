/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gamil.com
 * @LastEditTime: 2023-11-13 22:40:18
 * @FilePath: /tauri/packages/ChatGPT/rspack.config.mjs
 */
import { defineConfig } from '@rspack/cli';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import HtmlPlugin from '@rspack/plugin-html';

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
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            sourceMap: true,
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: !isProduction,
                  refresh: !isProduction,
                },
              },
            },
          },
        },
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
      disableTransformByDefault: true,
    },
  },
  plugins: [
    ...(isProduction ? [] : [new ReactRefreshPlugin()]),
    new MonacoWebpackPlugin({}),
    new HtmlPlugin.default({
      template: './index.html',
      chunks: ['main'],
    }),
  ],
});
export default config;
