import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkAction, type RootState } from '../../app/store';
import { getConfig } from '@chatgpt/service/config';

export enum Theme {
  Dark = 'dark',
  Light = 'light',
  System = 'system',
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

export const fetchConfig = (): AppThunkAction => async (dispatch) => {
  const data = await getConfig();
  dispatch(setConfig(data));
};
