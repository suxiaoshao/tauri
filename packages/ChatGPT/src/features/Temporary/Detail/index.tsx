import ChatForm from '@chatgpt/components/ChatForm';
import ErrorInfo from '@chatgpt/components/ErrorInfo';
import Loading from '@chatgpt/components/Loading';
import MessageHistory from '@chatgpt/components/MessageHistory';
import usePlatform from '@chatgpt/hooks/usePlatform';
import { PromiseStatus } from '@chatgpt/hooks/usePromise';
import usePromiseFn from '@chatgpt/hooks/usePromiseFn';
import { type TemporaryMessageEvent } from '@chatgpt/types/temporaryConversation';
import { Box } from '@mui/material';
import { getCurrentWebviewWindow, WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { match, P } from 'ts-pattern';
import { useShallow } from 'zustand/react/shallow';
import TemporaryHeader from './components/Header';
import { useTemporaryConversationStore } from './temporaryDetailSlice';
import {
  deleteTemporaryMessage,
  temporaryFetch,
  separateWindow,
} from '@chatgpt/service/temporaryConversation/mutation';
import { useTranslation } from 'react-i18next';
const appWindow = getCurrentWebviewWindow();

export default function TemporaryDetail() {
  const { t } = useTranslation();
  const platform = usePlatform();
  const [searchParams] = useSearchParams();
  const persistentId = match(searchParams.get('persistentId'))
    .with(P.nonNullable, (id) =>
      match(Number.parseInt(id, 10))
        .with(Number.NaN, () => null)
        .otherwise((id) => id),
    )
    .otherwise(() => null);
  const { fetchData, state, updateMessage } = useTemporaryConversationStore(
    useShallow(({ state, fetchData, updateMessage }) => ({
      state,
      fetchData,
      updateMessage,
    })),
  );
  useEffect(() => {
    fetchData(persistentId);
  }, [persistentId, fetchData]);
  // message history
  useEffect(() => {
    const fn = appWindow.listen<TemporaryMessageEvent>('temporary_message', (response) => {
      updateMessage(response.payload);
    });
    return () => {
      (async () => {
        const f = await fn;
        f();
      })();
    };
  }, [updateMessage]);

  const handleDeteteMessage = useCallback(
    async (messageId: number) => {
      await deleteTemporaryMessage({ messageId, persistentId });
    },
    [persistentId],
  );

  // send form status
  const fetchFn = useCallback(
    async (content: string, extensionName: string | null) => {
      await temporaryFetch({ content, persistentId, extensionName });
    },
    [persistentId],
  );
  const [status, onSendContent] = usePromiseFn(fetchFn);

  // hotkey
  const navigate = useNavigate();
  useHotkeys(
    'esc',
    (event) => {
      if (persistentId === null) {
        event.preventDefault();
        navigate(-1);
      }
    },
    { enableOnFormTags: ['textarea'] },
    [navigate, persistentId],
  );
  useHotkeys(
    match(platform)
      .with('macos', () => ['Meta+d'])
      .otherwise(() => ['Control+d']),
    (event) => {
      if (persistentId === null) {
        event.preventDefault();
        separateWindow();
      }
    },
    {
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    },
    [platform, persistentId],
  );
  const handleMessageView = (id: number) => {
    // eslint-disable-next-line no-new
    new WebviewWindow(`temporary-${persistentId}-message-${id}`, {
      url: `/temporary_conversation/message?persistentId=${persistentId}&messageId=${id}`,
      title: t('temporary_message_preview_title', { persistentId, id }),
      transparent: true,
      decorations: false,
    });
  };

  const content = match(state)
    .with({ tag: PromiseStatus.data }, ({ value }) => (
      <>
        <TemporaryHeader persistentId={persistentId} template={value.template} />
        <Box sx={{ flex: '1 1 0', overflowY: 'auto' }}>
          <MessageHistory
            onMessageViewed={handleMessageView}
            onMessageDeleted={handleDeteteMessage}
            messages={value.messages}
          />
        </Box>
        <ChatForm status={status} onSendMessage={onSendContent} />
      </>
    ))
    .with({ tag: PromiseStatus.loading }, () => <Loading sx={{ width: '100%', flex: '1 1 0' }} />)
    .with({ tag: PromiseStatus.error }, ({ value }) => (
      <ErrorInfo error={value} refetch={() => fetchData(persistentId)} />
    ))
    .otherwise(() => null);
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
      {content}
    </Box>
  );
}
