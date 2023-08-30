import { Conversation } from '@chatgpt/types/conversation';
import { getNodeIdByConversation } from '@chatgpt/utils/chatData';
import { TreeItem } from '@mui/lab';
import { Avatar, Box, Typography } from '@mui/material';

export interface ConversationItemProps {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: ConversationItemProps) {
  return (
    <TreeItem
      nodeId={getNodeIdByConversation(conversation)}
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
