import { useAppSelector } from '@chatgpt/app/hooks';
import { selectTemplates } from '@chatgpt/features/Template/templateSlice';
import { Box } from '@mui/material';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TemporaryHeader from './components/Header';
import { appWindow } from '@tauri-apps/api/window';

export default function TemporaryDetail() {
  // fetch template detail
  const { temporaryId } = useParams<{ temporaryId: string }>();
  const templates = useAppSelector(selectTemplates);
  const template = useMemo(() => templates.find(({ id }) => id === Number(temporaryId)), [templates, temporaryId]);
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
    </Box>
  );
}
