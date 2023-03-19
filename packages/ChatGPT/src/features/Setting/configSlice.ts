import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from '../../app/store';

export type ConfigSliceType = {
  api_key?: string | null;
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {} as ConfigSliceType,
  reducers: {
    setConfig: (state, action: PayloadAction<ConfigSliceType>) => {
      state.api_key = action.payload.api_key;
    },
  },
});
export const { setConfig } = themeSlice.actions;

export const selectApiKey = (state: RootState) => state.config.api_key;

export default themeSlice.reducer;
