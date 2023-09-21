import CustomEdit from '@chatgpt/components/CustomEdit';
import usePromise from '@chatgpt/hooks/usePromise';
import { findMessage } from '@chatgpt/service/chat';
import notification from '@chatgpt/utils/notification';
import { CircularProgress } from '@mui/material';
import { appWindow } from '@tauri-apps/api/window';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

export default function MessagePreview() {
  const { id } = useParams<{ id: string }>();
  const fn = useCallback(async () => {
    try {
      if (!id) {
        appWindow?.close();
        notification('id is empty');
        throw new Error('id is empty');
      }
      const messageId = parseInt(id);
      return await findMessage({ id: messageId });
    } catch (e) {
      if (e instanceof Error) {
        notification(e.message);
      } else {
        notification('unknown error');
      }
      appWindow?.close();
      throw e;
    }
  }, [id]);
  const { tag, value } = usePromise(fn);
  const content = useMemo(() => {
    switch (tag) {
      case 'loading':
        return <CircularProgress />;
      case 'error':
        return 'error';
      case 'data':
        return <CustomEdit sx={{ width: '100%', height: '100%' }} value={value.content} readonly language="markdown" />;
      default:
        return <CircularProgress />;
    }
  }, [tag, value]);
  return content;
}
