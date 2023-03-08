import React, { useEffect } from 'react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';
import setYouThemeToCssVars from './cssVar';
import {
  colorSchemaMatch,
  selectActiveYouTheme,
  selectMuiTheme,
  setSystemColorScheme,
  useAppDispatch,
  useAppSelector,
} from './themeSlice';

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
      const colorScheme = e.matches ? 'dark' : 'light';
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

export { hexFromArgb } from '@material/material-color-utilities';

export { default as themeReducer, selectActiveYouTheme } from './themeSlice';

export { default as ThemeDrawerItem } from './ThemeDrawerItem';
