import { Box, Paper } from '@mui/material';
import ChatForm from './components/ChatForm';
import FetchingMessage, { FetchingMessageType, FetchingMessageTypeTag } from './components/FetchingMessage';
import { Reducer, useMemo, useReducer } from 'react';
import { Enum } from 'types';
import { useAppSelector } from '@chatgpt/app/hooks';
import { selectSelectedConversation } from '@chatgpt/features/Conversations/conversationSlice';
import AddConversation from '@chatgpt/features/Home/components/AddConversation';

export enum FetchingMessageActionTag {
  add = 'add',
  error = 'error',
  complete = 'complete',
  start = 'start',
}

export type FetchingMessageAction =
  | Enum<FetchingMessageActionTag.add, string>
  | Enum<FetchingMessageActionTag.error, Error>
  | Enum<FetchingMessageActionTag.complete>
  | Enum<FetchingMessageActionTag.start>;
type FetchingMessageReducer = Reducer<FetchingMessageType, FetchingMessageAction>;

const reducer: FetchingMessageReducer = (state: FetchingMessageType, action) => {
  switch (state.tag) {
    case FetchingMessageTypeTag.init:
    case FetchingMessageTypeTag.error:
    case FetchingMessageTypeTag.complete:
      switch (action.tag) {
        case FetchingMessageActionTag.start:
          return { tag: FetchingMessageTypeTag.start };
        default:
          return state;
      }
    case FetchingMessageTypeTag.loading:
      switch (action.tag) {
        case FetchingMessageActionTag.add:
          return { tag: FetchingMessageTypeTag.loading, value: state.value + action.value };
        case FetchingMessageActionTag.error:
          return { tag: FetchingMessageTypeTag.error, value: action.value };
        case FetchingMessageActionTag.complete:
          return { tag: FetchingMessageTypeTag.complete, value: state.value };
        default:
          return state;
      }
    case FetchingMessageTypeTag.start:
      switch (action.tag) {
        case FetchingMessageActionTag.add:
          return { tag: FetchingMessageTypeTag.loading, value: action.value };
        case FetchingMessageActionTag.error:
          return { tag: FetchingMessageTypeTag.error, value: action.value };
        case FetchingMessageActionTag.complete:
          return { tag: FetchingMessageTypeTag.complete, value: '' };
        default:
          return state;
      }
  }
};

export default function Home() {
  const [fetchingMessage, fetchingMessageDispatch] = useReducer<FetchingMessageReducer>(reducer, {
    tag: FetchingMessageTypeTag.init,
  });
  const selectedConversation = useAppSelector(selectSelectedConversation);
  return useMemo(() => {
    if (selectedConversation) {
      return (
        <Box
          component={Paper}
          sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
          square
        >
          <Box sx={{ flex: '1 1 0', overflowY: 'auto' }}>
            <FetchingMessage fetchingMessage={fetchingMessage} />
          </Box>
          <ChatForm fetchingMessageDispatch={fetchingMessageDispatch} fetchingMessage={fetchingMessage} />
        </Box>
      );
    } else {
      return <AddConversation />;
    }
  }, [fetchingMessage, selectedConversation]);
}
