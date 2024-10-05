import FolderSelect from '@chatgpt/components/FolderSelect';
import usePlatform from '@chatgpt/hooks/usePlatform';
import { saveTemporaryConversation } from '@chatgpt/service/temporaryConversation/mutation';
import { Save } from '@mui/icons-material';
import {
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  TextField,
} from '@mui/material';
import { useState, useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { match } from 'ts-pattern';
import { object, string, pipe, emoji, number, integer, type InferInput, nullable } from 'valibot';

const saveConversationSchema = object({
  title: string(),
  icon: pipe(string(), emoji()),
  info: nullable(string()),
  folderId: nullable(pipe(number(), integer())),
});

export type SaveConversationForm = InferInput<typeof saveConversationSchema>;

export interface SaveConversationProps {
  persistentId: number | null;
}

export default function SaveConversation({ persistentId }: SaveConversationProps) {
  const platform = usePlatform();
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<SaveConversationForm>({
    defaultValues: {},
  });
  const onSubmit = handleSubmit(async ({ folderId, title, icon, info }: SaveConversationForm) => {
    await saveTemporaryConversation({ data: { folderId, icon, info, title, persistentId } });
    handleClose();
  });
  useHotkeys(
    match(platform)
      .with('Darwin', () => ['Meta+s'])
      .otherwise(() => ['Control+s']),
    (event) => {
      event.preventDefault();
      handleOpen();
    },
    {
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    },
    [platform, handleOpen],
  );
  return (
    <>
      <Tooltip title="save conversation">
        <IconButton onClick={handleOpen}>
          <Save />
        </IconButton>
      </Tooltip>
      <Dialog
        component="form"
        onSubmit={onSubmit}
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
        <DialogTitle>Save Conversation</DialogTitle>
        <DialogContent>
          <TextField
            error={!!errors.title?.message}
            helperText={errors.title?.message}
            {...register('title', { required: true })}
            required
            label="Title"
            fullWidth
          />
          <TextField
            error={!!errors.icon?.message}
            helperText={errors.icon?.message}
            label="Icon"
            required
            {...register('icon', { required: true })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            error={!!errors.info?.message}
            helperText={errors.info?.message}
            {...register('info')}
            label="Info"
            fullWidth
            sx={{ mt: 2 }}
          />
          <FormLabel sx={{ display: 'block' }}>Folder :</FormLabel>
          <Controller control={control} name="folderId" render={({ field }) => <FolderSelect {...field} />} />
        </DialogContent>
        <DialogActions>
          <Button variant="text" type="submit">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
