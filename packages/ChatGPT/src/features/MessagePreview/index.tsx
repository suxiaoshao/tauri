/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 02:17:06
 * @FilePath: /tauri/packages/ChatGPT/src/features/MessagePreview/index.tsx
 */
import usePromise from '@chatgpt/hooks/usePromise';
import { findMessage } from '@chatgpt/service/chat/query';
import notification from '@chatgpt/utils/notification';
import { CircularProgress } from '@mui/material';
import { appWindow } from '@tauri-apps/api/window';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Success from './Success';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import Loading from '@chatgpt/components/Loading';

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
  const [{ tag, value }] = usePromise(fn);
  const content = useMemo(() => {
    switch (tag) {
      case 'loading':
        return <Loading sx={{ width: '100%', height: '100%' }} />;
      case 'error':
        return <ErrorInfo error={value} refetch={fn} />;
      case 'data':
        return <Success message={value} />;
      default:
        return <Loading sx={{ width: '100%', height: '100%' }} />;
    }
  }, [tag, value]);
  return content;
}
