/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 04:07:38
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/components/ConversationItem.tsx
 */
import { type Conversation } from '@chatgpt/types/conversation';
import { getNodeIdByConversation } from '@chatgpt/utils/chatData';
import { Avatar, Box, Typography } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view';

export interface ConversationItemProps {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: ConversationItemProps) {
  return (
    <TreeItem
      itemId={getNodeIdByConversation(conversation)}
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            pr: 0,
          }}
        >
          <Avatar sx={{ backgroundColor: 'transparent', width: 24, height: 24, mr: 1 }}>{conversation.icon}</Avatar>
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {conversation.title}
          </Typography>
          <Typography variant="caption" color="inherit">
            {conversation.info}
          </Typography>
        </Box>
      }
    />
  );
}
