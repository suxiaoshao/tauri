import { Box, Typography, Toolbar, IconButton, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import { useMatch, useNavigate } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import FolderEdit, { FolderForm } from '@chatgpt/components/FolderEdit';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { fetchConversations, selectSelectedFolderId } from '../Conversations/conversationSlice';
import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api';
import { NewFolder } from '@chatgpt/types/folder';

function AddFolder() {
  const dispatch = useAppDispatch();
  const folderId = useAppSelector(selectSelectedFolderId);
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    async ({ name }: FolderForm) => {
      await invoke('plugin:chat|add_folder', {
        folder: {
          name: name.trim(),
          parentId: folderId,
        } satisfies NewFolder,
      });
      dispatch(fetchConversations());
      navigate('/');
    },
    [dispatch, folderId, navigate],
  );
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        backgroundColor: 'transparent',
      }}
    >
      <Box
        data-tauri-drag-region
        sx={{ backgroundColor: 'transparent', boxShadow: (theme) => theme.shadows[3].split(',0px')[0] }}
      >
        <Toolbar data-tauri-drag-region variant="dense">
          <Typography data-tauri-drag-region variant="h6">
            Add Folder
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton form="folder-form" type="submit">
            <PublishIcon />
          </IconButton>
        </Toolbar>
      </Box>
      <FolderEdit id="folder-form" onSubmit={handleSubmit} />
    </Box>
  );
}

function AddFolderItem() {
  const navigate = useNavigate();
  const matchAdd = useMatch('/add/folder');
  return (
    <ListItemButton
      onClick={() => {
        if (matchAdd) {
          navigate('/');
        } else {
          navigate('/add/folder');
        }
      }}
      selected={matchAdd !== null}
    >
      <ListItemIcon>
        <Add />
      </ListItemIcon>
      <ListItemText primary="Add Folder" />
    </ListItemButton>
  );
}

AddFolder.Item = AddFolderItem;

export default AddFolder;
