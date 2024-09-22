import { Conversation } from '@chatgpt/types/conversation';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback } from 'react';
import { CleaningServices, CopyAll, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clearConversation, deleteConversation } from '@chatgpt/service/chat/mutation';
import UpdateConversation from './UpdateConversation';
import MoveConversation from './MoveConversation';
import ExportConversation from './ExportConversation';
export interface ConversationHeaderProps {
  conversation: Conversation;
}

export default function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const handleDelete = useCallback(async () => {
    await deleteConversation({ id: conversation.id });
  }, [conversation.id]);
  const navigate = useNavigate();
  const handleCopy = useCallback(() => {
    navigate('/add/conversation', { state: { ...conversation, id: undefined } });
  }, [conversation, navigate]);
  const handleClear = useCallback(async () => {
    await clearConversation({ id: conversation.id });
  }, [conversation.id]);

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
      <Tooltip title="clear messages">
        <IconButton onClick={handleClear}>
          <CleaningServices />
        </IconButton>
      </Tooltip>
      <ExportConversation conversation={conversation} />
    </Box>
  );
}
