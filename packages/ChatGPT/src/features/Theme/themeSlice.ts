import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from '../Setting/configSlice';
import { RootState } from '@chatgpt/app/store';
import { argbFromHex, themeFromSourceColor, youThemeToMuiTheme } from 'theme';

export type ThemeSliceType = {
  systemColorScheme: Theme.Dark | Theme.Light;
};
const getColorScheme = (colorSetting: Theme, systemColorScheme: ThemeSliceType['systemColorScheme']) => {
  if (colorSetting === Theme.System) {
    return systemColorScheme;
  }
  return colorSetting;
};

export const colorSchemaMatch = window.matchMedia('(prefers-color-scheme: dark)');

function getInitDate(): ThemeSliceType {
  const systemColorScheme = colorSchemaMatch.matches ? Theme.Dark : Theme.Light;
  return {
    systemColorScheme,
  };
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState: getInitDate(),
  reducers: {
    setSystemColorScheme: (state, action: PayloadAction<ThemeSliceType['systemColorScheme']>) => {
      state.systemColorScheme = action.payload;
    },
  },
});
export const { setSystemColorScheme } = themeSlice.actions;

export const selectColorMode = (state: RootState) =>
  getColorScheme(state.config.theme.theme, state.theme.systemColorScheme);

export const selectActiveYouTheme = (state: RootState) => {
  const colorScheme = selectColorMode(state);
  return themeFromSourceColor(argbFromHex(state.config.theme.color)).schemes[colorScheme];
};

export const selectMuiTheme = (state: RootState) => {
  const colorScheme = selectColorMode(state);
  const youTheme = selectActiveYouTheme(state);
  return youThemeToMuiTheme(youTheme, colorScheme);
};

export default themeSlice.reducer;
