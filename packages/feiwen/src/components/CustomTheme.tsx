import React from 'react';
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export interface CustomThemeProps {
  children?: React.ReactNode;
}

export function CustomTheme({ children }: CustomThemeProps): JSX.Element {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(() => {
    const newTheme = createTheme({
      palette: isDark
        ? {
            mode: 'dark',
            primary: {
              main: '#90caf9',
              light: '#a6d4fa',
              dark: '#648dae',
            },
            secondary: {
              main: '#f48fb1',
              light: '#f6a5c0',
              dark: '#aa647b',
            },
          }
        : undefined,
    });
    return newTheme;
  }, [isDark]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
