import FolderEdit, { type FolderForm } from '@chatgpt/components/FolderEdit';
import { updateFolder } from '@chatgpt/service/chat/mutation';
import { type Folder, type NewFolder } from '@chatgpt/types/folder';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useCallback, useState } from 'react';

export interface FolderHeaderProps {
  folder: Folder;
}

export default function UpdateFolder({ folder }: FolderHeaderProps) {
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleSubmit = useCallback(
    async ({ name, parentId }: FolderForm) => {
      await updateFolder({
        folder: { name: name.trim(), parentId: parentId } satisfies NewFolder,
        id: folder.id,
      });
      handleClose();
    },
    [folder.id, handleClose],
  );
  return (
    <>
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
    </>
  );
}
