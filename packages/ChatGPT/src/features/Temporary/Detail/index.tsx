import { useAppSelector } from '@chatgpt/app/hooks';
import { selectTemplates } from '@chatgpt/features/Template/templateSlice';
import { Box } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TemporaryHeader from './components/Header';
import { appWindow } from '@tauri-apps/api/window';
import ChatForm from '@chatgpt/components/ChatForm';
import usePromiseFn from '@chatgpt/hooks/usePromiseFn';

export default function TemporaryDetail() {
  // fetch template detail
  const { temporaryId } = useParams<{ temporaryId: string }>();
  const templates = useAppSelector(selectTemplates);
  const template = useMemo(() => templates.find(({ id }) => id === Number(temporaryId)), [templates, temporaryId]);
  const fetchFn = useCallback(
    async (content: string) => {
      console.log(content);
    },
    [temporaryId],
  );
  const [status, onSendContent] = usePromiseFn(fetchFn);
  if (!template) {
    appWindow.close();
    return null;
  }
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
      }}
    >
      <TemporaryHeader template={template} />
      <ChatForm status={status} onSendMessage={onSendContent} />
    </Box>
  );
}
