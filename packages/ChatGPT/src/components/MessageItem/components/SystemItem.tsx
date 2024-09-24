/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:53:44
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/MessageItem/components/SystemItem.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Avatar, Box, Divider } from '@mui/material';
import { AvatarSx, MarkdownSx, MessageSx } from '../const';
import { type BaseMessage } from '../types';
import ToolBar from './ToolBar';
import CopyIcon from './ToolBar/CopyIcon';
import DeleteMessageIcon from './ToolBar/DeleteMessageIcon';
import ViewIcon from './ToolBar/ViewIcon';

export interface SystemItemProps {
  message: BaseMessage;
}

export default function SystemItem({ message }: SystemItemProps) {
  return (
    <>
      <Box sx={MessageSx}>
        <Avatar sx={{ ...AvatarSx, backgroundColor: 'transparent' }}>🤖</Avatar>
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
