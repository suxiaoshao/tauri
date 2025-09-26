import { clearConversation, deleteConversation } from '@chatgpt/service/chat/mutation';
import { type Conversation } from '@chatgpt/types/conversation';
import { CleaningServices, CopyAll, Delete } from '@mui/icons-material';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ExportConversation from './ExportConversation';
import MoveConversation from './MoveConversation';
import UpdateConversation from './UpdateConversation';
import { useHotkeys } from 'react-hotkeys-hook';
import usePlatform from '@chatgpt/hooks/usePlatform';
import { match } from 'ts-pattern';
import { useTranslation } from 'react-i18next';
export interface ConversationHeaderProps {
  conversation: Conversation;
}

export default function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const platform = usePlatform();
  const handleDelete = useCallback(async () => {
    await deleteConversation({ id: conversation.id });
  }, [conversation.id]);
  const navigate = useNavigate();
  const handleCopy = useCallback(() => {
    navigate('/add/conversation', { state: { ...conversation, id: undefined } });
  }, [conversation, navigate]);
  const handleClear = useCallback(async () => {
    await clearConversation({ id: conversation.id });
  }, [conversation.id]);

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
  const { t } = useTranslation();

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
        {conversation.icon}
      </Avatar>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 1 }} data-tauri-drag-region>
        <Typography data-tauri-drag-region variant="h6" component="span">
          {conversation.title}
        </Typography>
        <Typography sx={{ ml: 1 }} data-tauri-drag-region variant="body2" color="inherit" component="span">
          {conversation.info}
        </Typography>
      </Box>
      <UpdateConversation conversation={conversation} />
      <Tooltip title={t('delete')}>
        <IconButton onClick={handleDelete}>
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('copy_to_new_conversation')}>
        <IconButton onClick={handleCopy}>
          <CopyAll />
        </IconButton>
      </Tooltip>
      <MoveConversation conversation={conversation} />
      <Tooltip title={t('clear_messages')}>
        <IconButton onClick={handleClear}>
          <CleaningServices />
        </IconButton>
      </Tooltip>
      <ExportConversation conversation={conversation} />
    </Box>
  );
}
