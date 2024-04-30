/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 20:49:26
 * @FilePath: /tauri/packages/ChatGPT/src/features/Adds/AddConversation.tsx
 */
import { Box, Typography, Toolbar, IconButton, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import ConversationEdit, { ConversationForm } from '../../components/ConversationEdit';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { fetchConversations, selectSelectedFolderId } from '@chatgpt/features/Conversations/conversationSlice';
import { useCallback } from 'react';
import { useMatch, useNavigate, useLocation } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import { NewConversation } from '@chatgpt/types/conversation';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { addConversation } from '@chatgpt/service/chat/mutation';

function AddConversation() {
  const dispatch = useAppDispatch();
  const folderId = useAppSelector(selectSelectedFolderId);
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    async ({ info, ...data }: ConversationForm) => {
      await addConversation({
        data: {
          ...data,
          info: info?.trim(),
          folderId: folderId ?? undefined,
        } satisfies NewConversation,
      });
      dispatch(fetchConversations());
      navigate('/');
    },
    [dispatch, folderId, navigate],
  );
  const { state } = useLocation();
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
        <Toolbar data-tauri-drag-region variant="dense" sx={{ pl: '0!important' }}>
          <IconButton onClick={() => navigate(-1)}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Typography data-tauri-drag-region variant="h6" sx={{ ml: 1 }}>
            Add Conversation
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton form="conversation-form" type="submit">
            <PublishIcon />
          </IconButton>
        </Toolbar>
      </Box>
      <ConversationEdit initialValues={state} id="conversation-form" onSubmit={handleSubmit} />
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
