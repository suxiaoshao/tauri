/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:30:54
 * @FilePath: /tauri/common/theme/src/themeSlice.ts
 */
import { useEffect } from 'react';
import { match } from 'ts-pattern';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export interface ThemeSliceType {
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
  const colorSetting = (window.localStorage.getItem('colorSetting') ?? 'system') as ThemeSliceType['colorSetting'];

  const systemColorScheme = match(colorSchemaMatch.matches)
    .with(true, () => 'dark' as const)
    .otherwise(() => 'light' as const);
  window.localStorage.setItem('colorSetting', colorSetting);
  return {
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

const selectColorMode = (state: ThemeSliceType) => getColorScheme(state.colorSetting, state.systemColorScheme);

export function useListenColorMode() {
  const { setSystemColorScheme, colorMode } = useThemeStore(
    useShallow(({ setSystemColorScheme, ...state }) => ({
      setSystemColorScheme,
      colorMode: selectColorMode(state),
    })),
  );
  useEffect(() => {
    const sign = new AbortController();
    colorSchemaMatch.addEventListener(
      'change',
      (e) => {
        const colorScheme = match(e.matches)
          .with(true, () => 'dark' as const)
          .otherwise(() => 'light' as const);
        setSystemColorScheme(colorScheme);
      },
      { signal: sign.signal },
    );
    return () => {
      sign.abort();
    };
  }, [setSystemColorScheme]);
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    root.classList.add(colorMode);
  }, [colorMode]);
}
