/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 23:37:06
 * @FilePath: /tauri/packages/ChatGPT/src/app/store.ts
 */
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '@chatgpt/features/Theme/themeSlice';
import configReducer from '../features/Setting/configSlice';
import templateReducer from '../features/Template/templateSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    config: configReducer,
    template: templateReducer,
  },
});
export default store;
