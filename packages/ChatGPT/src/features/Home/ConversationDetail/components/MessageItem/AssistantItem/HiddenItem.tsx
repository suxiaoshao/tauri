import { Avatar, Box, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import { Message } from '@chatgpt/types/message';
import DeleteMessageIcon from '../components/DeleteMessageIcon';
import ToolBar from '../components/ToolBar';

export interface HiddenItemProps {
  message: Message;
}

export default function HiddenItem({ message }: HiddenItemProps) {
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
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
