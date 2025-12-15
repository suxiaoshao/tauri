/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 20:58:40
 * @FilePath: /tauri/common/theme/src/index.tsx
 */
import { useEffect } from 'react';
import { match } from 'ts-pattern';
import { useShallow } from 'zustand/react/shallow';
import './index.css';
import { colorSchemaMatch, getColorScheme, useThemeStore } from './themeSlice';

export interface CustomThemeProps {
  children?: React.ReactNode;
}

export function CustomTheme({ children }: CustomThemeProps) {
  const { setSystemColorScheme, colorScheme } = useThemeStore(
    useShallow(({ colorSetting, setSystemColorScheme, systemColorScheme }) => ({
      setSystemColorScheme,
      colorScheme: getColorScheme(colorSetting, systemColorScheme),
    })),
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(colorScheme);
  }, [colorScheme]);

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
  return children;
}
