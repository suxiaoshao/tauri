/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 23:31:45
 * @FilePath: /tauri/packages/ChatGPT/src/features/Setting/configSlice.ts
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkAction } from '../../app/store';
import { getConfig } from '@chatgpt/service/config';
import { ChatGptConfig } from '.';

export enum Theme {
  Dark = 'dark',
  Light = 'light',
  System = 'system',
}

export const configSlice = createSlice({
  name: 'config',
  initialState: {} as ChatGptConfig,
  reducers: {
    setConfig: (state, action: PayloadAction<ChatGptConfig>) => {
      state.apiKey = action.payload.apiKey;
      state.theme = action.payload.theme;
      state.url = action.payload.url;
      state.httpProxy = action.payload.httpProxy;
      state.models = action.payload.models;
    },
  },
  selectors: {
    selectApiKey: (state) => state.apiKey,
    selectModels: (state) => state.models,
  },
});
export const { setConfig } = configSlice.actions;

export const { selectApiKey, selectModels } = configSlice.selectors;

export default configSlice.reducer;

export const fetchConfig = (): AppThunkAction => async (dispatch) => {
  const data = await getConfig();
  dispatch(setConfig(data));
};
