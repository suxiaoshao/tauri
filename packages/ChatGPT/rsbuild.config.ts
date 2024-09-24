/*
 * @Author: suxiaoshao suxiaoshao@gamil.com
 * @Date: 2023-12-18 22:35:51
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 04:46:36
 */
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 1420,
  },
  dev: {
    lazyCompilation: true,
  },
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
  tools: {
    rspack: {
      resolve: {
        tsConfig: {
          configFile: resolve(__dirname, '../../tsconfig.json'),
          references: 'auto',
        },
      },
    },
    bundlerChain: (chain) => {
      if (process.env.RSDOCTOR) {
        chain.plugin('rsdoctor').use(new RsdoctorRspackPlugin());
      }
      if (process.env.NODE_ENV === 'development') {
        chain.plugin('code-inspector').use(codeInspectorPlugin({ bundler: 'rspack' }));
      }
    },
  },
});
