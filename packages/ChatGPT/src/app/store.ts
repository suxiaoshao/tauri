import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { themeReducer } from 'theme';
import configReducer, { ConfigSliceType, setConfig } from '../features/Setting/configSlice';
import { conversationReducer } from '@chatgpt/features/Conversations/conversationSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    config: configReducer,
    conversation: conversationReducer,
  },
});
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunkAction<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;

listen<ConfigSliceType>('config', (event) => {
  store.dispatch(setConfig(event.payload));
});

async function setInitDate(): Promise<void> {
  const config = await invoke<ConfigSliceType>('plugin:config|get_config');
  store.dispatch(setConfig(config));
}

setInitDate();
