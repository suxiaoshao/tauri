/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 20:58:40
 * @FilePath: /tauri/common/theme/src/index.tsx
 */
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React, { useEffect } from 'react';
import { match } from 'ts-pattern';
import { useShallow } from 'zustand/react/shallow';
import './index.css';
import { colorSchemaMatch, useThemeStore, selectActiveYouTheme, selectMuiTheme } from './themeSlice';
import setYouThemeToCssVars from './utils/cssVar';

export interface CustomThemeProps {
  children?: React.ReactNode;
}

export function CustomTheme({ children }: CustomThemeProps): JSX.Element {
  const { setSystemColorScheme, ...state } = useThemeStore(
    useShallow(({ setSystemColorScheme, color, colorSetting, systemColorScheme }) => ({
      color,
      colorSetting,
      systemColorScheme,
      setSystemColorScheme,
    })),
  );

  useEffect(() => {
    setYouThemeToCssVars(selectActiveYouTheme(state));
  }, [state]);
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
  return (
    <ThemeProvider theme={createTheme(selectMuiTheme(state))}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';

export { selectActiveYouTheme } from './themeSlice';

export { default as ThemeDrawerItem } from './components/ThemeDrawerItem';

export { youThemeToMuiTheme } from './utils/youTheme';

export { default as setYouThemeToCssVars } from './utils/cssVar';
