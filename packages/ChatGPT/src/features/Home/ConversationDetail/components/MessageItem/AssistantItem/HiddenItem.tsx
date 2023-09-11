import { Avatar, Box, CircularProgress, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import { Message } from '@chatgpt/types/message';
import { ToolSx } from '../const';

export interface HiddenItemProps {
  message: Message;
}

export default function HiddenItem({}: HiddenItemProps) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          position: 'relative',
          minHeight: '56px',
        }}
      >
        <Avatar sx={{ ml: 2, mt: 2 }} src={assistant} />
        <CircularProgress size={20} sx={ToolSx} color="inherit" />
      </Box>
      <Divider />
    </>
  );
}
