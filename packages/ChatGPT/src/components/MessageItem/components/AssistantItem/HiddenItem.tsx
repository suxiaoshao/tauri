import assistant from '@chatgpt/assets/assistant.jpg';
import { Avatar, Box, Divider } from '@mui/material';
import { AvatarSx, MessageSx } from '../../const';
import { type BaseMessage } from '../../types';
import ToolBar from '../ToolBar';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';

export interface HiddenItemProps {
  message: BaseMessage;
}

export default function HiddenItem({ message }: HiddenItemProps) {
  return (
    <>
      <Box sx={MessageSx}>
        <Avatar sx={AvatarSx} src={assistant} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
