import ErrorInfo from '@chatgpt/components/ErrorInfo';
import Loading from '@chatgpt/components/Loading';
import Success from '@chatgpt/features/MessagePreview/Success';
import usePromise, { PromiseStatus } from '@chatgpt/hooks/usePromise';
import { updateTemporaryMessage } from '@chatgpt/service/temporaryConversation/mutation';
import { getTemporaryMessage } from '@chatgpt/service/temporaryConversation/query';
import notification from '@chatgpt/utils/notification';
import { appWindow } from '@tauri-apps/api/window';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { match, P } from 'ts-pattern';

export default function MessagePreview() {
  const [searchParams] = useSearchParams();
  const { messageId, persistentId } = match([searchParams.get('persistentId'), searchParams.get('messageId')])
    .with([P.nonNullable, P.nonNullable], ([persistentId, messageId]) => ({
      persistentId: match(Number.parseInt(persistentId, 10))
        .with(Number.NaN, () => null)
        .otherwise((id) => id),
      messageId: match(Number.parseInt(messageId, 10))
        .with(Number.NaN, () => null)
        .otherwise((id) => id),
    }))
    .otherwise(() => ({ persistentId: null, messageId: null }));
  const fn = useCallback(async () => {
    try {
      if (!messageId) {
        appWindow?.close();
        notification('messageId is empty');
        throw new Error('messageId is empty');
      }
      return await getTemporaryMessage({ messageId, persistentId });
    } catch (error) {
      if (error instanceof Error) {
        notification(error.message);
      } else {
        notification('unknown error');
      }
      appWindow?.close();
      throw error;
    }
  }, [messageId, persistentId]);
  const [data] = usePromise(fn);
  const content = useMemo(() => {
    return match(data)
      .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', height: '100%' }} />)
      .with({ tag: PromiseStatus.error }, ({ value }) => <ErrorInfo error={value} refetch={fn} />)
      .with({ tag: PromiseStatus.data }, ({ value }) => (
        <Success
          updateMessageContent={(content) => updateTemporaryMessage({ content, messageId: value.id, persistentId })}
          message={value}
        />
      ))
      .otherwise(() => <Loading sx={{ width: '100%', height: '100%' }} />);
  }, [data]);
  return content;
}
