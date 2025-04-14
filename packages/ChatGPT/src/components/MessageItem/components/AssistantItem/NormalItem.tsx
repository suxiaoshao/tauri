/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:32
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/AssistantItem/NormalItem.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import { Avatar, Box, Divider } from '@mui/material';
import { AvatarSx, MarkdownSx, MessageSelectedSx, MessageSx, ToolSx } from '../../const';
import { type BaseMessage } from '../../types';
import ToolBar from '../ToolBar';
import CopyIcon from '../ToolBar/CopyIcon';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';
import ViewIcon from '../ToolBar/ViewIcon';
import { useState, useEffect } from 'react';
import { match } from 'ts-pattern';
import { getSourceContent } from '@chatgpt/utils/content';

export interface NormalItemProps {
  message: BaseMessage;
  selected: boolean;
}

export default function NormalItem({ message, selected }: NormalItemProps) {
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
        <Avatar sx={AvatarSx} src={assistant} />
        <CustomMarkdown sx={{ ...MarkdownSx }} value={getSourceContent(message.content)} />
        <ToolBar>
          <CheckCircleOutlineOutlined fontSize="small" sx={ToolSx} />
          <DeleteMessageIcon id={message.id} />
          <ViewIcon id={message.id} />
          <CopyIcon content={getSourceContent(message.content)} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
