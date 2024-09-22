/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-08 21:11:32
 * @FilePath: /tauri/packages/ChatGPT/src/features/Setting/configSlice.ts
 */
import { create } from 'zustand';
import { getConfig } from '@chatgpt/service/config';
import { Config, Theme } from './types';

interface ConfigState extends Config {
  setConfig: (config: Config) => void;
  fetchConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  apiKey: null,
  theme: {
    color: '#3271ae',
    theme: Theme.System,
  },
  url: null,
  httpProxy: '',
  models: [],
  temporaryHotkey: '',
  setConfig: (config: Config) => set(config),
  fetchConfig: async () => {
    const data = await getConfig();
    set(data);
  },
}));

export const selectApiKey = (state: ConfigState) => state.apiKey;
export const selectModels = (state: ConfigState) => state.models;
export const selectConfig = (state: ConfigState) => state;
