import { Box, Button, Paper } from '@mui/material';
import { useCallback } from 'react';
import { WebviewWindow } from '@tauri-apps/api/window';

export default function Home() {
  const handleClick = useCallback(() => {
    // invoke('plugin:config|open_setting');
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
    <Box component={Paper} sx={{ width: '100%', height: '100%' }} square>
      <Button onClick={handleClick}>setting</Button>
    </Box>
  );
}
