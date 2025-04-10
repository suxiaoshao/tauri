/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 02:17:06
 * @FilePath: /tauri/packages/ChatGPT/src/features/MessagePreview/index.tsx
 */
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import Loading from '@chatgpt/components/Loading';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { findMessage } from '@chatgpt/service/chat/query';
import notification from '@chatgpt/utils/notification';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { match } from 'ts-pattern';
import Success from './Success';
import { updateMessageContent } from '@chatgpt/service/chat/mutation';

export default function MessagePreview() {
  const { id } = useParams<{ id: string }>();
  const fn = useCallback(async () => {
    const appWindow = getCurrentWebviewWindow();
    try {
      if (!id) {
        appWindow?.close();
        notification('id is empty');
        throw new Error('id is empty');
      }
      const messageId = Number.parseInt(id, 10);
      return await findMessage({ id: messageId });
    } catch (error) {
      if (error instanceof Error) {
        notification(error.message);
      } else {
        notification('unknown error');
      }
      appWindow?.close();
      throw error;
    }
  }, [id]);
  const [data, func] = usePromise(fn);
  const content = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', height: '100%' }} />)
      .with({ tag: PromiseStatus.error }, ({ value }) => <ErrorInfo error={value} refetch={func} />)
      .with({ tag: PromiseStatus.data }, ({ value }) => (
        <Success updateMessageContent={(content) => updateMessageContent({ id: value.id, content })} message={value} />
      ))
      .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
  }, [data, func]);
  return content;
}
