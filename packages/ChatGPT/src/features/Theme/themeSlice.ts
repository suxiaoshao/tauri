/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-08 21:08:02
 * @FilePath: /tauri/packages/ChatGPT/src/features/Theme/themeSlice.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { RootState } from '@chatgpt/app/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { argbFromHex, themeFromSourceColor, youThemeToMuiTheme } from 'theme';
import { match } from 'ts-pattern';
import { Theme } from '../Setting/types';

export interface ThemeSliceType {
  systemColorScheme: Theme.Dark | Theme.Light;
}
const getColorScheme = (colorSetting: Theme, systemColorScheme: ThemeSliceType['systemColorScheme']) => {
  if (colorSetting === Theme.System) {
    return systemColorScheme;
  }
  return colorSetting;
};

export const colorSchemaMatch = window.matchMedia('(prefers-color-scheme: dark)');

function getInitDate(): ThemeSliceType {
  const systemColorScheme = match(colorSchemaMatch.matches)
    .with(true, () => Theme.Dark as const)
    .with(false, () => Theme.Light as const)
    .exhaustive();
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
