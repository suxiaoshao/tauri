import { Avatar, Box, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import { Message } from '@chatgpt/types/message';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';
import ToolBar from '../ToolBar';
import { MessageSx } from '../../const';

export interface HiddenItemProps {
  message: Message;
}

export default function HiddenItem({ message }: HiddenItemProps) {
  return (
    <>
      <Box sx={MessageSx}>
        <Avatar sx={{ ml: 2, mt: 2 }} src={assistant} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
