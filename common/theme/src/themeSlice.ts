/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:30:54
 * @FilePath: /tauri/common/theme/src/themeSlice.ts
 */
import { argbFromHex, themeFromSourceColor } from '@material/material-color-utilities';
import { match } from 'ts-pattern';
import { create } from 'zustand';
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

export const useThemeStore = create<
  ThemeSliceType & {
    // eslint-disable-next-line no-unexpected-multiline
    setSystemColorScheme: (scheme: ThemeSliceType['systemColorScheme']) => void;
    updateColor: (color: string, colorSetting: ThemeSliceType['colorSetting']) => void;
  }
>((set) => ({
  ...getInitDate(),
  setSystemColorScheme: (scheme) =>
    set(() => ({
      systemColorScheme: scheme,
    })),
  updateColor: (color, colorSetting) =>
    set(() => {
      window.localStorage.setItem('color', color);
      window.localStorage.setItem('colorSetting', colorSetting);
      return {
        color,
        colorSetting,
      };
    }),
}));

export const selectColorMode = (state: ThemeSliceType) => getColorScheme(state.colorSetting, state.systemColorScheme);

export const selectActiveYouTheme = (state: ThemeSliceType) => {
  const colorScheme = selectColorMode(state);
  return themeFromSourceColor(argbFromHex(state.color)).schemes[colorScheme];
};

export const selectMuiTheme = (state: ThemeSliceType) => {
  const colorScheme = selectColorMode(state);
  const youTheme = selectActiveYouTheme(state);
  return youThemeToMuiTheme(youTheme, colorScheme);
};
