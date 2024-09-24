/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 20:49:43
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/ConversationHeader/UpdateConversation.tsx
 */
import ConversationEdit, { type ConversationForm } from '@chatgpt/components/ConversationEdit';
import { updateConversation } from '@chatgpt/service/chat/mutation';
import { type Conversation, type NewConversation } from '@chatgpt/types/conversation';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

export interface UpdateConversationProps {
  conversation: Conversation;
}

export default function UpdateConversation({ conversation }: UpdateConversationProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleSubmit = useCallback(
    async ({ info, ...data }: ConversationForm) => {
      await updateConversation({
        data: {
          ...data,
          info: info?.trim(),
        } satisfies NewConversation,
        id: conversation.id,
      });
      handleClose();
    },
    [conversation.id, handleClose],
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
