/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:50:23
 * @FilePath: /tauri/common/theme/src/utils/youTheme.ts
 */
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
      tertiary: {
        main: hexFromArgb(theme.tertiary),
        contrastText: hexFromArgb(theme.onTertiary),
      },
    },
  } satisfies ThemeOptions;
}

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    tertiary: true;
  }
}
