/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:49
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/UserItem.tsx
 */
import user from '@chatgpt/assets/user.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Avatar, Box, Divider } from '@mui/material';
import { AvatarSx, MarkdownSx, MessageSelectedSx, MessageSx } from '../const';
import { type BaseMessage } from '../types';
import ToolBar from './ToolBar';
import CopyIcon from './ToolBar/CopyIcon';
import DeleteMessageIcon from './ToolBar/DeleteMessageIcon';
import ViewIcon from './ToolBar/ViewIcon';
import { useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { getSourceContent } from '@chatgpt/utils/content';

export interface UserItemProps {
  message: BaseMessage;
  selected: boolean;
}

export default function UserItem({ message, selected }: UserItemProps) {
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
      <Box sx={sx} ref={setRef}>
        <Avatar sx={AvatarSx} src={user} />
        {match(message.content)
          .with({ tag: 'text' }, ({ value }) => <CustomMarkdown sx={MarkdownSx} value={value} />)
          .with({ tag: 'extension' }, ({ value: { content, extensionName, source } }) => (
            <Box sx={{ ...MarkdownSx, display: 'flex', flexDirection: 'column' }}>
              <CustomMarkdown value={source} />
              <Divider> {extensionName}</Divider>
              <CustomMarkdown value={content} />
            </Box>
          ))
          .exhaustive()}

        <ToolBar>
          <DeleteMessageIcon id={message.id} />
          <ViewIcon id={message.id} />
          <CopyIcon content={getSourceContent(message.content)} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
