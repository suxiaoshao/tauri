import {
  Box,
  Button,
  FormLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
} from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { appWindow } from '@tauri-apps/api/window';
import { useAppSelector } from '../../app/hooks';
import { selectConfig } from './configSlice';
import { Add, Delete, Settings } from '@mui/icons-material';
import { useCallback } from 'react';
import useConfig from '@chatgpt/hooks/useConfig';
import useSettingKey from '@chatgpt/hooks/useSettingKey';
import { createSettingWindow, setConfigService } from '@chatgpt/service/config';
import { string, object, enum_, InferOutput, regex, url, array, nullish, pipe } from 'valibot';
import { valibotResolver } from '@hookform/resolvers/valibot';
import HotkeyInput from '@chatgpt/components/HotkeyInput';

export enum Theme {
  Dark = 'dark',
  Light = 'light',
  System = 'system',
}

const ChatGPTConfigSchema = object({
  apiKey: string(),
  theme: object({
    theme: enum_(Theme),
    color: pipe(string(), regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Invalid color format')),
  }),
  url: nullish(pipe(string(), url())),
  httpProxy: nullish(pipe(string(), url())),
  models: array(string()),
  temporaryHotkey: nullish(string()),
});

export type Config = InferOutput<typeof ChatGPTConfigSchema>;

function Setting() {
  const initData = useAppSelector(selectConfig);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Config>({
    defaultValues: initData,
    resolver: valibotResolver(ChatGPTConfigSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    // @ts-ignore
    name: 'models',
  });

  const onSubmit = handleSubmit(async (data) => {
    await setConfigService({ data });
    await appWindow.close();
  });
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        position: 'relative',
        overflowY: 'auto!important',
      }}
      component="form"
      onSubmit={onSubmit}
    >
      <Box
        sx={{
          p: 2,
          paddingX: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
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
          {...register('httpProxy', { setValueAs: (value) => (value?.trim()?.length > 0 ? value : undefined) })}
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => remove(index)}>
                    <Delete />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        ))}
        <Box sx={{ mt: 1 }}>
          <IconButton onClick={() => append('')}>
            <Add />
          </IconButton>
        </Box>
      </Box>
      <Button
        variant="contained"
        type="submit"
        sx={{ position: 'fixed', right: (theme) => theme.spacing(2), bottom: (theme) => theme.spacing(2) }}
      >
        submit
      </Button>
    </Box>
  );
}

function SettingItem() {
  useConfig();
  useSettingKey();
  const handleSetting = useCallback(async () => {
    await createSettingWindow();
  }, []);
  return (
    <ListItemButton onClick={handleSetting}>
      <ListItemIcon>
        <Settings />
      </ListItemIcon>
      <ListItemText primary="Setting" />
    </ListItemButton>
  );
}

Setting.Item = SettingItem;

export default Setting;
