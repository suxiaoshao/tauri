/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 22:32:11
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:18:50
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/List/header.tsx
 */
import { Publish } from '@mui/icons-material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Box, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export interface TemplateCreateHeaderProps {
  formId: string;
}

export default function TemplateCreateHeader({ formId }: TemplateCreateHeaderProps) {
  const navigate = useNavigate();
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
        <IconButton sx={{ mr: 1 }} onClick={() => navigate(-1)}>
          <KeyboardArrowLeftIcon />
        </IconButton>
        <Typography data-tauri-drag-region variant="h6" component="span">
          Create Template
        </Typography>
      </Box>
      <IconButton type="submit" form={formId}>
        <Publish />
      </IconButton>
    </Box>
  );
}
