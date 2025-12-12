/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-08 21:07:53
 * @FilePath: /tauri/packages/ChatGPT/src/features/Theme/index.tsx
 */
import { useEffect, useMemo } from 'react';
import { match } from 'ts-pattern';
import { useShallow } from 'zustand/react/shallow';
import { useConfigStore } from '../Setting/configSlice';
import { Theme } from '../Setting/types';
import { colorSchemaMatch, getColorScheme, useThemeStore } from './themeSlice';

export interface CustomThemeProps {
  children?: React.ReactNode;
}

export function CustomTheme({ children }: CustomThemeProps) {
  const { systemColorScheme, setSystemColorScheme } = useThemeStore(
    useShallow(({ setSystemColorScheme, systemColorScheme }) => ({ systemColorScheme, setSystemColorScheme })),
  );
  const theme = useConfigStore(useShallow((state) => state.theme));

  const colorScheme = useMemo(() => getColorScheme(theme.theme, systemColorScheme), [theme.theme, systemColorScheme]);
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    const controller = new AbortController();
    colorSchemaMatch.addEventListener(
      'change',
      (e) => {
        const colorScheme = match(e.matches)
          .with(true, () => Theme.Dark as const)
          .with(false, () => Theme.Light as const)
          .exhaustive();
        setSystemColorScheme(colorScheme);
      },
      { signal: controller.signal },
    );
    return () => {
      controller.abort();
    };
  }, [setSystemColorScheme]);
  return children;
}
