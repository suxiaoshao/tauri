/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 19:02:09
 * @FilePath: /tauri/packages/ChatGPT/src/features/Setting/configSlice.ts
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkAction, type RootState } from '../../app/store';
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
      state.http_proxy = action.payload.http_proxy;
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
