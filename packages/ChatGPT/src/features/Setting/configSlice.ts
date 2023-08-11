import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from '../../app/store';

export enum Theme {
  Dark = 'Dark',
  Light = 'Light',
  System = 'System',
}

interface ThemeOption {
  theme: Theme;
  color: string;
}

export type ConfigSliceType = {
  apiKey?: string;
  theme: ThemeOption;
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {} as ConfigSliceType,
  reducers: {
    setConfig: (state, action: PayloadAction<ConfigSliceType>) => {
      state.apiKey = action.payload.apiKey;
      state.theme = action.payload.theme;
    },
  },
});
export const { setConfig } = themeSlice.actions;

export const selectApiKey = (state: RootState) => state.config.apiKey;

export default themeSlice.reducer;
