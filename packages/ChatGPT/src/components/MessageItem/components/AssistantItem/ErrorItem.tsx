/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:10
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/AssistantItem/ErrorItem.tsx
 */
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Avatar, Box, Divider } from '@mui/material';
import { AvatarSx, MarkdownSx, MessageSx } from '../../const';
import { BaseMessage } from '../../types';
import ToolBar from '../ToolBar';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';

export interface ErrorItemProps {
  message: BaseMessage;
}

export default function ErrorItem({ message }: ErrorItemProps) {
  return (
    <>
      <Box
        sx={{
          ...MessageSx,
          borderLeft: (theme) => `${theme.spacing(1)} solid ${theme.palette.error.light}`,
          backgroundColor: (theme) => `${theme.palette.error.main}10`,
        }}
      >
        <Avatar sx={AvatarSx} src={assistant} />
        <CustomMarkdown sx={MarkdownSx} value={message.content} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
