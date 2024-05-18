import { Box, IconButton, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useAppDispatch } from '@chatgpt/app/hooks';
import { Folder } from '@chatgpt/types/folder';
import { Delete } from '@mui/icons-material';
import { deleteFolder } from '@chatgpt/service/chat/mutation';
import UpdateFolder from './UpdateFolder';
import MoveFolder from './MoveFolder';
export interface FolderHeaderProps {
  folder: Folder;
}

export default function FolderHeader({ folder }: FolderHeaderProps) {
  const dispatch = useAppDispatch();
  const handleDelete = useCallback(async () => {
    await deleteFolder({ id: folder.id });
  }, [dispatch, folder.id]);

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
        <Typography
          sx={{ ml: 1 }}
          data-tauri-drag-region
          variant="body2"
          color="inherit"
          component="span"
          paragraph={false}
        >
          {folder.path}
        </Typography>
      </Box>
      <UpdateFolder folder={folder} />
      <IconButton onClick={handleDelete}>
        <Delete />
      </IconButton>
      <MoveFolder folder={folder} />
    </Box>
  );
}
