import { Conversation } from '@chatgpt/types/conversation';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useAppDispatch } from '@chatgpt/app/hooks';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';
import { CopyAll, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { deleteConversation } from '@chatgpt/service/chat';
import UpdateConversation from './UpdateConversation';
import MoveConversation from './MoveConversation';
export interface ConversationHeaderProps {
  conversation: Conversation;
}

export default function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const dispatch = useAppDispatch();
  const handleDelete = useCallback(async () => {
    await deleteConversation({ id: conversation.id });
    dispatch(fetchConversations());
  }, [conversation.id, dispatch]);
  const navigate = useNavigate();
  const handleCopy = useCallback(async () => {
    navigate('/add/conversation', { state: { ...conversation, id: undefined } });
  }, [conversation, navigate]);

  return (
    <Box
      data-tauri-drag-region
      sx={{
        width: '100%',
        display: 'flex',
        p: 1,
        justifyContent: 'center',
        boxShadow: (theme) => theme.shadows[3].split(',0px')[0],
      }}
    >
      <Avatar data-tauri-drag-region sx={{ backgroundColor: 'transparent' }}>
        {conversation.icon}
      </Avatar>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 1 }} data-tauri-drag-region>
        <Typography data-tauri-drag-region variant="h6" component="span" paragraph={false}>
          {conversation.title}
        </Typography>
        <Typography
          sx={{ ml: 1 }}
          data-tauri-drag-region
          variant="body2"
          color="inherit"
          component="span"
          paragraph={false}
        >
          {conversation.info}
        </Typography>
      </Box>
      <UpdateConversation conversation={conversation} />
      <Tooltip title="delete">
        <IconButton onClick={handleDelete}>
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title="copy to new conversation">
        <IconButton onClick={handleCopy}>
          <CopyAll />
        </IconButton>
      </Tooltip>
      <MoveConversation conversation={conversation} />
    </Box>
  );
}