/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 03:09:23
 * @FilePath: /tauri/packages/ChatGPT/src/features/Adds/AddFolder.tsx
 */
import FolderEdit, { type FolderForm } from '@chatgpt/components/FolderEdit';
import { addFolder } from '@chatgpt/service/chat/mutation';
import { type NewFolder } from '@chatgpt/types/folder';
import { Add } from '@mui/icons-material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PublishIcon from '@mui/icons-material/Publish';
import { Box, IconButton, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';

function AddFolder() {
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    async ({ name, ...data }: FolderForm) => {
      await addFolder({
        folder: {
          ...data,
          name: name.trim(),
        } satisfies NewFolder,
      });
      navigate('/');
    },
    [navigate],
  );
  const { t } = useTranslation();
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
          <IconButton onClick={() => navigate(-1)}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Typography data-tauri-drag-region variant="h6">
            {t('add_folder')}
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
  const { t } = useTranslation();
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
      <ListItemText primary={t('add_folder')} />
    </ListItemButton>
  );
}

AddFolder.Item = AddFolderItem;

export default AddFolder;
