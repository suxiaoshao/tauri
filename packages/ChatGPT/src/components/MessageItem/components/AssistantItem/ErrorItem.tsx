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
import { AvatarSx, MarkdownSx, MessageSelectedSx, MessageSx } from '../../const';
import { type BaseMessage } from '../../types';
import ToolBar from '../ToolBar';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';
import { useState, useEffect } from 'react';
import { match } from 'ts-pattern';
import { getSourceContent } from '@chatgpt/utils/content';

export interface ErrorItemProps {
  message: BaseMessage;
  selected: boolean;
}

export default function ErrorItem({ message, selected }: ErrorItemProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref && selected) {
      ref?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [ref, selected]);
  const sx = match(selected)
    .with(true, () => ({ ...MessageSx, ...MessageSelectedSx }))
    .otherwise(() => MessageSx);
  return (
    <>
      <Box
        sx={{
          ...sx,
          borderLeft: (theme) => `${theme.spacing(1)} solid ${theme.palette.error.light}`,
          backgroundColor: (theme) => `${theme.palette.error.main}10`,
        }}
        ref={setRef}
      >
        <Avatar sx={AvatarSx} src={assistant} />
        <CustomMarkdown sx={MarkdownSx} value={getSourceContent(message.content)} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
