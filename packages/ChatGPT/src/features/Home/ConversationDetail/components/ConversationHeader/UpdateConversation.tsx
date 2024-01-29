/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 20:44:17
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/ConversationHeader/UpdateConversation.tsx
 */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import ConversationEdit, { ConversationForm } from '@chatgpt/components/ConversationEdit';
import { Conversation, NewConversation } from '@chatgpt/types/conversation';
import { updateConversation } from '@chatgpt/service/chat';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';
import { useAppDispatch } from '@chatgpt/app/hooks';

export interface UpdateConversationProps {
  conversation: Conversation;
}

export default function UpdateConversation({ conversation }: UpdateConversationProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleSubmit = useCallback(
    async ({ info, prompt, ...data }: ConversationForm) => {
      await updateConversation({
        data: {
          ...data,
          info: info?.trim(),
          prompt: prompt?.trim(),
          folderId: conversation.folderId ?? undefined,
        } satisfies NewConversation,
        id: conversation.id,
      });
      dispatch(fetchConversations());
      handleClose();
    },
    [conversation.folderId, conversation.id, dispatch, handleClose],
  );
  return (
    <>
      <Tooltip title="modify">
        <IconButton onClick={handleOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        sx={{
          height: '500px',
          '& .MuiDialog-paper': {
            backgroundColor: (theme) => theme.palette.background.paper + 'a0',
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
    </>
  );
}
