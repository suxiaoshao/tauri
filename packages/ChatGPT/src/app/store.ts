/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 23:37:06
 * @FilePath: /tauri/packages/ChatGPT/src/app/store.ts
 */
import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import themeReducer from '@chatgpt/features/Theme/themeSlice';
import configReducer from '../features/Setting/configSlice';
import templateReducer from '../features/Template/templateSlice';
import { conversationReducer } from '@chatgpt/features/Conversations/conversationSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    config: configReducer,
    conversation: conversationReducer,
    template: templateReducer,
  },
});
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunkAction<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;
