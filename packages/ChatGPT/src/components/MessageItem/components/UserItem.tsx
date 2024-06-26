/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:49
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/UserItem.tsx
 */
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Avatar, Box, Divider } from '@mui/material';
import user from '@chatgpt/assets/user.jpg';
import { AvatarSx, MarkdownSx, MessageSx } from '../const';
import DeleteMessageIcon from './ToolBar/DeleteMessageIcon';
import ToolBar from './ToolBar';
import ViewIcon from './ToolBar/ViewIcon';
import { BaseMessage } from '..';
import CopyIcon from './ToolBar/CopyIcon';

export interface UserItemProps {
  message: BaseMessage;
}

export default function UserItem({ message }: UserItemProps) {
  return (
    <>
      <Box sx={MessageSx}>
        <Avatar sx={AvatarSx} src={user} />
        <CustomMarkdown sx={MarkdownSx} value={message.content} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
          <ViewIcon id={message.id} />
          <CopyIcon content={message.content} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
