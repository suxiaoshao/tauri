import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import themeReducer from '@chatgpt/features/Theme/themeSlice';
import configReducer from '../features/Setting/configSlice';
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
