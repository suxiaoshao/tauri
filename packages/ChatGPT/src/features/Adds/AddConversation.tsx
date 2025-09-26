/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 20:49:26
 * @FilePath: /tauri/packages/ChatGPT/src/features/Adds/AddConversation.tsx
 */
import { addConversation } from '@chatgpt/service/chat/mutation';
import { type NewConversation } from '@chatgpt/types/conversation';
import { Add } from '@mui/icons-material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PublishIcon from '@mui/icons-material/Publish';
import { Box, IconButton, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import ConversationEdit, { type ConversationForm } from '../../components/ConversationEdit';
import { useTranslation } from 'react-i18next';

function AddConversation() {
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    async ({ info, ...data }: ConversationForm) => {
      await addConversation({
        data: {
          ...data,
          info: info?.trim(),
        } satisfies NewConversation,
      });
      navigate('/');
    },
    [navigate],
  );
  const { state } = useLocation();
  const { t } = useTranslation();
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
            {t('add_conversation')}
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
  const { t } = useTranslation();
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
      <ListItemText primary={t('add_conversation')} />
    </ListItemButton>
  );
}

AddConversation.Item = AddConversationItem;
export default AddConversation;
