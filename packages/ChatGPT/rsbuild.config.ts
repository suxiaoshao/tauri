/*
 * @Author: suxiaoshao suxiaoshao@gamil.com
 * @Date: 2023-12-18 22:35:51
 * @LastEditors: suxiaoshao suxiaoshao@gamil.com
 * @LastEditTime: 2023-12-19 00:33:14
 */
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
// @ts-ignore
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { resolve } from 'path';
export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 1420,
  },
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  tools: {
    rspack: {
      plugins: [new MonacoWebpackPlugin()],
      resolve: {
        tsConfig: {
          configFile: resolve(__dirname, '../../tsconfig.json'),
          references: 'auto',
        },
      },
    },
  },
});
