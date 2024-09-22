import { Conversation } from '@chatgpt/types/conversation';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import { useCallback, useState } from 'react';
import FolderSelect from '@chatgpt/components/FolderSelect';
import { Controller, useForm } from 'react-hook-form';
import { MoveConversationParams, moveConversation } from '@chatgpt/service/chat/mutation';

export interface MoveConversationProps {
  conversation: Conversation;
}

export default function MoveConversation({ conversation }: MoveConversationProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const { control, handleSubmit } = useForm<Pick<MoveConversationParams, 'folderId'>>({
    defaultValues: {
      folderId: conversation.folderId,
    },
  });
  const onSubmit = useCallback(
    async ({ folderId }: Pick<MoveConversationParams, 'folderId'>) => {
      await moveConversation({ folderId, conversationId: conversation.id });
      handleClose();
    },
    [conversation.id, handleClose],
  );
  return (
    <>
      <Tooltip title="Move">
        <IconButton onClick={handleOpen}>
          <DriveFileMoveIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        component="form"
        onSubmit={handleSubmit(onSubmit)}
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
        <DialogTitle>Move Conversation</DialogTitle>
        <DialogContent>
          <FormLabel sx={{ display: 'block' }}>Folder :</FormLabel>
          <Controller control={control} name="folderId" render={({ field }) => <FolderSelect {...field} />} />
        </DialogContent>
        <DialogActions>
          <Button variant="text" type="submit">
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
