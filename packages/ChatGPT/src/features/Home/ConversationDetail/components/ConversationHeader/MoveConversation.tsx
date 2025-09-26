import FolderSelect from '@chatgpt/components/FolderSelect';
import { type MoveConversationParams, moveConversation } from '@chatgpt/service/chat/mutation';
import { type Conversation } from '@chatgpt/types/conversation';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
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
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <>
      <Tooltip title={t('move')}>
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
        <DialogTitle>{t('move_conversation')}</DialogTitle>
        <DialogContent>
          <FormLabel sx={{ display: 'block' }}>{t('folder')}</FormLabel>
          <Controller control={control} name="folderId" render={({ field }) => <FolderSelect {...field} />} />
        </DialogContent>
        <DialogActions>
          <Button variant="text" type="submit">
            {t('move')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
