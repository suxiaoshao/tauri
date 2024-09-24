import FolderSelect from '@chatgpt/components/FolderSelect';
import { type MoveFolderParams, moveFolder } from '@chatgpt/service/chat/mutation';
import { type Folder } from '@chatgpt/types/folder';
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

export interface MoveFolderProps {
  folder: Folder;
}

export default function MoveFolder({ folder }: MoveFolderProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const { control, handleSubmit } = useForm<Pick<MoveFolderParams, 'parentId'>>({
    defaultValues: {
      parentId: folder.parentId,
    },
  });
  const onSubmit = useCallback(
    async ({ parentId }: Pick<MoveFolderParams, 'parentId'>) => {
      await moveFolder({ parentId, id: folder.id });
      handleClose();
    },
    [folder.id, handleClose],
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
        <DialogTitle>Move Folder</DialogTitle>
        <DialogContent>
          <FormLabel sx={{ display: 'block' }}>Parent Folder :</FormLabel>
          <Controller
            control={control}
            name="parentId"
            render={({ field }) => <FolderSelect {...field} disabledFolderIds={[folder.id]} />}
          />
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
