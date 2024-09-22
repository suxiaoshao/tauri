import { useAppSelector } from '@chatgpt/app/hooks';
import ChatForm from '@chatgpt/components/ChatForm';
import MessageHistory from '@chatgpt/components/MessageHistory';
import { selectTemplates } from '@chatgpt/features/Template/templateSlice';
import usePromiseFn from '@chatgpt/hooks/usePromiseFn';
import { deleteTemporaryMessage, temporaryFetch } from '@chatgpt/service/temporaryConversation';
import { TemporaryMessage } from '@chatgpt/types/temporaryConversation';
import { Box } from '@mui/material';
import { appWindow } from '@tauri-apps/api/window';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate, useParams } from 'react-router-dom';
import { match } from 'ts-pattern';
import { Enum } from 'types';
import TemporaryHeader from './components/Header';

enum ActionType {
  UpdateMessage,
  SetMessages,
}

type Action = Enum<ActionType.UpdateMessage, TemporaryMessage> | Enum<ActionType.SetMessages, TemporaryMessage[]>;

function reducer(state: TemporaryMessage[], action: Action): TemporaryMessage[] {
  return match(action)
    .with({ tag: ActionType.UpdateMessage }, (action) => {
      const index = state.findIndex((m) => m.id === action.value.id);
      if (index === -1) {
        return [...state, action.value];
      }
      return state.with(index, action.value);
    })
    .with({ tag: ActionType.SetMessages }, (action) => action.value)
    .otherwise(() => state);
}

export default function TemporaryDetail() {
  // message history
  const [messages, dispatch] = useReducer(reducer, []);
  useEffect(() => {
    const fn = appWindow.listen<TemporaryMessage>('temporary_message', (response) => {
      dispatch({ tag: ActionType.UpdateMessage, value: response.payload });
    });
    return () => {
      (async () => {
        const f = await fn;
        f();
      })();
    };
  }, []);

  const handleDeteteMessage = useCallback(async (id: number) => {
    const newMessages = await deleteTemporaryMessage({ id });
    dispatch({ tag: ActionType.SetMessages, value: newMessages });
  }, []);

  // fetch template detail
  const { temporaryId } = useParams<{ temporaryId: string }>();
  const templates = useAppSelector(selectTemplates);
  const template = useMemo(() => templates.find(({ id }) => id === Number(temporaryId)), [templates, temporaryId]);

  // send form status
  const fetchFn = useCallback(
    async (content: string) => {
      await temporaryFetch({ content });
    },
    [temporaryId],
  );
  const [status, onSendContent] = usePromiseFn(fetchFn);

  // hotkey
  const navigate = useNavigate();
  useHotkeys(
    'esc',
    (event) => {
      event.preventDefault();
      navigate(-1);
    },
    { enableOnFormTags: ['textarea'] },
    [navigate],
  );

  // render
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
      <Box sx={{ flex: '1 1 0', overflowY: 'auto' }}>
        <MessageHistory onMessageDeleted={handleDeteteMessage} messages={messages} />
      </Box>
      <ChatForm status={status} onSendMessage={onSendContent} />
    </Box>
  );
}
