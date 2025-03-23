import HotkeyInput from '@chatgpt/components/HotkeyInput';
import { Box, TextField, MenuItem, InputLabel, FormLabel } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { match } from 'ts-pattern';
import { type Config, Theme } from '../types';

export default function GeneralSettings() {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<Config>();
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
            label="Theme"
            select
            fullWidth
            sx={{ mt: 2 }}
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          >
            <MenuItem value={Theme.Dark}>{Theme.Dark}</MenuItem>
            <MenuItem value={Theme.Light}>{Theme.Light}</MenuItem>
            <MenuItem value={Theme.System}>{Theme.System}</MenuItem>
          </TextField>
        )}
      />

      <InputLabel htmlFor="color-input" sx={{ mt: 2 }} required error={!!errors.theme?.color?.message}>
        Color
      </InputLabel>
      <Box component="input" id="color-input" type="color" {...register('theme.color', { required: true })} />
      <Box sx={{ color: 'error.main' }}>{errors.theme?.color?.message}</Box>
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
        label="Http Proxy"
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
            label="Temporary Conversation Hotkey"
            fullWidth
            sx={{ mt: 2 }}
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <FormLabel sx={{ mt: 2 }} required>
        Models
      </FormLabel>
    </Box>
  );
}
