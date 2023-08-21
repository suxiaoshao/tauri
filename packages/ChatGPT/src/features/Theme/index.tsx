import React, { useEffect } from 'react';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'theme/src/index.css';
import { colorSchemaMatch, selectActiveYouTheme, selectMuiTheme, setSystemColorScheme } from './themeSlice';
import { setYouThemeToCssVars } from 'theme';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { Theme } from '../Setting/configSlice';

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
      const colorScheme = e.matches ? Theme.Dark : Theme.Light;
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
