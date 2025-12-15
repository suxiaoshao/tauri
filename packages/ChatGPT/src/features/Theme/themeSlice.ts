/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-08 21:08:02
 * @FilePath: /tauri/packages/ChatGPT/src/features/Theme/themeSlice.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { match } from 'ts-pattern';
import { create } from 'zustand';
import { Theme } from '../Setting/types';

export interface ThemeSliceType {
  systemColorScheme: Theme.Dark | Theme.Light;
}

export const getColorScheme = (colorSetting: Theme, systemColorScheme: ThemeSliceType['systemColorScheme']) => {
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

export const useThemeStore = create<
  // eslint-disable-next-line no-unexpected-multiline
  ThemeSliceType & { setSystemColorScheme: (scheme: ThemeSliceType['systemColorScheme']) => void }
>((set) => ({
  ...getInitDate(),
  setSystemColorScheme: (scheme) => set({ systemColorScheme: scheme }),
}));
