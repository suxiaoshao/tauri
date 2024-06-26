import { Avatar, Box, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';
import ToolBar from '../ToolBar';
import { AvatarSx, MessageSx } from '../../const';
import { BaseMessage } from '../..';

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
