import HotkeyInput from '@chatgpt/components/HotkeyInput';
import { Box, TextField, MenuItem, InputLabel } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { match } from 'ts-pattern';
import { type Config, Language, Theme } from '../types';
import { useTranslation } from 'react-i18next';

export default function GeneralSettings() {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<Config>();
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        p: 2,
        pt: 3,
        flex: '1 1 0',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <Controller
        control={control}
        name="theme.theme"
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <TextField
            required
            {...field}
            label={t('theme')}
            select
            fullWidth
            sx={{ mt: 2 }}
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          >
            <MenuItem value={Theme.Dark}>{t(Theme.Dark)}</MenuItem>
            <MenuItem value={Theme.Light}>{t(Theme.Light)}</MenuItem>
            <MenuItem value={Theme.System}>{t(Theme.System)}</MenuItem>
          </TextField>
        )}
      />

      <InputLabel htmlFor="color-input" sx={{ mt: 2 }} required error={!!errors.theme?.color?.message}>
        {t('color')}
      </InputLabel>
      <Box component="input" id="color-input" type="color" {...register('theme.color', { required: true })} />
      <Box sx={{ color: 'error.main' }}>{errors.theme?.color?.message}</Box>
      <Controller
        control={control}
        name="language"
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <TextField
            required
            {...field}
            label={t('language')}
            select
            fullWidth
            sx={{ mt: 2 }}
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          >
            <MenuItem value={Language.System}>{t(Language.System)}</MenuItem>
            <MenuItem value={Language.Chinese}>{t(Language.Chinese)}</MenuItem>
            <MenuItem value={Language.English}>{t(Language.English)}</MenuItem>
          </TextField>
        )}
      />
      <TextField
        {...register('httpProxy', {
          setValueAs: (value) => {
            return (
              match(value?.trim())
                // eslint-disable-next-line no-useless-undefined
                .with('', () => undefined)
                .otherwise(() => value)
            );
          },
        })}
        label={t('http_proxy')}
        fullWidth
        sx={{ mt: 2 }}
        error={!!errors.httpProxy?.message}
        helperText={errors.httpProxy?.message}
      />
      <Controller
        control={control}
        name="temporaryHotkey"
        render={({ field, fieldState }) => (
          <HotkeyInput
            {...field}
            label={t('temporary_conversation_hotkey')}
            fullWidth
            sx={{ mt: 2 }}
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </Box>
  );
}
