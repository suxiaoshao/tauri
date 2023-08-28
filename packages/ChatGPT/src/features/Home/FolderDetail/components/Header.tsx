import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { useAppDispatch } from '@chatgpt/app/hooks';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';
import { Folder, NewFolder } from '@chatgpt/types/folder';
import FolderEdit, { FolderForm } from '@chatgpt/components/FolderEdit';
export interface FolderHeaderProps {
  folder: Folder;
}

export default function FolderHeader({ folder }: FolderHeaderProps) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleSubmit = useCallback(
    async ({ name }: FolderForm) => {
      await invoke('plugin:chat|update_folder', {
        folder: { name: name.trim(), parentId: folder.parentId } satisfies NewFolder,
        id: folder.id,
      });
      dispatch(fetchConversations());
      handleClose();
    },
    [folder.parentId, folder.id, dispatch, handleClose],
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
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 1 }} data-tauri-drag-region>
        <Typography data-tauri-drag-region variant="h6" component="span" paragraph={false}>
          {folder.name}
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
            backgroundColor: (theme) => theme.palette.background.paper + 'a0',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle>Update Folder</DialogTitle>
        <DialogContent dividers>
          <FolderEdit
            initialValues={folder}
            id="folder-form"
            sx={{
              p: 0,
              overflowY: 'unset',
              pt: 1,
            }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" type="submit" form="folder-form">
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
