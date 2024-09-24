/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:25
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/AssistantItem/LoadingItem.tsx
 */
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Avatar, Box, CircularProgress, Divider } from '@mui/material';
import { AvatarSx, MarkdownSx, MessageSx } from '../../const';
import { type BaseMessage } from '../../types';

export interface LoadingItemProps {
  message: BaseMessage;
}

export default function LoadingItem({ message }: LoadingItemProps) {
  return (
    <>
      <Box sx={MessageSx}>
        <Avatar sx={AvatarSx} src={assistant} />
        <CustomMarkdown sx={MarkdownSx} value={message.content} />
        <CircularProgress size={20} sx={{ mr: 2, mt: 3 }} color="inherit" />
      </Box>
      <Divider />
    </>
  );
}
