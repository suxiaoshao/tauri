/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-08 21:07:53
 * @FilePath: /tauri/packages/ChatGPT/src/features/Theme/index.tsx
 */
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { setYouThemeToCssVars } from 'theme';
import 'theme/src/index.css';
import { match } from 'ts-pattern';
import { useShallow } from 'zustand/react/shallow';
import { useConfigStore } from '../Setting/configSlice';
import { Theme } from '../Setting/types';
import { colorSchemaMatch, selectActiveYouTheme, selectMuiTheme, useThemeStore } from './themeSlice';

export interface CustomThemeProps {
  children?: React.ReactNode;
}

export function CustomTheme({ children }: CustomThemeProps): JSX.Element {
  const { systemColorScheme, setSystemColorScheme } = useThemeStore(
    useShallow(({ setSystemColorScheme, systemColorScheme }) => ({ systemColorScheme, setSystemColorScheme })),
  );
  const theme = useConfigStore(useShallow((state) => state.theme));
  const muiTheme = useMemo(() => selectMuiTheme(theme, systemColorScheme), [theme, systemColorScheme]);

  useEffect(() => {
    setYouThemeToCssVars(selectActiveYouTheme(theme, systemColorScheme));
  }, [systemColorScheme, theme]);
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
  return (
    <ThemeProvider theme={createTheme(muiTheme)}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
