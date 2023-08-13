import { Conversation, NewConversation } from '@chatgpt/types/conversation';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useState } from 'react';
import ConversationEdit from '../../components/ConversationEdit';
import { invoke } from '@tauri-apps/api';
import { useAppDispatch } from '@chatgpt/app/hooks';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';
export interface ConversationHeaderProps {
  conversation: Conversation;
}

export default function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleSubmit = useCallback(
    async ({ info, prompt, ...data }: NewConversation) => {
      await invoke('plugin:chat|update_conversation', {
        data: { info: info?.trim() || null, prompt: prompt?.trim() || null, ...data },
        id: conversation.id,
      });
      dispatch(fetchConversations());
      handleClose();
    },
    [conversation.id, dispatch, handleClose],
  );

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
      <IconButton onClick={handleOpen}>
        <EditIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        sx={{
          height: '500px',
          '& .MuiDialog-paper': {
            backgroundColor: (theme) => theme.palette.background.paper + '10',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle>Update Conversation</DialogTitle>
        <DialogContent dividers>
          <ConversationEdit
            initialValues={conversation}
            id="conversation-form"
            sx={{
              p: 0,
              overflowY: 'unset',
              pt: 1,
            }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" type="submit" form="conversation-form">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
