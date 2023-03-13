import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { Menu, Settings } from '@mui/icons-material';
import { createSearchParams, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { WebviewWindow } from '@tauri-apps/api/window';
import { useCallback, useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectApiKey } from '../../features/Setting/configSlice';

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
    const window = WebviewWindow.getByLabel('setting');
    if (window) {
      window.show();
      window.setFocus();
    } else {
      new WebviewWindow('setting', {
        url: '/setting',
        title: 'setting',
        transparent: true,
      });
    }
  }, []);
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <AppBar data-tauri-drag-region position="static">
        <Toolbar data-tauri-drag-region variant="dense" sx={{ marginLeft: '46px' }}>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <Menu />
          </IconButton>
          <Typography data-tauri-drag-region variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ChatGPT
          </Typography>
          <IconButton size="large" edge="start" color="inherit" onClick={handleClick}>
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Outlet />
    </Box>
  );
}
