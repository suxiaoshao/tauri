import { getTags } from '@feiwen/service/store';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Query() {
  const navigate = useNavigate();
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      Home<Button onClick={() => navigate('/fetch')}>获取数据</Button>
      <Button
        onClick={async () => {
          const data = await getTags();
          console.log(data);
        }}
      >
        test
      </Button>
    </Box>
  );
}
