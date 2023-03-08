import { hexFromArgb, Scheme } from '@material/material-color-utilities';
export default function setYouThemeToCssVars(theme: ReturnType<Scheme['toJSON']>): void {
  const {
    primary,
    onPrimary,
    primaryContainer,
    onPrimaryContainer,
    secondary,
    onSecondary,
    secondaryContainer,
    onSecondaryContainer,
    tertiary,
    onTertiary,
    tertiaryContainer,
    onTertiaryContainer,
    error,
    onError,
    errorContainer,
    onErrorContainer,
    background,
    surface,
    onBackground,
    onSurface,
    surfaceVariant,
    onSurfaceVariant,
    outline,
    outlineVariant,
    inverseSurface,
    inverseOnSurface,
    inversePrimary,
    shadow,
    scrim,
  } = theme;
  document.documentElement.style.setProperty('--you-primary', hexFromArgb(primary));
  document.documentElement.style.setProperty('--you-on-primary', hexFromArgb(onPrimary));
  document.documentElement.style.setProperty('--you-primary-container', hexFromArgb(primaryContainer));
  document.documentElement.style.setProperty('--you-on-primary-container', hexFromArgb(onPrimaryContainer));
  document.documentElement.style.setProperty('--you-secondary', hexFromArgb(secondary));
  document.documentElement.style.setProperty('--you-on-secondary', hexFromArgb(onSecondary));
  document.documentElement.style.setProperty('--you-secondary-container', hexFromArgb(secondaryContainer));
  document.documentElement.style.setProperty('--you-on-secondary-container', hexFromArgb(onSecondaryContainer));
  document.documentElement.style.setProperty('--you-tertiary', hexFromArgb(tertiary));
  document.documentElement.style.setProperty('--you-on-tertiary', hexFromArgb(onTertiary));
  document.documentElement.style.setProperty('--you-tertiary-container', hexFromArgb(tertiaryContainer));
  document.documentElement.style.setProperty('--you-on-tertiary-container', hexFromArgb(onTertiaryContainer));
  document.documentElement.style.setProperty('--you-error', hexFromArgb(error));
  document.documentElement.style.setProperty('--you-on-error', hexFromArgb(onError));
  document.documentElement.style.setProperty('--you-error-container', hexFromArgb(errorContainer));
  document.documentElement.style.setProperty('--you-on-error-container', hexFromArgb(onErrorContainer));
  document.documentElement.style.setProperty('--you-background', hexFromArgb(background));
  document.documentElement.style.setProperty('--you-on-background', hexFromArgb(onBackground));
  document.documentElement.style.setProperty('--you-surface', hexFromArgb(surface));
  document.documentElement.style.setProperty('--you-on-surface', hexFromArgb(onSurface));
  document.documentElement.style.setProperty('--you-surface-variant', hexFromArgb(surfaceVariant));
  document.documentElement.style.setProperty('--you-on-surface-variant', hexFromArgb(onSurfaceVariant));
  document.documentElement.style.setProperty('--you-outline', hexFromArgb(outline));
  document.documentElement.style.setProperty('--you-outline-variant', hexFromArgb(outlineVariant));
  document.documentElement.style.setProperty('--you-inverse-surface', hexFromArgb(inverseSurface));
  document.documentElement.style.setProperty('--you-inverse-on-surface', hexFromArgb(inverseOnSurface));
  document.documentElement.style.setProperty('--you-inverse-primary', hexFromArgb(inversePrimary));
  document.documentElement.style.setProperty('--you-shadow', hexFromArgb(shadow));
  document.documentElement.style.setProperty('--you-scrim', hexFromArgb(scrim));
}
