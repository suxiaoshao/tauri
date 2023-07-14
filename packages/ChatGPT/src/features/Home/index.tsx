import { Box, Paper } from '@mui/material';
import ChatForm from './components/ChatForm';

export default function Home() {
  return (
    <Box
      component={Paper}
      sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
      square
    >
      <Box sx={{ flex: '1 1 0' }} />
      <ChatForm />
    </Box>
  );
}
