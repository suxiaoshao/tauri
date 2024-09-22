/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 22:32:11
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 01:26:12
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/List/header.tsx
 */
import { Box, IconButton, Typography } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { fetchTemplates, selectTemplateCount } from '../../templateSlice';
import { useNavigate } from 'react-router-dom';

export default function TemplateListHeader() {
  const count = useAppSelector(selectTemplateCount);
  const dispatch = useAppDispatch();
  const refresh = useCallback(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);
  const navigate = useNavigate();
  const goToCreate = useCallback(() => {
    navigate('/template/create');
  }, [navigate]);
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
          Conversation Templates
        </Typography>
        <Typography
          sx={{ ml: 1 }}
          data-tauri-drag-region
          variant="body2"
          color="inherit"
          component="span"
          paragraph={false}
        >
          {count} Templates
        </Typography>
      </Box>
      <IconButton onClick={refresh}>
        <Refresh />
      </IconButton>
      <IconButton onClick={goToCreate}>
        <Add />
      </IconButton>
    </Box>
  );
}
