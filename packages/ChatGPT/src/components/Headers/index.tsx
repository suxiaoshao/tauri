import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { Menu, Settings } from '@mui/icons-material';
import { createSearchParams, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectApiKey } from '../../features/Setting/configSlice';
import { invoke } from '@tauri-apps/api';
import useSettingKey from '../../hooks/useSettingKey';

export default function Headers() {
  const apiKey = useAppSelector(selectApiKey);
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();
  const [urlSearch] = useSearchParams();

  useEffect(() => {
    if (!apiKey) {
      const url = pathname + search + hash;
      if (pathname !== '/error') {
        navigate({ pathname: '/error', search: createSearchParams({ from: url }).toString() });
      }
    } else {
      if (pathname === '/error') {
        const from = urlSearch.get('from');
        if (from === null) {
          navigate('/');
        } else {
          navigate(from);
        }
      }
    }
  }, [hash, pathname, search, navigate, apiKey, urlSearch]);
  const handleClick = useCallback(() => {
    invoke('plugin:config|create_setting_window');
  }, []);
  useSettingKey();
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <AppBar data-tauri-drag-region position="static">
        <Toolbar data-tauri-drag-region variant="dense" sx={{ marginLeft: '50px', height: '40px', minHeight: '28px' }}>
          <IconButton size="small" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
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
      <Box sx={{ width: '100%', height: 'calc(100% - 40px)' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
