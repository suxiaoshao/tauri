/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 22:32:11
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 01:44:16
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/List/header.tsx
 */
import { Box, IconButton, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { PromiseData } from '@chatgpt/hooks/usePromise';
import { ConversationTemplate } from '@chatgpt/types/conversation_template';
import { useMemo } from 'react';

export interface TemplateListHeaderProps {
  refresh: () => void;
  data: PromiseData<ConversationTemplate[]>;
}

export default function TemplateListHeader({ refresh, data: { tag, value } }: TemplateListHeaderProps) {
  const count = useMemo(() => {
    switch (tag) {
      case 'loading':
        return null;
      case 'data':
        return (
          <Typography
            sx={{ ml: 1 }}
            data-tauri-drag-region
            variant="body2"
            color="inherit"
            component="span"
            paragraph={false}
          >
            {value?.length || 0} Templates
          </Typography>
        );
      default:
        return null;
    }
  }, [tag, value]);
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
        {count}
      </Box>
      <IconButton disabled={tag === 'loading'} onClick={refresh}>
        <Refresh />
      </IconButton>
    </Box>
  );
}
