import {
  Box,
  Button,
  InputLabel,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { appWindow } from '@tauri-apps/api/window';
import { useAppSelector } from '../../app/hooks';
import { Theme } from './configSlice';
import { Settings } from '@mui/icons-material';
import { useCallback } from 'react';
import useConfig from '@chatgpt/hooks/useConfig';
import useSettingKey from '@chatgpt/hooks/useSettingKey';
import { createSettingWindow, setConfigService } from '@chatgpt/service/config';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const ThemeSchema = Yup.string().oneOf([Theme.Dark, Theme.Light, Theme.System], 'Invalid theme').default(Theme.System);

const ThemeOptionSchema = Yup.object().shape({
  theme: ThemeSchema,
  color: Yup.string()
    .matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Invalid color format')
    .default('#3271ae'),
});

const ChatGPTConfigSchema = Yup.object().shape({
  apiKey: Yup.string().nullable(),
  theme: ThemeOptionSchema.default({
    /* Default ThemeOption values here */
  }),
  url: Yup.string().url(),
  http_proxy: Yup.string().optional().url(),
});

export type ChatGptConfig = Yup.InferType<typeof ChatGPTConfigSchema>;

function Setting() {
  const initData = useAppSelector((state) => state.config);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChatGptConfig>({
    defaultValues: initData,
    resolver: yupResolver(ChatGPTConfigSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    await setConfigService({ data });
    await appWindow.close();
  });
  return (
    <Box sx={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}>
      <Box
        component="form"
        onSubmit={onSubmit}
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
          {...register('http_proxy', { setValueAs: (value) => (value?.trim()?.length > 0 ? value : undefined) })}
          label="http_proxy"
          fullWidth
          sx={{ mt: 2 }}
          error={!!errors.http_proxy?.message}
          helperText={errors.http_proxy?.message}
        />

        <Box sx={{ mt: 2, width: '100%', display: 'flex', flexDirection: 'row-reverse' }}>
          <Button variant="contained" type="submit">
            submit
          </Button>
        </Box>
      </Box>
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
