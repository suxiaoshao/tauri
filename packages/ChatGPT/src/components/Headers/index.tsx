import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { Menu, Settings } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import useSettingKey from '../../hooks/useSettingKey';
import { platform } from '@chatgpt/const/platform';
import useConfig from '@chatgpt/hooks/useConfig';
import AppDrawer from '@chatgpt/features/Conversations';

export const headersHeight = 40;

export default function Headers() {
  useConfig();
  useSettingKey();
  const handleClick = useCallback(async () => {
    await invoke('plugin:config|create_setting_window');
  }, []);
  const [open, setOpen] = useState(true);
  const handleDrawerChange = () => {
    setOpen((value) => !value);
  };

  const drawerWidth = useMemo(() => {
    return open ? 200 : 0;
  }, [open]);
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <AppBar data-tauri-drag-region position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar
          data-tauri-drag-region
          variant="dense"
          sx={{
            ...(platform === 'Darwin' ? { marginLeft: '50px' } : {}),
            height: `${headersHeight}px`,
            minHeight: '28px',
          }}
        >
          <IconButton
            onClick={handleDrawerChange}
            size="small"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography data-tauri-drag-region variant="body1" component="div" sx={{ flexGrow: 1 }}>
            ChatGPT
          </Typography>
          <IconButton size="small" edge="start" color="inherit" onClick={handleClick}>
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>
      <AppDrawer open={open} drawerWidth={drawerWidth} />
      <Box
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          height: `calc(100% - ${headersHeight}px)`,
          marginTop: `${headersHeight}px`,
          marginLeft: `${drawerWidth}px`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
