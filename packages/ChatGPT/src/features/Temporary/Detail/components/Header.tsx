import usePlatform from '@chatgpt/hooks/usePlatform';
import { clearTemporaryConversation } from '@chatgpt/service/temporaryConversation/mutation';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { CleaningServices } from '@mui/icons-material';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { match } from 'ts-pattern';
import SaveConversation from './SaveConversation';

export interface TemporaryHeaderProps {
  template: ConversationTemplate;
  persistentId: number | null;
}

export default function TemporaryHeader({ template, persistentId }: TemporaryHeaderProps) {
  const platform = usePlatform();

  const handleClear = useCallback(async () => {
    await clearTemporaryConversation({ persistentId });
  }, [persistentId]);
  useHotkeys(
    match(platform)
      .with('macos', () => ['Meta+l'])
      .otherwise(() => ['Control+l']),
    (event) => {
      event.preventDefault();
      handleClear();
    },
    {
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    },
    [platform, handleClear],
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
      <Avatar data-tauri-drag-region sx={{ backgroundColor: 'transparent' }}>
        {template.icon}
      </Avatar>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 1 }} data-tauri-drag-region>
        <Typography data-tauri-drag-region variant="h6" component="span">
          {template.name}
        </Typography>
        <Typography sx={{ ml: 1 }} data-tauri-drag-region variant="body2" color="inherit" component="span">
          {template.description}
        </Typography>
      </Box>
      <Tooltip title="clear messages">
        <IconButton onClick={handleClear}>
          <CleaningServices />
        </IconButton>
      </Tooltip>
      <SaveConversation persistentId={persistentId} />
    </Box>
  );
}
