import { Box, Typography, Toolbar, IconButton } from '@mui/material';
import { Paper } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import ConversationEdit from '../components/ConversationEdit';
import { useAppDispatch } from '@chatgpt/app/hooks';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';
import { invoke } from '@tauri-apps/api';
import { NewConversation } from '@chatgpt/types/conversation';
import { useCallback } from 'react';

export default function AddConversation() {
  const dispatch = useAppDispatch();
  const handleSubmit = useCallback(
    async ({ info, prompt, ...data }: NewConversation) => {
      await invoke('plugin:chat|save_conversation', {
        data: { info: info?.trim() || null, prompt: prompt?.trim() || null, ...data },
      });
      dispatch(fetchConversations());
    },
    [dispatch],
  );
  return (
    <Box
      component={Paper}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        backgroundColor: 'transparent',
      }}
      square
    >
      <Box
        data-tauri-drag-region
        sx={{ backgroundColor: 'transparent', boxShadow: (theme) => theme.shadows[3].split(',0px')[0] }}
      >
        <Toolbar data-tauri-drag-region variant="dense">
          <Typography data-tauri-drag-region variant="h6">
            Add Conversation
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton form="conversation-form" type="submit">
            <PublishIcon />
          </IconButton>
        </Toolbar>
      </Box>
      <ConversationEdit id="conversation-form" onSubmit={handleSubmit} />
    </Box>
  );
}
