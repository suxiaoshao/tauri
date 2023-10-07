import CustomMarkdown from '@chatgpt/components/Markdown';
import { Message } from '@chatgpt/types/message';
import { Avatar, Box, Divider } from '@mui/material';
import user from '@chatgpt/assets/user.jpg';
import { MarkdownSx, MessageSx } from '../const';
import DeleteMessageIcon from './ToolBar/DeleteMessageIcon';
import ToolBar from './ToolBar';
import ViewIcon from './ToolBar/ViewIcon';

export interface UserItemProps {
  message: Message;
}

export default function UserItem({ message }: UserItemProps) {
  return (
    <>
      <Box sx={MessageSx}>
        <Avatar sx={{ ml: 2, mt: 2 }} src={user} />
        <CustomMarkdown sx={{ ...MarkdownSx }} value={message.content} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
          <ViewIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
