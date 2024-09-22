/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:30:54
 * @FilePath: /tauri/common/theme/src/themeSlice.ts
 */
import { argbFromHex, themeFromSourceColor } from '@material/material-color-utilities';
import { createSlice, EnhancedStore, PayloadAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { match } from 'ts-pattern';
import { youThemeToMuiTheme } from './utils/youTheme';

export interface ThemeSliceType {
  color: string;
  colorSetting: 'dark' | 'light' | 'system';
  systemColorScheme: 'light' | 'dark';
}
const getColorScheme = (
  colorSetting: ThemeSliceType['colorSetting'],
  systemColorScheme: ThemeSliceType['systemColorScheme'],
) => {
  if (colorSetting === 'system') {
    return systemColorScheme;
  }
  return colorSetting;
};

export const colorSchemaMatch = window.matchMedia('(prefers-color-scheme: dark)');

function getInitDate(): ThemeSliceType {
  const color = window.localStorage.getItem('color') ?? '#9cd67e';
  const colorSetting = (window.localStorage.getItem('colorSetting') ?? 'system') as ThemeSliceType['colorSetting'];

  const systemColorScheme = match(colorSchemaMatch.matches)
    .with(true, () => 'dark' as const)
    .otherwise(() => 'light' as const);
  window.localStorage.setItem('color', color);
  window.localStorage.setItem('colorSetting', colorSetting);
  return {
    color,
    colorSetting,
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
    updateColor(state, action: PayloadAction<Pick<ThemeSliceType, 'color' | 'colorSetting'>>) {
      const { color, colorSetting } = action.payload;
      state.color = color;
      window.localStorage.setItem('color', color);
      state.colorSetting = colorSetting;
      window.localStorage.setItem('colorSetting', colorSetting);
    },
  },
});
export const { setSystemColorScheme, updateColor } = themeSlice.actions;

export const selectColorMode = (state: RootState) =>
  getColorScheme(state.theme.colorSetting, state.theme.systemColorScheme);

export const selectActiveYouTheme = (state: RootState) => {
  const colorScheme = selectColorMode(state);
  return themeFromSourceColor(argbFromHex(state.theme.color)).schemes[colorScheme];
};

export const selectMuiTheme = (state: RootState) => {
  const colorScheme = selectColorMode(state);
  const youTheme = selectActiveYouTheme(state);
  return youThemeToMuiTheme(youTheme, colorScheme);
};

type StoreType = EnhancedStore<{ theme: ThemeSliceType }>;

export default themeSlice.reducer;
export type RootState = ReturnType<StoreType['getState']>;
export type AppDispatch = StoreType['dispatch'];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
