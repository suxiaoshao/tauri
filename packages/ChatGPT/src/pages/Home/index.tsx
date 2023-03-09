import { Box, Button, Paper } from '@mui/material';
import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function Home() {
  const handleClick = useCallback(() => {
    invoke('plugin:config|open_setting');
  }, []);
  return (
    <Box component={Paper} sx={{ width: '100%', height: '100%' }} square>
      <Button onClick={handleClick}>setting</Button>
    </Box>
  );
}
