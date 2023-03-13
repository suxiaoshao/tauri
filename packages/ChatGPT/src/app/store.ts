import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { themeReducer } from 'theme';
import configReducer from '../features/Setting/configSlice';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    config: configReducer,
  },
});
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type AppThunkAction<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;
