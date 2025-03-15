import useConfig from '@chatgpt/hooks/useConfig';
import useSettingKey from '@chatgpt/hooks/useSettingKey';
import { createSettingWindow, setConfigService } from '@chatgpt/service/config';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Backup, Power, Save, Settings } from '@mui/icons-material';
import { Box, Button, Divider, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import { selectConfig, useConfigStore } from './configSlice';
import { ChatGPTConfigSchema, type Config, Theme } from './types';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
const appWindow = getCurrentWebviewWindow();

function Setting() {
  const initData = useConfigStore(useShallow(selectConfig));
  const methods = useForm<Config>({
    defaultValues: initData,
    resolver: valibotResolver(ChatGPTConfigSchema),
  });
  const { handleSubmit } = methods;
  const navigate = useNavigate();
  const matchGeneral = useMatch('/setting/general');
  const matchAdapter = useMatch('/setting/adapter');

  const onSubmit = handleSubmit(async (data) => {
    await setConfigService({ data });
    await appWindow.close();
  });
  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'row',
        }}
        component="form"
        onSubmit={onSubmit}
      >
        <Box
          sx={{
            width: 200,
            flexShrink: 0,
            '& .MuiToolbar-root': {
              backgroundColor: 'transparent',
            },
            backgroundColor: 'transparent',
          }}
          className="box"
          data-tauri-drag-region
        >
          <List>
            <ListItemButton
              onClick={() => {
                navigate('/setting/general');
              }}
              selected={matchGeneral !== null}
            >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="General" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                navigate('/setting/adapter');
              }}
              selected={matchAdapter !== null}
            >
              <ListItemIcon>
                <Power />
              </ListItemIcon>
              <ListItemText primary="Adapter" />
            </ListItemButton>
          </List>
          <Divider />
          <List>
            <ListItemButton type="submit" component="button">
              <ListItemIcon>
                <Save />
              </ListItemIcon>
              <ListItemText primary="Submit" />
            </ListItemButton>
          </List>
        </Box>
        <Divider orientation="vertical" />
        <Outlet />
      </Box>
    </FormProvider>
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
