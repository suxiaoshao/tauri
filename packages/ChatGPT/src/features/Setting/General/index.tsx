import HotkeyInput from '@chatgpt/components/HotkeyInput';
import { Delete, Add } from '@mui/icons-material';
import { Box, TextField, MenuItem, InputLabel, FormLabel, InputAdornment, IconButton } from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { match } from 'ts-pattern';
import { type Config, Theme } from '../types';

export default function GeneralSettings() {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<Config>();
  const { fields, append, remove } = useFieldArray({
    control,
    // eslint-disable-next-line ban-ts-comment
    // @ts-expect-error
    name: 'models',
  });
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
      <TextField
        required
        {...register('apiKey', { required: true })}
        label="openai api key"
        fullWidth
        error={!!errors.apiKey?.message}
        helperText={errors.apiKey?.message}
      />
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
        required
        {...register('url', { required: true })}
        label="url"
        fullWidth
        sx={{ mt: 2 }}
        error={!!errors.url?.message}
        helperText={errors.url?.message}
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

      {fields.map((field, index) => (
        <TextField
          key={field.id}
          sx={{ mt: 2 }}
          required
          {...register(`models.${index}`, { required: true })}
          label="model"
          fullWidth
          error={!!errors.models?.[index]?.message}
          helperText={errors.models?.[index]?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => remove(index)}>
                    <Delete />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      ))}
      <Box sx={{ mt: 1 }}>
        <IconButton onClick={() => append('')}>
          <Add />
        </IconButton>
      </Box>
    </Box>
  );
}
