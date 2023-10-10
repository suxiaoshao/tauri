import { Box, Button } from '@mui/material';
import { invoke } from '@tauri-apps/api';
import { useNavigate } from 'react-router-dom';

export default function Query() {
  const navigate = useNavigate();
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      Home<Button onClick={() => navigate('/fetch')}>获取数据</Button>
      <Button
        onClick={async () => {
          const data = await invoke<string[]>('tags');
          console.log(data);
        }}
      >
        test
      </Button>
    </Box>
  );
}
