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
import './index.css';
import {
  colorSchemaMatch,
  selectActiveYouTheme,
  selectMuiTheme,
  setSystemColorScheme,
  useAppDispatch,
  useAppSelector,
} from './themeSlice';
import setYouThemeToCssVars from './utils/cssVar';

export interface CustomThemeProps {
  children?: React.ReactNode;
}

export function CustomTheme({ children }: CustomThemeProps): JSX.Element {
  const youTheme = useAppSelector(selectActiveYouTheme);
  const muiTheme = useAppSelector(selectMuiTheme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setYouThemeToCssVars(youTheme);
  }, [youTheme]);
  useEffect(() => {
    colorSchemaMatch.addEventListener('change', (e) => {
      const colorScheme = match(e.matches)
        .with(true, () => 'dark' as const)
        .with(false, () => 'light' as const)
        .exhaustive();
      dispatch(setSystemColorScheme(colorScheme));
    });
  }, [dispatch]);
  return (
    <ThemeProvider theme={createTheme(muiTheme)}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';

export { selectActiveYouTheme, default as themeReducer } from './themeSlice';

export { default as ThemeDrawerItem } from './components/ThemeDrawerItem';

export { youThemeToMuiTheme } from './utils/youTheme';

export { default as setYouThemeToCssVars } from './utils/cssVar';
