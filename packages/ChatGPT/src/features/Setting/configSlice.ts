/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:38:20
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

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {} as ChatGptConfig,
  reducers: {
    setConfig: (state, action: PayloadAction<ChatGptConfig>) => {
      state.apiKey = action.payload.apiKey;
      state.theme = action.payload.theme;
      state.url = action.payload.url;
      state.http_proxy = action.payload.http_proxy;
    },
  },
});
export const { setConfig } = themeSlice.actions;

export const selectApiKey = (state: RootState) => state.config.apiKey;

export default themeSlice.reducer;

export const fetchConfig = (): AppThunkAction => async (dispatch) => {
  const data = await getConfig();
  dispatch(setConfig(data));
};
