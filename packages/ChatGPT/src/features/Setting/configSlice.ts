/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-08 21:11:32
 * @FilePath: /tauri/packages/ChatGPT/src/features/Setting/configSlice.ts
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkAction } from '../../app/types';
import { getConfig } from '@chatgpt/service/config';
import { Config } from './types';

export const configSlice = createSlice({
  name: 'config',
  initialState: {} as Config,
  reducers: {
    setConfig: (state, action: PayloadAction<Config>) => {
      state.apiKey = action.payload.apiKey;
      state.theme = action.payload.theme;
      state.url = action.payload.url;
      state.httpProxy = action.payload.httpProxy;
      state.models = action.payload.models;
      state.temporaryHotkey = action.payload.temporaryHotkey;
    },
  },
  selectors: {
    selectApiKey: (state) => state.apiKey,
    selectModels: (state) => state.models,
    selectConfig: (state) => state,
  },
});
export const { setConfig } = configSlice.actions;

export const { selectApiKey, selectModels, selectConfig } = configSlice.selectors;

export default configSlice.reducer;

export const fetchConfig = (): AppThunkAction => async (dispatch) => {
  const data = await getConfig();
  dispatch(setConfig(data));
};
