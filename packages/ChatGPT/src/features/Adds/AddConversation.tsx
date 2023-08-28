import { Box, Typography, Toolbar, IconButton, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import ConversationEdit, { ConversationForm } from '../../components/ConversationEdit';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { fetchConversations, selectSelectedFolderId } from '@chatgpt/features/Conversations/conversationSlice';
import { invoke } from '@tauri-apps/api';
import { useCallback } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import { NewConversation } from '@chatgpt/types/conversation';

function AddConversation() {
  const dispatch = useAppDispatch();
  const folderId = useAppSelector(selectSelectedFolderId);
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    async ({ info, prompt, ...data }: ConversationForm) => {
      await invoke('plugin:chat|add_conversation', {
        data: {
          info: info?.trim() || null,
          prompt: prompt?.trim() || null,
          folderId,
          ...data,
        } satisfies NewConversation,
      });
      dispatch(fetchConversations());
      navigate('/');
    },
    [dispatch, folderId, navigate],
  );
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        backgroundColor: 'transparent',
      }}
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

function AddConversationItem() {
  const navigate = useNavigate();
  const matchAdd = useMatch('/add/conversation');
  return (
    <ListItemButton
      onClick={() => {
        if (matchAdd) {
          navigate('/');
        } else {
          navigate('/add/conversation');
        }
      }}
      selected={matchAdd !== null}
    >
      <ListItemIcon>
        <Add />
      </ListItemIcon>
      <ListItemText primary="Add Conversation" />
    </ListItemButton>
  );
}

AddConversation.Item = AddConversationItem;
export default AddConversation;
