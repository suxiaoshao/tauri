import { hexFromArgb, Scheme } from '@material/material-color-utilities';
import { ThemeOptions } from '@mui/material';

export function youThemeToMuiTheme(theme: ReturnType<Scheme['toJSON']>, mode: 'dark' | 'light' = 'light') {
  return {
    palette: {
      mode,
      primary: {
        main: hexFromArgb(theme.primary),
        contrastText: hexFromArgb(theme.onPrimary),
      },
      secondary: {
        main: hexFromArgb(theme.secondary),
        contrastText: hexFromArgb(theme.onSecondary),
      },
      error: {
        main: hexFromArgb(theme.error),
        contrastText: hexFromArgb(theme.onError),
      },
      warning: {
        main: hexFromArgb(theme.tertiary),
        contrastText: hexFromArgb(theme.onTertiary),
      },
      info: {
        main: hexFromArgb(theme.tertiary),
        contrastText: hexFromArgb(theme.onTertiary),
      },
      background: {
        default: hexFromArgb(theme.background),
        paper: hexFromArgb(theme.surface),
      },
      text: {
        primary: hexFromArgb(theme.onBackground),
        secondary: hexFromArgb(theme.onSurface),
        disabled: hexFromArgb(theme.onSurfaceVariant),
      },
    },
  } satisfies ThemeOptions;
}
